package client

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/asamigentoku/DatePlan-app/internal/dto"
)

// PixabayClient はPixabay画像検索APIのクライアント
type PixabayClient struct {
	apiKey string
}

// NewPixabayClient コンストラクタ
func NewPixabayClient(apiKey string) *PixabayClient {
	return &PixabayClient{
		apiKey: apiKey,
	}
}

// SearchPhotos は指定したワードに関連する画像URLの一覧を返す
func (c *PixabayClient) SearchPhotos(query string) ([]string, error) {
	params := url.Values{}
	params.Set("key", c.apiKey)
	params.Set("q", query)
	params.Set("lang", "ja")
	params.Set("image_type", "photo")
	params.Set("safesearch", "true")
	params.Set("per_page", "3") // Pixabayの最小値は3

	endpoint := "https://pixabay.com/api/?" + params.Encode()

	resp, err := http.Get(endpoint)
	if err != nil {
		return nil, fmt.Errorf("APIリクエスト失敗: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("レスポンス読み取り失敗: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Pixabay APIエラー: %s %s", resp.Status, body)
	}

	var result dto.PixabayResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("JSONパース失敗: %w", err)
	}

	photos := make([]string, 0, len(result.Hits))
	for _, hit := range result.Hits {
		photos = append(photos, hit.WebformatURL)
	}

	return photos, nil
}
