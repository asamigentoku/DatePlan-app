package dto

type PlacesResponse struct {
	Results []Place `json:"results"`
}

type Place struct {
	Name     string   `json:"name"`
	Rating   float64  `json:"rating"`
	Geometry Geometry `json:"geometry"`
}

type Geometry struct {
	Location Location `json:"location"`
}

type Location struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}
