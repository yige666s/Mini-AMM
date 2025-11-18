package main

import (
    "context"
    "math/big"
    "os"
    "os/signal"
    "syscall"

    log "github.com/sirupsen/logrus"
)

func main() {
    log.SetFormatter(&log.TextFormatter{
        FullTimestamp: true,
    })
    log.SetLevel(log.InfoLevel)

    log.Info("🚀 Mini-AMM Keeper Bot 启动中...")

    config, err := LoadConfig()
    if err != nil {
        log.Fatalf("加载配置失败: %v", err)
    }

    log.Infof("配置加载成功:")
    log.Infof("  RPC: %s", config.RPCEndpoint)
    log.Infof("  合约地址: %s", config.ContractAddress)
    log.Infof("  Chain ID: %d", config.ChainID)
    log.Infof("  复投间隔: %s", config.CompoundInterval)
    log.Infof("  再平衡间隔: %s", config.RebalanceInterval)
    log.Infof("  再平衡阈值: %.2f%%", config.RebalanceThreshold*100)

    rpcClient, err := NewRPCClient(config)
    if err != nil {
        log.Fatalf("连接 RPC 节点失败: %v", err)
    }
    defer rpcClient.Close()

    if err := rpcClient.CheckConnection(); err != nil {
        log.Fatalf("RPC 连接检查失败: %v", err)
    }
    log.Info("✅ RPC 连接成功")

    txService, err := NewTransactionService(config, rpcClient)
    if err != nil {
        log.Fatalf("初始化交易服务失败: %v", err)
    }

    log.Infof("Bot 账户地址: %s", txService.GetFromAddress().Hex())

    balance, err := txService.GetBalance()
    if err != nil {
        log.Warnf("获取账户余额失败: %v", err)
    } else {
        log.Infof("账户余额: %s ETH", formatEther(balance))
    }

    compoundService, err := NewCompoundService(config, rpcClient, txService)
    if err != nil {
        log.Fatalf("初始化复投服务失败: %v", err)
    }

    rebalanceService, err := NewRebalanceService(config, rpcClient, txService, compoundService)
    if err != nil {
        log.Fatalf("初始化再平衡服务失败: %v", err)
    }

    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    go compoundService.Start(ctx)
    go rebalanceService.Start(ctx)

    log.Info("✅ Keeper Bot 运行中...")
    log.Info("按 Ctrl+C 停止")

    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    <-sigChan

    log.Info("收到停止信号，正在关闭...")
    cancel()
    log.Info("👋 Keeper Bot 已停止")
}

func formatEther(wei *big.Int) string {
    if wei == nil {
        return "0"
    }
    ether := new(big.Float).Quo(
        new(big.Float).SetInt(wei),
        new(big.Float).SetInt(big.NewInt(1e18)),
    )
    return ether.Text('f', 6)
}
