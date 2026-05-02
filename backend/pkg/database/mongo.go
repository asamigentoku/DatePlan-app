package database

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoClient struct {
	Client *mongo.Client
	DB     *mongo.Database
}

func NewMongoClient(uri, dbName string) (*MongoClient, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().
		ApplyURI(uri). // mongodb+srv://... 形式
		SetServerAPIOptions(serverAPI)

	client, err := mongo.Connect(ctx, opts)
	if err != nil {
		return nil, fmt.Errorf("MongoDB Atlas接続失敗: %w", err)
	}

	// 疎通確認
	if err := client.Ping(ctx, nil); err != nil {
		return nil, fmt.Errorf("MongoDB Atlas ping失敗: %w", err)
	}

	fmt.Println("✅ MongoDB Atlas 接続成功")
	return &MongoClient{
		Client: client,
		DB:     client.Database(dbName),
	}, nil
}

func (m *MongoClient) Disconnect() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	m.Client.Disconnect(ctx)
}
