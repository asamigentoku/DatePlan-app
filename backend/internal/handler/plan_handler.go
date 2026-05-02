package handler

import (
	"github.com/asamigentoku/DatePlan-app/internal/dto"
	"github.com/asamigentoku/DatePlan-app/internal/service"
	"github.com/asamigentoku/DatePlan-app/pkg/response"
	"github.com/gin-gonic/gin"
)

type PlanHandler struct {
	svc service.PlanService
}

func NewPlanHandler(svc service.PlanService) *PlanHandler {
	return &PlanHandler{svc: svc}
}

func (h *PlanHandler) MakePlans(c *gin.Context) {
	// 1. リクエストボディを格納するDTOを準備
	var req dto.CreatePlanRequest

	// 2. JSONを構造体にバインド（読み込み）
	// ShouldBindJSON は JSONが正しくない場合にエラーを返してくれる
	if err := c.ShouldBindJSON(&req); err != nil {
		// リクエストが不正な場合は Bad Request を返す
		response.BadRequest(c, "Invalid request format")
		return
	}
	//jsonのresponseを構造体に変換して流す
	plans, err := h.svc.MakePlan(&req)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, plans)
}
