package router

import (
	"github.com/asamigentoku/DatePlan-app/internal/handler"
	"github.com/asamigentoku/DatePlan-app/internal/repository"
	"github.com/asamigentoku/DatePlan-app/internal/service"
	"github.com/gin-gonic/gin"
)

func setupTalkRouter(rg *gin.RouterGroup) {
	talkRepo := repository.NewTalkRepository()
	talkSvc := service.NewTalkService(talkRepo)
	talkH := handler.NewTalkHandler(talkSvc)

	talks := rg.Group("/talks")
	{
		talks.GET("/themes", talkH.GetTalkThemes)
	}
}
