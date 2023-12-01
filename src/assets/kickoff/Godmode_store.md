You are a professional Vue3 Developer.
You write code only in TypeScript. You don´t explain you code. You only deliver code which is commented if necessary.

You will use a given dataprovider in this project.
the dataprovider will provide:
´´´
interface DataProviderInterface {
    login(username: string, password: string): Promise<boolean>;
    checkLogin(): Promise<boolean>;
    logout(): Promise<void>;

    readEquivalents(): Promise<Equivalent[]>;
    readEquivalentsAsDict(): Promise<{ [key: string]: Equivalent }>;
    createEquivalent(data: Equivalent): Promise<any>;
    updateEquivalents(data: Equivalent): Promise<any>;
    deleteEquivalent(id: string): Promise<any>;

    createUserInput(data: InputEntry): Promise<any>;
    readUserInput(id: string): Promise<InputEntry>;
    readUserInputs(query?: UserInputQuery): Promise<InputEntry[]>;
    updateUserInput(data: InputEntry): Promise<any>;
    deleteUserInput(id: string): Promise<any>;

    createReport(data: ReportEntry): Promise<any>;
    readReport(id: string): Promise<ReportEntry>;
    readReports(): Promise<ReportEntry[]>;
    updateReport(data: ReportEntry): Promise<any>;
    deleteReport(id: string): Promise<any>;

    createSource(data: SourceEntry): Promise<any>;
    readSource(id: string): Promise<SourceEntry>;
    readSources(): Promise<SourceEntry[]>;
    updateSource(data: SourceEntry): Promise<any>;
    deleteSource(id: string): Promise<any>;

    createProject(data: ProjectEntry): Promise<any>;
    readProject(id: string): Promise<ProjectEntry>;
    readProjects(): Promise<ProjectEntry[]>;
    updateProject(data: ProjectEntry): Promise<any>;
    deleteProject(id: string): Promise<any>;

    createCategory(data: CategoryEntry): Promise<any>;
    readCategory(id: string): Promise<CategoryEntry>;
    readCategories(): Promise<CategoryEntry[]>;
    updateCategory(data: CategoryEntry): Promise<any>;
    deleteCategory(id: string): Promise<any>;
}

// table "equivalents"
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

// table "inputs"
export interface InputEntry {
  id: string;
  name: string;
  scope: number; // 1-3
  comment: string;
  rawValue: number;
  sumValue: number;
  equivalent: null | string; // reference on table equivalents
  report: string; // reference on table reports
}

// query object for table "inputs"
export interface UserInputQuery {
  scope?: number;
}

// table "reports"
export interface ReportEntry {
  id: string;
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

// table "sources"
export interface SourceEntry {
  id: string;
  name: string;
}

// table "projects"
export interface ProjectEntry {
  id: string;
  name: string;
}

// table "categories"
export interface CategoryEntry {
  id: string;
  name: string;
  parent: null | string; // reference on table categories. flat structure
  equivalent: null | string; // single reference on table equivalents
}
´´´

# Your Task

You will extend the given Pinia Store. 
The store works as a chache for the backend.

1 - The store need a "initialisation" function.
This function will get all "projects" from user and will put them in the Store with id and name.
This is needed to choose the project in the UI later.

For each project the user has a list of "reports". The store needs functions to work with the dataprovider and "reports".

It need functionality to change the project. Is a project is loaded or changed it needs to get all "reports" that belong to that project.
If a "report" is added/deleted/updated the store must get the same update.

2 - For the table "sources" it is enough to have a "refresh" function that will update the cache.

3 - You will add a "changeTheme" function.

4 - For the table "categories" a refresh function is enough. The result must be stored in an nested tree based on this interfaces.
/**
 * Custom TreeNode metadata.
 */
export interface TreeNode {
    key: string;
    label?: string;   
    data?: any; // if "entry" this will be the assigned equivalent in a object   
    type?: "folder" | "entry";    
    icon?: string; // depends on type    
    children?: TreeNode[];    
    selectable?: boolean;
    /**
     * Specifies if the node has children. Used in lazy loading.
     * @defaultValue false
     */
    leaf?: boolean;
    /**
     * Optional
     */
    [key: string]: any;
    /**
     * Icon to use in expanded state.
     */
    expandedIcon?: string; // open folder icon if type == "folder"
    /**
     * Icon to use in collapsed state.
     */
    collapsedIcon?: string; // closed folder icon if type == "folder"
}




The code to extend is:
´´´
import { defineStore } from "pinia";
import { router } from "./../router/index";
import { Equivalent, ReportEntry } from "./../services/types";
import dataprovider from "./../services/dataprovider";
import { error, info } from "./../services/toast";

export interface GlobalState {
  isLoading: boolean;
  isLoggenIn: boolean;
  requestPending: boolean;
  //
  selectedReport: null | ReportEntry;
  // selectedMonth: number;
  // user information
  username: string;
  company: string;
  project: string;
  // layout information
  theme: "light" | "dark";
  // equivalents
  equivalents: Equivalent[];
  equivalentDict: { [key: string]: Equivalent };
}

export const useGlobalStore = defineStore("global", {
  state: () => ({
    isLoading: false,
    isLoggenIn: false,
    requestPending: false,
    //
    selectedReport: null,
    // selectedMonth: 1,
    // user information
    username: "",
    company: "",
    project: "",
    // layout information
    theme: "light" as "light" | "dark",
    // equivalents
    equivalents: [],
    equivalentDict: {},
  } as GlobalState),

  actions: {
    async redirectToMain() {
      await router.push({ name: "dashboard" });
    },
    async redirectToLogin() {
      await router.push({ name: "login" });
    },
    async refreshEquivalents(force = false) {
      if (force || this.equivalents.length === 0) {
        this.equivalents = await dataprovider.readEquivalents();
        // sort by "name"
        this.equivalents.sort((a, b) => a.name.localeCompare(b.name));
        // create dict
        this.equivalentDict = this.equivalents.reduce(
          (acc, cur) => ({ ...acc, [cur.id]: cur }),
          {},
        );
      }
    },
    async addEquivalent(equivalent: Equivalent) {
      try {
        const created = await dataprovider.createEquivalent(equivalent);
        // add equivalent to local store at position 0
        this.equivalents.push(created);
        // sort by "name"
        this.equivalents.sort((a, b) => a.name.localeCompare(b.name));
        this.equivalentDict[equivalent.id] = created;
        info("Equivalent wurde erstellt.");
        return created;
      } catch (e) {
        error("Equivalent konnte nicht erstellt werden. " + e);
      }
    },
    async dropEquivalent(equivalent: Equivalent) {
      try {
        await dataprovider.deleteEquivalent(equivalent.id);
        // drop equivalent from local store
        this.equivalents = this.equivalents.filter((e) =>
          e.id !== equivalent.id
        );
        delete this.equivalentDict[equivalent.id];
        info("Equivalent wurde gelöscht.");
      } catch (e) {
        error("Equivalent konnte nicht gelöscht werden. " + e);
      }
    },
    async updateEquivalent(equivalent: Equivalent) {
      try {
        const updated = await dataprovider.updateEquivalents(equivalent);
        // get index of existing equivalent
        const index = this.equivalents.findIndex((e) => e.id === equivalent.id);
        // replace
        if (index > -1) {
          this.equivalents.splice(index, 1, updated);
        }
        // update dict
        this.equivalentDict[equivalent.id] = updated;
        info("Equivalent wurde aktualisiert.");
        return updated;
      } catch (e) {
        error("Equivalent konnte nicht aktualisiert werden. " + e);
      }
    },
  },
});

´´´