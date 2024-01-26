import { defineStore } from 'pinia';
import { router } from './../router/index';
import {
  EquivalentEntry,
  FacilityEntry,
  ProjectEntry,
  ReportEntry,
  TargetEntry,
} from './../services/types';
import dataprovider from './../services/dataprovider';
import { info } from '../services/toast';

export interface GlobalState {
  isLoading: boolean;
  isLoggedIn: boolean;
  requestPending: boolean;
  // layout and theme
  theme: 'light' | 'dark';
  showTooltips: boolean;
  // user information
  username: string;
  isGlobalAdmin: boolean;
  // equivalents
  equivalents: EquivalentEntry[];
  equivalentDict: { [key: string]: EquivalentEntry };
  equivalentFilters: {
    category: {
      all: string[];
      scope1: string[];
      scope2: string[];
      scope3: string[];
    };
    unit: {
      all: string[];
    };
    source: {
      all: string[];
    };
  };
  //
  facilities: FacilityEntry[];
  facilitiesDict: { [id: string]: FacilityEntry };
  // projects
  projects: ProjectEntry[];
  selectedProject: null | ProjectEntry;
  targetsInProject: TargetEntry[];
  // reports
  reports: ReportEntry[];
  selectedReport: null | ReportEntry;
}

export const useGlobalStore = defineStore('global', {
  state: (): GlobalState => ({
    isLoading: true,
    isLoggedIn: false,
    requestPending: false,
    //
    username: '',
    isGlobalAdmin: false,
    theme: 'light' as 'light' | 'dark',
    showTooltips: false,
    //
    equivalents: [],
    equivalentDict: {},
    equivalentFilters: {
      category: {
        all: [],
        scope1: [],
        scope2: [],
        scope3: [],
      },
      unit: {
        all: [],
      },
      source: {
        all: [],
      },
    },
    //
    facilities: [],
    facilitiesDict: {},
    //
    projects: [],
    selectedProject: null,
    targetsInProject: [],
    //
    reports: [],
    selectedReport: null,
  }),

  actions: {
    //login actions
    async redirectToMain() {
      await router.push({ name: 'dashboard' });
    },
    async redirectToLogin() {
      await router.push({ name: 'login' });
    },

    /**
     * MAIN FUNCTION when App is loaded.
     */
    async initializeStore() {
      console.log('initializeStore');
      this.isLoading = true;
      // load all data from backend
      await Promise.all([this.refreshProjects()]);
      // select the first project
      // HACK: in the future the last selected project could be loaded from the local storage
      await this.ensureProjectSelected();
      // load equivalents and reports for the selected project
      await this.refreshProjectAndReport();

      this.isLoading = false;
    },

    async refreshProjectAndReport() {
      // load equivalents and reports for the selected project

      // first reset all
      this.targetsInProject = [];
      this.reports = [];
      this.equivalents = [];
      this.equivalentDict = {};
      // load all data for new project from backend
      await Promise.all([
        this.refreshEquivalents(true),
        this.refreshReports(true),
        this.refreshTargets(),
      ]);
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
        this.equivalents.sort((a: EquivalentEntry, b: EquivalentEntry) =>
          a.specification1.localeCompare(b.specification1),
        );
        // create dict
        this.equivalentDict = this.equivalents.reduce(
          (acc, cur) => ({ ...acc, [cur.id]: cur }),
          {},
        );

        // create a list of all unique entries for category
        this.equivalentFilters.category.all = [];
        this.equivalents.forEach((equivalent: EquivalentEntry) => {
          if (
            !this.equivalentFilters.category.all.includes(equivalent.category)
          ) {
            this.equivalentFilters.category.all.push(equivalent.category);
          }
        });
        // create a list of all unique entries for category grouped by scope 1,2,3
        this.equivalentFilters.category.scope1 = [];
        this.equivalentFilters.category.scope2 = [];
        this.equivalentFilters.category.scope3 = [];

        // create a list of all unique entries for unit
        this.equivalentFilters.unit.all = [];

        // create a list of all unique entries for source
        this.equivalentFilters.source.all = [];

        this.equivalents.forEach((equivalent: EquivalentEntry) => {
          if (
            equivalent.scope === 1 &&
            !this.equivalentFilters.category.scope1.includes(
              equivalent.category,
            )
          ) {
            this.equivalentFilters.category.scope1.push(equivalent.category);
          }
          if (
            equivalent.scope === 2 &&
            !this.equivalentFilters.category.scope2.includes(
              equivalent.category,
            )
          ) {
            this.equivalentFilters.category.scope2.push(equivalent.category);
          }
          if (
            equivalent.scope === 3 &&
            !this.equivalentFilters.category.scope3.includes(
              equivalent.category,
            )
          ) {
            this.equivalentFilters.category.scope3.push(equivalent.category);
          }

          if (!this.equivalentFilters.unit.all.includes(equivalent.in)) {
            this.equivalentFilters.unit.all.push(equivalent.in);
          }

          if (!this.equivalentFilters.source.all.includes(equivalent.source)) {
            this.equivalentFilters.source.all.push(equivalent.source);
          }
        });
      }
    },
    /**
     * Add a new equivalent to the cache and backend.
     * This euquvalent will always be a project specific equivalent!
     * HACK: this must be checked in the backend!
     */
    async addEquivalent(equivalent: EquivalentEntry) {
      const entryToAdd: any = equivalent;
      delete entryToAdd.id;
      const created = await dataprovider.createEquivalent(equivalent);
      // add equivalent to local store at position 0
      this.equivalents.push(created);
      // sort by "name"
      this.equivalents.sort((a: EquivalentEntry, b: EquivalentEntry) =>
        a.specification1.localeCompare(b.specification1),
      );
      this.equivalentDict[created.id] = created;
      return created;
    },
    /**
     * Update an equivalent in the cache and backend.
     * Only project specific equivalents can be updated.
     * HACK: this must be checked in the backend!
     */
    async updateEquivalent(equivalent: EquivalentEntry) {
      const updated = await dataprovider.updateEquivalents(equivalent);
      // get index of existing equivalent
      const index = this.equivalents.findIndex(
        (e: EquivalentEntry) => e.id === equivalent.id,
      );
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
    async dropEquivalent(equivalent: EquivalentEntry) {
      await dataprovider.deleteEquivalent(equivalent.id);
      // drop equivalent from local store
      this.equivalents = this.equivalents.filter(
        (e: EquivalentEntry) => e.id !== equivalent.id,
      );
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
          'Es wurde kein Projekt gefunden. Ein neues Projekt wird automatisch angelegt.',
        );
        await this.addProject({
          id: 'new',
          name: 'Mein erstes Projekt',
        });
        this.selectedProject = this.projects[0];
        this.targetsInProject = [];
      } else {
        // select the first project
        this.selectedProject = this.projects[0];
        // load targets for the selected project
        await this.refreshTargets();
      }
    },

    /**
     * reload the cache for "targets" from backend for selected project.
     */
    async refreshTargets() {
      this.targetsInProject = await dataprovider.readTargets();
      this.sortTargets();
    },

    /**
     * sort all targets by year in ascending order.
     */
    sortTargets() {
      this.targetsInProject.sort(
        (a: TargetEntry, b: TargetEntry) => a.year - b.year,
      );
    },

    /**
     * Add a new target to the cache and backend.
     */
    async addTarget(target: TargetEntry) {
      const entryToAdd: any = target;
      delete entryToAdd.id;
      // ensure the selected project is set
      target.project = this.selectedProject?.id ?? '';
      const created = await dataprovider.createTarget(target);
      this.targetsInProject.push(created);
      this.sortTargets();
      return created;
    },

    /**
     * Update a target in the cache and backend.
     */
    async updateTarget(target: TargetEntry) {
      const updated = await dataprovider.updateTarget(target);
      const index = this.targetsInProject.findIndex(
        (t: TargetEntry) => t.id === target.id,
      );
      if (index > -1) {
        this.targetsInProject[index] = updated;
      }
      this.sortTargets();
      return updated;
    },

    /**
     * Drop a target from the cache and backend.
     */
    async dropTarget(target: TargetEntry) {
      await dataprovider.deleteTarget(target.id);
      this.targetsInProject = this.targetsInProject.filter(
        (t: TargetEntry) => t.id !== target.id,
      );
      this.sortTargets();
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
      const index = this.projects.findIndex(
        (p: ProjectEntry) => p.id === project.id,
      );
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
      this.projects = this.projects.filter(
        (p: ProjectEntry) => p.id !== project.id,
      );
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
      this.reports = this.reports.filter(
        (report: ReportEntry) => report.project === project.id,
      );
      this.equivalents = await dataprovider.readEquivalents();
      this.equivalents = this.equivalents.filter(
        (equivalent: EquivalentEntry) => equivalent.project === project.id,
      );
      // reload also targets
      await this.refreshTargets();
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
        const sorted = this.reports.sort(
          (a: ReportEntry, b: ReportEntry) => a.year - b.year,
        );
        const latest = sorted[sorted.length - 1];
        const report: ReportEntry = {
          ...latest,
          id: 'new',
          year: latest.year + 1,
        };
        return report;
      }
      const report: ReportEntry = {
        id: 'new',
        project: this.selectedProject?.id ?? '',
        year: new Date().getFullYear(),
        companyName: '',
        companyStreet: '',
        companyPostal: '',
        companyCity: '',
        companyCountry: '',
        companyDomain: '',
        contactName: '',
        contactTelephone: '',
        contactEmail: '',
        contactDomain: '',
        countEmployees: 0,
        businessTurnover: 0,
        baseYear: new Date().getFullYear(),
        sumEmissions: 0,
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
        this.selectedReport = this.reports.reduce(
          (a: ReportEntry, b: ReportEntry) => (a.year > b.year ? a : b),
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
      this.reports = this.reports.filter(
        (r: ReportEntry) => r.id !== report.id,
      );
    },

    /**
     * Update a report in the cache and backend.
     * A user can only update reports that belong to projects that belong to him.
     * HACK: this must be checked in the backend!
     */
    async updateReport(report: ReportEntry) {
      const updated = await dataprovider.updateReport(report);
      const index = this.reports.findIndex(
        (r: ReportEntry) => r.id === report.id,
      );
      if (index > -1) {
        this.reports[index] = updated;
      }
      this.selectedReport = updated;
      return updated;
    },

    // READ cache for "facilities"
    async refreshFacilities() {
      if (this.facilities.length === 0) {
        this.facilities = await dataprovider.readFacilities();
        // create dict
        this.facilitiesDict = this.facilities.reduce(
          (acc, cur) => ({ ...acc, [cur.id]: cur }),
          {},
        );
      }
    },

    /**
     * Update the theme in the store.
     */
    changeTheme(theme: 'light' | 'dark') {
      this.theme = theme;
    },

    saveUserSettings() {
      // store user settings in local storage
      localStorage.setItem('psm_mode', this.theme);
    },
    getUserSettings() {
      // get user settings from local storage
      const mode = localStorage.getItem('psm_mode');
      if (mode && (mode === 'light' || mode === 'dark')) {
        this.theme = mode;
      }
    },
  },
});
