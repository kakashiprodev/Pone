import { defineStore } from "pinia";
import { router } from "./../router/index";

export const useGlobalStore = defineStore("global", {
  state: () => ({
    isLoading: false,
    isLoggenIn: false,
    requestPending: false,
  }),
  actions: {
    async redirectToMain() {
      await router.push({ path: "/" });
    },
    async redirectToLogin() {
      await router.push({ path: "/login" });
    },
  },
});
