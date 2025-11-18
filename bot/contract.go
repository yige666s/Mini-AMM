package main

import (
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

type MiniAMMContract struct {
	address common.Address
	client  *ethclient.Client
}

func NewMiniAMMContract(address common.Address, client *ethclient.Client) (*MiniAMMContract, error) {
	return &MiniAMMContract{
		address: address,
		client:  client,
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
	result.Arg0 = big.NewInt(0)
	result.Arg1 = big.NewInt(0)
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
	result.Arg0 = big.NewInt(0)
	result.Arg1 = big.NewInt(0)
	return result, nil
}

func (c *MiniAMMContract) CompoundFees(opts *bind.TransactOpts) (*types.Transaction, error) {
	return nil, nil
}

func (c *MiniAMMContract) Rebalance(opts *bind.TransactOpts, amount *big.Int, AtoB bool) (*types.Transaction, error) {
	return nil, nil
}
