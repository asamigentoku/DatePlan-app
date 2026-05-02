// internal/client/groq.go
package client

import (
	"context"
	"fmt"
	"strings"

	"github.com/asamigentoku/DatePlan-app/internal/dto"
	"github.com/asamigentoku/DatePlan-app/internal/prompts"
	"github.com/goccy/go-json"
	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

type GroqClient struct {
	client openai.Client
	model  string
}

func NewGroqClient(apiKey string) *GroqClient {
	client := openai.NewClient(
		option.WithAPIKey(apiKey),
		option.WithBaseURL("https://api.groq.com/openai/v1"), // 👈 ここだけ変える
	)

	return &GroqClient{
		client: client,
		model:  "llama-3.3-70b-versatile", // 高性能モデル
	}
}

func (c *GroqClient) Chat(prompt string) (string, error) {
	ctx := context.Background()

	result, err := c.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Model: c.model,
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.UserMessage(prompt),
		},
	})
	if err != nil {
		return "", fmt.Errorf("生成失敗: %w", err)
	}

	return result.Choices[0].Message.Content, nil
}

// デートプラン生成（PlanResponse で返す）
func (c *GroqClient) GenerateDatePlan(prompt string) (*dto.PlanResponse, error) {

	return generate[dto.PlanResponse](c, prompts.SystemPrompt, prompt)
}

// 内部共通処理
func generate[T any](c *GroqClient, systemPrompt, userPrompt string) (*T, error) {
	ctx := context.Background()

	result, err := c.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Model: c.model,
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage(systemPrompt),
			openai.UserMessage(userPrompt),
		},
	})
	if err != nil {
		return nil, fmt.Errorf("生成失敗: %w", err)
	}

	raw := result.Choices[0].Message.Content
	raw = strings.ReplaceAll(raw, "```json", "")
	raw = strings.ReplaceAll(raw, "```", "")
	raw = strings.TrimSpace(raw)

	var parsed T
	if err := json.Unmarshal([]byte(raw), &parsed); err != nil {
		fmt.Println("パース失敗。生のレスポンス:", raw)
		return nil, fmt.Errorf("JSONパース失敗: %w", err)
	}

	return &parsed, nil
}
