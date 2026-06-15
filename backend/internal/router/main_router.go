package router

import (
	"github.com/asamigentoku/DatePlan-app/docs"
	"github.com/asamigentoku/DatePlan-app/internal/handler"
	"github.com/asamigentoku/DatePlan-app/internal/middleware"
	"github.com/asamigentoku/DatePlan-app/internal/repository"
	"github.com/asamigentoku/DatePlan-app/internal/service"
	"github.com/asamigentoku/DatePlan-app/pkg/config"
	"github.com/asamigentoku/DatePlan-app/pkg/database"
	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/gorm"
)

func New(cfg *config.Config, db *gorm.DB, mongodb *database.MongoClient) *gin.Engine {
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	//エンジンの作成
	r := gin.New()
	//サーバーをリカバリーモードにする
	r.Use(gin.Recovery())
	//middlewaraは全てのリクエストの共通の設定
	//アクセスのログの表示
	r.Use(middleware.Logger())
	//アクセスの権限設定
	r.Use(middleware.CORS())

	r.GET("/health", handler.Health)

	// DI: repository → service → handler
	//これは外でやる本来
	userRepo := repository.NewUserRepository(db)
	userSvc := service.NewUserService(userRepo)
	userH := handler.NewUserHandler(userSvc)

	v1 := r.Group("/api/v1")
	setupPlanRouters(v1, cfg, db, mongodb)
	{
		users := v1.Group("/users")
		users.Use(middleware.Auth(cfg.JWTSecret))
		{

			users.GET("", userH.List)
			users.GET("/:id", userH.Get)
			users.POST("", userH.Create)
			users.PUT("/:id", userH.Update)
			users.DELETE("/:id", userH.Delete)
		}
	}

	docs.SwaggerInfo.BasePath = "/api/v1"
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	return r
}
