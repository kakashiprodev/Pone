import { defineStore } from "pinia";
import { router } from "./../router/index";
import {
  CategoryEntry,
  Equivalent,
  PresetEntry,
  ProjectEntry,
  ReportEntry,
  SourceEntry,
} from "./../services/types";
import dataprovider from "./../services/dataprovider";
import { info } from "../services/toast";

export interface GlobalState {
  isLoading: boolean;
  isLoggedIn: boolean;
  requestPending: boolean;
  // layout and theme
  theme: "light" | "dark";
  showTooltips: boolean;
  // user information
  username: string;
  // equivalent sources, e.g. GEMIS
  sources: SourceEntry[];
  sourcesDict: { [key: string]: SourceEntry };
  // equivalents
  equivalents: Equivalent[];
  equivalentDict: { [key: string]: Equivalent };
  // projects
  projects: ProjectEntry[];
  selectedProject: null | ProjectEntry;
  // reports
  reports: ReportEntry[];
  selectedReport: null | ReportEntry;
  // categories
  categories: CategoryEntry[];
  presets: PresetEntry[];
}

export const useGlobalStore = defineStore("global", {
  state: (): GlobalState => ({
    isLoading: true,
    isLoggedIn: false,
    requestPending: false,
    //
    username: "",
    theme: "light" as "light" | "dark",
    showTooltips: true,
    //
    sources: [],
    sourcesDict: {},
    //
    equivalents: [],
    equivalentDict: {},
    //
    projects: [],
    selectedProject: null,
    //
    reports: [],
    selectedReport: null,
    //
    categories: [],
    presets: [],
  }),

  actions: {
    //login actions
    async redirectToMain() {
      await router.push({ name: "dashboard" });
    },
    async redirectToLogin() {
      await router.push({ name: "login" });
    },

    /**
     * MAIN FUNCTION when App is loaded.
     */
    async initializeStore() {
      console.log("initializeStore");
      this.isLoading = true;
      // load all data from backend
      await Promise.all([
        this.refreshSources(),
        this.refreshCategories(),
        this.refreshProjects(),
      ]);
      // select the first project
      // HACK: in the future the last selected project could be loaded from the local storage
      await this.ensureProjectSelected();
      // load equivalents and reports for the selected project
      await this.refreshProjectAndReport();

      this.isLoading = false;
    },

    async refreshProjectAndReport() {
      // load equivalents and reports for the selected project
      await this.refreshEquivalents(true);
      await this.refreshReports(true);
      // select report with the highest year
      this.loadLatestReport();
    },

    // *************************************************************
    // CRUD cache for "equivalents"
    // *************************************************************

    /**
     * reload the cache for "equivalents" from backend.
     * will not overwrite it if still data in cache. (use force = true to overwrite)
     * HACK: All euquivalents belong to ONE project.
     */
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
    /**
     * Add a new equivalent to the cache and backend.
     * This euquvalent will always be a project specific equivalent!
     * HACK: this must be checked in the backend!
     */
    async addEquivalent(equivalent: Equivalent) {
      const entryToAdd: any = equivalent;
      delete entryToAdd.id;
      const created = await dataprovider.createEquivalent(equivalent);
      // add equivalent to local store at position 0
      this.equivalents.push(created);
      // sort by "name"
      this.equivalents.sort((a, b) => a.name.localeCompare(b.name));
      this.equivalentDict[equivalent.id] = created;
      return created;
    },
    /**
     * Update an equivalent in the cache and backend.
     * Only project specific equivalents can be updated.
     * HACK: this must be checked in the backend!
     */
    async updateEquivalent(equivalent: Equivalent) {
      const updated = await dataprovider.updateEquivalents(equivalent);
      // get index of existing equivalent
      const index = this.equivalents.findIndex((e) => e.id === equivalent.id);
      // replace
      if (index > -1) {
        this.equivalents.splice(index, 1, updated);
      }
      // update dict
      this.equivalentDict[equivalent.id] = updated;
      return updated;
    },
    /**
     * Drop an equivalent from the cache and backend.
     * Only project specific equivalents can be dropped.
     * HACK: this must be checked in the backend!
     */
    async dropEquivalent(equivalent: Equivalent) {
      await dataprovider.deleteEquivalent(equivalent.id);
      // drop equivalent from local store
      this.equivalents = this.equivalents.filter((e) => e.id !== equivalent.id);
      delete this.equivalentDict[equivalent.id];
    },

    // *************************************************************
    // CRUD cache for "projects"
    // *************************************************************

    /**
     * ensure that a project is selected and that a project is existing.
     */
    async ensureProjectSelected() {
      // if a user has NO projects, he can not use the app
      // so we need to create one here
      if (this.projects.length === 0) {
        info(
          "Es wurde kein Projekt gefunden. Ein neues Projekt wird automatisch angelegt.",
        );
        await this.addProject({
          id: "new",
          name: "Mein erstes Projekt",
          targetDefined: false,
          targetYear: 0,
        });
        this.selectedProject = this.projects[0];
      } else {
        this.selectedProject = this.projects[0];
      }
    },

    /**
     * reload the cache for "projects" from backend.
     * this will only be done if the cache is empty. (use force = true to overwrite)
     * this will only list projects that belong to the current user.
     * HACK: this must be checked in the backend!
     */
    async refreshProjects(force = false) {
      if (force || this.projects.length === 0) {
        this.projects = await dataprovider.readProjects();
      }
    },
    /**
     * Add a new project to the cache and backend.
     * A user can only add projects that belong to him any can add users later.
     * HACK: this must be checked in the backend!
     */
    async addProject(project: ProjectEntry) {
      const entryToAdd: any = project;
      delete entryToAdd.id;
      const created = await dataprovider.createProject(project);
      this.projects.push(created);
      return created;
    },
    /**
     * Update a project in the cache and backend.
     * A user can only update projects that belong to him.
     * HACK: this must be checked in the backend!
     */
    async updateProject(project: ProjectEntry) {
      const updated = await dataprovider.updateProject(project);
      const index = this.projects.findIndex((p) => p.id === project.id);
      if (index > -1) {
        this.projects[index] = updated;
      }
      return updated;
    },
    /**
     * Drop a project from the cache and backend.
     * A user can only drop projects that belong to him.
     * HACK: this must be checked in the backend!
     */
    async dropProject(project: ProjectEntry) {
      await dataprovider.deleteProject(project.id);
      this.projects = this.projects.filter((p) => p.id !== project.id);
      this.ensureProjectSelected();
    },

    /**
     * Action to change the current project.
     * This will also reload the reports for the new project.
     * This will also reload the equivalents for the new project.
     * HACK: this must be checked in the backend!
     */
    async changeProject(project: ProjectEntry) {
      this.selectedProject = project;
      this.reports = await dataprovider.readReports();
      this.reports = this.reports.filter((report) =>
        report.project === project.id
      );
      this.equivalents = await dataprovider.readEquivalents();
      this.equivalents = this.equivalents.filter(
        (equivalent) => equivalent.project === project.id,
      );
    },

    /**
     * reload the cache for "sources" from backend.
     * this will only be done if the cache is empty. (use force = true to overwrite)
     * No CRUD is needed here since sources are system wide any only created by us.
     */
    async refreshSources(force = false) {
      if (this.sources.length === 0 || force) {
        this.sources = await dataprovider.readSources();
        this.sourcesDict = this.sources.reduce(
          (acc, cur) => ({ ...acc, [cur.id]: cur }),
          {},
        );
      }
    },

    /**
     * Fetch categories and construct the nested tree for the Scope1-3 ViewComponent.
     * HACK: This can be done in a service or in the backend.
     */
    async refreshCategories() {
      this.categories = await dataprovider.readCategories();
      this.presets = await dataprovider.readPresets();
    },

    // *************************************************************
    // CRUD cache for "reports"
    // *************************************************************

    /**
     * create an empty report object.
     */
    getNewReport(): ReportEntry {
      // check if a older report is existing
      if (this.reports.length > 0) {
        // get the latest report. so sort by year and get the last one
        const sorted = this.reports.sort((a, b) => a.year - b.year);
        const latest = sorted[sorted.length - 1];
        const report: ReportEntry = {
          ...latest,
          id: "new",
          year: latest.year + 1,
        };
        return report;
      }
      const report: ReportEntry = {
        id: "new",
        project: this.selectedProject?.id ?? "",
        year: new Date().getFullYear(),
        companyName: "",
        companyStreet: "",
        companyPostal: "",
        companyCity: "",
        companyCountry: "",
        contactName: "",
        contactTelephone: "",
        contactEmail: "",
        contactDomain: "",
        countEmployees: 0,
        businessTurnover: 0,
        baseYear: new Date().getFullYear(),
        baseEquivalentSource: null,
      };
      return report;
    },

    /**
     * reload the cache for "reports" from backend.
     * this will only be done if the cache is empty. (use force = true to overwrite)
     * All projects belong to ONE project.
     * HACK: this must be checked in the backend!
     */
    async refreshReports(force = false) {
      if (force || this.reports.length === 0) {
        this.reports = await dataprovider.readReports();
      }
    },

    /**
     * Load the report with the highest year.
     */
    loadLatestReport() {
      if (this.reports.length > 0) {
        this.selectedReport = this.reports.reduce((a, b) =>
          a.year > b.year ? a : b
        );
      } else {
        this.selectedReport = null;
      }
    },

    /**
     * Add a new report to the cache and backend.
     * A report belongs to the selected project.
     */
    async addReport(report: ReportEntry) {
      const entryToAdd: any = report;
      delete entryToAdd.id;
      const created = await dataprovider.createReport(entryToAdd);
      this.reports.push(created);
      this.selectedReport = created;
      return created;
    },

    /**
     * Drop a report from the cache and backend.
     * A user can only drop reports that belong to projects that belong to him.
     * HACK: this must be checked in the backend!
     */
    async dropReport(report: ReportEntry) {
      await dataprovider.deleteReport(report.id);
      this.reports = this.reports.filter((r) => r.id !== report.id);
    },

    /**
     * Update a report in the cache and backend.
     * A user can only update reports that belong to projects that belong to him.
     * HACK: this must be checked in the backend!
     */
    async updateReport(report: ReportEntry) {
      const updated = await dataprovider.updateReport(report);
      const index = this.reports.findIndex((r) => r.id === report.id);
      if (index > -1) {
        this.reports[index] = updated;
      }
      this.selectedReport = updated;
      return updated;
    },

    /**
     * Update the theme in the store.
     */
    changeTheme(theme: "light" | "dark") {
      this.theme = theme;
    },
  },
});
