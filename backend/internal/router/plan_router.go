package router

import (
	"github.com/asamigentoku/DatePlan-app/internal/client"
	"github.com/asamigentoku/DatePlan-app/internal/handler"
	"github.com/asamigentoku/DatePlan-app/internal/service"
	"github.com/asamigentoku/DatePlan-app/pkg/config"
	"github.com/asamigentoku/DatePlan-app/pkg/database"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupPlanRouters(rg *gin.RouterGroup, cfg *config.Config, db *gorm.DB, mongodb *database.MongoClient) {
	googleClient := client.NewGooglePlacesClient(cfg.GoogleMapAPIKey)

	groqClient := client.NewGroqClient(cfg.GROQAPIKEY)
	weatherClient := client.NewWeatherClient()
	nominatimClient := client.NewNominatimClient()

	planSvc := service.NewPlanService(googleClient, groqClient, weatherClient, nominatimClient)
	planH := handler.NewPlanHandler(planSvc)

	plans := rg.Group("/plans")
	{
		plans.POST("", planH.MakePlans)
	}
}
