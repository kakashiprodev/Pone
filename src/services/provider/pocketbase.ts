import PocketBase from 'pocketbase';
import {
  ActionEntry,
  EquivalentEntry,
  FacilityEntry,
  InputEntry,
  InputEntryWithExpandedReportAndSite,
  ProjectEntry,
  ReportEntry,
  SiteEntry,
  TargetEntry,
  UserEntry,
  UserInputQuery,
} from '../types';
import { error } from '../toast';
import { globalStore } from '../../main';
import { getSumForInput } from '../reporting';

/**
 *
 * ACHTUNG. Bisher werden bei einigen READ Funktionen nur die ersten 500 Einträge zurückgegeben!!!
 * Das müsste noch angepasst werden, wenn mehr als 500 Einträge erwartet werden.
 *
 * Außerdem muss das Backend selbst noch so angepasst werden, dass ein user nur das tun kann, was er auch darf!
 * D.h. die Row-Level-Security muss noch implementiert werden.
 *
 */

let equivalentCache: EquivalentEntry[] = [];

const ensureDateFormat = (date: null | string | Date) => {
  if (date != null && date !== '') {
    return new Date(date);
  } else return null;
};

export default class DataProvider {
  private pb: PocketBase;

  /**
   * Create a new DataProvider instance
   */
  constructor() {
    this.pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
    this.pb.autoCancellation(false);
  }

  /**
   * Plain Login
   */
  async login(username: string, password: string): Promise<boolean> {
    try {
      await this.pb.collection('users').authWithPassword(username, password);
      return this.checkLogin();
    } catch (err) {
      error(err + '');
      return false;
    }
  }

  /**
   * check if a user is already logged in
   * this is done by a cookie/token which is stored in the browser (or not)
   */
  async checkLogin(): Promise<boolean> {
    console.log('checking login');
    try {
      // console.log("token: ", this.pb.authStore.token);
      const res = await this.pb.collection('users').getList(1, 1);
      if (res.items.length < 1) return false;
      // set globalStore username and company
      globalStore.username = res.items[0].username;
      globalStore.isLoggedIn = true;
      globalStore.isGlobalAdmin = res.items[0].isGlobalAdmin;
      globalStore.displayInTons = res.items[0].displayInTons;
      return true;
    } catch (error) {
      console.log('error: ', error);
      globalStore.isLoggedIn = false;
      return false;
    }
  }

  /**
   * Logout
   */
  async logout() {
    this.pb.authStore.clear();
  }

  // CRUD for "projects"
  async createProject(data: ProjectEntry) {
    return await this.pb.collection('projects').create<ProjectEntry>({
      ...data,
      id: undefined,
    });
  }

  async readProject(id: string) {
    return await this.pb.collection('projects').getOne<ProjectEntry>(id);
  }

  async readProjects() {
    const res = await this.pb
      .collection('projects')
      .getList<ProjectEntry>(1, 500);
    return res.items;
  }

  async updateProject(data: ProjectEntry) {
    return await this.pb
      .collection('projects')
      .update<ProjectEntry>(data.id, data);
  }

  async deleteProject(id: string) {
    return await this.pb.collection('projects').delete(id);
  }

  // CRUD for "sites"
  async createSite(data: SiteEntry) {
    return await this.pb
      .collection('sites')
      .create<SiteEntry>({ ...data, id: undefined }); // ensure that id is not set
  }

  async readSitesForProject() {
    if (!globalStore.selectedProject) throw new Error('No project selected');
    const res = await this.pb.collection('sites').getList<SiteEntry>(1, 500, {
      filter: `project="${globalStore.selectedProject.id}"`,
    });
    return res.items;
  }

  async readSite(id: string) {
    return await this.pb.collection('sites').getOne<SiteEntry>(id);
  }

  async updateSite(data: SiteEntry) {
    if (!data.id) throw new Error('Site ID is missing');
    return await this.pb.collection('sites').update<SiteEntry>(data.id, data);
  }

  async deleteSite(id: string) {
    return await this.pb.collection('sites').delete(id);
  }

  // CRUD for "reports"
  async createReport(data: ReportEntry) {
    return await this.pb.collection('reports').create<ReportEntry>({
      ...data,
      id: undefined,
    });
  }

  async readReport(id: string) {
    return await this.pb.collection('reports').getOne<ReportEntry>(id);
  }

  async readReports(siteId?: string) {
    if (!globalStore.selectedSite && !siteId)
      throw new Error('No site selected');
    const res = await this.pb
      .collection('reports')
      .getList<ReportEntry>(1, 500, {
        filter: `site="${siteId ?? globalStore.selectedSite?.id}"`,
      });
    return res.items;
  }

  async updateReport(data: ReportEntry) {
    if (!data.id) throw new Error('Report ID is missing');
    return await this.pb
      .collection('reports')
      .update<ReportEntry>(data.id, data);
  }

  async deleteReport(id: string) {
    return await this.pb.collection('reports').delete(id);
  }

  // RU for "users"
  async getUser(): Promise<UserEntry> {
    const res = await this.pb.collection('users').getList<UserEntry>(1, 1);
    return res.items[0];
  }

  async updateUser(data: UserEntry) {
    return await this.pb.collection('users').update(data.id, data);
  }

  // CRUD for Equivalent
  async readEquivalents() {
    const items = [];
    const res = await this.pb
      .collection('equivalents')
      .getList<EquivalentEntry>(1, 500, {
        filter: `project="${globalStore.selectedProject?.id}" || project=""`,
      });
    items.push(...res.items);
    if (res.totalPages > 1) {
      for (let i = 2; i <= res.totalPages; i++) {
        const page = await this.pb
          .collection('equivalents')
          .getList<EquivalentEntry>(i, 500, {
            filter: `project="${globalStore.selectedProject?.id}" || project=""`,
          });
        items.push(...page.items);
      }
    }
    // HACK:
    equivalentCache = items;
    return items;
  }

  async readEquivalentsAsDict() {
    if (equivalentCache.length < 1) {
      equivalentCache = await this.readEquivalents();
    }
    const dict: { [key: string]: EquivalentEntry } = {};
    equivalentCache.forEach((item) => {
      dict[item.id] = item;
    });
    return dict;
  }

  async createEquivalent(data: EquivalentEntry) {
    return await this.pb.collection('equivalents').create<EquivalentEntry>({
      ...data,
      id: undefined,
    });
  }

  async updateEquivalents(data: EquivalentEntry) {
    return await this.pb
      .collection('equivalents')
      .update<EquivalentEntry>(data.id, data);
  }

  async deleteEquivalent(id: string) {
    return await this.pb.collection('equivalents').delete(id);
  }

  // CRUD for "inputs"
  async createUserInput(data: InputEntry) {
    // calculate sum
    data.sumValue = getSumForInput(data, globalStore.equivalentDict);
    return await this.pb.collection('inputs').create<InputEntry>({
      ...data,
      id: undefined,
    });
  }

  async readUserInput(id: string) {
    return await this.pb.collection('inputs').getOne<InputEntry>(id);
  }

  async readUserInputs(query?: UserInputQuery) {
    console.log('input query: ', query);
    const res = await this.pb.collection('inputs').getList<InputEntry>(1, 500, {
      filter: `report = '${globalStore.selectedReport?.id}'${
        query?.scope
          ? ' && (' + query.scope.map((s) => `scope="${s}"`).join(' || ') + ')'
          : ''
      }${
        query?.category
          ? ' && (' +
            query.category.map((c) => `category="${c}"`).join(' || ') +
            ')'
          : ''
      }${
        query?.facility
          ? ' && (' +
            query.facility.map((f) => `facility="${f}"`).join(' || ') +
            ')'
          : ''
      }`,
      // expand: "equivalent",
    });
    return res.items;
  }

  async readUserInputsForReport(projectId: string) {
    const res = await this.pb
      .collection('inputs')
      .getList<InputEntryWithExpandedReportAndSite>(1, 500, {
        filter: `report.site.project.id = '${projectId}'`,
        expand: 'report.site',
      });
    return res.items;
  }

  async updateUserInput(data: InputEntry) {
    // calculate sum
    data.sumValue = getSumForInput(data, globalStore.equivalentDict);
    return await this.pb.collection('inputs').update<InputEntry>(data.id, data);
  }

  async deleteUserInput(id: string) {
    return await this.pb.collection('inputs').delete(id);
  }

  async deleteAllUserInputsForReport(reportId: string) {
    const res = await this.pb.collection('inputs').getList<InputEntry>(1, 500, {
      filter: `report = '${reportId}'`,
    });
    for (const item of res.items) {
      await this.pb.collection('inputs').delete(item.id);
    }
  }

  // CRUD for "actions"
  async createAction(data: ActionEntry) {
    return await this.pb.collection('actions').create<ActionEntry>({
      ...data,
      id: undefined,
    });
  }

  async readAction(id: string) {
    return await this.pb.collection('actions').getOne<ActionEntry>(id);
  }

  async readActions() {
    if (!globalStore.selectedSite) throw new Error('No site selected');
    const res = await this.pb
      .collection('actions')
      .getList<ActionEntry>(1, 500, {
        filter: `site="${globalStore.selectedSite.id}"`,
      });
    // ensure that the date is ISO8601 for each action finishedUntil entry
    res.items.forEach((action: ActionEntry) => {
      action.finishedUntilIs = ensureDateFormat(action.finishedUntilIs);
      action.finishedUntilPlanned = ensureDateFormat(
        action.finishedUntilPlanned,
      );
    });
    return res.items;
  }

  async updateAction(data: ActionEntry) {
    return await this.pb
      .collection('actions')
      .update<ActionEntry>(data.id, data);
  }

  async deleteAction(id: string) {
    return await this.pb.collection('actions').delete(id);
  }

  // CRUD for "targets"
  async createTarget(data: TargetEntry) {
    return await this.pb.collection('targets').create<TargetEntry>({
      ...data,
      id: undefined,
    });
  }

  async readTarget(id: string) {
    return await this.pb.collection('targets').getOne<TargetEntry>(id);
  }

  async readTargets() {
    if (!globalStore.selectedReport) throw new Error('No report selected');
    const res = await this.pb
      .collection('targets')
      .getList<TargetEntry>(1, 500, {
        filter: `report="${globalStore.selectedReport.id}"`,
      });
    return res.items;
  }

  async updateTarget(data: TargetEntry) {
    return await this.pb
      .collection('targets')
      .update<TargetEntry>(data.id, data);
  }

  async deleteTarget(id: string) {
    return await this.pb.collection('targets').delete(id);
  }

  // CRUD for "facilities"
  async createFacility(data: FacilityEntry) {
    return await this.pb.collection('facilities').create<FacilityEntry>({
      ...data,
      id: undefined,
    });
  }

  async readFacility(id: string) {
    return await this.pb.collection('facilities').getOne<FacilityEntry>(id);
  }

  async readFacilities() {
    if (!globalStore.selectedSite) throw new Error('No site selected');
    const res = await this.pb
      .collection('facilities')
      .getList<FacilityEntry>(1, 500, {
        filter: `site="${globalStore.selectedSite.id}"`,
      });
    // ensure that the date is ISO8601 for each facility shutdownDate entry
    res.items.forEach((facility: FacilityEntry) => {
      if (facility.shutdownDate && facility.shutdownDate !== '') {
        facility.shutdownDate = new Date(facility.shutdownDate);
      }
    });
    return res.items;
  }

  async updateFacility(data: FacilityEntry) {
    return await this.pb
      .collection('facilities')
      .update<FacilityEntry>(data.id, data);
  }

  async deleteFacility(id: string) {
    return await this.pb.collection('facilities').delete(id);
  }
}
