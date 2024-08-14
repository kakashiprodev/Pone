import { defineStore } from 'pinia';

export interface AuthStoreState {
  authenticated: boolean;
  user: {
    username: string;
    token: string;
  };
}

export const useAuthStore = defineStore('authStore', {
  state: (): AuthStoreState => ({
    authenticated: false,
    user: {
      username: '',
      token: '',
    },
  }),
});
