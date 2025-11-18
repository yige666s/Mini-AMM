package api

import (
	"context"
	"fmt"
	"mini-amm-bot/internal/db"
	"net/http"
	"time"

	log "github.com/sirupsen/logrus"
)

type Server struct {
	httpServer *http.Server
	handler    *Handler
}

func NewServer(port int, repo *db.BotActionRepository) *Server {
	handler := NewHandler(repo)

	mux := http.NewServeMux()
	mux.HandleFunc("/api/bot-actions", handler.GetBotActions)
	mux.HandleFunc("/api/bot-stats", handler.GetBotStats)
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	return &Server{
		httpServer: &http.Server{
			Addr:         fmt.Sprintf(":%d", port),
			Handler:      mux,
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 15 * time.Second,
			IdleTimeout:  60 * time.Second,
		},
		handler: handler,
	}
}

func (s *Server) Start() error {
	log.Infof("API 服务器启动在 %s", s.httpServer.Addr)
	if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return fmt.Errorf("failed to start API server: %w", err)
	}
	return nil
}

func (s *Server) Shutdown(ctx context.Context) error {
	log.Info("正在关闭 API 服务器...")
	return s.httpServer.Shutdown(ctx)
}
