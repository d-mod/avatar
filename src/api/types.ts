export interface Collocation {
  id: string;
  name: string;
  description: string;
  author: string;
  code: string;
  profession: string;
  type: string;
  year: number;
  amount: number;
  custom: boolean;
}

export interface CollocationType {
  name: string;
  label: string;
}
