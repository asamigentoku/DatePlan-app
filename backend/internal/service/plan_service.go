package service

import (
	"fmt"
	"math/rand/v2"

	"github.com/asamigentoku/DatePlan-app/internal/client"
	"github.com/asamigentoku/DatePlan-app/internal/dto"
)

type PlanService interface {
	// 戻り値を (*dto.PlanResponse, error) に変更！
	MakePlan(*dto.CreatePlanRequest) (*dto.PlanResponse, error)
}

type planService struct {
	googleClient    *client.GooglePlacesClient
	groqclient      *client.GroqClient
	weatherclient   *client.WeatherClient
	nominatimclient *client.NominatimClient
}

// NewPlanService クライアントを受け取って初期化するコンストラクタ
func NewPlanService(
	google *client.GooglePlacesClient,
	groq *client.GroqClient,
	weather *client.WeatherClient,
	nomi *client.NominatimClient) PlanService {
	return &planService{
		googleClient:    google,
		groqclient:      groq,
		weatherclient:   weather,
		nominatimclient: nomi,
	}
}

func (s *planService) MakePlan(req *dto.CreatePlanRequest) (*dto.PlanResponse, error) {
	cities := req.Locations
	wanted_places := req.DesiredPlaces
	// 乱数のシード設定（Go 1.20未満の場合は必要。1.20以降は rand.Seed は推奨されませんが、動作します）
	// 1. バリデーション
	if len(cities) == 0 || len(wanted_places) == 0 {
		return nil, fmt.Errorf("locations or desired_places is empty")
	}

	// 2. ランダムに1つずつ選択 (Go 1.22+ math/rand/v2 の場合)
	// rand.N(n) はシード設定不要で、より直感的に書けます
	randomCity := cities[rand.N(len(cities))]
	randomPlace := wanted_places[rand.N(len(wanted_places))]

	// 座標取得
	latlon, err := s.nominatimclient.GetLatLon(req.Prefecture)
	if err != nil {
		return nil, fmt.Errorf("座標取得失敗: %w", err)
	}

	// 天気取得
	weather, err := s.weatherclient.GetWeatherByDate(latlon.Lat, latlon.Lon, req.Date)
	if err != nil {
		return nil, fmt.Errorf("天気取得失敗: %w", err)
	}

	fmt.Printf("座標: %+v\n", latlon)
	fmt.Printf("天気: %+v\n", weather)

	searchQuery := fmt.Sprintf("%s %s", randomCity, randomPlace)
	places, err := s.googleClient.SearchPlaces(searchQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to search places: %w", err)
	}
	//fmt.Printf("取得したスポット: %+v\n", places)
	prompt := fmt.Sprintf("以下のスポットから一つ追加して、デートプランを考えて: %v %v", places, weather)
	//description, err := s.groqclient.Chat(prompt)
	//if err != nil {
	//	// 👇 詳細なエラーを出力
	//	fmt.Println("Geminiエラー詳細:", err)
	//	return nil, err
	//}
	//fmt.Printf("groqに考えさせた: %+v\n", description)
	plan, err := s.groqclient.GenerateDatePlan(prompt)
	if err != nil {
		fmt.Println("エラー:", err)
		return nil, err
	}
	fmt.Printf("groqに考えさせた: %+v\n", plan)

	// そのまま返せる
	return plan, nil
	//
	//// 3. 戻り値も型を合わせる
	//return &dto.PlanResponse{
	//	Theme: req.Theme,
	//}, nil
}
