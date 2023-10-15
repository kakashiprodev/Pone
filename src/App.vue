<template>
  <Toast />
  <router-view />
</template>

<script setup lang="ts">
import Toast from 'primevue/toast';
import './styles/theme.scss';
import './styles/layout/layout.scss';
import DataProvider from "./services/dataprovider";
import { useRouter } from 'vue-router';
const router = useRouter();

DataProvider.checkLogin()
  .then((loggedIn) => {
    if (loggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  })

</script>