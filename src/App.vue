<template>
  <Toast />
  <router-view v-if="!global.isLoading" />
</template>

<script setup lang="ts">
import Toast from 'primevue/toast';
import './styles/theme.scss';
import './styles/layout/layout.scss';
import DataProvider from "./services/dataprovider";
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
}
init();
</script>