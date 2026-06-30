package handler

import (
	"github.com/asamigentoku/DatePlan-app/internal/dto"
	"github.com/asamigentoku/DatePlan-app/internal/service"
	"github.com/asamigentoku/DatePlan-app/pkg/response"
	"github.com/gin-gonic/gin"
)

type TalkHandler struct {
	svc service.TalkService
}

func NewTalkHandler(svc service.TalkService) *TalkHandler {
	return &TalkHandler{svc: svc}
}

// GetTalkThemes godoc
// @Summary      会話テーマ一覧を取得する
// @Tags         talks
// @Produce      json
// @Param        count query int false "カテゴリあたりのテーマ件数（デフォルト2）"
// @Success      200  {object}  dto.TalkThemeResponse
// @Failure      500  {object}  map[string]string
// @Router       /talks/themes [get]
func (h *TalkHandler) GetTalkThemes(c *gin.Context) {
	var req dto.TalkThemeRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.BadRequest(c, "Invalid query parameter")
		return
	}

	themes, err := h.svc.GetTalkThemes(&req)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, themes)
}
