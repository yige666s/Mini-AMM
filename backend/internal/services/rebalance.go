package services

import (
	"context"
	"errors"
	"fmt"
	"math"
	"math/big"
	"time"

	"mini-amm-bot/internal/db"
	"mini-amm-bot/internal/models"
	util "mini-amm-bot/internal/util"

	log "github.com/sirupsen/logrus"
)

// 市场决定版本的 RebalanceService：
// - 不维护 initialPrice（不追逐价格）
// - 使用外部 marketPrice (oracle 或市场聚合价) 作为定价依据
// - 目标策略：按市值 50/50 分配（可扩展为可配置目标比例）
// - 再平衡采用温和策略：限制单次交易量、检测最小交易量、记录日志并保存到 repo
type RebalanceService struct {
	config          *util.Config
	rpcClient       *util.RPCClient
	txService       *TransactionService
	compoundService *CompoundService
	repo            *db.BotActionRepository

	// 可配置的目标价值比例 (默认 0.5 即 50/50)
	targetValueShare float64
}

func NewRebalanceServiceMarket(config *util.Config, rpcClient *util.RPCClient, txService *TransactionService, compoundService *CompoundService, repo *db.BotActionRepository) (*RebalanceService, error) {
	// targetValueShare 可从 config 获取，默认 0.5
	target := 0.5
	if config != nil && config.TargetValueShare > 0 {
		target = config.TargetValueShare
	}
	return &RebalanceService{
		config:           config,
		rpcClient:        rpcClient,
		txService:        txService,
		compoundService:  compoundService,
		repo:             repo,
		targetValueShare: target,
	}, nil
}

func (r *RebalanceService) Start(ctx context.Context) {
	ticker := time.NewTicker(r.config.RebalanceInterval)
	defer ticker.Stop()

	log.Info("自动再平衡服务已启动")

	for {
		select {
		case <-ctx.Done():
			log.Info("自动再平衡服务已停止")
			return
		case <-ticker.C:
			if err := r.checkAndRebalanceMarket(); err != nil {
				log.Errorf("再平衡检查失败: %v", err)
			}
		}
	}
}

// checkAndRebalanceMarket
func (r *RebalanceService) checkAndRebalanceMarket() error {
	log.Info("执行再平衡检查")

	// 1. 获取储备
	reserveA, reserveB, err := r.compoundService.GetReserves()
	if err != nil {
		return fmt.Errorf("获取储备量失败: %w", err)
	}
	if reserveA.Cmp(big.NewInt(0)) == 0 || reserveB.Cmp(big.NewInt(0)) == 0 {
		return errors.New("流动性池储备不足，跳过")
	}

	// 2. 获取市场价格
	marketPrice, err := r.compoundService.GetMarketPrice(context.Background())
	if err != nil {
		return fmt.Errorf("获取市场价格失败: %w", err)
	}

	// 3. 计算价值：使用市场价格按 B 计价（假设 B 为基准资产）
	price := marketPrice // A 相对于 B 的价格

	valueA := new(big.Float).SetInt(reserveA)
	valueA.Mul(valueA, price)

	valueB := new(big.Float).SetInt(reserveB)

	totalValue := new(big.Float).Add(valueA, valueB)
	if isZeroFloat(totalValue) {
		return errors.New("总价值为 0，跳过")
	}

	// 每边希望持有的价值（默认 50%）
	targetValueEach := new(big.Float).Mul(
		totalValue,
		big.NewFloat(r.targetValueShare),
	)

	// 4. 根据 AMM 内部价格反推目标储备
	targetReserveA := new(big.Float).Quo(targetValueEach, price)
	targetReserveB := new(big.Float).Set(targetValueEach)

	// 转 int
	targetReserveAInt := floatToBigIntFloor(targetReserveA)
	targetReserveBInt := floatToBigIntFloor(targetReserveB)

	log.Infof("当前储备: A=%s, B=%s", reserveA.String(), reserveB.String())
	log.Infof("目标储备: A=%s, B=%s", targetReserveAInt.String(), targetReserveBInt.String())

	// 检查目标储备是否过大（防止合约溢出）
	maxReserve := new(big.Int).Lsh(big.NewInt(1), 255) // 2^255，大约 5.7e76
	if targetReserveAInt.Cmp(maxReserve) > 0 || targetReserveBInt.Cmp(maxReserve) > 0 {
		log.Warnf("目标储备过大，跳过再平衡: targetA=%s, targetB=%s", targetReserveAInt.String(), targetReserveBInt.String())
		return nil
	}

	// 5. 偏差判断
	diffValue := new(big.Float).Abs(new(big.Float).Sub(valueA, valueB))
	deviationFloat, _ := new(big.Float).Quo(diffValue, totalValue).Float64()

	if deviationFloat <= r.config.RebalanceThreshold {
		return nil // 不需要 rebalance
	}

	// 6. 计算需要 swap 的量
	diffA := new(big.Int).Sub(reserveA, targetReserveAInt)
	diffB := new(big.Int).Sub(reserveB, targetReserveBInt)

	var directionAtoB bool
	var swapAmount *big.Int

	if diffA.Cmp(big.NewInt(0)) > 0 {
		// A 多，卖 A -> 买 B
		directionAtoB = true
		swapAmount = diffA
	} else if diffB.Cmp(big.NewInt(0)) > 0 {
		// B 多，卖 B -> 买 A
		directionAtoB = false
		swapAmount = diffB
	} else {
		return nil
	}

	// 7. 限制换手比例
	maxFrac := r.config.MaxRebalanceFraction
	if maxFrac <= 0 || maxFrac > 1 {
		maxFrac = 0.1
	}

	swapCap := fractionOfBigInt(swapAmount, maxFrac)
	if swapCap.Cmp(big.NewInt(0)) > 0 {
		swapAmount = swapCap
	}

	// // 8. 最小换手量过滤
	// minSwap := r.config.MinRebalanceAmount
	// if minSwap == nil || minSwap.Cmp(big.NewInt(0)) == 0 {
	// 	minSwap = big.NewInt(1e15) // 默认 0.001 token
	// }

	// if swapAmount.Cmp(minSwap) < 0 {
	// 	return nil
	// }

	// 9. 执行 swap
	return r.executeRebalanceMarket(directionAtoB, swapAmount)
}

// executeRebalanceMarket: 发送链上交易并保存记录（与之前类似）
// directionAtoB: true 表示把 A 换成 B（A->B），false 表示 B->A
func (r *RebalanceService) executeRebalanceMarket(directionAtoB bool, amount *big.Int) error {
	log.Infof("执行再平衡: directionAtoB=%t, amount=%s", directionAtoB, amount.String())

	// 根据你的 txService 实现细节传参（这里保持和原来 ExecuteRebalance 类似的签名）
	tx, err := r.txService.ExecuteRebalance(amount, directionAtoB)
	if err != nil {
		return fmt.Errorf("执行再平衡交易失败: %w", err)
	}

	log.Infof("再平衡交易已发送: %s", tx.Hash().Hex())

	receipt, err := r.txService.WaitForReceipt(tx.Hash())
	if err != nil {
		return fmt.Errorf("等待交易确认失败: %w", err)
	}

	status := "failed"
	if receipt.Status == 1 {
		log.Infof("✅ 再平衡成功! Gas 使用: %d", receipt.GasUsed)
		status = "success"
	} else {
		log.Error("❌ 再平衡交易失败")
	}

	// 保存记录
	if r.repo != nil {
		direction := "BtoA"
		if directionAtoB {
			direction = "AtoB"
		}
		action := &models.BotAction{
			Timestamp:  time.Now(),
			ActionType: models.ActionTypeRebalance,
			AmountA:    amount.String(),
			AmountB:    "0",
			TxHash:     tx.Hash().Hex(),
			Direction:  &direction,
			Status:     status,
			GasUsed:    receipt.GasUsed,
		}
		if err := r.repo.Create(action); err != nil {
			log.Errorf("保存再平衡记录到数据库失败: %v", err)
		} else {
			log.Infof("✅ 再平衡记录已保存到数据库 (ID: %d)", action.ID)
		}
	}

	return nil
}

//
// ---------- 辅助函数 ----------
//

// bigFloatFromInt: 把 big.Int 转为 big.Float
func bigFloatFromInt(i *big.Int) *big.Float {
	return new(big.Float).SetInt(i)
}

// isZeroFloat: 判断 big.Float 是否为 0
func isZeroFloat(f *big.Float) bool {
	z := new(big.Float).SetFloat64(0)
	return f.Cmp(z) == 0
}

// floatToBigIntFloor: 把 big.Float 向下取整为 big.Int
func floatToBigIntFloor(f *big.Float) *big.Int {
	i := new(big.Int)
	f.Int(i) // 注意：Int 截断取整（向零），对于正数即向下取整
	return i
}

// fractionOfBigInt: 取 big.Int 的 fraction（例如 fraction=0.1 -> 返回 floor(n*0.1)）
func fractionOfBigInt(n *big.Int, fraction float64) *big.Int {
	if n == nil || fraction <= 0 {
		return big.NewInt(0)
	}
	// 将 n 转为 float64 进行近似（谨慎：对于超大数会有精度损失，若需要高精度请用 big.Rat）
	nf, _ := new(big.Float).SetInt(n).Float64()
	val := math.Floor(nf * fraction)
	if val < 0 {
		val = 0
	}
	return big.NewInt(int64(val))
}

// ternary: 辅助打印
func ternary(cond bool, a, b string) string {
	if cond {
		return a
	}
	return b
}
