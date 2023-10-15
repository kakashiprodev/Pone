<template>
  <div class="login">
    <h1 class="welcome-text">Willkommen</h1>
    <div>
      <!--login with username and password -->
      <div class="p-fluid">
        <div class="p-field">
          <label for="username">Benutzername</label>
          <TextInput class="mt-2" id="username" v-model="username" />
        </div>
        <div class="p-field mt-2">
          <label for="password">Passwort</label>
          <TextInput class="mt-2" id="password" type="password" v-model="password" />
        </div>
        <Button @click="login" :disabled="false" class="mt-5" label="Login" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import TextInput from 'primevue/inputtext';
import { useRouter } from 'vue-router';
import DataProvider from "./../services/dataprovider";
import { Ref, ref } from 'vue';
const router = useRouter();

const username: Ref<string> = ref('');
const password: Ref<string> = ref('');

const login = async () => {
  const loggedIn = await DataProvider.login(username.value, password.value);
  if (loggedIn) {
    router.push('/dashboard');
  }
}
</script>

<style scoped>
.login {
  width: 100%;
  padding-left: 20%;
  padding-right: 20%;
  background-image: url(../assets/green-industry-2.webp);
  opacity: 0.6;
  background-repeat: no-repeat;
  background-size: 100%;
  background-position: bottom;
  height: 100%;
}

h1.welcome-text {
  font-size: 50px;
  font-weight: 700;
  background: -webkit-linear-gradient(#32cbbf, #054351);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  direction: ltr;
}
</style>