<template>
  <Toast />
  <router-view v-if="global != null && !global.isLoading" :key="route.path" />
  <div
    v-else
    class="m-auto w-1/12 min-h-screen flex items-center justify-center"
  >
    <ProgressSpinner />
  </div>
</template>

<script setup lang="ts">
import DataProvider from './services/dataprovider';
import { useAuthStore } from './stores/auth';
import { useGlobalStore } from './stores/global';
import { router } from './router';
import { useRoute } from 'vue-router';

const global = useGlobalStore();
const auth = useAuthStore();
const route = useRoute();

const init = async () => {
  console.log('Init App.vue. Waiting for loading to finish...');

  while (!auth || !auth.authenticated) {
    console.log('waiting for authStore to be initialized');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const loggedIn = await DataProvider.checkLogin();
  console.log('loggedIn', loggedIn);

  if (loggedIn) {
    await global.initializeStore();
    console.log('global initialized', router);
    if (router.currentRoute.value.path.startsWith('/login')) {
      router.push({ name: 'dashboard' });
    } else {
      console.log('logged in');
    }
  } else {
    global.isLoading = false;
    console.log('not logged in. forwarding to login');
    router.push({ name: 'login' });
  }
};
init();
</script>

<style>
/*
Fix for PrimeVue InputNumber problem with width
*/
.w-full .p-inputnumber-input {
  width: 100%;
}

/**
Custom CARD stlye for #header
*/
.psm-report-header {
  /*background-image: linear-gradient(
    to left top,
    #00ae97,
    #0db69f,
    #17bfa7,
    #1fc7b0,
    #26d0b8,
    #2accb6
  );*/
  /*background-image: linear-gradient(to left top, #00ae973d, #008a770f);*/
  background-color: var(--surface-200) !important;
  text-align: center;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 10px;
}

.psm-report-header h3 {
  margin: 0;
  color: #334155;
  font-size: 0.9rem;
}
</style>
