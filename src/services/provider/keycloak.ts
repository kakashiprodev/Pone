// src/services/keycloak.js
import Keycloak from 'keycloak-js';

const options = {
  url: 'http://localhost:8089',
  realm: 'master',
  clientId: 'app',
};

const keycloak = new Keycloak(options);
let authenticated = false;
let store = null;

/**
 * Initializes Keycloak, then run callback. This will prompt you to login.
 *
 * @param onAuthenticatedCallback
 */
async function init(onInitCallback: any) {
  try {
    // get the actual route from the first slash on. href is something like "http://localhost:5173/#/dashboard?test=1"
    // we need to get /#/dashboard until the first & or ? or end of string
    let pattern = window.location.href.match(/\/#\/[^&\?]+/g);
    const route = pattern ? pattern[0] : '/#/login?';

    console.log('route', route);

    authenticated = await keycloak.init({
      onLoad: 'login-required',
      redirectUri: window.location.origin + route,
    });
    onInitCallback();
  } catch (error) {
    console.error('Keycloak init failed');
    console.error(error);
  }
}

/**
 * Initializes store with Keycloak user data
 *
 */
async function initStore(storeInstance: any) {
  try {
    store = storeInstance;
    await store.initOauth(keycloak);

    // Show alert if user is not authenticated
    if (!authenticated) {
      alert('not authenticated');
    }
  } catch (error) {
    console.error('Keycloak init failed');
    console.error(error);
  }
}

/**
 * Logout user
 */
function logout(url: any) {
  keycloak.logout({ redirectUri: url });
}

/**
 * Refreshes token
 */
async function refreshToken() {
  try {
    await keycloak.updateToken(480);
    return keycloak;
  } catch (error) {
    console.error('Failed to refresh token');
    console.error(error);
  }
}

const KeycloakService = {
  CallInit: init,
  CallInitStore: initStore,
  CallLogout: logout,
  CallTokenRefresh: refreshToken,
};

export default KeycloakService;
