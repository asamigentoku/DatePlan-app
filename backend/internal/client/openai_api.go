// internal/client/openai_api.go
package client

import (
	"context"
	"fmt"

	"github.com/asamigentoku/DatePlan-app/internal/dto"
	"github.com/asamigentoku/DatePlan-app/internal/prompts"
	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

// OpenAIClient はGroqがレートリミットに達した際のフォールバック先として使うChatGPTクライアント
type OpenAIClient struct {
	client openai.Client
	model  string
}

func NewOpenAIClient(apiKey string) *OpenAIClient {
	client := openai.NewClient(
		option.WithAPIKey(apiKey),
	)

	return &OpenAIClient{
		client: client,
		model:  "gpt-4o-mini",
	}
}

func (c *OpenAIClient) Chat(prompt string) (string, error) {
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
func (c *OpenAIClient) GenerateDatePlan(prompt string) (*dto.PlanResponse, error) {
	return generateChatJSON[dto.PlanResponse](c.client, c.model, prompts.SystemPrompt, prompt)
}
