import PocketBase from 'pocketbase';
import {
  ActionEntry,
  EquivalentEntry,
  FacilityEntry,
  InputEntry,
  ProjectEntry,
  ReportEntry,
  TargetEntry,
  UserEntry,
  UserInputQuery,
} from '../types';
import { error } from '../toast';
import { globalStore } from '../../main';
import { getSumForInput } from '../reporting';

export default class DataProvider {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
    this.pb.autoCancellation(false);
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      await this.pb.collection('users').authWithPassword(username, password);
      return this.checkLogin();
    } catch (err) {
      error(err + '');
      return false;
    }
  }

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

  async logout() {
    await this.pb.authStore.clear();
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
    return items;
  }

  async readEquivalentsAsDict() {
    const res = await this.pb
      .collection('equivalents')
      .getList<EquivalentEntry>(1, 500, {
        // filter: `report = ${globalStore.selectedReport?.year}`,
      });
    const dict: { [key: string]: EquivalentEntry } = {};
    res.items.forEach((item) => {
      dict[item.id] = item;
    });
    return dict;
  }

  async createEquivalent(data: EquivalentEntry) {
    return await this.pb
      .collection('equivalents')
      .create<EquivalentEntry>(data);
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
    return await this.pb.collection('inputs').create<InputEntry>(data);
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

  async updateUserInput(data: InputEntry) {
    // calculate sum
    data.sumValue = getSumForInput(data, globalStore.equivalentDict);
    if (data.id == null) throw new Error('id is null');
    return await this.pb.collection('inputs').update<InputEntry>(data.id, data);
  }

  async deleteUserInput(id: string) {
    return await this.pb.collection('inputs').delete(id);
  }

  // CRUD for "reports"
  async createReport(data: ReportEntry) {
    return await this.pb.collection('reports').create<ReportEntry>(data);
  }

  async readReport(id: string) {
    return await this.pb.collection('reports').getOne<ReportEntry>(id);
  }

  async readReports() {
    const res = await this.pb
      .collection('reports')
      .getList<ReportEntry>(1, 500, {
        filter: `project="${globalStore.selectedProject?.id}"`,
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

  // CRUD for "projects"
  async createProject(data: ProjectEntry) {
    return await this.pb.collection('projects').create<ProjectEntry>(data);
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
    if (!data.id) throw new Error('Project ID is missing');
    return await this.pb
      .collection('projects')
      .update<ProjectEntry>(data.id, data);
  }

  async deleteProject(id: string) {
    return await this.pb.collection('projects').delete(id);
  }

  // CRUD for "actions"
  // CRUD for "actions"
  async createAction(data: ActionEntry) {
    return await this.pb.collection('actions').create<ActionEntry>(data);
  }

  async readAction(id: string) {
    return await this.pb.collection('actions').getOne<ActionEntry>(id);
  }

  async readActions() {
    const res = await this.pb
      .collection('actions')
      .getList<ActionEntry>(1, 500, {
        filter: `project="${globalStore.selectedProject?.id}"`,
      });
    // ensure that the date is ISO8601 for each action finishedUntil entry
    res.items.forEach((action: ActionEntry) => {
      if (action.finishedUntil && action.finishedUntil !== '') {
        action.finishedUntil = new Date(action.finishedUntil);
      }
    });
    return res.items;
  }

  async updateAction(data: ActionEntry) {
    if (!data.id) throw new Error('Action ID is missing');
    return await this.pb
      .collection('actions')
      .update<ActionEntry>(data.id, data);
  }

  async deleteAction(id: string) {
    return await this.pb.collection('actions').delete(id);
  }

  // CRUD for "targets"
  async createTarget(data: TargetEntry) {
    return await this.pb.collection('targets').create<TargetEntry>(data);
  }

  async readTarget(id: string) {
    return await this.pb.collection('targets').getOne<TargetEntry>(id);
  }

  async readTargets() {
    const res = await this.pb
      .collection('targets')
      .getList<TargetEntry>(1, 500, {
        filter: `project="${globalStore.selectedProject?.id}"`,
      });
    return res.items;
  }

  async updateTarget(data: TargetEntry) {
    if (!data.id) throw new Error('Target ID is missing');
    return await this.pb
      .collection('targets')
      .update<TargetEntry>(data.id, data);
  }

  async deleteTarget(id: string) {
    return await this.pb.collection('targets').delete(id);
  }

  // CRUD for "facilities"
  async createFacility(data: FacilityEntry) {
    return await this.pb.collection('facilities').create<FacilityEntry>(data);
  }

  async readFacility(id: string) {
    return await this.pb.collection('facilities').getOne<FacilityEntry>(id);
  }

  async readFacilities() {
    const res = await this.pb
      .collection('facilities')
      .getList<FacilityEntry>(1, 500, {
        filter: `project="${globalStore.selectedProject?.id}"`,
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
    if (!data.id) throw new Error('Facility ID is missing');
    return await this.pb
      .collection('facilities')
      .update<FacilityEntry>(data.id, data);
  }

  async deleteFacility(id: string) {
    return await this.pb.collection('facilities').delete(id);
  }

  async getUser(): Promise<UserEntry> {
    const res: any = await this.pb.collection('users').getList(1, 1);
    return res.items[0];
  }

  async saveUser(data: UserEntry) {
    return await this.pb.collection('users').update(data.id, data);
  }
}
