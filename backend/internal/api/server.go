package api

import (
	"context"
	"fmt"
	"mini-amm-bot/internal/db"
	"mini-amm-bot/internal/util"
	"net/http"
	"time"

	log "github.com/sirupsen/logrus"
)

type Server struct {
	httpServer *http.Server
	handler    *Handler
}

// corsMiddleware 添加 CORS 头
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 设置 CORS 头
		w.Header().Set("Access-Control-Allow-Origin", "*") // 允许所有origin，或指定为 "http://155.94.154.240:4000"
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// 处理预检请求
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func NewServer(port int, repo *db.BotActionRepository, config *util.Config) *Server {
	handler := NewHandler(repo, config)

	mux := http.NewServeMux()
	mux.HandleFunc("/api/bot-actions", handler.GetBotActions)
	mux.HandleFunc("/api/bot-stats", handler.GetBotStats)
	mux.HandleFunc("/api/bot-config", handler.GetBotConfig)
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// 包装 mux 以添加 CORS 中间件
	corsHandler := corsMiddleware(mux)

	return &Server{
		httpServer: &http.Server{
			Addr:         fmt.Sprintf(":%d", port),
			Handler:      corsHandler,
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
