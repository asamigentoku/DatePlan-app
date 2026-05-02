package main

import (
	"log"

	"github.com/asamigentoku/DatePlan-app/internal/router"
	"github.com/asamigentoku/DatePlan-app/pkg/config"
	"github.com/asamigentoku/DatePlan-app/pkg/database"
	"github.com/asamigentoku/DatePlan-app/pkg/logger"
)

func main() {
	//環境変数の読み込み
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	//ログの設定のところ、最初はスキップしていい
	if err := logger.Init(cfg.Env); err != nil {
		log.Fatal("Failed to init logger:", err)
	}
	defer logger.Log.Sync()

	//データベース初期化
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	//テーブル挿入、モデル参照
	if err := database.Migrate(db); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	//mongoDBの初期化
	mongodb, err := database.NewMongoClient(cfg.MongoUri, cfg.MongoDbName)
	if err != nil {
		log.Fatal("Failed to connect Mongodatabase:", err)
	}

	r := router.New(cfg, db, mongodb)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to run server:", err)
	}
}
