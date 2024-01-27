<template>
  <div class="m-auto w-8">
    <h1>Benutzerprofil</h1>

    <div class="p-fluid mt-5">
      <h2>Persönliche Einstellungen</h2>
      <div class="p-fluid">
        <div class="p-field mt-2 flex align-items-center">
          <label for="password">Darstellung in Tonnen?</label>
          <InputSwitch class="ml-2" v-model="global.displayInTons" />
        </div>
      </div>
    </div>

    <div class="p-fluid mt-5">
      <h2>Passwort ändern</h2>
      <div class="p-fluid">
        <div class="p-field">
          <label for="username">Benutzername</label>
          <TextInput
            :disabled="true"
            class="mt-2"
            id="username"
            v-model="global.username"
          />
        </div>
        <Divider />
        <div class="p-field mt-2">
          <label for="password">Altes Passwort</label>
          <TextInput
            class="mt-2"
            id="old-password"
            type="password"
            v-model="passwordOld"
          />
        </div>
        <div class="p-field mt-2">
          <label for="password">Neues Passwort</label>
          <TextInput
            class="mt-2"
            id="new-password"
            type="password"
            v-model="passwordNew"
          />
        </div>
        <div class="p-field mt-2">
          <label for="password">Passwort wiesderholen</label>
          <TextInput
            class="mt-2"
            id="repeat-password"
            type="password"
            v-model="passwordRepeat"
          />
        </div>
        <Button
          @click="changePassword"
          :disabled="false"
          class="mt-5"
          label="Passwort ändern"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import TextInput from 'primevue/inputtext';
import { Ref, ref } from 'vue';
import Divider from 'primevue/divider';
import InputSwitch from 'primevue/inputswitch';
import { error } from './../services/toast';
import { useGlobalStore } from './../stores/global';

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
  error('Funktion noch nicht implementiert');
};
</script>
