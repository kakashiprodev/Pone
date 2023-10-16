export interface Equivalent {
  id: string;
  name: string;
  comment: null | string;
  unit: string;
  avgValue: number;
  jan: null | number;
  feb: null | number;
  mar: null | number;
  apr: null | number;
  may: null | number;
  jun: null | number;
  jul: null | number;
  aug: null | number;
  sep: null | number;
  oct: null | number;
  nov: null | number;
  dec: null | number;
  year: number;
  project: string;
  source: string;
  monthlyValues: boolean;
}

export interface UserInput {
  id: string;
  project: string;
  name: string;
  sumValue: number;
  equivalent: null | string;
  equivalentManual: null | number;
  comment: string;
  year: number;
}

export interface UserInputQuery {
  scope?: string;
}
