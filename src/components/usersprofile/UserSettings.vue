<template>
  <div v-if="user != null">
    <div class="p-fluid mt-5">
      <h2>Persönliche Einstellungen</h2>
      <div class="p-fluid">
        <div class="p-field mt-2 flex align-items-center">
          <label for="displayInTons">Darstellung in Tonnen?</label>
          <InputSwitch
            id="displayInTons"
            class="ml-2"
            v-model="user.displayInTons"
          />
        </div>
      </div>
    </div>

    <div class="p-fluid mt-5">
      <h2>Angaben</h2>
      <div class="p-fluid">
        <div class="p-field">
          <label for="username">Benutzername</label>
          <InputText class="mt-2" id="username" v-model="global.username" />
        </div>
        <div class="p-field mt-2">
          <label for="email">E-Mail</label>
          <InputText class="mt-2" id="email" v-model="user.email" />
        </div>
        <div class="p-field mt-2">
          <label for="firstname">Vorname</label>
          <InputText class="mt-2" id="firstname" v-model="user.firstname" />
        </div>
        <div class="p-field mt-2">
          <label for="surname">Nachname</label>
          <InputText class="mt-2" id="surname" v-model="user.surname" />
        </div>
        <div class="p-field mt-2">
          <label for="department">Abteilung</label>
          <InputText class="mt-2" id="department" v-model="user.department" />
        </div>
        <div class="p-field mt-2">
          <label for="role">Rolle</label>
          <InputText class="mt-2" id="role" v-model="user.role" />
        </div>
        <div class="p-field mt-2">
          <label for="telephone">Telefon</label>
          <InputText class="mt-2" id="telephone" v-model="user.telephone" />
        </div>

        <Button
          @click="saveUser"
          :disabled="false"
          class="mt-5"
          label="Speichern"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted } from 'vue';
import { error } from './../../services/ui/toast';
import { useGlobalStore } from './../../stores/global';
import { UserEntry } from './../../services/types';
import dataprovider from './../../services/dataprovider';

const global = useGlobalStore();

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
