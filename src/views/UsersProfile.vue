<template>
  <div v-if="user != null">

    <div class="p-fluid mt-5">
      <h2>Persönliche Einstellungen</h2>
      <div class="p-fluid">
        <div class="p-field mt-2 flex align-items-center">
          <label for="displayInTons">Darstellung in Tonnen?</label>
          <InputSwitch id="displayInTons" class="ml-2" v-model="user.displayInTons" />
        </div>
      </div>
    </div>

    <div class="p-fluid mt-5">
      <h2>Angaben</h2>
      <div class="p-fluid">
        <div class="p-field">
          <label for="username">Benutzername</label>
          <TextInput class="mt-2" id="username" v-model="global.username" />
        </div>
        <div class="p-field mt-2">
          <label for="email">E-Mail</label>
          <TextInput class="mt-2" id="email" v-model="user.email" />
        </div>
        <div class="p-field mt-2">
          <label for="firstname">Vorname</label>
          <TextInput class="mt-2" id="firstname" v-model="user.firstname" />
        </div>
        <div class="p-field mt-2">
          <label for="surname">Nachname</label>
          <TextInput class="mt-2" id="surname" v-model="user.surname" />
        </div>
        <div class="p-field mt-2">
          <label for="department">Abteilung</label>
          <TextInput class="mt-2" id="department" v-model="user.department" />
        </div>
        <div class="p-field mt-2">
          <label for="role">Rolle</label>
          <TextInput class="mt-2" id="role" v-model="user.role" />
        </div>
        <div class="p-field mt-2">
          <label for="telephone">Telefon</label>
          <TextInput class="mt-2" id="telephone" v-model="user.telephone" />
        </div>

        <Button @click="saveUser" :disabled="false" class="mt-5" label="Speichern" />
      </div>
    </div>

    <div class="p-fluid mt-5">
      <h2>Passwort ändern</h2>
      <div class="p-fluid">
        <Divider />
        <form @prevent="changePassword">
          <div class="p-field" v-show="false">
            <TextInput class="mt-2" id="username" v-model="global.username" autocomplete="username" :disabled="true" />
          </div>
          <div class="p-field mt-2">
            <label for="password">Altes Passwort</label>
            <TextInput class="mt-2" id="old-password" type="password" v-model="passwordOld"
              autocomplete="current-password" />
          </div>
          <div class="p-field mt-2">
            <label for="password">Neues Passwort</label>
            <TextInput class="mt-2" id="new-password" type="password" v-model="passwordNew" autocomplete="new-password" />
          </div>
          <div class="p-field mt-2">
            <label for="password">Passwort wiesderholen</label>
            <TextInput class="mt-2" id="repeat-password" type="password" v-model="passwordRepeat"
              autocomplete="new-password" />
          </div>
          <Button @click="changePassword" :disabled="false" class="mt-5" label="Passwort ändern" />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import TextInput from 'primevue/inputtext';
import { Ref, ref, onMounted } from 'vue';
import Divider from 'primevue/divider';
import InputSwitch from 'primevue/inputswitch';
import { error } from './../services/toast';
import { useGlobalStore } from './../stores/global';
import { UserEntry } from './../services/types';
import dataprovider from './../services/dataprovider';

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

const user: Ref<UserEntry | null> = ref(null);
const getData = async () => {
  try {
    user.value = await dataprovider.getUser();
  } catch (e: any) {
    error(e + '');
  }
};

const saveUser = async () => {
  try {
    if (user.value == null || user.value.id == null) return;
    await dataprovider.updateUser(user.value);
    global.displayInTons = user.value.displayInTons;
  } catch (e: any) {
    error(e + '');
  }
};

onMounted(() => {
  getData();
});
</script>
