// internal/client/groq.go
package client

import (
	"context"
	"fmt"
	"strings"

	"github.com/asamigentoku/DatePlan-app/internal/dto"
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
	systemPrompt := `あなたはデートプランを提案するアシスタントです。
必ず以下のJSON形式のみで返してください。
{
    "theme": "テーマ",
    "weather": {
        "status": "晴れ",
        "temperature": 20.0,
        "season": "春"
    },
    "description": "プランの説明",
    "spots": [
        {
            "order": 1,
            "name": "スポット名",
            "description": "説明",
            "photos": [],
            "category": "カフェ",
            "stay_time": 60,
            "price_range": 1000,
            "indoor_outdoor": "屋内",
            "rating": 4.5,
            "congestion": 3,
            "opening_hours": {
                "start": 9,
                "end": 21
            }
        }
    ],
    "movements": [
        {
            "order": 1,
            "from": "スポットA",
            "to": "スポットB",
            "duration": 15,
            "method": "徒歩"
        }
    ]
}`

	return generate[dto.PlanResponse](c, systemPrompt, prompt)
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
