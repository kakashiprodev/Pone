// table "equivalents"
export interface EquivalentEntry {
  id: string;
  category: string;
  scope: number; // 1-3
  specification1: string;
  specification2: string;
  specification3: string;
  addName1: string;
  comment: null | string;
  source: string;
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
  in: string; // input unit
  out: string; // output unit
  project: null | string; // reference on table projects. system values will be NULL
}

// table "inputs"
export interface InputEntry {
  id: string;
  name: string;
  scope: number; // 1-3
  comment: string;
  sumValue: number;
  equivalent: null | string; // reference on table equivalents
  report: string; // reference on table reports
  category: null | string;
  facility: null | string; // references on table facilities 1:n
  parent: null | string; // reference on table inputs. set if the input belongs to a group
  rawValue: number;
  monthlyValues: boolean;
  rawJan: number;
  rawFeb: number;
  rawMar: number;
  rawApr: number;
  rawMay: number;
  rawJun: number;
  rawJul: number;
  rawAug: number;
  rawSep: number;
  rawOct: number;
  rawNov: number;
  rawDec: number;
}

// query object for table "inputs"
export interface UserInputQuery {
  scope?: number[];
  category?: string[];
  facility?: string[];
}

// table "reports"
export interface ReportEntry {
  [key: string]: any;
  id: string;
  project: string; // the project id
  year: number;
  companyName: string;
  companyStreet: string;
  companyPostal: string;
  companyCity: string;
  companyCountry: string;
  companyDomain: string;
  contactName: string;
  contactTelephone: string;
  contactEmail: string;
  contactDomain: string;
  countEmployees: number;
  businessTurnover: number;
  baseYear: number;
  sumEmissions: number;
}

// table "projects"
export interface ProjectEntry {
  id: string;
  name: string;
}

// table "actions"
export interface ActionEntry {
  id: string;
  relevant: boolean; // if false the action is not used in the calculation
  project: string; // reference on table projects
  name: string; // normal text
  shortDescription: string; // rich text
  longDescription: string; // rich text
  targetValueAbsolut: number; // absolute value that should be saved. can be 0 if unknown
  responsible: string;
  finishedUntil: string | Date | null; // date
  status: 'open' | 'inProgress' | 'finished' | 'canceled';
  progress: number; // 0-100
}

// table "targets"
export interface TargetEntry {
  id: string;
  project: string; // reference on table projects
  year: number;
  percentage: number; // 0-100
}

// table facilities
export interface FacilityEntry {
  id: string;
  name: string;
  manufacturer: string;
  model: null | string;
  description: null | string;
  project: string; // reference on table projects
  shutdownDate: null | string | Date; // if null or empty the facility is in use
}

// table "users"
export interface UserEntry {
  id: string;
  username: string;
  email: string;
  projects: string[]; // reference on table projects
  isGlobalAdmin: boolean;
  firstname: string;
  surname: string;
  department: string;
  role: string;
  telephone: string;
  displayInTons: boolean;
}
