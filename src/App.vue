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
const router = useRouter();
const route = useRoute();

DataProvider.checkLogin()
  .then((loggedIn) => {
    if (loggedIn) {
      if (route.name === 'login') {
        router.push('/dashboard');
      } else {
        console.log('logged in');
      }
    } else {
      router.push('/login');
    }
  })

</script>