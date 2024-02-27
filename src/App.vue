<template>
  <Toast />
  <router-view v-if="!global.isLoading" :key="route.path" />
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
</style>
