package config

import (
	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

// goの構造体、goにclassは存在しない
type Config struct {
	Env              string
	Port             string
	DBUrl            string
	JWTSecret        string
	GoogleMap_APIKEY string
}

func Load() (*Config, error) {
	_ = godotenv.Load()
	//上のコードで.envの変数名をviperに取り込む

	//viperの変数にデフォルト値をセット
	viper.SetDefault("ENV", "development")
	viper.SetDefault("PORT", "8080")
	viper.AutomaticEnv()
	viper.SetDefault("GoogleMap_APIKEY", "None")

	return &Config{
		Env:              viper.GetString("ENV"),
		Port:             viper.GetString("PORT"),
		DBUrl:            viper.GetString("DATABASE_URL"),
		JWTSecret:        viper.GetString("JWT_SECRET"),
		GoogleMap_APIKEY: viper.GetString("GoogleMap_APIKEY"),
	}, nil
}
