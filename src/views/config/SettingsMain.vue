<template>
  <div class="flex">
    <!-- PanelMenu für das vertikale Menü auf der linken Seite -->
    <PanelMenu
      :model="items"
      class="w-1/5 pr-3"
      v-model:expandedKeys="expandedKeys"
    >
      <template #item="{ item }">
        <router-link
          class="flex align-items-center px-3 py-2 cursor-pointer no-underline text-color"
          :to="item.to ?? ''"
          :exact-active-class="'active-route'"
        >
          <span :class="[item.icon, 'text-primary']" />
          <span :class="['ml-2', { 'font-semibold': item.items }]">
            {{ item.label }}
          </span>
        </router-link>
      </template>
    </PanelMenu>

    <!-- Bereich für die Anzeige der Komponenten auf der rechten Seite -->
    <div class="w-4/5">
      <router-view :key="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PanelMenu from 'primevue/panelmenu';
import { useRoute } from 'vue-router';
const route = useRoute();

const expandedKeys = ref({
  user: true,
  project: true,
});
const items = ref([
  {
    key: 'user',
    label: 'Benutzer',
    icon: 'fa-solid fa-user',
    items: [
      {
        key: 'user-settings',
        label: 'Profil',
        icon: 'fa-solid fa-user-gear',
        to: '/settings/user-settings',
      },
      {
        key: 'user-password',
        label: 'Passwort ändern',
        icon: 'fa-solid fa-key',
        to: '/settings/user-password',
      },
      {
        key: 'user-demo',
        label: '=> Zeige DataEngine Demo!',
        icon: 'fa-solid fa-key',
        to: '/demo',
      },
    ],
  },
  {
    key: 'project',
    label: 'Aktuelles Projekt',
    icon: 'fa-solid fa-briefcase',
    items: [
      {
        key: 'project-general',
        label: 'Projektverwaltung',
        icon: 'fa-solid fa-building',
        to: '/settings/project-general',
      },
      {
        key: 'project-reports',
        label: 'Berichtszeiträume',
        icon: 'fa-solid fa-calendar',
        to: '/settings/project-reports',
      },
      {
        key: 'project-targets',
        label: 'Zieldefinition',
        icon: 'fa-solid fa-bullseye',
        to: '/settings/project-targets',
      },
      {
        key: 'project-equivalents',
        label: 'Äquivalente',
        icon: 'fa-solid fa-list',
        to: '/settings/project-equivalents',
      },
    ],
  },
]);
</script>

<style scoped>
.active-route {
  font-weight: bold;
}
</style>
