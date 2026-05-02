package database

import (
	"fmt"
	"time"

	"github.com/asamigentoku/DatePlan-app/internal/model"
	"github.com/asamigentoku/DatePlan-app/pkg/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// func 関数名(引数)(戻り値)
func Connect(cfg *config.Config) (*gorm.DB, error) {
	//gormの設定オブジェクトを渡している
	gormCfg := &gorm.Config{}
	if cfg.Env != "production" {
		//本番環境でないのであれば実行したSQLを出力する設定
		gormCfg.Logger = logger.Default.LogMode(logger.Info)
	}

	//設定とURLからGORMのエンジンの設定、接続を行う
	db, err := gorm.Open(postgres.Open(cfg.DBUrl), gormCfg)
	//エラーが発生した時は意図的にnilを返す
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	//同時アイドル数
	sqlDB.SetMaxIdleConns(10)
	//最大で何人が接続できるか
	sqlDB.SetMaxOpenConns(100)
	//一つの接続のタイムアウト時間
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db, nil
}

func Migrate(db *gorm.DB) error {
	//データベースにテーブルを登録する
	return db.AutoMigrate(
		//構造体が存在する場所自体から取得する
		&model.User{},
		// 追加モデルをここに列挙する
	)
}
