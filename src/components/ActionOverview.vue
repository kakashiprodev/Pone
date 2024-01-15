<template>
  <h3 class="m-auto text-center mt-5">Auflistung aller geplanten Maßnahmen</h3>
  <div>
    <Card class="w-8 mt-3 m-auto" v-for="action in actions">
      <template #title>{{ action.name }}</template>
      <template #subtitle>
        <span style="white-space: pre" v-html="action.shortDescription"></span>
      </template>
      <template #content>
        <p class="m-0" style="white-space: pre">
          <span v-html="action.longDescription"></span>
        </p>
      </template>
      <template #footer>
        Geplante Einsparung: {{ action.targetValueAbsolut }} [kg CO2/Jahr]
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import dataprovider from './../services/dataprovider';
import { ref, Ref } from 'vue';
import { ActionEntry } from './../services/types';
import { useGlobalStore } from './../stores/global';

const global = useGlobalStore();

const actions: Ref<ActionEntry[]> = ref([]);
const getData = async () => {
  try {
    if (!global.selectedReport) {
      console.error('No report selected');
      return;
    }
    actions.value = await dataprovider.readActions();
    console.log(actions.value);
  } catch (e) {
    console.error(e);
  }
};
getData();
</script>
