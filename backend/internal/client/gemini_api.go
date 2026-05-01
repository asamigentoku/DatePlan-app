// internal/client/gemini.go
package client

import (
	"context"
	"fmt"

	"google.golang.org/genai"
)

type GeminiClient struct {
	client *genai.Client
	model  string
}

func NewGeminiClient(ctx context.Context) (*GeminiClient, error) {
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("Geminiクライアント作成失敗: %w", err)
	}

	return &GeminiClient{
		client: client,
		model:  "gemini-2.5-flash",
	}, nil
}

// 汎用的なメソッド
func (g *GeminiClient) Chat(prompt string) (string, error) {
	ctx := context.Background()

	result, err := g.client.Models.GenerateContent(
		ctx,
		g.model,
		genai.Text(prompt),
		nil,
	)
	if err != nil {
		return "", fmt.Errorf("生成失敗: %w", err)
	}

	return result.Text(), nil
}
