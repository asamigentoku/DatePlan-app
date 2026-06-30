package router

import (
	"github.com/asamigentoku/DatePlan-app/internal/handler"
	"github.com/asamigentoku/DatePlan-app/internal/repository"
	"github.com/asamigentoku/DatePlan-app/internal/service"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupTalkRouter(rg *gin.RouterGroup, db *gorm.DB) {
	talkRepo := repository.NewTalkRepository(db)
	talkSvc := service.NewTalkService(talkRepo)
	talkH := handler.NewTalkHandler(talkSvc)

	talks := rg.Group("/talks")
	{
		talks.GET("/themes", talkH.GetTalkThemes)
	}
}
