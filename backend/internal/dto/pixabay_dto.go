package dto

// PixabayResponse はPixabay画像検索APIのレスポンス
type PixabayResponse struct {
	Total     int          `json:"total"`
	TotalHits int          `json:"totalHits"`
	Hits      []PixabayHit `json:"hits"`
}

// PixabayHit はPixabay画像検索結果1件分
type PixabayHit struct {
	ID            int    `json:"id"`
	PageURL       string `json:"pageURL"`
	WebformatURL  string `json:"webformatURL"`
	LargeImageURL string `json:"largeImageURL"`
}
