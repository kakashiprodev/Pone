// table "equivalents"
export interface EquivalentEntry {
  id: string;
  category: string;
  scope: number; // 1-3
  specification1: string;
  specification2: string;
  specification3: string;
  add_name1: string;
  comment: string;
  source: string;
  avg_value: number;
  monthly_values: boolean;
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
  created_at: string; // date
  updated_at: string; // date
}

// table "inputs"
export interface InputEntry {
  id: string;
  name: string;
  scope: number; // 1-3
  comment: string;
  sum_value: number;
  equivalent: null | string; // reference on table equivalents
  report: string; // reference on table reports
  category: null | string;
  facility: null | string; // references on table facilities 1:n
  parent: null | string; // reference on table inputs. set if the input belongs to a group
  raw_value: number;
  monthly_values: boolean;
  raw_value_jan: number;
  raw_value_feb: number;
  raw_value_mar: number;
  raw_value_apr: number;
  raw_value_may: number;
  raw_value_jun: number;
  raw_value_jul: number;
  raw_value_aug: number;
  raw_value_sep: number;
  raw_value_oct: number;
  raw_value_nov: number;
  raw_value_dec: number;
  created_at: string; // date
  updated_at: string; // date
}

// table "inputs" with expanded report and site
export interface InputEntryWithExpandedReportAndSite
  extends Omit<InputEntry, 'report' | 'facility' | 'site'> {
  report: {
    id: string;
    base_year: number;
    year: number;
    site: {
      id: string;
      name: string;
      project: string; // reference on table projects
    };
  };
  facility: {
    id: string;
    name: string;
  };
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
  site: string; // reference on table sites
  year: number;
  company_name: string;
  company_street: string;
  company_postal: string;
  company_city: string;
  company_country: string;
  company_domain: string;
  contact_name: string;
  contact_telephone: string;
  contact_email: string;
  contact_domain: string;
  count_employees: number;
  business_turnover: number;
  base_year: number;
  sum_emissions: number; // kann ggf. später weg?!
  created_at: string; // date
  updated_at: string; // date
}

// table "projects"
export interface ProjectEntry {
  id: string;
  name: string;
  logo: string; // url to the logo
  logo_id: null | string; // reference on table files
  created_at: string; // date
  updated_at: string; // date
}

// table "user_projects"
export interface UserProjectEntry {
  user_id: string; // reference on table users
  project_id: string; // reference on table projects
}

// table "sites"
export interface SiteEntry {
  id: string;
  name: string;
  project: string; // reference on table projects
  created_at: string; // date
  updated_at: string; // date
}

// table "actions"
export interface ActionEntry {
  id: string;

  // PM
  responsible: string;
  status: 'open' | 'inProgress' | 'finished' | 'canceled';
  progress: number; // 0-100

  relevant: boolean; // if false the action is not used in the calculation
  site: string; // reference on table sites
  name: string; // normal text

  description_before: string; // rich text
  description_after: string; // rich text

  target_value_absolut_planned: number; // planned target value to save
  target_value_absolut_is: number; // actual target value to save
  description_target_value: string; // rich text

  finished_until_planned: string | Date | null; // date
  finished_until_is: string | Date | null; // date

  category: string;

  costs_planned: number;
  costs_is: number;
  roi: number; // return of investment
  description_costs: string; // description of costs
  avoidance_costs: number; // de="vermeidungskosten"

  created_at: string; // date
  updated_at: string; // date
}

export interface ActionWithPercentage extends ActionEntry {
  target_value_planned: number;
  target_value_is: number;
}

// table facilities
export interface FacilityEntry {
  id: string;
  site: string; // reference on table sites
  name: string;
  manufacturer: string;
  model: null | string;
  description: string;
  shutdown_date: null | string | Date; // if null or empty the facility is in use
  created_at: string; // date
  updated_at: string; // date
}

// table "users"
export interface UserEntry {
  id: string;
  username: string;
  email: string;
  is_global_admin: boolean;
  firstname: string;
  surname: string;
  department: string;
  role: string;
  telephone: string;
  // preferences:
  display_in_tons: boolean;
  last_selected_project: null | string; // reference on table projects. can be empty
  last_selected_site: null | string; // reference on table sites. can be empty
  last_selected_report: null | string; // reference on table reports. can be empty
  selected_theme: string; // dark | light
  // admin
  can_manage_projects: number;

  created_at: string; // date
  updated_at: string; // date
}

// table "targets"
export interface TargetEntry {
  id: string;
  report: string; // reference on table reports
  year: number;
  percentage: number; // 0-100
  created_at: string; // date
  updated_at: string; // date
}
