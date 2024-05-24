<template>
  <div class="login">
    <h1 class="welcome-text">Willkommen</h1>
    <div>
      <!--login with username and password -->
      <Card>
        <template #header> Login </template>
        <template #content>
          <div class="p-fluid m-auto">
            <div class="p-field">
              <label for="username">Benutzername</label>
              <InputText class="mt-2" id="username" v-model="username" />
            </div>
            <div class="p-field mt-2">
              <label for="password">Passwort</label>
              <InputText
                class="mt-2"
                id="password"
                type="password"
                v-model="password"
              />
            </div>
            <div class="w-full mt-5 flex justify-center">
              <Button
                @click="login"
                :loading="loading"
                class="mt-5"
                label="Login"
              />
            </div>
            <!-- Divider -->
            <div class="w-full mt-5 flex justify-center">
              <Divider class="mt-5" />
            </div>
            <div class="w-full mt-1 flex justify-center">
              <img
                src="./../../assets/ms-symbollockup_signin_dark.svg"
                alt="Microsoft"
                class="cursor-pointer"
                @click="loginWithMs()"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import DataProvider from '../../services/dataprovider';
import { Ref, ref } from 'vue';
// import { useGlobalStore } from '../../stores/global';
const router = useRouter();
// const global = useGlobalStore();

const username: Ref<string> = ref('');
const password: Ref<string> = ref('');
const loading = ref(false);

const login = async () => {
  loading.value = true;
  const loggedIn = await DataProvider.login(username.value, password.value);
  if (loggedIn) {
    router.push({ name: 'dashboard' });
    // await global.initializeStore();
  }
  loading.value = false;
};

const loginWithMs = async () => {
  loading.value = true;
  const loggedIn = await DataProvider.loginWithMicrosoft();
  if (loggedIn) {
    router.push({ name: 'dashboard' });
    // await global.initializeStore();
  }
  loading.value = false;
};
</script>

<style scoped>
.login {
  width: 100%;
  padding-left: 20%;
  padding-right: 20%;
  /* background-image: url(../assets/green-industry-2.webp);
  opacity: 0.6;
  background-repeat: no-repeat;
  background-size: 100%;
  background-position: bottom; */
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
