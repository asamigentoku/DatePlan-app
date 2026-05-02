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
