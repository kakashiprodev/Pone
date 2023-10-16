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

export type Scope = "scope1" | "scope2" | "scope3";

export interface UserInput {
  id: string;
  scope: Scope;
  name: string;
  rawValue: number;
  sumValue: number;
  equivalent: null | string;
  project: string;
  year: number;
  comment: string;
}

export interface UserInputQuery {
  scope?: string;
}
