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

// places_cache コレクションのドキュメント構造
type PlacesCacheRepository interface {
	GetCache(ctx context.Context, city string, place string) (*[]dto.Place, error)
	SetCache(ctx context.Context, city string, place string, results []dto.Place) error
}

type placesCacheRepository struct {
	col *mongo.Collection
}

func NewPlacesCacheRepository(mc *database.MongoClient) PlacesCacheRepository {
	col := mc.DB.Collection("places_cache")

	// TTLインデックス: expire_at を過ぎたら MongoDB が自動削除
	indexModel := mongo.IndexModel{
		Keys:    bson.M{"expire_at": 1},
		Options: options.Index().SetExpireAfterSeconds(0),
	}
	col.Indexes().CreateOne(context.Background(), indexModel)

	return &placesCacheRepository{col: col}
}

func (r *placesCacheRepository) GetCache(ctx context.Context, city string, place string) (*[]dto.Place, error) {
	filter := bson.M{
		"city":      city,
		"place":     place,
		"expire_at": bson.M{"$gt": time.Now()}, // 期限切れを除外
	}

	var doc mongo_models.GoogleAPICache
	err := r.col.FindOne(ctx, filter).Decode(&doc)
	if err != nil {
		return nil, err // mongo.ErrNoDocuments ならキャッシュなし
	}
	return &doc.Results, nil
}

func (r *placesCacheRepository) SetCache(ctx context.Context, city string, place string, results []dto.Place) error {
	doc := mongo_models.GoogleAPICache{
		ID:        primitive.NewObjectID(),
		City:      city,
		Place:     place,
		Results:   results,
		CreatedAt: time.Now(),
		ExpireAt:  time.Now().Add(24 * time.Hour), // 24時間でキャッシュ失効
	}
	_, err := r.col.InsertOne(ctx, doc)
	return err
}
