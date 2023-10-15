import { defineStore } from "pinia";
import { router } from "./../router/index";

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
  // layout information
  theme: "light" | "dark";
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
    // layout information
    theme: "light" as "light" | "dark",
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
  },
});
