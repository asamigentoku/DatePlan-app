package mongo_models

import (
	"time"

	"github.com/asamigentoku/DatePlan-app/internal/dto"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// placeとcityの組み合わせにキャッシュ構造をおく
type GoogleAPICache struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"` // Mongoの検索・更新に使うためIDだけは定義
	Place     string             `bson:"place"`
	City      string             `bson:"city"`
	Results   []dto.Place        `bson:"results"` // dto をそのまま使う
	CreatedAt time.Time          `bson:"created_at"`
	ExpireAt  time.Time          `bson:"expire_at"` //期限切れ
}

type ImgCache struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Keyword   string             `bson:"keyword"`
	Results   []dto.PixabayHit   `bson:"results"`
	CreatedAt time.Time          `bson:"created_at"`
	ExpireAt  time.Time          `bson:"expire_at"` //期限切れ
}

// 都道府県名 → 座標のキャッシュ
type GeoCache struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	Prefecture string             `bson:"prefecture"`
	Lat        float64            `bson:"lat"`
	Lon        float64            `bson:"lon"`
	CreatedAt  time.Time          `bson:"created_at"`
	ExpireAt   time.Time          `bson:"expire_at"` //期限切れ
}

// 都道府県名 + 日付 の組み合わせに天気のキャッシュをおく
type WeatherCache struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	Prefecture string             `bson:"prefecture"`
	Date       string             `bson:"date"`
	Weather    dto.TodayWeather   `bson:"weather"`
	CreatedAt  time.Time          `bson:"created_at"`
	ExpireAt   time.Time          `bson:"expire_at"` //期限切れ
}
