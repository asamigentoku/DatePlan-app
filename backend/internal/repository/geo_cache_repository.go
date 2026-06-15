package repository

import (
	"context"
	"time"

	"github.com/asamigentoku/DatePlan-app/internal/model/mongo_models"
	"github.com/asamigentoku/DatePlan-app/pkg/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type GeoLocation struct {
	Lat float64
	Lon float64
}

type GeoCacheRepository interface {
	GetCache(ctx context.Context, prefecture string) (*GeoLocation, error)
	SetCache(ctx context.Context, prefecture string, loc GeoLocation) error
}

type geoCacheRepository struct {
	col *mongo.Collection
}

func NewGeoCacheRepository(mc *database.MongoClient) GeoCacheRepository {
	col := mc.DB.Collection("geo_cache")

	// TTLインデックス: expire_at を過ぎたら MongoDB が自動削除
	indexModel := mongo.IndexModel{
		Keys:    bson.M{"expire_at": 1},
		Options: options.Index().SetExpireAfterSeconds(0),
	}
	col.Indexes().CreateOne(context.Background(), indexModel)

	return &geoCacheRepository{col: col}
}

func (r *geoCacheRepository) GetCache(ctx context.Context, prefecture string) (*GeoLocation, error) {
	filter := bson.M{
		"prefecture": prefecture,
		"expire_at":  bson.M{"$gt": time.Now()}, // 期限切れを除外
	}

	var doc mongo_models.GeoCache
	err := r.col.FindOne(ctx, filter).Decode(&doc)
	if err != nil {
		return nil, err // mongo.ErrNoDocuments ならキャッシュなし
	}
	return &GeoLocation{Lat: doc.Lat, Lon: doc.Lon}, nil
}

func (r *geoCacheRepository) SetCache(ctx context.Context, prefecture string, loc GeoLocation) error {
	doc := mongo_models.GeoCache{
		ID:         primitive.NewObjectID(),
		Prefecture: prefecture,
		Lat:        loc.Lat,
		Lon:        loc.Lon,
		CreatedAt:  time.Now(),
		ExpireAt:   time.Now().Add(30 * 24 * time.Hour), // 都道府県の座標は実質不変のため30日
	}
	_, err := r.col.InsertOne(ctx, doc)
	return err
}
