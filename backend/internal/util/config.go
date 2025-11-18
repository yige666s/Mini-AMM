package util

import (
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
}

func LoadConfig() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		log.Warn("未找到 .env 文件，使用环境变量")
	}

	compoundInterval, _ := strconv.Atoi(getEnv("COMPOUND_INTERVAL", "300"))
	rebalanceInterval, _ := strconv.Atoi(getEnv("REBALANCE_INTERVAL", "60"))
	rebalanceThreshold, _ := strconv.ParseFloat(getEnv("REBALANCE_THRESHOLD", "0.05"), 64)
	gasLimit, _ := strconv.ParseUint(getEnv("GAS_LIMIT", "300000"), 10, 64)
	maxGasPrice, _ := strconv.ParseInt(getEnv("MAX_GAS_PRICE", "100"), 10, 64)
	retryAttempts, _ := strconv.Atoi(getEnv("RETRY_ATTEMPTS", "3"))
	retryDelay, _ := strconv.Atoi(getEnv("RETRY_DELAY", "5"))
	chainID, _ := strconv.ParseInt(getEnv("CHAIN_ID", "31337"), 10, 64)

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
