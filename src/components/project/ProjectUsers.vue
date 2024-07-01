<template>
  <Toolbar>
    <template #end>
      <Button icon="fa-solid fa-plus" @click="add()" class="ml-1" />
    </template>
  </Toolbar>

  <DataTable :value="usersInProject" class="mt-5" :showGridlines="false">
    <Column field="email" header="User"></Column>
    <Column header="">
      <template #body="{ data }">
        <Button
          icon="fa-solid fa-trash"
          @click="confirmDrop(data, $event)"
          rounded
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted } from 'vue';
import { useGlobalStore } from '../../stores/global';
import { useConfirm } from 'primevue/useconfirm';
import { ProjectEntry } from '../../services/types';
import { error, info } from '../../services/ui/toast';
import dataprovider from '@/services/dataprovider';

const global = useGlobalStore();
const confirm = useConfirm();

const usersInProject: Ref<any> = ref([]);

const add = () => {
  // ...
};

const confirmDrop = async (project: ProjectEntry, event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Soll dieses Projekt wirklich gelöscht werden?',
    icon: 'fa-solid fa-question',
    accept: async () => {
      try {
        // ...
      } catch (e) {
        error(e + '');
      }
    },
  });
};

const init = async () => {
  while (global.isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  // get all users in project
  // ...
};

onMounted(init);
</script>
