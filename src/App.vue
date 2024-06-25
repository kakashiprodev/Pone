<template>
  <Toast />
  <router-view v-if="route.name === 'login'" />
  <router-view
    v-else-if="global != null && !global.isLoading"
    :key="route.path"
  />
  <div
    v-else
    class="m-auto w-1/12 min-h-screen flex items-center justify-center"
  >
    <ProgressSpinner />
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { useAuthStore } from './stores/auth';
import { useGlobalStore } from './stores/global';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
const { user, isAuthenticated, idTokenClaims, loginWithRedirect } = useAuth0();

const global = useGlobalStore();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const init = async () => {
  console.log('Init App.vue. Waiting for loading to finish...');

  // await loginWithRedirect();

  if (isAuthenticated) {
    // wait 2s to initialize the redirect from auth0. it's a workaround for the auth0-vue issue
    await new Promise((resolve) => setTimeout(resolve, 1500));
    auth.authenticated = true;
    auth.user.username = user.value?.nickname ?? user.value?.email ?? '';
    auth.user.token = idTokenClaims.value?.__raw ?? '';
  } else {
    await loginWithRedirect({
      authorizationParams: {
        redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL,
      },
    });
  }

  const i = await global.initializeStore();
  if (i.redirect) {
    console.log('Redirecting to', i.redirect);
    await router.push({ name: i.redirect });
  }
};

onMounted(() => {
  init();
});
</script>
