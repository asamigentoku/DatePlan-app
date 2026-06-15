package client

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/asamigentoku/DatePlan-app/internal/dto"
)

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
func (c *GooglePlacesClient) SearchPlaces(query string) ([]dto.Place, error) {
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

	var placesResp dto.PlacesResponse
	//jsonのデータを自分の構造体に変換する
	if err := json.Unmarshal(body, &placesResp); err != nil {
		return nil, fmt.Errorf("JSONパース失敗: %w", err)
	}

	return placesResp.Results, nil
}

type geocodingResponse struct {
	Status  string `json:"status"`
	Results []struct {
		Geometry struct {
			Location struct {
				Lat float64 `json:"lat"`
				Lng float64 `json:"lng"`
			} `json:"location"`
		} `json:"geometry"`
	} `json:"results"`
}

// GetLatLon は Google Geocoding API を使って地名から緯度経度を取得する
func (c *GooglePlacesClient) GetLatLon(place string) (*LatLon, error) {
	params := url.Values{}
	params.Set("address", place)
	params.Set("key", c.apiKey)
	params.Set("language", "ja")

	endpoint := "https://maps.googleapis.com/maps/api/geocode/json?" + params.Encode()

	resp, err := http.Get(endpoint)
	if err != nil {
		return nil, fmt.Errorf("APIリクエスト失敗: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("レスポンス読み取り失敗: %w", err)
	}

	var geoResp geocodingResponse
	if err := json.Unmarshal(body, &geoResp); err != nil {
		return nil, fmt.Errorf("JSONパース失敗: %w", err)
	}

	if geoResp.Status != "OK" || len(geoResp.Results) == 0 {
		return nil, fmt.Errorf("見つかりませんでした: %s (status=%s)", place, geoResp.Status)
	}

	loc := geoResp.Results[0].Geometry.Location
	return &LatLon{Lat: loc.Lat, Lon: loc.Lng}, nil
}
