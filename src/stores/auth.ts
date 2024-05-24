import KeycloakService from '@/services/provider/keycloak';
import { defineStore } from 'pinia';

export interface AuthStoreState {
  authenticated: boolean;
  user: {
    username: string;
    token: string;
    refToken: string;
  };
}

export interface AuthStoreActions {
  initOauth: (keycloak: any, clearData?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserToken: () => Promise<void>;
  clearUserData: () => Promise<void>;
}

export const useAuthStore = defineStore('authStore', {
  state: (): AuthStoreState => ({
    authenticated: false,
    user: {
      username: '',
      token: '',
      refToken: '',
    },
  }),
  persist: true,
  getters: {},
  actions: {
    // Initialize Keycloak OAuth
    async initOauth(keycloak: any, clearData = true) {
      if (clearData) {
        await this.clearUserData();
      }
      this.authenticated = keycloak.authenticated;
      this.user.username = keycloak.idTokenParsed.preferred_username;
      this.user.token = keycloak.token;
      this.user.refToken = keycloak.refreshToken;
    },
    // Logout user
    async logout() {
      try {
        KeycloakService.CallLogout('/');
        await this.clearUserData();
      } catch (error) {
        console.error(error);
      }
    },
    // Refresh user's token
    async refreshUserToken() {
      try {
        const keycloak = await KeycloakService.CallTokenRefresh();
        this.initOauth(keycloak, false);
      } catch (error) {
        console.error(error);
      }
    },
    // Clear user's store data
    async clearUserData() {
      this.authenticated = false;
      this.user = {
        username: '',
        token: '',
        refToken: '',
      };
    },
  },
});
