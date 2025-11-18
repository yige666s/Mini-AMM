package db

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
)

type PostgresDB struct {
	db *sql.DB
}

type Config struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
}

func NewPostgresDB(config Config) (*PostgresDB, error) {
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		config.Host, config.Port, config.User, config.Password, config.DBName)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	log.Info("✅ PostgreSQL 连接成功")

	return &PostgresDB{db: db}, nil
}

func (p *PostgresDB) Close() error {
	return p.db.Close()
}

func (p *PostgresDB) InitSchema() error {
	schema := `
	CREATE TABLE IF NOT EXISTS bot_actions (
		id SERIAL PRIMARY KEY,
		timestamp TIMESTAMP NOT NULL,
		action_type VARCHAR(20) NOT NULL,
		amount_a VARCHAR(100) NOT NULL DEFAULT '0',
		amount_b VARCHAR(100) NOT NULL DEFAULT '0',
		tx_hash VARCHAR(66) NOT NULL,
		direction VARCHAR(10),
		status VARCHAR(20) NOT NULL,
		gas_used BIGINT,
		created_at TIMESTAMP NOT NULL DEFAULT NOW()
	);

	CREATE INDEX IF NOT EXISTS idx_bot_actions_timestamp ON bot_actions(timestamp DESC);
	CREATE INDEX IF NOT EXISTS idx_bot_actions_action_type ON bot_actions(action_type);
	CREATE INDEX IF NOT EXISTS idx_bot_actions_tx_hash ON bot_actions(tx_hash);
	`

	_, err := p.db.Exec(schema)
	if err != nil {
		return fmt.Errorf("failed to initialize schema: %w", err)
	}

	log.Info("✅ 数据库表初始化成功")
	return nil
}

func (p *PostgresDB) GetDB() *sql.DB {
	return p.db
}
