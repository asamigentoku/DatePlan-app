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

type ImgCacheRepository interface {
	GetCache(ctx context.Context, keyword string) (*[]dto.PixabayHit, error)
	SetCache(ctx context.Context, keyword string, results []dto.PixabayHit) error
}

type imgCacheRepository struct {
	col *mongo.Collection
}

func NewImgCacheRepository(mc *database.MongoClient) ImgCacheRepository {
	col := mc.DB.Collection("img_cache")

	// TTLインデックス: expire_at を過ぎたら MongoDB が自動削除
	indexModel := mongo.IndexModel{
		Keys:    bson.M{"expire_at": 1},
		Options: options.Index().SetExpireAfterSeconds(0),
	}
	col.Indexes().CreateOne(context.Background(), indexModel)

	return &imgCacheRepository{col: col}
}

func (r *imgCacheRepository) GetCache(ctx context.Context, keyword string) (*[]dto.PixabayHit, error) {
	filter := bson.M{
		"keyword":   keyword,
		"expire_at": bson.M{"$gt": time.Now()}, // 期限切れを除外
	}

	var doc mongo_models.ImgCache
	err := r.col.FindOne(ctx, filter).Decode(&doc)
	if err != nil {
		return nil, err // mongo.ErrNoDocuments ならキャッシュなし
	}
	return &doc.Results, nil
}

func (r *imgCacheRepository) SetCache(ctx context.Context, keyword string, results []dto.PixabayHit) error {
	doc := mongo_models.ImgCache{
		ID:        primitive.NewObjectID(),
		Keyword:   keyword,
		Results:   results,
		CreatedAt: time.Now(),
		ExpireAt:  time.Now().Add(24 * time.Hour), // 24時間でキャッシュ失効
	}
	_, err := r.col.InsertOne(ctx, doc)
	return err
}
