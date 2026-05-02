package dto

type PlacesResponse struct {
	Results []Place `json:"results"`
}

type Place struct {
	BusinessStatus      string               `json:"business_status"`
	FormattedAddress    string               `json:"formatted_address"`
	Geometry            Geometry             `json:"geometry"`
	Icon                string               `json:"icon"`
	IconBackgroundColor string               `json:"icon_background_color"`
	IconMaskBaseUri     string               `json:"icon_mask_base_uri"`
	Name                string               `json:"name"`
	OpeningHours        *OpeningHours_google `json:"opening_hours,omitempty"`
	Photos              []Photo              `json:"photos"`
	PlaceId             string               `json:"place_id"`
	PlusCode            PlusCode             `json:"plus_code"`
	PriceLevel          int                  `json:"price_level,omitempty"`
	Rating              float64              `json:"rating"`
	Reference           string               `json:"reference"`
	Types               []string             `json:"types"`
	UserRatingsTotal    int                  `json:"user_ratings_total"`
}

type Geometry struct {
	Location Location `json:"location"`
	Viewport Viewport `json:"viewport"`
}

type Location struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type Viewport struct {
	Northeast Location `json:"northeast"`
	Southwest Location `json:"southwest"`
}

type OpeningHours_google struct {
	OpenNow bool `json:"open_now"`
}

type Photo struct {
	Height           int      `json:"height"`
	HtmlAttributions []string `json:"html_attributions"`
	PhotoReference   string   `json:"photo_reference"`
	Width            int      `json:"width"`
}

type PlusCode struct {
	CompoundCode string `json:"compound_code"`
	GlobalCode   string `json:"global_code"`
}
