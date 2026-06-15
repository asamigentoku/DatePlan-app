package service

import (
	"context"
	"errors"
	"fmt"
	"math/rand/v2"
	"net/http"

	"github.com/asamigentoku/DatePlan-app/internal/client"
	"github.com/asamigentoku/DatePlan-app/internal/dto"
	"github.com/asamigentoku/DatePlan-app/internal/repository"
	"github.com/openai/openai-go"
)

type PlanService interface {
	// 戻り値を (*dto.PlanResponse, error) に変更！
	MakePlan(*dto.CreatePlanRequest) (*dto.PlanResponse, error)
}

type planService struct {
	googleClient    *client.GooglePlacesClient
	groqclient      *client.GroqClient
	chatgptclient   *client.OpenAIClient
	weatherclient   *client.WeatherClient
	nominatimclient *client.NominatimClient
	pixabayclient   *client.PixabayClient
	placesCache     repository.PlacesCacheRepository
	imgCache        repository.ImgCacheRepository
	geoCache        repository.GeoCacheRepository
	weatherCache    repository.WeatherCacheRepository
}

// NewPlanService クライアントを受け取って初期化するコンストラクタ
func NewPlanService(
	google *client.GooglePlacesClient,
	groq *client.GroqClient,
	chatgpt *client.OpenAIClient,
	weather *client.WeatherClient,
	nomi *client.NominatimClient,
	pixabay *client.PixabayClient,
	placesCache repository.PlacesCacheRepository,
	imgCache repository.ImgCacheRepository,
	geoCache repository.GeoCacheRepository,
	weatherCache repository.WeatherCacheRepository) PlanService {
	return &planService{
		googleClient:    google,
		groqclient:      groq,
		chatgptclient:   chatgpt,
		weatherclient:   weather,
		nominatimclient: nomi,
		pixabayclient:   pixabay,
		placesCache:     placesCache,
		imgCache:        imgCache,
		geoCache:        geoCache,
		weatherCache:    weatherCache,
	}
}

// attachPhotos はプラン内の各スポットにスポット名で検索した写真を付与する（Mongoキャッシュ利用）
func (s *planService) attachPhotos(ctx context.Context, plan *dto.PlanResponse) {
	for i := range plan.Spots {
		name := plan.Spots[i].Name

		if cached, err := s.imgCache.GetCache(ctx, name); err == nil && cached != nil {
			fmt.Println("⚡ 画像キャッシュから取得:", name)
			plan.Spots[i].Photos = pixabayHitsToURLs(*cached)
			continue
		}

		hits, err := s.pixabayclient.SearchPhotos(name)
		if err != nil {
			fmt.Println("⚠️ 写真取得失敗:", err)
			continue
		}
		plan.Spots[i].Photos = hits

		if cacheErr := s.imgCache.SetCache(ctx, name, urlsToPixabayHits(hits)); cacheErr != nil {
			fmt.Println("⚠️ 画像キャッシュ保存失敗:", cacheErr)
		}
	}
}

// attachCoordinates はプラン内の各スポットにスポット名で取得した座標を付与する（Mongoキャッシュ利用）
// fallback は座標取得に失敗した場合に使うモック座標（同じ県内になるよう、最初に取得した県の座標を渡す）
func (s *planService) attachCoordinates(ctx context.Context, plan *dto.PlanResponse, fallback *client.LatLon) {
	for i := range plan.Spots {
		name := plan.Spots[i].Name

		if cached, err := s.geoCache.GetCache(ctx, name); err == nil && cached != nil {
			fmt.Println("⚡ 座標キャッシュから取得:", name)
			plan.Spots[i].Lat = cached.Lat
			plan.Spots[i].Lng = cached.Lon
			continue
		}

		latlon, err := s.nominatimclient.GetLatLon(name)
		if err != nil {
			fmt.Println("⚠️ スポット座標取得失敗(Nominatim):", name, err)
			latlon, err = s.googleClient.GetLatLon(name)
			if err != nil {
				fmt.Println("⚠️ スポット座標取得失敗(Google)、県の座標をモックとして使用:", name, err)
				plan.Spots[i].Lat = fallback.Lat
				plan.Spots[i].Lng = fallback.Lon
				continue
			}
			fmt.Println("✅ Google Geocodingで座標取得:", name)
		}
		plan.Spots[i].Lat = latlon.Lat
		plan.Spots[i].Lng = latlon.Lon

		if cacheErr := s.geoCache.SetCache(ctx, name, repository.GeoLocation{Lat: latlon.Lat, Lon: latlon.Lon}); cacheErr != nil {
			fmt.Println("⚠️ 座標キャッシュ保存失敗:", cacheErr)
		}
	}
}

func pixabayHitsToURLs(hits []dto.PixabayHit) []string {
	urls := make([]string, 0, len(hits))
	for _, hit := range hits {
		urls = append(urls, hit.WebformatURL)
	}
	return urls
}

func urlsToPixabayHits(urls []string) []dto.PixabayHit {
	hits := make([]dto.PixabayHit, 0, len(urls))
	for _, url := range urls {
		hits = append(hits, dto.PixabayHit{WebformatURL: url})
	}
	return hits
}

// isRateLimitError はGroq APIがレートリミット(429)を返したかどうかを判定する
func isRateLimitError(err error) bool {
	apiErr, ok := errors.AsType[*openai.Error](err)
	return ok && apiErr.StatusCode == http.StatusTooManyRequests
}

func (s *planService) MakePlan(req *dto.CreatePlanRequest) (*dto.PlanResponse, error) {
	cities := req.Locations
	if len(cities) == 0 {
		cities = []string{req.Prefecture}
	}
	wanted_places := req.DesiredPlaces
	if len(wanted_places) == 0 {
		wanted_places = []string{"デートスポット"}
	}
	ctx := context.Background()

	// 2. ランダムに1つずつ選択 (Go 1.22+ math/rand/v2 の場合)
	// rand.N(n) はシード設定不要で、より直感的に書けます
	randomCity := cities[rand.N(len(cities))]
	randomPlace := wanted_places[rand.N(len(wanted_places))]

	// 座標取得（キャッシュ優先、失敗時はモックを使用）
	var latlon *client.LatLon
	if cached, err := s.geoCache.GetCache(ctx, req.Prefecture); err == nil && cached != nil {
		fmt.Println("⚡ 座標キャッシュから取得")
		latlon = &client.LatLon{Lat: cached.Lat, Lon: cached.Lon}
	} else {
		latlon, err = s.nominatimclient.GetLatLon(req.Prefecture)
		if err != nil {
			fmt.Println("⚠️ 座標取得失敗(Nominatim)、Googleで再試行:", err)
			latlon, err = s.googleClient.GetLatLon(req.Prefecture)
		}
		if err != nil {
			fmt.Println("⚠️ 座標取得失敗、モックを使用:", err)
			latlon = &client.LatLon{Lat: 35.681236, Lon: 139.767125} // 東京駅
		} else if cacheErr := s.geoCache.SetCache(ctx, req.Prefecture, repository.GeoLocation{Lat: latlon.Lat, Lon: latlon.Lon}); cacheErr != nil {
			fmt.Println("⚠️ 座標キャッシュ保存失敗:", cacheErr)
		}
	}

	// 天気取得（キャッシュ優先、失敗時はモックを使用）
	var weather *dto.TodayWeather
	if cached, err := s.weatherCache.GetCache(ctx, req.Prefecture, req.Date); err == nil && cached != nil {
		fmt.Println("⚡ 天気キャッシュから取得")
		weather = cached
	} else {
		weather, err = s.weatherclient.GetWeatherByDate(latlon.Lat, latlon.Lon, req.Date)
		if err != nil {
			fmt.Println("⚠️ 天気取得失敗、モックを使用:", err)
			weather = &dto.TodayWeather{
				Date:       req.Date,
				TempMax:    22.0,
				TempMin:    15.0,
				Precip:     0,
				PrecipProb: 10,
				Status:     "晴れ",
			}
		} else if cacheErr := s.weatherCache.SetCache(ctx, req.Prefecture, req.Date, *weather); cacheErr != nil {
			fmt.Println("⚠️ 天気キャッシュ保存失敗:", cacheErr)
		}
	}

	fmt.Printf("座標: %+v\n", latlon)
	fmt.Printf("天気: %+v\n", weather)

	searchQuery := fmt.Sprintf("%s %s", randomCity, randomPlace)
	cachedPlaces, err := s.placesCache.GetCache(ctx, randomCity, randomPlace)
	var places []dto.Place
	if err == nil && cachedPlaces != nil {
		fmt.Println("⚡ キャッシュから取得")
		places = *cachedPlaces // ← .Results を取り出す
	} else {
		places, err = s.googleClient.SearchPlaces(searchQuery)
		if err != nil {
			return nil, fmt.Errorf("failed to search places: %w", err)
		}

		if cacheErr := s.placesCache.SetCache(ctx, randomCity, randomPlace, places); cacheErr != nil {
			fmt.Println("⚠️ キャッシュ保存失敗:", cacheErr)
		}
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
		if isRateLimitError(err) && s.chatgptclient != nil {
			fmt.Println("⚠️ Groqがレートリミットのため、ChatGPTにフォールバック:", err)
			plan, err = s.chatgptclient.GenerateDatePlan(prompt)
			if err != nil {
				fmt.Println("エラー:", err)
				return nil, err
			}
			fmt.Printf("ChatGPTに考えさせた: %+v\n", plan)
		} else {
			fmt.Println("エラー:", err)
			return nil, err
		}
	} else {
		fmt.Printf("groqに考えさせた: %+v\n", plan)
	}

	// 各スポットに写真・座標を付与する
	s.attachPhotos(ctx, plan)
	s.attachCoordinates(ctx, plan, latlon)

	return plan, nil
}
