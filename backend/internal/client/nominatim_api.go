package client

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

type NominatimClient struct{}

func NewNominatimClient() *NominatimClient {
	return &NominatimClient{}
}

type nominatimResponse struct {
	Lat string `json:"lat"`
	Lon string `json:"lon"`
}

type LatLon struct {
	Lat float64
	Lon float64
}

func (c *NominatimClient) GetLatLon(place string) (*LatLon, error) {
	params := url.Values{}
	params.Set("q", place)
	params.Set("format", "json")
	params.Set("limit", "1")

	endpoint := "https://nominatim.openstreetmap.org/search?" + params.Encode()

	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("リクエスト作成失敗: %w", err)
	}
	// Nominatim はUser-Agentが必須
	req.Header.Set("User-Agent", "DatePlan-app/1.0")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("APIリクエスト失敗: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("APIエラー: status=%d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("レスポンス読み取り失敗: %w", err)
	}

	var results []nominatimResponse
	if err := json.Unmarshal(body, &results); err != nil {
		return nil, fmt.Errorf("JSONパース失敗: %w", err)
	}

	if len(results) == 0 {
		return nil, fmt.Errorf("見つかりませんでした: %s", place)
	}

	var lat, lon float64
	fmt.Sscanf(results[0].Lat, "%f", &lat)
	fmt.Sscanf(results[0].Lon, "%f", &lon)

	return &LatLon{Lat: lat, Lon: lon}, nil
}
