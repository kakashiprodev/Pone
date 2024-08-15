import { PostgrestClient } from '@supabase/postgrest-js';
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
import { error } from '../ui/toast';
import { globalStore, authStore } from '../../main';
import { getSumForInput } from '../reporting';
import { UsersTopicAnswer } from '../csrd-esrs/topics';

const REST_URL = import.meta.env.VITE_POSTGREST_URL as string;
const USE_PROXY_SERVER = import.meta.env.VITE_USE_PROXY_SERVER || 'false';
if (!REST_URL) {
  throw new Error('REST URL not found');
}

const REST_URL_COLLECTIONS = 'http://localhost:3005/v1/db/collections';

const get = async (url: string) => {
  try {
    const response = await fetch(REST_URL_COLLECTIONS + url, {
      headers: {
        Authorization: `Bearer ${authStore.user.token}`,
      },
    });
    const json = await response.json();
    return { data: json, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
const post = async (url: string, body: any) => {
  try {
    const response = await fetch(REST_URL_COLLECTIONS + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.user.token}`,
      },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    return { data: json, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
const put = async (url: string, body: any) => {
  try {
    const response = await fetch(REST_URL_COLLECTIONS + url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.user.token}`,
      },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    return { data: json, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

const del = async (url: string) => {
  try {
    const response = await fetch(REST_URL_COLLECTIONS + url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.user.token}`,
      },
    });
    const json = await response.json();
    return { data: json, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

const API_URL =
  USE_PROXY_SERVER === 'true' ? REST_URL + '/v1/db/postgrest' : REST_URL;

export default class DataProvider {
  private postgrest: PostgrestClient;

  constructor() {
    this.postgrest = new PostgrestClient(API_URL, {
      fetch: (url: any, options: any = {}) => {
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${authStore.user.token}`,
          },
        });
      },
    });
  }

  initPostgrestClient() {
    this.postgrest = new PostgrestClient(API_URL, {
      fetch: (url: any, options: any = {}) => {
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${authStore.user.token}`,
          },
        });
      },
    });
  }

  async ensureUserIsExisting() {
    await fetch(`${API_URL}/rpc/ensure_user`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.user.token}`,
      },
    }).catch((err) => {
      console.log('error, ensureUserIsExisting: ', err);
      return false;
    });
  }

  // async login(username: string, password: string): Promise<boolean> {
  //   try {
  //     if (!authStore.user.token || authStore.user.token === '') {
  //       throw new Error('No token found in store');
  //     }
  //     // set postgrest client with user token
  //     const { data, error } = await get('/users');
  //     if (error || data.length === 0) {
  //       throw error || new Error('Invalid username or password');
  //     }
  //     return this.checkLogin();
  //   } catch (err) {
  //     error(err + '');
  //     return false;
  //   }
  // }

  // async checkLogin(): Promise<boolean> {
  //   try {
  //     this.initPostgrestClient();

  //     console.log('ensureUserIsExisting');
  //     await this.ensureUserIsExisting();

  //     const { data, error } = await get('/users');
  //     if (error || data.length === 0) {
  //       throw error || new Error('User not logged in');
  //     }
  //     globalStore.username = data[0].email;
  //     globalStore.isLoggedIn = true;
  //     globalStore.isGlobalAdmin = data[0].isGlobalAdmin;
  //     globalStore.displayInTons = data[0].displayInTons;
  //     return true;
  //   } catch (err) {
  //     console.log('error, checking login: ', err);
  //     globalStore.isLoggedIn = false;
  //     return false;
  //   }
  // }

  async createProject(data: ProjectEntry): Promise<ProjectEntry> {
    const { error } = await this.postgrest
      .from('projects')
      .insert({ ...data, id: undefined });
    // then select the created project by sort by "createdAt" and limit to 1
    const { data: created } = await this.postgrest
      .from('projects')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();
    if (error) throw error;
    return created as ProjectEntry;
  }

  async readProject(id: string): Promise<ProjectEntry> {
    const { data, error } = await get(`/projects?id[eq]=${id}`);
    if (error) throw error;
    return data as ProjectEntry;
  }

  async readProjects(): Promise<ProjectEntry[]> {
    const { data, error } = await get(`/projects`);
    if (error) throw error;
    return data as ProjectEntry[];
  }

  async updateProject(data: ProjectEntry): Promise<ProjectEntry> {
    const { data: updated, error } = await this.postgrest
      .from('projects')
      .update(data)
      .eq('id', data.id)
      .single();
    if (error) throw error;
    return updated as ProjectEntry;
  }

  async deleteProject(id: string) {
    const { data, error } = await this.postgrest
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  }

  async createSite(data: SiteEntry): Promise<SiteEntry> {
    const { data: created, error } = await post('/sites', data);
    if (error) throw error;
    return created as SiteEntry;
  }

  async readSitesForProject(): Promise<SiteEntry[]> {
    if (!globalStore.selectedProject) throw new Error('No project selected');
    const { data, error } = await get(
      `/sites?project[eq]=${globalStore.selectedProject.id}`,
    );
    if (error) throw error;
    return data as SiteEntry[];
  }

  async readSite(id: string): Promise<SiteEntry> {
    const { data, error } = await get(`/sites?id[eq]=${id}&single=true`);
    if (error) throw error;
    return data as SiteEntry;
  }

  async updateSite(data: SiteEntry): Promise<SiteEntry> {
    if (!data.id) throw new Error('Site ID is missing');
    const { data: updated, error } = await put(`/sites/${data.id}`, data);
    if (error) throw error;
    return updated as SiteEntry;
  }

  async deleteSite(id: string) {
    const { error } = await del(`/sites/${id}`);
    if (error) throw error;
  }

  async createReport(data: ReportEntry): Promise<ReportEntry> {
    const { data: created, error } = await post('/reports', data);
    if (error) throw error;
    return created as ReportEntry;
  }

  async readReport(id: string): Promise<ReportEntry> {
    const { data, error } = await get(`/reports?id[eq]=${id}&single=true`);
    if (error) throw error;
    return data as ReportEntry;
  }

  async readReports(siteId?: string): Promise<ReportEntry[]> {
    if (!globalStore.selectedSite && !siteId)
      throw new Error('No site selected in (readReports)');
    const { data, error } = await get(
      `/reports?site[eq]=${siteId ?? globalStore.selectedSite?.id}`,
    );
    if (error) throw error;
    return data as ReportEntry[];
  }

  async updateReport(data: ReportEntry): Promise<ReportEntry> {
    if (!data.id) throw new Error('Report ID is missing');
    const { data: updated, error } = await put(`/reports/${data.id}`, data);
    if (error) throw error;
    return updated as ReportEntry;
  }

  async deleteReport(id: string) {
    const { data, error } = await del(`/reports/${id}`);
    if (error) throw error;
    return data;
  }

  async getUser(): Promise<UserEntry> {
    const { data, error } = await get(
      '/users?id[eq]=auth0|666abe8a45413f914aa675c2&single=true',
    );
    if (error) throw error;
    return data;
  }

  async updateUser(data: UserEntry): Promise<UserEntry> {
    const { data: updated, error } = await put(`/users/${data.id}`, data);
    if (error) throw error;
    return updated as UserEntry;
  }

  async readEquivalents(): Promise<EquivalentEntry[]> {
    const { data, error } = await get(
      `/equivalents?project[or]=${globalStore.selectedProject?.id},null`,
    );
    if (error) throw error;
    return data as EquivalentEntry[];
  }

  async readEquivalentsAsDict(): Promise<{ [key: string]: EquivalentEntry }> {
    const equivalents = await this.readEquivalents();
    const dict: { [key: string]: EquivalentEntry } = {};
    equivalents.forEach((item) => {
      dict[item.id] = item;
    });
    return dict as { [key: string]: EquivalentEntry };
  }

  async createEquivalent(data: EquivalentEntry): Promise<EquivalentEntry> {
    const { data: created, error } = await post('/equivalents', data);
    if (error) throw error;
    return created as EquivalentEntry;
  }

  async updateEquivalents(data: EquivalentEntry): Promise<EquivalentEntry> {
    const { data: updated, error } = await put(`/equivalents/${data.id}`, data);
    if (error) throw error;
    return updated as EquivalentEntry;
  }

  async deleteEquivalent(id: string) {
    const { data, error } = await del(`/equivalents/${id}`);
    if (error) throw error;
    return data;
  }

  async createUserInput(data: InputEntry): Promise<InputEntry> {
    data.sumValue = getSumForInput(data, globalStore.equivalentDict);
    const { data: created, error } = await post('/inputs', data);
    if (error) throw error;
    return created as InputEntry;
  }

  async readUserInput(id: string): Promise<InputEntry> {
    const { data, error } = await get(`/inputs?id[eq]=${id}&single=true`);
    if (error) throw error;
    return data as InputEntry;
  }

  async readUserInputs(_query?: UserInputQuery): Promise<InputEntry[]> {
    // const filter = `report.eq.${globalStore.selectedReport?.id}${
    //   query?.scope
    //     ? ' && (' + query.scope.map((s) => `scope.eq.${s}`).join(' || ') + ')'
    //     : ''
    // }${
    //   query?.category
    //     ? ' && (' +
    //       query.category.map((c) => `category.eq.${c}`).join(' || ') +
    //       ')'
    //     : ''
    // }${
    //   query?.facility
    //     ? ' && (' +
    //       query.facility.map((f) => `facility.eq.${f}`).join(' || ') +
    //       ')'
    //     : ''
    // }`;
    // HACK
    const { data, error } = await get('/inputs');
    //.filter(filter)
    if (error) throw error;
    return data as InputEntry[];
  }

  async readUserInputsForProject(
    projectId: string,
    years?: number[],
  ): Promise<InputEntry[]> {
    // if (years) {
    //   const { data, error } = await this.postgrest
    //     .from('inputs')
    //     .select(
    //       '*,report_expanded:report!inner(site_expanded:site!inner(project_expanded:project!inner(id)))',
    //     )
    //     .eq('report.site.project.id', projectId)
    //     .in('report.year', years);
    //   if (error) throw error;
    //   return data as InputEntry[];
    // } else {
    //   const { data, error } = await this.postgrest
    //     .from('inputs')
    //     .select(
    //       '*,report_expanded:report!inner(site_expanded:site!inner(project_expanded:project!inner(id)))',
    //     )
    //     .eq('report.site.project.id', projectId);
    //   if (error) throw error;
    //   return data as InputEntry[];
    // }
    return [];
  }

  async readUserInputsForProjectExtendFields(
    projectId: string,
  ): Promise<InputEntryWithExpandedReportAndSite[]> {
    // const { data, error } = await this.postgrest
    //   .from('inputs')
    //   .select('*,report!inner(*,site!inner(*,project!inner(id))),facility(*)')
    //   .eq('report.site.project.id', projectId);
    // if (error) throw error;
    // return data as InputEntryWithExpandedReportAndSite[];
    return [];
  }

  async updateUserInput(data: InputEntry): Promise<InputEntry> {
    data.sumValue = getSumForInput(data, globalStore.equivalentDict);
    const { data: updated, error } = await put(`/inputs/${data.id}`, data);
    if (error) throw error;
    return updated as InputEntry;
  }

  async deleteUserInput(id: string) {
    const { data, error } = await del(`/inputs/${id}`);
    if (error) throw error;
    return data;
  }

  async deleteAllUserInputsForReport(reportId: string) {
    const { data, error } = await del(`/inputs?report[eq]=${reportId}`);
    if (error) throw error;
    return data;
  }

  async createAction(data: ActionEntry): Promise<ActionEntry> {
    const { data: created, error } = await post('/actions', data);
    if (error) throw error;
    return created as ActionEntry;
  }

  async readAction(id: string): Promise<ActionEntry> {
    const { data, error } = await get(`/actions?id[eq]=${id}&single=true`);
    if (error) throw error;
    return data as ActionEntry;
  }

  async readActions(getValuesInTons = false): Promise<ActionEntry[]> {
    if (!globalStore.selectedSite)
      throw new Error('No site selected in (readActions)');
    const { data, error } = await get(
      `/actions?site[eq]=${globalStore.selectedSite.id}`,
    );
    if (error) throw error;

    if (getValuesInTons) {
      data.forEach((action) => {
        action.targetValueAbsolutPlanned =
          action.targetValueAbsolutPlanned / 1000;
        action.targetValueAbsolutIs = action.targetValueAbsolutIs / 1000;
      });
    }
    return data as ActionEntry[];
  }

  async updateAction(data: ActionEntry): Promise<ActionEntry> {
    const { data: updated, error } = await put(`/actions/${data.id}`, data);
    if (error) throw error;
    return updated as ActionEntry;
  }

  async deleteAction(id: string) {
    const { error } = await del(`/actions/${id}`);
    if (error) throw error;
  }

  async createTarget(data: TargetEntry): Promise<TargetEntry> {
    const { data: created, error } = await post('/targets', data);
    if (error) throw error;
    return created as TargetEntry;
  }

  async readTarget(id: string): Promise<TargetEntry> {
    const { data, error } = await get(`/targets?id[eq]=${id}&single=true`);
    if (error) throw error;
    return data as TargetEntry;
  }

  async readTargets(reportId?: string): Promise<TargetEntry[]> {
    if (!globalStore.selectedReport) throw new Error('No report selected');
    const { data, error } = await get(
      `/targets?report[eq]=${reportId ?? globalStore.selectedReport.id}`,
    );
    if (error) throw error;
    return data as TargetEntry[];
  }

  async updateTarget(data: TargetEntry): Promise<TargetEntry> {
    const { data: updated, error } = await put(`/targets/${data.id}`, data);
    if (error) throw error;
    return updated as TargetEntry;
  }

  async deleteTarget(id: string) {
    const { error } = await del(`/targets/${id}`);
    if (error) throw error;
  }

  async createFacility(data: FacilityEntry): Promise<FacilityEntry> {
    const { data: created, error } = await post('/facilities', data);
    if (error) throw error;
    return created as FacilityEntry;
  }

  async readFacility(id: string): Promise<FacilityEntry> {
    const { data, error } = await get(`/facilities?id[eq]=${id}&single=true`);
    if (error) throw error;
    return data as FacilityEntry;
  }

  async readFacilities(): Promise<FacilityEntry[]> {
    if (!globalStore.selectedSite)
      throw new Error('No site selected in (readFacilities)');
    const { data, error } = await get(
      `/facilities?site[eq]=${globalStore.selectedSite.id}`,
    );
    if (error) throw error;
    data.forEach((facility: FacilityEntry) => {
      if (facility.shutdownDate && facility.shutdownDate !== '') {
        facility.shutdownDate = new Date(facility.shutdownDate);
      }
    });
    return data as FacilityEntry[];
  }

  async updateFacility(data: FacilityEntry): Promise<FacilityEntry> {
    const { data: updated, error } = await put(`/facilities/${data.id}`, data);
    if (error) throw error;
    return updated as FacilityEntry;
  }

  async deleteFacility(id: string) {
    const { data, error } = await del(`/facilities/${id}`);
    if (error) throw error;
    return data;
  }

  async createCsrdTopic(data: UsersTopicAnswer): Promise<UsersTopicAnswer> {
    const { data: created, error } = await post('/csrdtopics', data);
    if (error) throw error;
    return created as UsersTopicAnswer;
  }

  async readCsrdTopics() {
    const { data, error } = await get(
      `/csrdtopics?report=${globalStore.selectedReport?.id}`,
    );
    if (error) throw error;
    return data;
  }

  async updateCsrdTopic(data: UsersTopicAnswer) {
    const { data: updated, error } = await put(`/csrdtopics/${data.id}`, data);
    if (error) throw error;
    return updated;
  }

  async deleteCsrdTopic(id: string) {
    const { data, error } = await del(`/csrdtopics/${id}`);
    if (error) throw error;
    return data;
  }

  async uploadImage(file: File) {
    // HACK
    const r = await fetch(API_URL + '/rpc/upload_media_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        Authorization: `Bearer ${authStore.user.token}`,
        Accept: 'application/json',
      },
      body: file,
    });
    const j: { id: string } = await r.json();
    return j;
  }

  async deleteImage(id: string) {
    const { error } = await del(`/media/${id}`);
    if (error) throw error;
    return true;
  }

  getRestUrl() {
    return REST_URL_COLLECTIONS;
  }
}
