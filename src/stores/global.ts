import { defineStore } from "pinia";
import { router } from "./../router/index";
import { Equivalent } from "./../services/types";
import dataprovider from "./../services/dataprovider";
import { error, info } from "./../services/toast";

export interface GlobalState {
  isLoading: boolean;
  isLoggenIn: boolean;
  requestPending: boolean;
  //
  selectedYear: number;
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

const lastYear = new Date().getFullYear() - 1;

export const useGlobalStore = defineStore("global", {
  state: () => ({
    isLoading: false,
    isLoggenIn: false,
    requestPending: false,
    //
    selectedYear: lastYear,
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
      await router.push({ path: "/" });
    },
    async redirectToLogin() {
      await router.push({ path: "/login" });
    },
    async incrementYear() {
      this.selectedYear++;
    },
    async decrementYear() {
      this.selectedYear--;
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
