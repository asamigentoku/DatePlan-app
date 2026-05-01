package client

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

// レスポンスの構造体
type PlacesResponse struct {
	Results []Place `json:"results"`
}

type Place struct {
	Name     string   `json:"name"`
	Rating   float64  `json:"rating"`
	Geometry Geometry `json:"geometry"`
}

type Geometry struct {
	Location Location `json:"location"`
}

type Location struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

// GooglePlacesClient 構造体
type GooglePlacesClient struct {
	apiKey string
}

// NewGooglePlacesClient コンストラクタ
func NewGooglePlacesClient(apiKey string) *GooglePlacesClient {
	return &GooglePlacesClient{
		apiKey: apiKey,
	}
}

// SearchPlaces をメソッドに変更 (レシーバーを加える)
func (c *GooglePlacesClient) SearchPlaces(query string) ([]Place, error) {
	// クエリパラメータの組み立て
	params := url.Values{}
	params.Set("query", query)
	params.Set("key", c.apiKey)
	params.Set("language", "ja") // 構造体からAPIキーを使う

	endpoint := "https://maps.googleapis.com/maps/api/place/textsearch/json?" + params.Encode()

	// HTTPリクエスト
	resp, err := http.Get(endpoint)
	if err != nil {
		return nil, fmt.Errorf("APIリクエスト失敗: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("レスポンス読み取り失敗: %w", err)
	}

	var placesResp PlacesResponse
	//jsonのデータを自分の構造体に変換する
	if err := json.Unmarshal(body, &placesResp); err != nil {
		return nil, fmt.Errorf("JSONパース失敗: %w", err)
	}

	return placesResp.Results, nil
}
