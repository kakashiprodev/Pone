<template>
  <div class="content">
    <h1>Benutzerprofil</h1>
    <div class="p-fluid">
      <h2>
        Ausgewähltes Jahr
      </h2>
      <div class="flex align-content-center">
        <Button icon="fa-solid fa-caret-left" class="surface-100 border-0 mr-1" @click="global.decrementYear()"></Button>
        <InputNumber v-model="global.selectedYear" :use-grouping="false" class="w-full" />
        <Button icon="fa-solid fa-caret-right" class="surface-100 border-0 ml-1" @click="global.incrementYear()"></Button>
      </div>
      <!--login with username and password -->
      <h2>
        Passwort ändern
      </h2>
      <div class="p-fluid">
        <div class="p-field">
          <label for="username">Benutzername</label>
          <TextInput :disabled="true" class="mt-2" id="username" v-model="global.username" />
        </div>
        <Divider />
        <div class="p-field mt-2">
          <label for="password">Altes Passwort</label>
          <TextInput class="mt-2" id="old-password" type="password" v-model="passwordOld" />
        </div>
        <div class="p-field mt-2">
          <label for="password">Neues Passwort</label>
          <TextInput class="mt-2" id="new-password" type="password" v-model="passwordNew" />
        </div>
        <div class="p-field mt-2">
          <label for="password">Passwort wiesderholen</label>
          <TextInput class="mt-2" id="repeat-password" type="password" v-model="passwordRepeat" />
        </div>
        <Button @click="changePassword" :disabled="false" class="mt-5" label="Passwort ändern" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import TextInput from 'primevue/inputtext';
// import { useRouter } from 'vue-router';
// import DataProvider from "./../services/dataprovider";
import { Ref, ref } from 'vue';
import Divider from 'primevue/divider';
import { error } from './../services/toast';
import { useGlobalStore } from "./../stores/global";
import InputNumber from 'primevue/inputnumber';

const global = useGlobalStore();
// const router = useRouter();

const passwordOld: Ref<string> = ref('');
const passwordNew: Ref<string> = ref('');
const passwordRepeat: Ref<string> = ref('');

const changePassword = async () => {
  if (passwordNew.value !== passwordRepeat.value) {
    error('Passwörter stimmen nicht überein');
    return;
  }
  error("Funktion noch nicht implementiert")
}
</script>

<style scoped>
.content {
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
</style>