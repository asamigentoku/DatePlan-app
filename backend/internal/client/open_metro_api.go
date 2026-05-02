package client

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/asamigentoku/DatePlan-app/internal/dto"
)

type WeatherClient struct{}

func NewWeatherClient() *WeatherClient {
	return &WeatherClient{}
}

type WeatherResponse struct {
	Daily dto.DailyWeather `json:"daily"`
}

func (c *WeatherClient) GetWeather(lat, lng float64) (*dto.TodayWeather, error) {
	params := url.Values{}
	params.Set("latitude", fmt.Sprintf("%f", lat))
	params.Set("longitude", fmt.Sprintf("%f", lng))
	params.Set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode")
	params.Set("timezone", "Asia/Tokyo")
	params.Set("forecast_days", "1")

	endpoint := "https://api.open-meteo.com/v1/forecast?" + params.Encode()

	resp, err := http.Get(endpoint)
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

	var weatherResp WeatherResponse
	if err := json.Unmarshal(body, &weatherResp); err != nil {
		return nil, fmt.Errorf("JSONパース失敗: %w", err)
	}

	daily := weatherResp.Daily
	if len(daily.Time) == 0 {
		return nil, fmt.Errorf("天気データが空です")
	}

	return &dto.TodayWeather{
		Date:       daily.Time[0],
		TempMax:    daily.TempMax[0],
		TempMin:    daily.TempMin[0],
		Precip:     daily.Precipitation[0],
		PrecipProb: daily.PrecipProb[0],
		Status:     weatherCodeToStatus(daily.WeatherCode[0]),
	}, nil
}

// 天気コードを日本語に変換
func weatherCodeToStatus(code int) string {
	switch {
	case code == 0:
		return "快晴"
	case code <= 2:
		return "晴れ"
	case code <= 3:
		return "曇り"
	case code <= 67:
		return "雨"
	case code <= 77:
		return "雪"
	case code <= 99:
		return "雷雨"
	default:
		return "不明"
	}
}

// internal/client/weather.go

// 日付を引数に追加
func (c *WeatherClient) GetWeatherByDate(lat, lng float64, date string) (*dto.TodayWeather, error) {
	params := url.Values{}
	params.Set("latitude", fmt.Sprintf("%f", lat))
	params.Set("longitude", fmt.Sprintf("%f", lng))
	params.Set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode")
	params.Set("timezone", "Asia/Tokyo")
	params.Set("start_date", date) // 👈 開始日
	params.Set("end_date", date)   // 👈 終了日（同じ日にすると1日だけ取得）

	endpoint := "https://api.open-meteo.com/v1/forecast?" + params.Encode()

	resp, err := http.Get(endpoint)
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

	var weatherResp WeatherResponse
	if err := json.Unmarshal(body, &weatherResp); err != nil {
		return nil, fmt.Errorf("JSONパース失敗: %w", err)
	}

	daily := weatherResp.Daily
	if len(daily.Time) == 0 {
		return nil, fmt.Errorf("天気データが空です")
	}

	return &dto.TodayWeather{
		Date:       daily.Time[0],
		TempMax:    daily.TempMax[0],
		TempMin:    daily.TempMin[0],
		Precip:     daily.Precipitation[0],
		PrecipProb: daily.PrecipProb[0],
		Status:     weatherCodeToStatus(daily.WeatherCode[0]),
	}, nil
}
