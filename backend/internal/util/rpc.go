package util

import (
	"context"
	"time"

	"github.com/ethereum/go-ethereum/ethclient"
	log "github.com/sirupsen/logrus"
)

type RPCClient struct {
	client          *ethclient.Client
	config          *Config
	currentEndpoint string
	fallbackIndex   int
}

func NewRPCClient(config *Config) (*RPCClient, error) {
	client, err := ethclient.Dial(config.RPCEndpoint)
	if err != nil {
		return nil, err
	}

	return &RPCClient{
		client:          client,
		config:          config,
		currentEndpoint: config.RPCEndpoint,
		fallbackIndex:   -1,
	}, nil
}

func (r *RPCClient) GetClient() *ethclient.Client {
	return r.client
}

func (r *RPCClient) SwitchToFallback() error {
	if len(r.config.FallbackRPCEndpoints) == 0 {
		return nil
	}

	r.fallbackIndex++
	if r.fallbackIndex >= len(r.config.FallbackRPCEndpoints) {
		r.fallbackIndex = 0
	}

	fallbackEndpoint := r.config.FallbackRPCEndpoints[r.fallbackIndex]
	log.Warnf("切换到备用 RPC 节点: %s", fallbackEndpoint)

	client, err := ethclient.Dial(fallbackEndpoint)
	if err != nil {
		log.Errorf("连接备用 RPC 节点失败: %v", err)
		return err
	}

	if r.client != nil {
		r.client.Close()
	}

	r.client = client
	r.currentEndpoint = fallbackEndpoint
	return nil
}

func (r *RPCClient) CheckConnection() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.client.BlockNumber(ctx)
	if err != nil {
		log.Errorf("RPC 连接检查失败: %v", err)
		return err
	}

	return nil
}

func (r *RPCClient) GetBlockNumber() (uint64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return r.client.BlockNumber(ctx)
}

func (r *RPCClient) Close() {
	if r.client != nil {
		r.client.Close()
	}
}
