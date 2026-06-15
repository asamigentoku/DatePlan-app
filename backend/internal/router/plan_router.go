package router

import (
	"github.com/asamigentoku/DatePlan-app/internal/client"
	"github.com/asamigentoku/DatePlan-app/internal/handler"
	"github.com/asamigentoku/DatePlan-app/internal/repository"
	"github.com/asamigentoku/DatePlan-app/internal/service"
	"github.com/asamigentoku/DatePlan-app/pkg/config"
	"github.com/asamigentoku/DatePlan-app/pkg/database"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupPlanRouters(rg *gin.RouterGroup, cfg *config.Config, db *gorm.DB, mongodb *database.MongoClient) {
	googleClient := client.NewGooglePlacesClient(cfg.GoogleMapAPIKey)

	groqClient := client.NewGroqClient(cfg.GROQAPIKEY)
	chatgptClient := client.NewOpenAIClient(cfg.OPENAIAPIKEY)
	weatherClient := client.NewWeatherClient()
	nominatimClient := client.NewNominatimClient()
	pixabayClient := client.NewPixabayClient(cfg.PixabayAPIKey)
	placeCacheRepo := repository.NewPlacesCacheRepository(mongodb)
	imgCacheRepo := repository.NewImgCacheRepository(mongodb)
	geoCacheRepo := repository.NewGeoCacheRepository(mongodb)
	weatherCacheRepo := repository.NewWeatherCacheRepository(mongodb)

	planSvc := service.NewPlanService(googleClient, groqClient, chatgptClient, weatherClient, nominatimClient, pixabayClient, placeCacheRepo, imgCacheRepo, geoCacheRepo, weatherCacheRepo)
	planH := handler.NewPlanHandler(planSvc)

	plans := rg.Group("/plans")
	{
		plans.POST("", planH.MakePlans)
	}
}
