package main

import (
	"context"
	"fmt"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	log "github.com/sirupsen/logrus"
)

type RebalanceService struct {
	config           *Config
	rpcClient        *RPCClient
	txService        *TransactionService
	compoundService  *CompoundService
	initialPrice     *big.Float
}

func NewRebalanceService(config *Config, rpcClient *RPCClient, txService *TransactionService, compoundService *CompoundService) (*RebalanceService, error) {
	return &RebalanceService{
		config:          config,
		rpcClient:       rpcClient,
		txService:       txService,
		compoundService: compoundService,
	}, nil
}

func (r *RebalanceService) Start(ctx context.Context) {
	if err := r.initializePrice(); err != nil {
		log.Errorf("初始化价格失败: %v", err)
		return
	}

	ticker := time.NewTicker(r.config.RebalanceInterval)
	defer ticker.Stop()

	log.Info("自动再平衡服务已启动")

	for {
		select {
		case <-ctx.Done():
			log.Info("自动再平衡服务已停止")
			return
		case <-ticker.C:
			if err := r.checkAndRebalance(); err != nil {
				log.Errorf("检查再平衡失败: %v", err)
			}
		}
	}
}

func (r *RebalanceService) initializePrice() error {
	reserveA, reserveB, err := r.compoundService.GetReserves()
	if err != nil {
		return err
	}

	if reserveA.Cmp(big.NewInt(0)) == 0 {
		log.Warn("流动性池为空，等待初始化")
		return nil
	}

	r.initialPrice = new(big.Float).Quo(
		new(big.Float).SetInt(reserveB),
		new(big.Float).SetInt(reserveA),
	)

	log.Infof("初始价格: %s", r.initialPrice.String())
	return nil
}

func (r *RebalanceService) checkAndRebalance() error {
	if r.initialPrice == nil {
		if err := r.initializePrice(); err != nil {
			return err
		}
		if r.initialPrice == nil {
			return nil
		}
	}

	reserveA, reserveB, err := r.compoundService.GetReserves()
	if err != nil {
		return fmt.Errorf("获取储备量失败: %w", err)
	}

	if reserveA.Cmp(big.NewInt(0)) == 0 {
		return nil
	}

	currentPrice := new(big.Float).Quo(
		new(big.Float).SetInt(reserveB),
		new(big.Float).SetInt(reserveA),
	)

	priceDiff := new(big.Float).Sub(currentPrice, r.initialPrice)
	priceDiff.Abs(priceDiff)

	priceDeviation := new(big.Float).Quo(priceDiff, r.initialPrice)
	deviation, _ := priceDeviation.Float64()

	log.Debugf("当前价格偏差: %.4f%%", deviation*100)

	if deviation > r.config.RebalanceThreshold {
		log.Warnf("价格偏差超过阈值 (%.2f%%), 执行再平衡", r.config.RebalanceThreshold*100)
		return r.executeRebalance(currentPrice, reserveA, reserveB)
	}

	return nil
}

func (r *RebalanceService) executeRebalance(currentPrice *big.Float, reserveA, reserveB *big.Int) error {
	AtoB := false
	comp := currentPrice.Cmp(r.initialPrice)
	if comp > 0 {
		AtoB = true
	}

	rebalanceAmount := new(big.Int).Div(reserveA, big.NewInt(100))
	if rebalanceAmount.Cmp(big.NewInt(1e15)) < 0 {
		rebalanceAmount = big.NewInt(1e15)
	}

	log.Infof("执行再平衡: amount=%s, AtoB=%v", rebalanceAmount.String(), AtoB)

	tx, err := r.txService.ExecuteRebalance(rebalanceAmount, AtoB)
	if err != nil {
		return fmt.Errorf("执行再平衡交易失败: %w", err)
	}

	log.Infof("再平衡交易已发送: %s", tx.Hash().Hex())

	receipt, err := r.txService.WaitForReceipt(tx.Hash())
	if err != nil {
		return fmt.Errorf("等待交易确认失败: %w", err)
	}

	if receipt.Status == 1 {
		log.Infof("✅ 再平衡成功! Gas 使用: %d", receipt.GasUsed)
		return r.initializePrice()
	} else {
		log.Error("❌ 再平衡交易失败")
	}

	return nil
}

func (r *RebalanceService) GetCurrentDeviation() (float64, error) {
	if r.initialPrice == nil {
		return 0, fmt.Errorf("初始价格未设置")
	}

	reserveA, reserveB, err := r.compoundService.GetReserves()
	if err != nil {
		return 0, err
	}

	if reserveA.Cmp(big.NewInt(0)) == 0 {
		return 0, fmt.Errorf("流动性池为空")
	}

	currentPrice := new(big.Float).Quo(
		new(big.Float).SetInt(reserveB),
		new(big.Float).SetInt(reserveA),
	)

	priceDiff := new(big.Float).Sub(currentPrice, r.initialPrice)
	priceDiff.Abs(priceDiff)

	priceDeviation := new(big.Float).Quo(priceDiff, r.initialPrice)
	deviation, _ := priceDeviation.Float64()

	return deviation, nil
}
