package api

import (
	"encoding/json"
	"mini-amm-bot/internal/db"
	"mini-amm-bot/internal/models"
	"net/http"
	"strconv"
)

type Handler struct {
	repo *db.BotActionRepository
}

func NewHandler(repo *db.BotActionRepository) *Handler {
	return &Handler{repo: repo}
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func (h *Handler) GetBotActions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Method not allowed"})
		return
	}

	query := r.URL.Query()
	
	filter := db.QueryFilter{
		Limit:  20, // Default limit
		Offset: 0,
	}

	if limitStr := query.Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			filter.Limit = limit
		}
	}

	if offsetStr := query.Get("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil && offset >= 0 {
			filter.Offset = offset
		}
	}

	if actionTypeStr := query.Get("type"); actionTypeStr != "" {
		actionType := models.ActionType(actionTypeStr)
		if actionType == models.ActionTypeCompound || actionType == models.ActionTypeRebalance {
			filter.ActionType = &actionType
		}
	}

	actions, err := h.repo.List(filter)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    actions,
		"count":   len(actions),
	})
}

func (h *Handler) GetBotStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Method not allowed"})
		return
	}

	compoundCount, err := h.repo.CountByType(models.ActionTypeCompound)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	rebalanceCount, err := h.repo.CountByType(models.ActionTypeRebalance)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	latestAction, err := h.repo.GetLatestAction()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":        true,
		"compoundCount":  compoundCount,
		"rebalanceCount": rebalanceCount,
		"latestAction":   latestAction,
	})
}
