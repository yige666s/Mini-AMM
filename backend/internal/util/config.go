package util

import (
	"math"
	"math/big"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	log "github.com/sirupsen/logrus"
)

type Config struct {
	RPCEndpoint          string
	FallbackRPCEndpoints []string
	ContractAddress      string
	PrivateKey           string
	ChainID              int64
	CompoundInterval     time.Duration
	RebalanceInterval    time.Duration
	RebalanceThreshold   float64
	GasLimit             uint64
	MaxGasPrice          int64
	RetryAttempts        int
	RetryDelay           time.Duration
	TargetValueShare     float64  // 目标价值占比
	MaxRebalanceFraction float64  // 单次最大再平衡比例
	MinRebalanceAmount   *big.Int // 最小再平衡金额
	SimulatedMarketPrice float64  // 模拟市场价格（A 相对于 B 的价格）
}

func LoadConfig() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		log.Warn("未找到 .env 文件，使用环境变量")
	}

	compoundInterval, _ := strconv.Atoi(getEnv("COMPOUND_INTERVAL", "300"))
	rebalanceInterval, _ := strconv.Atoi(getEnv("REBALANCE_INTERVAL", "300"))
	rebalanceThreshold, _ := strconv.ParseFloat(getEnv("REBALANCE_THRESHOLD", "0.10"), 64)
	gasLimit, _ := strconv.ParseUint(getEnv("GAS_LIMIT", "300000"), 10, 64)
	maxGasPrice, _ := strconv.ParseInt(getEnv("MAX_GAS_PRICE", "100"), 10, 64)
	retryAttempts, _ := strconv.Atoi(getEnv("RETRY_ATTEMPTS", "3"))
	retryDelay, _ := strconv.Atoi(getEnv("RETRY_DELAY", "5"))
	chainID, _ := strconv.ParseInt(getEnv("CHAIN_ID", "31337"), 10, 64)
	targetValueShare, _ := strconv.ParseFloat(getEnv("TARGET_VALUE_SHARE", "0.5"), 64)
	maxRebalanceFraction, _ := strconv.ParseFloat(getEnv("MAX_REBALANCE_FRACTION", "0.005"), 64)
	minRebalanceAmount := GetEnvBigInt("MIN_REBALANCE_AMOUNT", "1e15")
	simulatedMarketPrice, _ := strconv.ParseFloat(getEnv("SIMULATED_MARKET_PRICE", "1"), 64)

	fallbackRPCs := []string{}
	if fallback := getEnv("FALLBACK_RPC_ENDPOINTS", ""); fallback != "" {
		fallbackRPCs = append(fallbackRPCs, fallback)
	}

	config := &Config{
		RPCEndpoint:          getEnv("RPC_ENDPOINT", "http://localhost:8545"),
		FallbackRPCEndpoints: fallbackRPCs,
		ContractAddress:      getEnv("CONTRACT_ADDRESS", ""),
		PrivateKey:           getEnv("PRIVATE_KEY", ""),
		ChainID:              chainID,
		CompoundInterval:     time.Duration(compoundInterval) * time.Second,
		RebalanceInterval:    time.Duration(rebalanceInterval) * time.Second,
		RebalanceThreshold:   rebalanceThreshold,
		GasLimit:             gasLimit,
		MaxGasPrice:          maxGasPrice,
		RetryAttempts:        retryAttempts,
		RetryDelay:           time.Duration(retryDelay) * time.Second,
		TargetValueShare:     targetValueShare,
		MaxRebalanceFraction: maxRebalanceFraction,
		MinRebalanceAmount:   minRebalanceAmount,
		SimulatedMarketPrice: simulatedMarketPrice,
	}

	if config.ContractAddress == "" {
		log.Fatal("CONTRACT_ADDRESS 未设置")
	}
	if config.PrivateKey == "" {
		log.Fatal("PRIVATE_KEY 未设置")
	}

	return config, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// GetEnvBigInt: 从 env 读取并解析为 *big.Int，支持整数字符串或科学计数法如 "1e15"
func GetEnvBigInt(key string, defaultVal string) *big.Int {
	raw := os.Getenv(key)
	if raw == "" {
		raw = defaultVal
	}
	// 尝试直接解析为整数
	i := new(big.Int)
	if _, ok := i.SetString(raw, 10); ok {
		return i
	}
	// 如果是科学计数法或浮点形式，先 parse 为 float then to big.Int
	f, err := strconv.ParseFloat(raw, 64)
	if err != nil {
		// 兜底，返回 0
		return big.NewInt(0)
	}
	// 转换为整数（向下取整）
	val := math.Floor(f)
	return big.NewInt(int64(val))
}
