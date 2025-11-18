package main

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	log "github.com/sirupsen/logrus"
)

type TransactionService struct {
	config      *Config
	rpcClient   *RPCClient
	privateKey  *ecdsa.PrivateKey
	fromAddress common.Address
	contract    *MiniAMMContract
}

func NewTransactionService(config *Config, rpcClient *RPCClient) (*TransactionService, error) {
	privateKey, err := crypto.HexToECDSA(config.PrivateKey)
	if err != nil {
		return nil, fmt.Errorf("解析私钥失败: %w", err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("无法转换公钥")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	contract, err := NewMiniAMMContract(common.HexToAddress(config.ContractAddress), rpcClient.GetClient())
	if err != nil {
		return nil, err
	}

	return &TransactionService{
		config:      config,
		rpcClient:   rpcClient,
		privateKey:  privateKey,
		fromAddress: fromAddress,
		contract:    contract,
	}, nil
}

func (t *TransactionService) GetTransactOpts() (*bind.TransactOpts, error) {
	nonce, err := t.rpcClient.GetClient().PendingNonceAt(context.Background(), t.fromAddress)
	if err != nil {
		return nil, fmt.Errorf("获取 nonce 失败: %w", err)
	}

	gasPrice, err := t.rpcClient.GetClient().SuggestGasPrice(context.Background())
	if err != nil {
		return nil, fmt.Errorf("获取 gas price 失败: %w", err)
	}

	maxGasPrice := big.NewInt(t.config.MaxGasPrice * 1e9)
	if gasPrice.Cmp(maxGasPrice) > 0 {
		log.Warnf("Gas price 过高 (%s), 使用最大值 %s", gasPrice.String(), maxGasPrice.String())
		gasPrice = maxGasPrice
	}

	auth, err := bind.NewKeyedTransactorWithChainID(t.privateKey, big.NewInt(t.config.ChainID))
	if err != nil {
		return nil, fmt.Errorf("创建交易签名器失败: %w", err)
	}

	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)
	auth.GasLimit = t.config.GasLimit
	auth.GasPrice = gasPrice

	return auth, nil
}

func (t *TransactionService) ExecuteCompoundFees() (*types.Transaction, error) {
	auth, err := t.GetTransactOpts()
	if err != nil {
		return nil, err
	}

	tx, err := t.contract.CompoundFees(auth)
	if err != nil {
		return nil, fmt.Errorf("调用 compoundFees 失败: %w", err)
	}

	return tx, nil
}

func (t *TransactionService) ExecuteRebalance(amount *big.Int, AtoB bool) (*types.Transaction, error) {
	auth, err := t.GetTransactOpts()
	if err != nil {
		return nil, err
	}

	tx, err := t.contract.Rebalance(auth, amount, AtoB)
	if err != nil {
		return nil, fmt.Errorf("调用 rebalance 失败: %w", err)
	}

	return tx, nil
}

func (t *TransactionService) WaitForReceipt(txHash common.Hash) (*types.Receipt, error) {
	for i := 0; i < t.config.RetryAttempts; i++ {
		time.Sleep(t.config.RetryDelay)

		receipt, err := t.rpcClient.GetClient().TransactionReceipt(context.Background(), txHash)
		if err == nil {
			return receipt, nil
		}

		log.Debugf("等待交易确认... (尝试 %d/%d)", i+1, t.config.RetryAttempts)
	}

	return nil, fmt.Errorf("交易确认超时")
}

func (t *TransactionService) GetBalance() (*big.Int, error) {
	return t.rpcClient.GetClient().BalanceAt(context.Background(), t.fromAddress, nil)
}

func (t *TransactionService) GetFromAddress() common.Address {
	return t.fromAddress
}
