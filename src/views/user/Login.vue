<template>
  <div class="login">
    <h1 class="welcome-text">Willkommen</h1>
    <div>
      <!--login with username and password -->
      <Card>
        <template #header> Login </template>
        <template #content>
          <Button label="Login" @click="login" />
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
const { loginWithRedirect } = useAuth0();

const login = async () => {
  await loginWithRedirect();
  console.log('login reached');
};
</script>

<style scoped>
.login {
  width: 100%;
  padding-left: 20%;
  padding-right: 20%;
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
