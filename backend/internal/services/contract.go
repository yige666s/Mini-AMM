package services

import (
	"context"
	"fmt"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

type MiniAMMContract struct {
	address common.Address
	client  *ethclient.Client
	abi     abi.ABI
}

func NewMiniAMMContract(address common.Address, client *ethclient.Client) (*MiniAMMContract, error) {
	// MiniAMM ABI (简化版，只包含需要的函数)
	abiStr := `[{"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFees","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"compoundFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"bool","name":"AtoB","type":"bool"}],"name":"rebalance","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}]`
	parsedABI, err := abi.JSON(strings.NewReader(abiStr))
	if err != nil {
		return nil, err
	}

	return &MiniAMMContract{
		address: address,
		client:  client,
		abi:     parsedABI,
	}, nil
}

func (c *MiniAMMContract) GetReserves(opts *bind.CallOpts) (struct {
	Arg0 *big.Int
	Arg1 *big.Int
}, error) {
	var result struct {
		Arg0 *big.Int
		Arg1 *big.Int
	}

	data, err := c.abi.Pack("getReserves")
	if err != nil {
		return result, fmt.Errorf("failed to pack getReserves: %w", err)
	}

	msg := ethereum.CallMsg{
		To:   &c.address,
		Data: data,
	}
	if opts != nil {
		msg.From = opts.From
	}

	output, err := c.client.CallContract(context.Background(), msg, nil)
	if err != nil {
		return result, fmt.Errorf("failed to call contract: %w", err)
	}

	if len(output) == 0 {
		return result, fmt.Errorf("empty output from contract call")
	}

	results, err := c.abi.Unpack("getReserves", output)
	if err != nil {
		return result, fmt.Errorf("failed to unpack output: %w, output: %x", err, output)
	}

	if len(results) < 2 {
		return result, fmt.Errorf("insufficient results: got %d, want 2", len(results))
	}

	result.Arg0 = results[0].(*big.Int)
	result.Arg1 = results[1].(*big.Int)
	return result, nil
}

func (c *MiniAMMContract) GetFees(opts *bind.CallOpts) (struct {
	Arg0 *big.Int
	Arg1 *big.Int
}, error) {
	var result struct {
		Arg0 *big.Int
		Arg1 *big.Int
	}

	data, err := c.abi.Pack("getFees")
	if err != nil {
		return result, err
	}

	msg := ethereum.CallMsg{
		To:   &c.address,
		Data: data,
	}
	if opts != nil {
		msg.From = opts.From
	}

	output, err := c.client.CallContract(context.Background(), msg, nil)
	if err != nil {
		return result, err
	}

	results, err := c.abi.Unpack("getFees", output)
	if err != nil {
		return result, err
	}

	if len(results) < 2 {
		return result, fmt.Errorf("insufficient results: got %d, want 2", len(results))
	}

	result.Arg0 = results[0].(*big.Int)
	result.Arg1 = results[1].(*big.Int)
	return result, nil
}

func (c *MiniAMMContract) CompoundFees(opts *bind.TransactOpts) (*types.Transaction, error) {
	data, err := c.abi.Pack("compoundFees")
	if err != nil {
		return nil, err
	}

	nonce, err := c.client.PendingNonceAt(context.Background(), opts.From)
	if err != nil {
		return nil, err
	}

	gasPrice, err := c.client.SuggestGasPrice(context.Background())
	if err != nil {
		return nil, err
	}

	tx := types.NewTransaction(nonce, c.address, big.NewInt(0), opts.GasLimit, gasPrice, data)
	signedTx, err := opts.Signer(opts.From, tx)
	if err != nil {
		return nil, err
	}

	err = c.client.SendTransaction(context.Background(), signedTx)
	return signedTx, err
}

func (c *MiniAMMContract) Rebalance(opts *bind.TransactOpts, amount *big.Int, AtoB bool) (*types.Transaction, error) {
	data, err := c.abi.Pack("rebalance", amount, AtoB)
	if err != nil {
		return nil, err
	}

	nonce, err := c.client.PendingNonceAt(context.Background(), opts.From)
	if err != nil {
		return nil, err
	}

	gasPrice, err := c.client.SuggestGasPrice(context.Background())
	if err != nil {
		return nil, err
	}

	tx := types.NewTransaction(nonce, c.address, big.NewInt(0), opts.GasLimit, gasPrice, data)
	signedTx, err := opts.Signer(opts.From, tx)
	if err != nil {
		return nil, err
	}

	err = c.client.SendTransaction(context.Background(), signedTx)
	return signedTx, err
}
