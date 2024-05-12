<template>
  <Toast />
  <router-view v-if="!global.isLoading" :key="route.path" />
  <div
    v-else
    class="m-auto w-1 min-h-screen flex align-items-center justify-content-center"
  >
    <ProgressSpinner />
  </div>
</template>

<script setup lang="ts">
import DataProvider from './services/dataprovider';
import { useRouter, useRoute } from 'vue-router';
import { useGlobalStore } from './stores/global';

const global = useGlobalStore();
const router = useRouter();
const route = useRoute();

const init = async () => {
  console.log('init');
  const loggedIn = await DataProvider.checkLogin();
  console.log('loggedIn', loggedIn);
  if (loggedIn) {
    await global.initializeStore();
    if (route.name === 'login') {
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
  background-image: linear-gradient(to left top, #00ae973d, #008a770f);
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
