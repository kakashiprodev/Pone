<template>
  <div class="flex">
    <!-- PanelMenu für das vertikale Menü auf der linken Seite -->

    <PanelMenu :model="items" class="w-1/5 pr-3" v-model:expandedKeys="expandedKeys">
      <template #item="{ item }">
        <a class="flex align-items-center px-3 py-2 cursor-pointer" @click="
          selectedKey = item.key;
        item.action ? item.action() : null;
        ">
          <span :class="[item.icon, 'text-primary']" />
          <span :class="['ml-2', { 'font-semibold': item.items }]">
            {{ item.label }}
          </span>
        </a>
      </template>
    </PanelMenu>

    <!-- Bereich für die Anzeige der Komponenten auf der rechten Seite -->
    <div class="w-4/5 flex-grow-1">
      <!-- 1 -->
      <UsersProfile v-if="selectedKey === '1-1'" />
      <ProjectConfig v-if="selectedKey === '1-2'" />
      <!-- 2 -->
      <SiteDefinition v-if="selectedKey === '2-1'" />
      <ReportConfig v-if="selectedKey === '2-2'" />
      <TargetConfig v-if="selectedKey === '2-3'" />
      <EquivalentList v-if="selectedKey === '2-4'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue';
import PanelMenu from 'primevue/panelmenu';
import EquivalentList from './EquivalentList.vue';
import UsersProfile from './UsersProfile.vue';
import ProjectConfig from './ProjectConfig.vue';
import DataProvider from './../services/dataprovider';
import TargetConfig from '../components/TargetDefinition.vue';
import SiteDefinition from '../components/SiteDefinition.vue';
import ReportConfig from './ReportConfig.vue';
import { router } from './../router';

const selectedKey: Ref<undefined | string> = ref('1-1');
const expandedKeys = ref({
  '1': true,
  '2': true,
});
const items = ref([
  {
    key: '1',
    label: 'Persönliche Einstellungen',
    icon: 'fa-solid fa-user',
    items: [
      {
        key: '1-1',
        label: 'Benutzerprofil',
        icon: 'fa-solid fa-user-gear',
      },
      {
        key: '1-2',
        label: 'Projektverwaltung',
        icon: 'fa-solid fa-project-diagram',
      },
      {
        key: '1-3',
        label: 'Ausloggen',
        icon: 'fa-solid fa-right-from-bracket',
        action: () => {
          console.log('logout');
          DataProvider.logout();
          router.push({ name: 'login' });
        },
      },
    ],
  },
  {
    key: '2',
    label: 'Aktuelles Projekt',
    icon: 'fa-solid fa-briefcase',
    items: [
      {
        key: '2-1',
        label: 'Standorte',
        icon: 'fa-solid fa-map-location',
      },
      {
        key: '2-2',
        label: 'Berichtszeiträume',
        icon: 'fa-solid fa-calendar',
      },
      {
        key: '2-3',
        label: 'Zieldefinition',
        icon: 'fa-solid fa-bullseye',
      },
      {
        key: '2-4',
        label: 'Äquivalente',
        icon: 'fa-solid fa-list',
      },
    ],
  },
]);
</script>
