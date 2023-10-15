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
  project: string;
  source: string;
}

export interface UserInput {
  id: string;
  project: string;
  name: string;
  value: number;
  equivalent: null | string;
  equivalentManual: null | number;
  comment: string;
  validity: "P1Y" | "P1M";
  timestamp: string;
}

export interface UserInputQuery {
  scope?: string;
}
