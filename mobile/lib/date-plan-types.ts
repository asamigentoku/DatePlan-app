export interface Spot {
  name: string;
  // Anthropic response fields
  time?: string;
  desc?: string;
  tip?: string;
  // Backend response fields
  description?: string;
  photos?: string[];
  category?: string;
  rating?: number;
  stay_time?: number;
  price_range?: number;
  indoor_outdoor?: string;
  congestion?: number;
  opening_hours?: { start: number; end: number };
}

export interface Movement {
  from: string;
  to: string;
  duration: number;
  method: string;
}

export interface Plan {
  area: string;
  budget: string;
  spots: Spot[];
  totalTip: string;
  theme?: string;
  weather?: {
    status: string;
    temperature: number;
    season: string;
  };
  movements?: Movement[];
}