<template>
  <div class="login">
    <h1 class="txt-gradient">Welcome</h1>
    <div>
      <!--login with username and password -->
      <div class="p-fluid">
        <div class="p-field">
          <label for="username">Username</label>
          <TextInput id="username" />
        </div>
        <div class="p-field mt-2">
          <label for="password">Password</label>
          <TextInput id="password" type="password" />
        </div>
        <Button @click="" :disabled="false" class="mt-5" label="Login" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
// import { useGlobalStore } from './../stores/global';
// import { ref } from 'vue';
import TextInput from 'primevue/inputtext';
// import { error } from './../services/toast';
// const store = useGlobalStore();
</script>