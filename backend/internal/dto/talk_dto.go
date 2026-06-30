package dto

type TalkThemeRequest struct {
	Count int `form:"count"` // カテゴリあたりの件数（デフォルト2）
}

type TalkCategory struct {
	Label  string   `json:"label"`
	Themes []string `json:"themes"`
}

type TalkThemeResponse struct {
	Categories []TalkCategory `json:"categories"`
}
