package database

import (
	"context"
	"fmt"
	"net/url"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoClient struct {
	Client *mongo.Client
	DB     *mongo.Database
}

func NewMongoClient(uri string) (*MongoClient, error) {
	u, err := url.Parse(uri)
	if err != nil {
		return nil, fmt.Errorf("MongoDB URI parse失敗: %w", err)
	}
	dbName := strings.TrimPrefix(u.Path, "/")
	if dbName == "" {
		return nil, fmt.Errorf("MongoDB URI にDB名が含まれていません: %s", uri)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().
		ApplyURI(uri).
		SetServerAPIOptions(serverAPI)

	client, err := mongo.Connect(ctx, opts)
	if err != nil {
		return nil, fmt.Errorf("MongoDB Atlas接続失敗: %w", err)
	}

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
