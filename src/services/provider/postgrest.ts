import { PostgrestClient } from '@supabase/postgrest-js';
import {
  ActionEntry,
  EquivalentEntry,
  FacilityEntry,
  InputEntry,
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

const REST_URL = 'http://localhost:5434';

const ensureDateFormat = (date: null | string | Date) => {
  if (date != null && date !== '') {
    return new Date(date);
  } else return null;
};

export default class DataProvider {
  private postgrest: PostgrestClient;

  constructor() {
    this.postgrest = new PostgrestClient(REST_URL);
  }

  initPostgrestClient() {
    this.postgrest = new PostgrestClient(REST_URL, {
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
    await fetch(`${REST_URL}/rpc/ensure_user`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.user.token}`,
      },
    });
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      if (!authStore.user.token || authStore.user.token === '') {
        throw new Error('No token found in store');
      }

      // set postgrest client with user token
      console.log('setting postgrest client with user token');

      const { data, error } = await this.postgrest
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password);
      if (error || data.length === 0) {
        throw error || new Error('Invalid username or password');
      }
      return this.checkLogin();
    } catch (err) {
      error(err + '');
      return false;
    }
  }

  async loginWithMicrosoft(): Promise<boolean> {
    // Implement OAuth2 login with Microsoft here
    return false;
  }

  async checkLogin(): Promise<boolean> {
    try {
      console.log('set PG client with user token');
      this.initPostgrestClient();

      await this.ensureUserIsExisting();

      const { data, error } = await this.postgrest
        .from('users')
        .select('*')
        .limit(1)
        .returns<UserEntry[]>();
      if (error || data.length === 0) {
        throw error || new Error('User not logged in');
      }
      globalStore.username = data[0].email;
      globalStore.isLoggedIn = true;
      globalStore.isGlobalAdmin = data[0].is_global_admin;
      globalStore.displayInTons = data[0].display_in_tons;
      globalStore.isLoading = false;
      return true;
    } catch (err) {
      console.log('error, checking login: ', err);
      globalStore.isLoggedIn = false;
      return false;
    }
  }

  async logout() {
    // Implement logout functionality here
  }

  async createProject(data: ProjectEntry): Promise<ProjectEntry> {
    const { error } = await this.postgrest
      .from('projects')
      .insert({ ...data, id: undefined });
    // then select the created project by sort by "created_at" and limit to 1
    const { data: created } = await this.postgrest
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error) throw error;
    return created as ProjectEntry;
  }

  async readProject(id: string): Promise<ProjectEntry> {
    const { data, error } = await this.postgrest
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as ProjectEntry;
  }

  async readProjects(): Promise<ProjectEntry[]> {
    const { data, error } = await this.postgrest.from('projects').select('*');
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
    const { data: created, error } = await this.postgrest
      .from('sites')
      .insert({ ...data, id: undefined })
      .select()
      .single();
    if (error) throw error;
    return created as SiteEntry;
  }

  async readSitesForProject(): Promise<SiteEntry[]> {
    if (!globalStore.selectedProject) throw new Error('No project selected');
    const { data, error } = await this.postgrest
      .from('sites')
      .select('*')
      .eq('project', globalStore.selectedProject.id);
    if (error) throw error;
    return data as SiteEntry[];
  }

  async readSite(id: string): Promise<SiteEntry> {
    const { data, error } = await this.postgrest
      .from('sites')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as SiteEntry;
  }

  async updateSite(data: SiteEntry): Promise<SiteEntry> {
    if (!data.id) throw new Error('Site ID is missing');
    const { data: updated, error } = await this.postgrest
      .from('sites')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return updated as SiteEntry;
  }

  async deleteSite(id: string) {
    const { error } = await this.postgrest.from('sites').delete().eq('id', id);
    if (error) throw error;
  }

  async createReport(data: ReportEntry): Promise<ReportEntry> {
    const { data: created, error } = await this.postgrest
      .from('reports')
      .insert({ ...data, id: undefined })
      .select()
      .single();
    if (error) throw error;
    return created as ReportEntry;
  }

  async readReport(id: string): Promise<ReportEntry> {
    const { data, error } = await this.postgrest
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as ReportEntry;
  }

  async readReports(siteId?: string): Promise<ReportEntry[]> {
    if (!globalStore.selectedSite && !siteId)
      throw new Error('No site selected');
    const { data, error } = await this.postgrest
      .from('reports')
      .select('*')
      .eq('site', siteId ?? globalStore.selectedSite?.id);
    if (error) throw error;
    return data as ReportEntry[];
  }

  async updateReport(data: ReportEntry): Promise<ReportEntry> {
    if (!data.id) throw new Error('Report ID is missing');
    const { data: updated, error } = await this.postgrest
      .from('reports')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return updated as ReportEntry;
  }

  async deleteReport(id: string) {
    const { data, error } = await this.postgrest
      .from('reports')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  }

  async getUser(): Promise<UserEntry> {
    const { data, error } = await this.postgrest
      .from('users')
      .select('*')
      .limit(1)
      .single();
    if (error) throw error;
    return data;
  }

  async updateUser(data: UserEntry): Promise<UserEntry> {
    const { data: updated, error } = await this.postgrest
      .from('users')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return updated as UserEntry;
  }

  async readEquivalents(): Promise<EquivalentEntry[]> {
    const { data, error } = await this.postgrest
      .from('equivalents')
      .select('*')
      .or(`project.eq.${globalStore.selectedProject?.id},project.is.null`);
    // .or('id.eq.2,name.eq.Algeria')
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
    const { data: created, error } = await this.postgrest
      .from('equivalents')
      .insert({ ...data, id: undefined })
      .select()
      .single();
    if (error) throw error;
    return created as EquivalentEntry;
  }

  async updateEquivalents(data: EquivalentEntry): Promise<EquivalentEntry> {
    const { data: updated, error } = await this.postgrest
      .from('equivalents')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return updated as EquivalentEntry;
  }

  async deleteEquivalent(id: string) {
    const { data, error } = await this.postgrest
      .from('equivalents')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  }

  async createUserInput(data: InputEntry): Promise<InputEntry> {
    data.sum_value = getSumForInput(data, globalStore.equivalentDict);
    const { data: created, error } = await this.postgrest
      .from('inputs')
      .insert({ ...data, id: undefined })
      .select()
      .single();
    if (error) throw error;
    return created as InputEntry;
  }

  async readUserInput(id: string): Promise<InputEntry> {
    const { data, error } = await this.postgrest
      .from('inputs')
      .select('*')
      .eq('id', id)
      .single();
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
    const { data, error } = await this.postgrest.from('inputs').select('*');
    //.filter(filter)
    if (error) throw error;
    return data as InputEntry[];
  }

  async readUserInputsForProject(
    projectId: string,
    years?: number[],
  ): Promise<InputEntry[]> {
    let filter = `report.site.project.id.eq.${projectId}`;
    if (years) {
      filter += ` && (${years.map((y) => `report.year.eq.${y}`).join(' || ')})`;
    }
    const { data, error } = await this.postgrest
      .from('inputs')
      .select('*,report (*)');

    //.filter(filter)
    if (error) throw error;
    return data as any;
  }

  async updateUserInput(data: InputEntry): Promise<InputEntry> {
    data.sum_value = getSumForInput(data, globalStore.equivalentDict);
    const { data: updated, error } = await this.postgrest
      .from('inputs')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return updated as InputEntry;
  }

  async deleteUserInput(id: string) {
    const { data, error } = await this.postgrest
      .from('inputs')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  }

  async deleteAllUserInputsForReport(reportId: string) {
    const { data, error } = await this.postgrest
      .from('inputs')
      .delete()
      .eq('report', reportId);
    if (error) throw error;
    return data;
  }

  async createAction(data: ActionEntry): Promise<ActionEntry> {
    const { data: created, error } = await this.postgrest
      .from('actions')
      .insert({ ...data, id: undefined })
      .select()
      .single();
    if (error) throw error;
    return created as ActionEntry;
  }

  async readAction(id: string): Promise<ActionEntry> {
    const { data, error } = await this.postgrest
      .from('actions')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as ActionEntry;
  }

  async readActions(): Promise<ActionEntry[]> {
    if (!globalStore.selectedSite) throw new Error('No site selected');
    const { data, error } = await this.postgrest
      .from('actions')
      .select('*')
      .eq('site', globalStore.selectedSite.id);
    if (error) throw error;
    data.forEach((action: ActionEntry) => {
      action.finished_until_is = ensureDateFormat(action.finished_until_is);
      action.finished_until_planned = ensureDateFormat(
        action.finished_until_planned,
      );
    });
    return data as ActionEntry[];
  }

  async updateAction(data: ActionEntry): Promise<ActionEntry> {
    const { data: updated, error } = await this.postgrest
      .from('actions')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return updated as ActionEntry;
  }

  async deleteAction(id: string) {
    const { error } = await this.postgrest
      .from('actions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async createTarget(data: TargetEntry): Promise<TargetEntry> {
    const { data: created, error } = await this.postgrest
      .from('targets')
      .insert({ ...data, id: undefined })
      .select()
      .single();
    if (error) throw error;
    return created as TargetEntry;
  }

  async readTarget(id: string): Promise<TargetEntry> {
    const { data, error } = await this.postgrest
      .from('targets')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as TargetEntry;
  }

  async readTargets(reportId?: string): Promise<TargetEntry[]> {
    if (!globalStore.selectedReport) throw new Error('No report selected');
    const { data, error } = await this.postgrest
      .from('targets')
      .select('*')
      .eq('report', reportId ?? globalStore.selectedReport.id);
    if (error) throw error;
    return data as TargetEntry[];
  }

  async updateTarget(data: TargetEntry): Promise<TargetEntry> {
    const { data: updated, error } = await this.postgrest
      .from('targets')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return updated as TargetEntry;
  }

  async deleteTarget(id: string) {
    const { error } = await this.postgrest
      .from('targets')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async createFacility(data: FacilityEntry): Promise<FacilityEntry> {
    const { data: created, error } = await this.postgrest
      .from('facilities')
      .insert({ ...data, id: undefined })
      .select()
      .single();
    if (error) throw error;
    return created as FacilityEntry;
  }

  async readFacility(id: string): Promise<FacilityEntry> {
    const { data, error } = await this.postgrest
      .from('facilities')
      .select('*')
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as FacilityEntry;
  }

  async readFacilities(): Promise<FacilityEntry[]> {
    if (!globalStore.selectedSite) throw new Error('No site selected');
    const { data, error } = await this.postgrest
      .from('facilities')
      .select('*')
      .eq('site', globalStore.selectedSite.id);
    if (error) throw error;
    data.forEach((facility: FacilityEntry) => {
      if (facility.shutdown_date && facility.shutdown_date !== '') {
        facility.shutdown_date = new Date(facility.shutdown_date);
      }
    });
    return data as FacilityEntry[];
  }

  async updateFacility(data: FacilityEntry): Promise<FacilityEntry> {
    const { data: updated, error } = await this.postgrest
      .from('facilities')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return updated as FacilityEntry;
  }

  async deleteFacility(id: string) {
    const { data, error } = await this.postgrest
      .from('facilities')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  }

  async createCsrdTopic(data: UsersTopicAnswer): Promise<UsersTopicAnswer> {
    const { data: created, error } = await this.postgrest
      .from('csrdtopics')
      .insert({ ...data, id: undefined })
      .select()
      .single();
    if (error) throw error;
    return created as UsersTopicAnswer;
  }

  async readCsrdTopics() {
    const { data, error } = await this.postgrest
      .from('csrdtopics')
      .select('*')
      .eq('report', globalStore.selectedReport?.id);
    if (error) throw error;
    return data;
  }

  async updateCsrdTopic(data: UsersTopicAnswer) {
    const { data: updated, error } = await this.postgrest
      .from('csrdtopics')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  }

  async deleteCsrdTopic(id: string) {
    const { data, error } = await this.postgrest
      .from('csrdtopics')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  }

  async uploadImage(_file: File) {
    // Implement image upload using Supabase storage or other suitable method
    return { id: '', url: '' };
  }

  async updateImage(_id: string, _file: File) {
    // Implement image update using Supabase storage or other suitable method
    return '';
  }

  async getImageUrl(_id: string) {
    // Implement getting image URL using Supabase storage or other suitable method
    return '';
  }

  async deleteImage(_id: string) {
    // Implement image deletion using Supabase storage or other suitable method
  }
}
