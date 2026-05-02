package dto

type CreatePlanRequest struct {
	Theme         string   `json:"theme"`                         // テーマ
	Budget        *int     `json:"budget"`                        // 予算 (default=Noneを表現するためポインタを使用)
	DesiredPlaces []string `json:"desired_places"`                // 行きたい場所
	TimeSlot      string   `json:"time_slot"`                     // 時間帯 (朝、昼、夜)
	StartTime     *int     `json:"start_time"`                    // 始まりの時間
	EndTime       *int     `json:"end_time"`                      // 終わりの時間 (default=Noneを表現するためポインタを使用)
	Locations     []string `json:"locations"`                     // 場所(リスト),地名
	Relationship  *string  `json:"relationship"`                  // 関係性
	HasCar        bool     `json:"has_car"`                       // 車あり
	Prefecture    string   `json:"prefecture" binding:"required"` // 都道府県 (選ばせる項目)
	Date          string   `json:"date"`                          //いついくか
}

// PlanResponse は最終的にフロントエンドへ返すデートプランの全データ
type PlanResponse struct {
	Theme       string         `json:"theme"`
	Weather     WeatherInfo    `json:"weather"`
	Description string         `json:"description"`
	Spots       []SpotInfo     `json:"spots"`
	Movements   []MovementInfo `json:"movements"`
}

// WeatherInfo 天気情報
type WeatherInfo struct {
	Status      string  `json:"status"`      // 晴れ / 雨 / 曇り
	Temperature float64 `json:"temperature"` // 気温
	Season      string  `json:"season"`      // 季節
}

// SpotInfo 各スポットの詳細
type SpotInfo struct {
	Order         int          `json:"order"` // いつ表示するか
	Name          string       `json:"name"`
	Description   string       `json:"description"`
	Photos        []string     `json:"photos"`         // list[url]
	Category      string       `json:"category"`       // カフェ / 公園 / 映画館
	StayTime      int          `json:"stay_time"`      // 滞在時間目安(分)
	PriceRange    int          `json:"price_range"`    // 価格帯
	IndoorOutdoor string       `json:"indoor_outdoor"` // 屋内 / 屋外
	Rating        float64      `json:"rating"`
	Congestion    int          `json:"congestion"` // 混雑度
	OpeningHours  OpeningHours `json:"opening_hours"`
}

// OpeningHours 営業時間
type OpeningHours struct {
	Start int `json:"start"`
	End   int `json:"end"`
}

// MovementInfo スポット間の移動情報
type MovementInfo struct {
	Order    int    `json:"order"` // いつ表示するか
	From     string `json:"from"`
	To       string `json:"to"`
	Duration int    `json:"duration"` // 時間(分)
	Method   string `json:"method"`   // 徒歩 / 電車 / 車
}
