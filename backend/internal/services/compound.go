package services

import (
	"context"
	"fmt"
	"math"
	"math/big"
	"time"

	"mini-amm-bot/internal/db"
	"mini-amm-bot/internal/models"
	util "mini-amm-bot/internal/util"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	log "github.com/sirupsen/logrus"
)

type CompoundService struct {
	config    *util.Config
	rpcClient *util.RPCClient
	txService *TransactionService
	contract  *MiniAMMContract
	repo      *db.BotActionRepository
}

// // 假设你已经生成了 UniswapV2Pair binding
// type DEXPriceFeed struct {
// 	client   *ethclient.Client
// 	pairAddr common.Address
// 	pair     *UniswapV2Pair
// }

// // NewDEXPriceFeed 创建实例
// func NewDEXPriceFeed(client *ethclient.Client, pairAddr common.Address) (*DEXPriceFeed, error) {
// 	pair, err := NewUniswapV2Pair(pairAddr, client)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to bind pair contract: %w", err)
// 	}

// 	return &DEXPriceFeed{
// 		client:   client,
// 		pairAddr: pairAddr,
// 		pair:     pair,
// 	}, nil
// }

func NewCompoundService(config *util.Config, rpcClient *util.RPCClient, txService *TransactionService, repo *db.BotActionRepository) (*CompoundService, error) {
	contract, err := NewMiniAMMContract(common.HexToAddress(config.ContractAddress), rpcClient.GetClient())
	if err != nil {
		return nil, err
	}

	return &CompoundService{
		config:    config,
		rpcClient: rpcClient,
		txService: txService,
		contract:  contract,
		repo:      repo,
	}, nil
}

// GetMarketPrice 获取市场价格（支持模拟波动）
func (c *CompoundService) GetMarketPrice(ctx context.Context) (*big.Float, error) {
	// 如果配置了模拟市场价格，则使用模拟波动值
	if c.config.SimulatedMarketPrice > 0 {
		// 使用正弦波模拟价格波动，周期为 60 秒，幅度为 ±10%
		basePrice := c.config.SimulatedMarketPrice
		amplitude := 0.05
		period := 1800.0
		t := float64(time.Now().Unix()) / period
		fluctuation := amplitude * math.Sin(2*math.Pi*t)
		price := basePrice * (1 + fluctuation)
		priceFloat := big.NewFloat(price)
		log.Infof("使用模拟波动市场价格: %s (基准: %f, 波动: %.2f%%)", priceFloat.Text('f', 8), basePrice, fluctuation*100)
		return priceFloat, nil
	}

	// 否则使用 AMM 内部价格
	reserves, err := c.contract.GetReserves(&bind.CallOpts{Context: ctx})
	if err != nil {
		return nil, fmt.Errorf("failed to get reserves: %w", err)
	}

	reserveA := reserves.Arg0
	reserveB := reserves.Arg1

	if reserveA.Cmp(big.NewInt(0)) == 0 {
		return nil, fmt.Errorf("reserveA is zero")
	}

	price := new(big.Float).Quo(new(big.Float).SetInt(reserveB), new(big.Float).SetInt(reserveA))

	log.Infof("DEX price calculated: %s (reserveB/reserveA)", price.Text('f', 8))
	return price, nil
}

func (c *CompoundService) Start(ctx context.Context) {
	ticker := time.NewTicker(c.config.CompoundInterval)
	defer ticker.Stop()

	log.Info("自动复投服务已启动")

	for {
		select {
		case <-ctx.Done():
			log.Info("自动复投服务已停止")
			return
		case <-ticker.C:
			if err := c.executeCompound(); err != nil {
				log.Errorf("执行复投失败: %v", err)
			}
		}
	}
}

func (c *CompoundService) executeCompound() error {
	log.Info("检查是否需要复投...")

	fees, err := c.contract.GetFees(&bind.CallOpts{})
	if err != nil {
		return fmt.Errorf("获取手续费失败: %w", err)
	}

	feeA := fees.Arg0
	feeB := fees.Arg1

	log.Infof("当前累积手续费: feeA=%s, feeB=%s", feeA.String(), feeB.String())

	minAmount := big.NewInt(1e15)
	if feeA.Cmp(minAmount) < 0 && feeB.Cmp(minAmount) < 0 {
		log.Info("手续费不足，跳过复投")
		return nil
	}

	log.Info("开始执行复投...")

	tx, err := c.txService.ExecuteCompoundFees()
	if err != nil {
		return fmt.Errorf("执行复投交易失败: %w", err)
	}

	log.Infof("复投交易已发送: %s", tx.Hash().Hex())

	receipt, err := c.txService.WaitForReceipt(tx.Hash())
	if err != nil {
		return fmt.Errorf("等待交易确认失败: %w", err)
	}

	status := "failed"
	if receipt.Status == 1 {
		log.Infof("✅ 复投成功! Gas 使用: %d", receipt.GasUsed)
		status = "success"
	} else {
		log.Error("❌ 复投交易失败")
	}

	// Save to database
	if c.repo != nil {
		action := &models.BotAction{
			Timestamp:  time.Now(),
			ActionType: models.ActionTypeCompound,
			AmountA:    feeA.String(),
			AmountB:    feeB.String(),
			TxHash:     tx.Hash().Hex(),
			Status:     status,
			GasUsed:    receipt.GasUsed,
		}
		if err := c.repo.Create(action); err != nil {
			log.Errorf("保存复投记录到数据库失败: %v", err)
		} else {
			log.Infof("✅ 复投记录已保存到数据库 (ID: %d)", action.ID)
		}
	}

	return nil
}

func (c *CompoundService) GetAccumulatedFees() (*big.Int, *big.Int, error) {
	fees, err := c.contract.GetFees(&bind.CallOpts{})
	if err != nil {
		return nil, nil, err
	}
	return fees.Arg0, fees.Arg1, nil
}

func (c *CompoundService) GetReserves() (*big.Int, *big.Int, error) {
	reserves, err := c.contract.GetReserves(&bind.CallOpts{})
	if err != nil {
		return nil, nil, err
	}
	return reserves.Arg0, reserves.Arg1, nil
}

func (c *CompoundService) CalculateOptimalAmounts(feeA, feeB, reserveA, reserveB *big.Int) (*big.Int, *big.Int) {
	if feeA.Cmp(big.NewInt(0)) == 0 || feeB.Cmp(big.NewInt(0)) == 0 {
		return big.NewInt(0), big.NewInt(0)
	}

	optimalA := new(big.Int).Mul(feeA, reserveB)
	optimalA.Div(optimalA, reserveA)

	compoundA := feeA
	compoundB := feeB

	if optimalA.Cmp(feeB) <= 0 {
		compoundB = optimalA
	} else {
		optimalB := new(big.Int).Mul(feeB, reserveA)
		optimalB.Div(optimalB, reserveB)
		compoundA = optimalB
	}

	return compoundA, compoundB
}
