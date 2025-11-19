package db

import (
	"database/sql"
	"fmt"
	"mini-amm-bot/internal/models"
)

type BotActionRepository struct {
	db *sql.DB
}

func NewBotActionRepository(db *sql.DB) *BotActionRepository {
	return &BotActionRepository{db: db}
}

func (r *BotActionRepository) Create(action *models.BotAction) error {
	query := `
		INSERT INTO bot_actions (timestamp, action_type, amount_a, amount_b, tx_hash, direction, status, gas_used)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at
	`

	err := r.db.QueryRow(
		query,
		action.Timestamp,
		action.ActionType,
		action.AmountA,
		action.AmountB,
		action.TxHash,
		action.Direction,
		action.Status,
		action.GasUsed,
	).Scan(&action.ID, &action.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create bot action: %w", err)
	}

	return nil
}

type QueryFilter struct {
	ActionType *models.ActionType
	Limit      int
	Offset     int
}

func (r *BotActionRepository) List(filter QueryFilter) ([]models.BotAction, error) {
	query := `
		SELECT id, timestamp, action_type, amount_a, amount_b, tx_hash, direction, status, gas_used, created_at
		FROM bot_actions
	`

	args := []interface{}{}
	argIndex := 1

	if filter.ActionType != nil {
		query += fmt.Sprintf(" WHERE action_type = $%d", argIndex)
		args = append(args, *filter.ActionType)
		argIndex++
	}

	query += " ORDER BY timestamp DESC"

	if filter.Limit > 0 {
		query += fmt.Sprintf(" LIMIT $%d", argIndex)
		args = append(args, filter.Limit)
		argIndex++
	}

	if filter.Offset > 0 {
		query += fmt.Sprintf(" OFFSET $%d", argIndex)
		args = append(args, filter.Offset)
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query bot actions: %w", err)
	}
	defer rows.Close()

	actions := []models.BotAction{}
	for rows.Next() {
		var action models.BotAction
		err := rows.Scan(
			&action.ID,
			&action.Timestamp,
			&action.ActionType,
			&action.AmountA,
			&action.AmountB,
			&action.TxHash,
			&action.Direction,
			&action.Status,
			&action.GasUsed,
			&action.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan bot action: %w", err)
		}
		actions = append(actions, action)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return actions, nil
}

func (r *BotActionRepository) GetByTxHash(txHash string) (*models.BotAction, error) {
	query := `
		SELECT id, timestamp, action_type, amount_a, amount_b, tx_hash, direction, status, gas_used, created_at
		FROM bot_actions
		WHERE tx_hash = $1
	`

	var action models.BotAction
	err := r.db.QueryRow(query, txHash).Scan(
		&action.ID,
		&action.Timestamp,
		&action.ActionType,
		&action.AmountA,
		&action.AmountB,
		&action.TxHash,
		&action.Direction,
		&action.Status,
		&action.GasUsed,
		&action.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get bot action by tx hash: %w", err)
	}

	return &action, nil
}

func (r *BotActionRepository) CountByType(actionType models.ActionType) (int64, error) {
	query := `SELECT COUNT(*) FROM bot_actions WHERE action_type = $1`

	var count int64
	err := r.db.QueryRow(query, actionType).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count bot actions: %w", err)
	}

	return count, nil
}

func (r *BotActionRepository) GetLatestAction() (*models.BotAction, error) {
	query := `
		SELECT id, timestamp, action_type, amount_a, amount_b, tx_hash, direction, status, gas_used, created_at
		FROM bot_actions
		ORDER BY timestamp DESC
		LIMIT 1
	`

	var action models.BotAction
	err := r.db.QueryRow(query).Scan(
		&action.ID,
		&action.Timestamp,
		&action.ActionType,
		&action.AmountA,
		&action.AmountB,
		&action.TxHash,
		&action.Direction,
		&action.Status,
		&action.GasUsed,
		&action.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get latest bot action: %w", err)
	}

	return &action, nil
}
