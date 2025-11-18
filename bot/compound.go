package main

import (
	"context"
	"fmt"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	log "github.com/sirupsen/logrus"
)

type CompoundService struct {
	config     *Config
	rpcClient  *RPCClient
	txService  *TransactionService
	contract   *MiniAMMContract
}

func NewCompoundService(config *Config, rpcClient *RPCClient, txService *TransactionService) (*CompoundService, error) {
	contract, err := NewMiniAMMContract(common.HexToAddress(config.ContractAddress), rpcClient.GetClient())
	if err != nil {
		return nil, err
	}

	return &CompoundService{
		config:    config,
		rpcClient: rpcClient,
		txService: txService,
		contract:  contract,
	}, nil
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
	if feeA.Cmp(minAmount) < 0 || feeB.Cmp(minAmount) < 0 {
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

	if receipt.Status == 1 {
		log.Infof("✅ 复投成功! Gas 使用: %d", receipt.GasUsed)
	} else {
		log.Error("❌ 复投交易失败")
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
