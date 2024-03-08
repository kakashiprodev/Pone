<template>
  <div v-if="user != null">
    <div class="p-fluid mt-5">
      <h2>Passwort ändern</h2>
      <div class="p-fluid">
        <Divider />
        <form @prevent="changePassword">
          <div class="p-field" v-show="false">
            <InputText
              class="mt-2"
              id="username"
              v-model="global.username"
              autocomplete="username"
              :disabled="true"
            />
          </div>
          <div class="p-field mt-2">
            <label for="password">Altes Passwort</label>
            <InputText
              class="mt-2"
              id="old-password"
              type="password"
              v-model="passwordOld"
              autocomplete="current-password"
            />
          </div>
          <div class="p-field mt-2">
            <label for="password">Neues Passwort</label>
            <InputText
              class="mt-2"
              id="new-password"
              type="password"
              v-model="passwordNew"
              autocomplete="new-password"
            />
          </div>
          <div class="p-field mt-2">
            <label for="password">Passwort wiesderholen</label>
            <InputText
              class="mt-2"
              id="repeat-password"
              type="password"
              v-model="passwordRepeat"
              autocomplete="new-password"
            />
          </div>
          <Button
            @click="changePassword"
            :disabled="false"
            class="mt-5"
            label="Passwort ändern"
          />
        </form>
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

onMounted(() => {
  getData();
});
</script>
