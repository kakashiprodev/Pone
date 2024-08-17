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
import { globalStore, authStore } from '../../main';
import { getSumForInput } from '../reporting';
import { UsersTopicAnswer } from '../csrd-esrs/topics';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005';

interface ApiRequest<T> {
  data: T | null;
  error: any | null;
}

const get = async <T>(url: string): Promise<ApiRequest<T>> => {
  try {
    const response = await fetch(URL_BACKEND + url, {
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
const post = async <T>(url: string, body: any): Promise<ApiRequest<T>> => {
  try {
    const response = await fetch(URL_BACKEND + url, {
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
const put = async <T>(url: string, body: any): Promise<ApiRequest<T>> => {
  try {
    const response = await fetch(URL_BACKEND + url, {
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
const del = async <T>(
  url: string,
  parseResult = false,
): Promise<ApiRequest<T>> => {
  try {
    const response = await fetch(URL_BACKEND + url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.user.token}`,
      },
    });
    if (parseResult) {
      const json = await response.json();
      return { data: json, error: null };
    } else {
      return { data: null, error: null };
    }
  } catch (err) {
    return { data: null, error: err };
  }
};

export default class DataProvider {
  async ensureUserIsExisting(): Promise<void> {
    await get('/v1/db/hooks/ensure-user');
  }

  async createProject(project: ProjectEntry): Promise<ProjectEntry> {
    const { data, error } = await post<ProjectEntry>(
      '/v1/db/hooks/create-project',
      project,
    );
    if (!data) throw error;
    return data;
  }

  async readProject(id: string): Promise<ProjectEntry> {
    const { data, error } = await get<ProjectEntry>(
      `/v1/db/collections/projects?id[eq]=${id}&single=true`,
    );
    if (!data) throw error;
    return data;
  }

  async readProjects(): Promise<ProjectEntry[]> {
    const { data, error } = await get<ProjectEntry[]>(
      `/v1/db/collections/projects`,
    );
    if (!data) throw error;
    return data;
  }

  async updateProject(project: ProjectEntry): Promise<ProjectEntry> {
    const { data, error } = await put<ProjectEntry>(
      `/v1/db/collections/projects/${project.id}`,
      project,
    );
    if (!data) throw error;
    return data;
  }

  async deleteProject(id: string): Promise<void> {
    const { data, error } = await del(`/v1/db/collections/projects/${id}`);
    if (!data) throw error;
    return;
  }

  async createSite(site: SiteEntry): Promise<SiteEntry> {
    const { data, error } = await post<SiteEntry>(
      '/v1/db/collections/sites',
      site,
    );
    if (!data) throw error;
    return data;
  }

  async readSitesForProject(): Promise<SiteEntry[]> {
    if (!globalStore.selectedProject) throw new Error('No project selected');
    const { data, error } = await get<SiteEntry[]>(
      `/v1/db/collections/sites?project[eq]=${globalStore.selectedProject.id}`,
    );
    if (!data) throw error;
    return data;
  }

  async readSite(id: string): Promise<SiteEntry> {
    const { data, error } = await get<SiteEntry>(
      `/v1/db/collections/sites?id[eq]=${id}&single=true`,
    );
    if (!data) throw error;
    return data;
  }

  async updateSite(site: SiteEntry): Promise<SiteEntry> {
    if (!site.id) throw new Error('Site ID is missing');
    const { data, error } = await put<SiteEntry>(`/sites/${site.id}`, site);
    if (!data) throw error;
    return data;
  }

  async deleteSite(id: string): Promise<void> {
    const { error } = await del(`/v1/db/collections/sites/${id}`);
    if (error) throw error;
  }

  async createReport(report: ReportEntry): Promise<ReportEntry> {
    const { data, error } = await post<ReportEntry>(
      '/v1/db/collections/reports',
      report,
    );
    if (!data) throw error;
    return data;
  }

  async readReport(id: string): Promise<ReportEntry> {
    const { data, error } = await get<ReportEntry>(
      `/v1/db/collections/reports?id[eq]=${id}&single=true`,
    );
    if (!data) throw error;
    return data;
  }

  async readReports(siteId?: string): Promise<ReportEntry[]> {
    if (!globalStore.selectedSite && !siteId)
      throw new Error('No site selected in (readReports)');
    const { data, error } = await get<ReportEntry[]>(
      `/v1/db/collections/reports?site[eq]=${
        siteId ?? globalStore.selectedSite?.id
      }`,
    );
    if (!data) throw error;
    return data;
  }

  async updateReport(report: ReportEntry): Promise<ReportEntry> {
    if (!report.id) throw new Error('Report ID is missing');
    const { data, error } = await put<ReportEntry>(
      `/v1/db/collections/reports/${report.id}`,
      report,
    );
    if (!data) throw error;
    return data;
  }

  async deleteReport(id: string): Promise<void> {
    const { error } = await del(`/v1/db/collections/reports/${id}`);
    if (error) throw error;
  }

  async getUser(): Promise<UserEntry> {
    const { data, error } = await get<UserEntry>('/v1/user/me');
    if (!data) throw error;
    return data;
  }

  async updateUser(user: UserEntry): Promise<UserEntry> {
    const { data, error } = await put<UserEntry>(`/v1/user/me`, user);
    if (!data) throw error;
    return data;
  }

  async readEquivalents(): Promise<EquivalentEntry[]> {
    const { data, error } = await get<EquivalentEntry[]>(
      `/v1/db/collections/equivalents?project[or]=${globalStore.selectedProject?.id},null`,
    );
    if (!data) throw error;
    return data;
  }

  async readEquivalentsAsDict(): Promise<{ [key: string]: EquivalentEntry }> {
    const equivalents = await this.readEquivalents();
    const dict: { [key: string]: EquivalentEntry } = {};
    equivalents.forEach((item) => {
      dict[item.id] = item;
    });
    return dict as { [key: string]: EquivalentEntry };
  }

  async createEquivalent(eq: EquivalentEntry): Promise<EquivalentEntry> {
    const { data, error } = await post<EquivalentEntry>(
      '/v1/db/collections/equivalents',
      eq,
    );
    if (!data) throw error;
    return data;
  }

  async updateEquivalents(eq: EquivalentEntry): Promise<EquivalentEntry> {
    const { data, error } = await put<EquivalentEntry>(
      `/v1/db/collections/equivalents/${eq.id}`,
      eq,
    );
    if (!data) throw error;
    return data;
  }

  async deleteEquivalent(id: string): Promise<void> {
    const { error } = await del(`/v1/db/collections/equivalents/${id}`);
    if (error) throw error;
  }

  async createUserInput(input: InputEntry): Promise<InputEntry> {
    // HACK: this should be a preaction in the backend
    input.sumValue = getSumForInput(input, globalStore.equivalentDict);
    const { data, error } = await post<InputEntry>('/inputs', input);
    if (!data) throw error;
    return data;
  }

  async readUserInput(id: string): Promise<InputEntry> {
    const { data, error } = await get<InputEntry>(
      `/v1/db/collections/inputs?id[eq]=${id}&single=true`,
    );
    if (!data) throw error;
    return data;
  }

  async readUserInputs(_query?: UserInputQuery): Promise<InputEntry[]> {
    // HACK: unklar ob das nicht gefiltert werden muss
    const { data, error } = await get('/v1/db/collections/inputs');
    if (error) throw error;
    return data as InputEntry[];
  }

  async readUserInputsForProject(
    projectId: string,
    years?: number[],
  ): Promise<InputEntry[]> {
    const { data, error } = await get<InputEntry[]>(
      `/v1/db/inputs-for-project?project=${projectId}${
        years ? `&years=${years.join(',')}` : ''
      }`,
    );
    if (!data) throw error;
    return data;
  }

  async readUserInputsForProjectExtendFields(
    projectId: string,
  ): Promise<InputEntryWithExpandedReportAndSite[]> {
    const { data, error } = await get<InputEntryWithExpandedReportAndSite[]>(
      `/v1/db/inputs-for-project?project=${projectId}&extend=true`,
    );
    if (!data) throw error;
    return data;
  }

  async updateUserInput(input: InputEntry): Promise<InputEntry> {
    // HACK: this should be a preaction in the backend
    input.sumValue = getSumForInput(input, globalStore.equivalentDict);
    const { data, error } = await put<InputEntry>(
      `/v1/db/collections/inputs/${input.id}`,
      input,
    );
    if (!data) throw error;
    return data;
  }

  async deleteUserInput(id: string): Promise<void> {
    const { error } = await del(`/v1/db/collections/inputs/${id}`);
    if (error) throw error;
  }

  async deleteAllUserInputsForReport(reportId: string): Promise<void> {
    // get all inputs for report
    const { data: inputs, error: errorGet } = await get<InputEntry[]>(
      `/v1/db/collections/inputs?report[eq]=${reportId}`,
    );
    if (!inputs) throw errorGet;
    // delte in loop
    for (const input of inputs) {
      const { error } = await del(`/v1/db/collections/inputs/${input.id}`);
      if (error) throw error;
    }
  }

  async createAction(action: ActionEntry): Promise<ActionEntry> {
    const { data, error } = await post<ActionEntry>(
      '/v1/db/collections/actions',
      action,
    );
    if (!data) throw error;
    return data;
  }

  async readAction(id: string): Promise<ActionEntry> {
    const { data, error } = await get<ActionEntry>(
      `/v1/db/collections/actions?id[eq]=${id}&single=true`,
    );
    if (!data) throw error;
    return data;
  }

  async readActions(getValuesInTons = false): Promise<ActionEntry[]> {
    if (!globalStore.selectedSite)
      throw new Error('No site selected in (readActions)');
    const { data, error } = await get<ActionEntry[]>(
      `/v1/db/collections/actions?site[eq]=${globalStore.selectedSite.id}`,
    );
    if (!data) throw error;

    if (getValuesInTons) {
      data.forEach((action) => {
        action.targetValueAbsolutPlanned =
          action.targetValueAbsolutPlanned / 1000;
        action.targetValueAbsolutIs = action.targetValueAbsolutIs / 1000;
      });
    }
    return data;
  }

  async updateAction(data: ActionEntry): Promise<ActionEntry> {
    const { data: updated, error } = await put(
      `/v1/db/collections/actions/${data.id}`,
      data,
    );
    if (!data) throw error;
    return updated as ActionEntry;
  }

  async deleteAction(id: string): Promise<void> {
    const { error } = await del(`/v1/db/collections/actions/${id}`);
    if (error) throw error;
  }

  async createTarget(target: TargetEntry): Promise<TargetEntry> {
    const { data, error } = await post<TargetEntry>(
      '/v1/db/collections/targets',
      { ...target, id: undefined },
    );
    if (!data) throw error;
    return data;
  }

  async readTarget(id: string): Promise<TargetEntry> {
    const { data, error } = await get<TargetEntry>(
      `/v1/db/collections/targets?id[eq]=${id}&single=true`,
    );
    if (!data) throw error;
    return data;
  }

  async readTargets(reportId?: string): Promise<TargetEntry[]> {
    if (!globalStore.selectedReport) throw new Error('No report selected');
    const { data, error } = await get<TargetEntry[]>(
      `/v1/db/collections/targets?report[eq]=${
        reportId ?? globalStore.selectedReport.id
      }`,
    );
    if (!data) throw error;
    return data;
  }

  async updateTarget(target: TargetEntry): Promise<TargetEntry> {
    const { data, error } = await put<TargetEntry>(
      `/v1/db/collections/targets/${target.id}`,
      target,
    );
    if (!data) throw error;
    return data;
  }

  async deleteTarget(id: string): Promise<void> {
    const { error } = await del(`/v1/db/collections/targets/${id}`);
    if (error) throw error;
  }

  async createFacility(facility: FacilityEntry): Promise<FacilityEntry> {
    const { data, error } = await post<FacilityEntry>(
      '/v1/db/collections/facilities',
      facility,
    );
    if (!data) throw error;
    return data;
  }

  async readFacility(id: string): Promise<FacilityEntry> {
    const { data, error } = await get<FacilityEntry>(
      `/v1/db/collections/facilities?id[eq]=${id}&single=true`,
    );
    if (!data) throw error;
    return data;
  }

  async readFacilities(): Promise<FacilityEntry[]> {
    if (!globalStore.selectedSite)
      throw new Error('No site selected in (readFacilities)');
    const { data, error } = await get<FacilityEntry[]>(
      `/v1/db/collections/facilities?site[eq]=${globalStore.selectedSite.id}`,
    );
    if (!data) throw error;
    return data;
  }

  async updateFacility(facility: FacilityEntry): Promise<FacilityEntry> {
    const { data, error } = await put<FacilityEntry>(
      `/v1/db/collections/facilities/${facility.id}`,
      facility,
    );
    if (!data) throw error;
    return facility;
  }

  async deleteFacility(id: string): Promise<void> {
    const { error } = await del(`/v1/db/collections/facilities/${id}`);
    if (error) throw error;
  }

  async createCsrdTopic(csrd: UsersTopicAnswer): Promise<UsersTopicAnswer> {
    const { data, error } = await post<UsersTopicAnswer>(
      '/v1/db/collections/csrdtopics',
      csrd,
    );
    if (!data) throw error;
    return data;
  }

  async readCsrdTopics(): Promise<UsersTopicAnswer[]> {
    const { data, error } = await get<UsersTopicAnswer[]>(
      `/v1/db/collections/csrdtopics?report=${globalStore.selectedReport?.id}`,
    );
    if (!data) throw error;
    return data;
  }

  async updateCsrdTopic(csrd: UsersTopicAnswer): Promise<UsersTopicAnswer> {
    const { data, error } = await put<UsersTopicAnswer>(
      `/v1/db/collections/csrdtopics/${csrd.id}`,
      csrd,
    );
    if (!data) throw error;
    return data;
  }

  async deleteCsrdTopic(id: string): Promise<void> {
    const { error } = await del(`/v1/db/collections/csrdtopics/${id}`);
    if (error) throw error;
  }

  async uploadImage(file: File): Promise<{ id: string }> {
    const form = new FormData();
    form.append('file', file);
    const r = await fetch(URL_BACKEND + '/v1/db/files/images', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.user.token}`,
      },
      body: form,
    });
    const j: { id: string } = await r.json();
    return j;
  }

  async getImageAsObjectUrl(id: string): Promise<string> {
    const r = await fetch(URL_BACKEND + `/v1/db/files/images/${id}`, {
      headers: {
        Authorization: `Bearer ${authStore.user.token}`,
      },
    });
    const blob = await r.blob();
    return URL.createObjectURL(blob);
  }

  async deleteImage(id: string): Promise<void> {
    const { error } = await del(`/v1/db/files/images/${id}`);
    if (error) throw error;
  }

  getRestUrl(): string {
    return URL_BACKEND;
  }
}
