export interface Spot {
  name: string;
  time: string;
  desc: string;
  tip: string;
}

export interface Plan {
  area: string;
  budget: string;
  spots: Spot[];
  totalTip: string;
}
