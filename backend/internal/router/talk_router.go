package router

import (
	"github.com/asamigentoku/DatePlan-app/pkg/config"
	"github.com/gin-gonic/gin"
)

//トークテーマとミッションの生成

func setupTalkRouter(rg *gin.RouterGroup, cfg *config.Config) {

	//planSvc := service.NewPlanService(googleClient, groqClient, chatgptClient, weatherClient, nominatimClient, pixabayClient, placeCacheRepo, imgCacheRepo, geoCacheRepo, weatherCacheRepo)
	//planH := handler.NewPlanHandler(planSvc)
	//
	//plans := rg.Group("/plans")
	//{
	//	plans.POST("", planH.MakePlans)
	//}
}
