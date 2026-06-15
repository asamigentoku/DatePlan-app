package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Health godoc
// @Summary      ヘルスチェック
// @Tags         health
// @Produce      json
// @Success      200  {object}  map[string]string
// @Router       /health [get]
func Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
