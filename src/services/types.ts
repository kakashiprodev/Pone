export interface Equivalent {
  id: string;
  name: string;
  comment: null | string;
  year: number;
  avgValue: number;
  monthlyValues: boolean;
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
  parent: null | string; // reference on table equivalents. if set a calculation chain is used
  source: null | string; // reference on table sources. user inputs can have NULL
  project: null | string; // reference on table projects. system values will be NULL
  in: string; // input unit
  out: string; // output unit
}

export interface UserInput {
  id: string;
  name: string;
  scope: number; // 1-3
  comment: string;
  rawValue: number;
  sumValue: number;
  equivalent: null | string; // reference on table equivalents
  report: string; // reference on table reports
}

export interface UserInputQuery {
  scope?: number;
}

export interface ReportEntry {
  project: string; // the project id
  year: number;
  companyName: string;
  companyStreet: string;
  companyPostal: string;
  companyCity: string;
  companyCountry: string;
  contactName: string;
  contactTelephone: string;
  contactEmail: string;
  contactDomain: string;
  companyDomain: string;
  countEmployees: number;
  businessTurnover: number;
  baseYear: number;
  baseEquivalentSource: null | string; // reference on table sources
}

export interface SourceEntry {
  id: string;
  name: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
}

export interface CategoryEntry {
  id: string;
  name: string;
  parent: null | string; // reference on table categories. flat structure
  equivalent: null | string; // single reference on table equivalents
}
