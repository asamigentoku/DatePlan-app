package repository

import (
	"context"
	"time"

	"github.com/asamigentoku/DatePlan-app/internal/dto"
	"github.com/asamigentoku/DatePlan-app/internal/model/mongo_models"
	"github.com/asamigentoku/DatePlan-app/pkg/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type WeatherCacheRepository interface {
	GetCache(ctx context.Context, prefecture, date string) (*dto.TodayWeather, error)
	SetCache(ctx context.Context, prefecture, date string, weather dto.TodayWeather) error
}

type weatherCacheRepository struct {
	col *mongo.Collection
}

func NewWeatherCacheRepository(mc *database.MongoClient) WeatherCacheRepository {
	col := mc.DB.Collection("weather_cache")

	// TTLインデックス: expire_at を過ぎたら MongoDB が自動削除
	indexModel := mongo.IndexModel{
		Keys:    bson.M{"expire_at": 1},
		Options: options.Index().SetExpireAfterSeconds(0),
	}
	col.Indexes().CreateOne(context.Background(), indexModel)

	return &weatherCacheRepository{col: col}
}

func (r *weatherCacheRepository) GetCache(ctx context.Context, prefecture, date string) (*dto.TodayWeather, error) {
	filter := bson.M{
		"prefecture": prefecture,
		"date":       date,
		"expire_at":  bson.M{"$gt": time.Now()}, // 期限切れを除外
	}

	var doc mongo_models.WeatherCache
	err := r.col.FindOne(ctx, filter).Decode(&doc)
	if err != nil {
		return nil, err // mongo.ErrNoDocuments ならキャッシュなし
	}
	return &doc.Weather, nil
}

func (r *weatherCacheRepository) SetCache(ctx context.Context, prefecture, date string, weather dto.TodayWeather) error {
	doc := mongo_models.WeatherCache{
		ID:         primitive.NewObjectID(),
		Prefecture: prefecture,
		Date:       date,
		Weather:    weather,
		CreatedAt:  time.Now(),
		ExpireAt:   time.Now().Add(24 * time.Hour), // 24時間でキャッシュ失効
	}
	_, err := r.col.InsertOne(ctx, doc)
	return err
}
