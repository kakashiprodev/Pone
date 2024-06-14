<template>
  <Sidebar v-model:visible="showSidebar" position="right">
    <div class="flex flex-col gap-3 w-full mt-3 rounded-xl bg-slate-100 p-3">
      <Chip :label="global.selectedSite?.name" class="bg-slate-200">
        <img
          v-if="
            global.selectedProject?.logo && global.selectedProject.logo !== ''
          "
          :src="global.selectedProject.logo"
          class="rounded-lg object-scale-down"
        />
        <span>{{ global.selectedProject?.name }}</span>
      </Chip>

      <span>{{ $t('global.sidebar.places') }}</span>
      <Dropdown
        :options="global.sites"
        optionLabel="name"
        v-model="global.selectedSite"
        @change="switchReport()"
      />
    </div>

    <div class="flex flex-col gap-3 w-full mt-5 rounded-xl bg-slate-100 p-3">
      <span class="text-sm font-bold">{{ global.username }}</span>

      <div class="flex flex-col gap-2 mt-5 w-full">
        <div class="flex flex-col gap-4">
          <div class="flex justify-items-end gap-2">
            <i v-if="colorMode === 'dark'" class="fa-solid fa-moon" />
            <i v-if="colorMode === 'light'" class="fa-solid fa-sun" />
            <span class="grow">Dark/Light Mode</span>
            <InputSwitch
              v-model="global.theme"
              :true-value="'dark'"
              :false-value="'light'"
            />
          </div>

          <div class="flex justify-items-end gap-2">
            <i class="fa-solid fa-question-circle" />
            <span class="grow">Zeige Hilfe</span>
            <InputSwitch v-model="global.showTooltips" />
          </div>
        </div>
      </div>

      <Button
        class="mt-5"
        icon="fa-solid fa-gear"
        @click="router.push({ name: 'settings' })"
        label="Einstellungen"
      />
      <Button
        icon="fa-solid fa-right-from-bracket"
        @click="logout"
        label="Abmelden"
      />
    </div>
  </Sidebar>

  <AppLayout>
    <template #logo>
      <img
        src="../../assets/logo-transparent_part.png"
        class="cursor-pointer"
        @click="router.push({ name: 'home' })"
        style="height: 50px"
      />
    </template>

    <template #start>
      <h3 class="text-slate-600 ml-5 text-2xl">Sustainability Management</h3>
    </template>

    <template #end>
      <ul class="list-none no-underline text-color flex items-center">
        <li>
          <Dropdown
            v-show="global.reports.length > 0"
            :options="global.reports.sort((a, b) => b.year - a.year)"
            optionLabel="year"
            v-model="global.selectedReport"
            @change="switchReport()"
          />
        </li>

        <li class="ml-2">
          <router-link
            to="/settings/project-reports"
            :exact-active-class="'active-route'"
          >
            <Chip :label="global.selectedSite?.name">
              <img
                v-if="
                  global.selectedProject?.logo &&
                  global.selectedProject.logo !== ''
                "
                :src="global.selectedProject.logo"
                class="rounded-lg object-scale-down"
              />
              <span>{{ global.selectedProject?.name }}</span>
            </Chip>
          </router-link>
        </li>

        <li class="ml-4">
          <Button
            icon="fa-solid fa-bars"
            @click="showSidebar = !showSidebar"
            class="bg-slate-400 text-slate-1 border-slate-400"
          />
        </li>
      </ul>
    </template>

    <template #sidebar>
      <div>
        <template v-for="item in sidebar.filter((i) => !i.hide)">
          <div
            class="rounded-sm dark:bg-slate-700 mt-2 pt-1"
            :class="{
              'bg-slate-100': global.theme === 'light',
              'bg-slate-700': global.theme !== 'light',
            }"
          >
            <h3 class="text-xs px-1 text-500">
              {{ item.header }}
            </h3>
            <PanelMenu :model="item.items" class="less-padding">
              <template #item="{ item }">
                <router-link
                  class="flex items-center px-3 py-2 cursor-pointer no-underline text-slate-600"
                  :to="item.to ?? ''"
                  :exact-active-class="'active-route'"
                >
                  <span
                    :class="[item.icon, 'text-primary', 'sidebar-item-custom']"
                    style="color: var(--primary-color)"
                  />
                  <span
                    :class="[
                      'ml-2',
                      { 'font-semibold': item.items },
                      'sidebar-item-custom',
                    ]"
                  >
                    {{ item.label }}
                  </span>
                </router-link>
              </template>
            </PanelMenu>
          </div>
        </template>
      </div>
    </template>

    <template #submenu>
      <ul class="list-none m-0 p-0">
        <li>
          <a
            href="/#/project-config"
            class="text-800 flex p-2 rounded-sm items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer"
          >
            <i class="fa-solid fa-people-group mr-3"></i>
            <span>{{ $t('global.manageProjects') }}</span>
          </a>
          <a
            href="/#/equivalents"
            class="text-800 flex p-2 rounded-sm items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer"
          >
            <i class="fa-solid fa-list mr-3"></i>
            <span>{{ $t('global.manageEquivalents') }}</span>
          </a>
          <a
            href="/#/user"
            class="text-800 flex p-2 rounded-sm items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer"
          >
            <i class="fa-solid fa-user mr-3"></i>
            <span>{{ $t('global.userProfile') }}</span>
          </a>
          <a
            @click="logout()"
            class="text-800 flex p-2 rounded-sm items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer"
          >
            <i class="fa-solid fa-right-from-bracket mr-3"></i>
            <span>{{ $t('global.logout') }}</span>
          </a>
        </li>
      </ul>
    </template>

    <template #content>
      <router-view :key="route.path" />
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from './AppLayout.vue';
import { useGlobalStore } from '../../stores/global';
import { useRouter } from 'vue-router';
import dataprovider from '../../services/dataprovider';
import { useRoute } from 'vue-router';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const global = useGlobalStore();
const loading = ref(false);
const colorMode = computed(() => global.theme);

const logout = async () => {
  console.log('logout');
  await dataprovider.logout();
  router.push('/login');
};

const switchReport = async () => {
  loading.value = true;
  await global.changeReport();
  loading.value = false;
};

const showSidebar = ref(false);

const sidebarAnalysis = [
  {
    key: 'dashboard',
    label: t('global.sidebar.dashboard'),
    icon: 'fa-solid fa-chart-line',
    to: '/dashboard',
    visible: true,
  },
  {
    key: 'overview',
    label: 'Alle Eingaben',
    icon: 'fa-solid fa-list',
    to: '/inputs',
    visible: true,
  },
];

const sidebarInputs = [
  {
    key: 'scope-1',
    label: t('global.sidebar.scope', { scope: '1' }),
    icon: 'fa-solid fa-1',
    to: '/inputs/scope/1',
    visible: true,
  },
  {
    key: 'scope-2',
    label: t('global.sidebar.scope', { scope: '2' }),
    icon: 'fa-solid fa-2',
    to: '/inputs/scope/2',
    visible: true,
  },
  {
    key: 'scope-3',
    label: t('global.sidebar.scope', { scope: '3' }),
    icon: 'fa-solid fa-3',
    to: '/inputs/scope/3',
    visible: true,
  },
  {
    key: 'assistant',
    label: t('global.sidebar.assistant'),
    icon: 'fa-solid fa-magic',
    to: '/assistant',
    visible: global.isGlobalAdmin,
  },
];

const sidebarCsrd = [
  {
    key: 'csrd-report-interview',
    label: t('global.sidebar.csrdReportInterview'),
    icon: 'fa-solid fa-magic',
    to: '/csrd-report-interview',
    visible: global.isGlobalAdmin,
  },
];

const sidebarActions = [
  {
    key: 'actions',
    label: t('global.sidebar.actions'),
    icon: 'fa-solid fa-list-check',
    to: '/actions',
    visible: true,
  },
  {
    key: 'facilities',
    label: t('global.sidebar.facilities'),
    icon: 'fa-solid fa-industry',
    to: '/facilities',
    visible: true,
  },
  {
    key: 'report-data',
    label: 'Unternehmen',
    icon: 'fa-solid fa-building',
    to: '/report-data',
    visible: true,
  },
];

const sidebar = [
  {
    header: t('global.sidebar.analysis'),
    items: sidebarAnalysis,
  },
  {
    header: t('global.sidebar.inputs'),
    items: sidebarInputs,
  },
  {
    header: t('global.sidebar.inputs'),
    items: sidebarActions,
  },
  {
    header: t('global.sidebar.reporting'),
    items: sidebarCsrd,
    hide: !global.isGlobalAdmin,
  },
];
</script>

<style>
.less-padding > .p-panelmenu-panel {
  margin-bottom: 0 !important;
  border: none;
}

.sidebar-toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  font-size: 20px;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  padding: 5px;
  font-size: 25px;
  font-weight: 600;
  margin-left: 10px;
}

.sidebar-menu li a {
  color: var(--primary-color);
}

.active-route .sidebar-item-custom {
  font-weight: 800;
}

.active-route .button-custom {
  border: 2px solid #888888;
}
</style>
