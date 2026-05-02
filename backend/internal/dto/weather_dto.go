package dto

type DailyWeather struct {
	Time          []string  `json:"time"`
	TempMax       []float64 `json:"temperature_2m_max"`
	TempMin       []float64 `json:"temperature_2m_min"`
	Precipitation []float64 `json:"precipitation_sum"`
	PrecipProb    []int     `json:"precipitation_probability_max"`
	WeatherCode   []int     `json:"weathercode"`
}

type TodayWeather struct {
	Date       string
	TempMax    float64
	TempMin    float64
	Precip     float64
	PrecipProb int
	Status     string
}
