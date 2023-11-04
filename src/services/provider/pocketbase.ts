import PocketBase from "pocketbase";
import {
  CategoryEntry,
  Equivalent,
  InputEntry,
  PresetEntry,
  ProjectEntry,
  ReportEntry,
  SourceEntry,
  UserInputQuery,
} from "../types";
import { error } from "../toast";
import { globalStore } from "../../main";
import { getSumForInput } from "../reporting";

export default class DataProvider {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      await this.pb.collection("users").authWithPassword(
        username,
        password,
      );
      return this.checkLogin();
    } catch (err) {
      error(err + "");
      return false;
    }
  }

  async checkLogin(): Promise<boolean> {
    console.log("checking login");
    try {
      // console.log("token: ", this.pb.authStore.token);
      const res = await this.pb.collection("users").getList(1, 1, {
        expand: "company",
      });
      if (res.items.length < 1) return false;
      // set globalStore username and company
      globalStore.username = res.items[0].username;
      return true;
    } catch (error) {
      console.log("error: ", error);
      return false;
    }
  }

  async logout() {
    await this.pb.authStore.clear();
  }

  // CRUD for Equivalent
  async readEquivalents() {
    const res = await this.pb.collection("equivalents").getList<Equivalent>(
      1,
      500,
      {
        filter: `project="${globalStore.selectedProject?.id}" || project=""`,
      },
    );
    return res.items;
  }

  async readEquivalentsAsDict() {
    const res = await this.pb.collection("equivalents").getList<Equivalent>(
      1,
      500,
      {
        // filter: `report = ${globalStore.selectedReport?.year}`,
      },
    );
    const dict: { [key: string]: Equivalent } = {};
    res.items.forEach((item) => {
      dict[item.id] = item;
    });
    return dict;
  }

  async createEquivalent(data: Equivalent) {
    return await this.pb.collection("equivalents").create<Equivalent>(
      data,
    );
  }

  async updateEquivalents(data: Equivalent) {
    return await this.pb
      .collection("equivalents").update<Equivalent>(data.id, data);
  }

  async deleteEquivalent(id: string) {
    return await this.pb.collection("equivalents").delete(id);
  }

  // CRUD for "inputs"
  async createUserInput(data: InputEntry) {
    // calculate sum
    data.sumValue = getSumForInput(data, globalStore.equivalentDict);
    return await this.pb
      .collection("inputs").create<InputEntry>(data);
  }

  async readUserInput(id: string) {
    return await this.pb
      .collection("inputs").getOne<InputEntry>(id);
  }

  async readUserInputs(query?: UserInputQuery) {
    const res = await this.pb
      .collection("inputs").getList<InputEntry>(1, 500, {
        filter: `report = '${globalStore.selectedReport?.id}'${
          query?.scope
            ? " && " + query.scope.map((s) => `scope="${s}"`).join(" || ")
            : ""
        }${
          query?.category
            ? " && " + query.category.map((c) => `category="${c}"`).join(" || ")
            : ""
        }`,
        // expand: "equivalent",
      });
    return res.items;
  }

  async updateUserInput(data: InputEntry) {
    // calculate sum
    data.sumValue = getSumForInput(data, globalStore.equivalentDict);
    if (data.id == null) throw new Error("id is null");
    return await this.pb.collection("inputs").update<InputEntry>(data.id, data);
  }

  async deleteUserInput(id: string) {
    return await this.pb.collection("inputs").delete(id);
  }

  // CRUD for "reports"
  async createReport(data: ReportEntry) {
    return await this.pb.collection("reports").create<ReportEntry>(data);
  }

  async readReport(id: string) {
    return await this.pb.collection("reports").getOne<ReportEntry>(id);
  }

  async readReports() {
    const res = await this.pb.collection("reports").getList<ReportEntry>(
      1,
      500,
    );
    return res.items;
  }

  async updateReport(data: ReportEntry) {
    if (!data.id) throw new Error("Report ID is missing");
    return await this.pb.collection("reports").update<ReportEntry>(
      data.id,
      data,
    );
  }

  async deleteReport(id: string) {
    return await this.pb.collection("reports").delete(id);
  }

  // CRUD for "sources"
  async createSource(data: SourceEntry) {
    return await this.pb.collection("sources").create<SourceEntry>(data);
  }

  async readSource(id: string) {
    return await this.pb.collection("sources").getOne<SourceEntry>(id);
  }

  async readSources() {
    const res = await this.pb.collection("sources").getList<SourceEntry>(
      1,
      500,
    );
    return res.items;
  }

  async updateSource(data: SourceEntry) {
    if (!data.id) throw new Error("Source ID is missing");
    return await this.pb.collection("sources").update<SourceEntry>(
      data.id,
      data,
    );
  }

  async deleteSource(id: string) {
    return await this.pb.collection("sources").delete(id);
  }

  // CRUD for "projects"
  async createProject(data: ProjectEntry) {
    return await this.pb.collection("projects").create<ProjectEntry>(data);
  }

  async readProject(id: string) {
    return await this.pb.collection("projects").getOne<ProjectEntry>(id);
  }

  async readProjects() {
    const res = await this.pb.collection("projects").getList<ProjectEntry>(
      1,
      500,
    );
    return res.items;
  }

  async updateProject(data: ProjectEntry) {
    if (!data.id) throw new Error("Project ID is missing");
    return await this.pb.collection("projects").update<ProjectEntry>(
      data.id,
      data,
    );
  }

  async deleteProject(id: string) {
    return await this.pb.collection("projects").delete(id);
  }

  // CRUD for "categories"
  async createCategory(data: CategoryEntry) {
    return await this.pb.collection("categories").create<CategoryEntry>(data);
  }

  async readCategory(id: string) {
    return await this.pb.collection("categories").getOne<CategoryEntry>(id);
  }

  async readCategories() {
    const res = await this.pb.collection("categories").getList<CategoryEntry>(
      1,
      500,
    );
    return res.items;
  }

  async updateCategory(data: CategoryEntry) {
    if (!data.id) throw new Error("Category ID is missing");
    return await this.pb.collection("categories").update<CategoryEntry>(
      data.id,
      data,
    );
  }

  async deleteCategory(id: string) {
    return await this.pb.collection("categories").delete(id);
  }

  // R for "presets"
  async readPresets() {
    const res = await this.pb.collection("presets").getList<PresetEntry>(
      1,
      500,
    );
    return res.items;
  }
}
