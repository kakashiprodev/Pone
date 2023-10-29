<template>
  <Toast />
  <router-view />
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
  const loggedIn = await DataProvider.checkLogin();
  if (loggedIn) {
    await global.initializeStore();
    if (route.name === 'login') {
      router.push({ name: 'dashboard' });
    } else {
      console.log('logged in');
    }
  } else {
    router.push({ name: 'login' });
  }
}
init();
</script>