package models

import (
	"time"
)

type ActionType string

const (
	ActionTypeCompound  ActionType = "COMPOUND"
	ActionTypeRebalance ActionType = "REBALANCE"
)

type BotAction struct {
	ID        int64      `json:"id"`
	Timestamp time.Time  `json:"timestamp"`
	ActionType ActionType `json:"actionType"`
	AmountA   string     `json:"amountA"`
	AmountB   string     `json:"amountB"`
	TxHash    string     `json:"txHash"`
	Direction *string    `json:"direction,omitempty"` // For rebalance: "AtoB" or "BtoA"
	Status    string     `json:"status"` // "success" or "failed"
	GasUsed   uint64     `json:"gasUsed,omitempty"`
	CreatedAt time.Time  `json:"createdAt"`
}
