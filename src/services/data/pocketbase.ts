import PocketBase from "pocketbase";
import { Equivalent, UserInput, UserInputQuery } from "./../types";
import { error } from "./../toast";
import { globalStore } from "./../../main";

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
      globalStore.company = res.items[0].expand?.company.companyName;
      globalStore.project = res.items[0].expand?.company.prefix;

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
        filter: `year = ${globalStore.selectedYear}`,
      },
    );
    return res.items;
  }

  async readEquivalentsAsDict() {
    const res = await this.pb.collection("equivalents").getList<Equivalent>(
      1,
      500,
      {
        filter: `year = ${globalStore.selectedYear}`,
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

  // CRUD für UserInput
  async createUserInputs(data: UserInput) {
    return await this.pb
      .collection("userInputs").create<UserInput>(data);
  }

  async readUserInput(id: string) {
    return await this.pb
      .collection("userInputs").getOne<UserInput>(id);
  }

  async readUserInputs(query?: UserInputQuery) {
    const res = await this.pb
      .collection("userInputs").getList<UserInput>(1, 500, {
        filter: `year = ${globalStore.selectedYear}${
          query?.scope ? " && scope = '" + query.scope + "'" : ""
        }`,
        expand: "equivalent",
      });
    return res.items;
  }

  async updateUserInputs(id: string, data: Partial<UserInput>) {
    return await this.pb.collection("userInputs").update<UserInput>(id, data);
  }

  async deleteUserInputs(id: string) {
    return await this.pb.collection("userInputs").delete(id);
  }
}
