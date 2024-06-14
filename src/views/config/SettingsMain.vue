<template>
  <div class="flex">
    <!-- PanelMenu Left Side -->
    <PanelMenu
      :model="items"
      class="w-1/7 pr-3"
      v-model:expandedKeys="expandedKeys"
    >
      <template #item="{ item }">
        <router-link
          v-if="!item.onlyAdmin || globalStore.isGlobalAdmin"
          class="flex items-center px-3 py-2 cursor-pointer no-underline text-slate-800"
          style="color: var(--primary-color)"
          :to="item.to ?? ''"
          :exact-active-class="'active-route'"
        >
          <span :class="[item.icon]" style="color: var(--primary-color)" />
          <span
            class="text-slate-800"
            :class="['ml-2', { 'font-semibold': item.items }]"
          >
            {{ item.label }}
          </span>
        </router-link>
      </template>
    </PanelMenu>

    <!-- Settings Content -->
    <div class="w-full p-5">
      <router-view :key="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useGlobalStore } from '@/stores/global';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const globalStore = useGlobalStore();

const expandedKeys = ref({
  user: true,
  project: true,
});
const items = ref([
  {
    key: 'user',
    label: t('settings.user'),
    icon: 'fa-solid fa-user',
    items: [
      {
        key: 'user-settings',
        label: t('settings.profile'),
        icon: 'fa-solid fa-user-gear',
        to: '/settings/user-settings',
      },
      {
        key: 'user-password',
        label: t('settings.changePassword'),
        icon: 'fa-solid fa-key',
        to: '/settings/user-password',
      },
      {
        key: 'user-demo',
        label: t('settings.showDemo'),
        icon: 'fa-solid fa-key',
        to: '/demo',
        onlyAdmin: true,
      },
      {
        key: 'user-demo-data-generator',
        label: t('settings.genDemoData'),
        icon: 'fa-solid fa-key',
        to: '/demo-data-generator',
        onlyAdmin: true,
      },
    ],
  },
  {
    key: 'project',
    label: t('settings.currentProject'),
    icon: 'fa-solid fa-briefcase',
    items: [
      {
        key: 'project-general',
        label: t('settings.projectGeneral'),
        icon: 'fa-solid fa-building',
        to: '/settings/project-general',
      },
      {
        key: 'project-reports',
        label: t('settings.projectReports'),
        icon: 'fa-solid fa-calendar',
        to: '/settings/project-reports',
      },
      {
        key: 'project-targets',
        label: t('settings.projectTargets'),
        icon: 'fa-solid fa-bullseye',
        to: '/settings/project-targets',
      },
      {
        key: 'project-equivalents',
        label: t('settings.equivalents'),
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
