<template>
  <AppLayout>
    <template #logo>
      <img
        src="./../assets/logo-transparent_part.png"
        class="cursor-pointer"
        @click="router.push({ name: 'home' })"
        style="height: 50px"
      />
    </template>

    <template #center>
      <ul class="list-none no-underline text-color flex align-items-center">
        <li style="float: left">
          <router-link to="/report-config" :exact-active-class="'active-route'">
            <Button
              severity="secondary"
              icon="fa-solid fa-building"
              :label="'Berichtsdaten ' + global.selectedReport?.year"
              class="button-custom"
            />
          </router-link>
        </li>

        <li style="float: left">
          <router-link to="/actions" :exact-active-class="'active-route'">
            <Button
              severity="secondary"
              icon="fa-solid fa-list-check"
              label="Maßnahmen "
              class="button-custom ml-2"
            />
          </router-link>
        </li>

        <li style="float: left" class="ml-4">
          <div class="flex flex-wrap">
            <InputSwitch
              class="flex align-items-center justify-content-center"
              v-model="global.showTooltips"
            />
            <span class="ml-2 text-600"> Zeige Hilfe </span>
          </div>
        </li>
      </ul>
    </template>

    <template #sidebar>
      <PanelMenu :model="sidebarItems" class="w-1/5">
        <template #item="{ item }">
          <router-link
            class="flex align-items-center px-3 py-2 cursor-pointer no-underline text-color"
            :to="item.to ?? ''"
            :exact-active-class="'active-route'"
          >
            <span :class="[item.icon, 'text-primary', 'sidebar-item-custom']" />
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
    </template>

    <template #submenu>
      <ul class="list-none m-0 p-0">
        <li>
          <a
            href="/#/project-config"
            class="text-800 flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer"
          >
            <i class="fa-solid fa-people-group mr-3"></i>
            <span>Projekte verwalten</span>
          </a>
          <a
            href="/#/equivalents"
            class="text-800 flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer"
          >
            <i class="fa-solid fa-list mr-3"></i>
            <span>Äquivalente verwalten</span>
          </a>
          <a
            href="/#/user"
            class="text-800 flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer"
          >
            <i class="fa-solid fa-user mr-3"></i>
            <span>Benutzerprofil</span>
          </a>
          <a
            @click="logout()"
            class="text-800 flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer"
          >
            <i class="fa-solid fa-right-from-bracket mr-3"></i>
            <span>Ausloggen</span>
          </a>
        </li>
      </ul>
    </template>

    <template #content>
      <router-view />
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from './AppLayout.vue';
import { useGlobalStore } from './../stores/global';
import { useRouter } from 'vue-router';
import InputSwitch from 'primevue/inputswitch';
import dataprovider from './../services/dataprovider';
import PanelMenu from 'primevue/panelmenu';
import Button from 'primevue/button';

const router = useRouter();
const global = useGlobalStore();

const sidebarItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'fa-solid fa-chart-line',
    to: '/dashboard',
    visible: true,
  },
  {
    key: 'scope-1',
    label: 'Scope 1',
    icon: 'fa-solid fa-1',
    to: '/inputs/scope/1',
    visible: true,
  },
  {
    key: 'scope-2',
    label: 'Scope 2',
    icon: 'fa-solid fa-2',
    to: '/inputs/scope/2',
    visible: true,
  },
  {
    key: 'scope-3',
    label: 'Scope 3',
    icon: 'fa-solid fa-3',
    to: '/inputs/scope/3',
    visible: true,
  },
  {
    key: 'overview',
    label: 'Gesamtübersicht',
    icon: 'fa-solid fa-list',
    to: '/inputs',
    visible: true,
  },
  {
    key: 'actions',
    label: 'Anlagen',
    icon: 'fa-solid fa-industry',
    to: '/facilities',
    visible: true,
  },
  {
    key: 'assistant',
    label: 'Assistent',
    icon: 'fa-solid fa-magic',
    to: '/assistant',
    visible: true,
  },
  {
    key: 'settings',
    label: 'Einstellungen',
    icon: 'fa-solid fa-gear',
    to: '/settings',
    visible: true,
  },
  // {
  //     label: 'Flottenverbrauch',
  //     icon: 'fa-solid fa-gas-pump',
  //     to: '/inputPerCategory/mobility',
  //     visible: true,
  // },
  // {
  //     label: 'Direkte Verbrennung',
  //     icon: 'fa-solid fa-fire',
  //     to: '/inputPerCategory/combustion',
  //     visible: true,
  // },
  // {
  //     label: 'Raumheizung',
  //     icon: 'fa-solid fa-fire-flame-curved',
  //     to: '/inputPerCategory/room-heating',
  //     visible: true,
  // },
  // {
  //     label: 'Kühlmittelverlust und Isoliergase',
  //     icon: 'fa-solid fa-cloud',
  //     to: '/inputPerCategory/insulating-gases',
  //     visible: true,
  // },
  // {
  //     label: 'Äquivalente',
  //     icon: 'fa-solid fa-hashtag',
  //     to: '/equivalents',
  //     visible: true,
  // },
];

const logout = async () => {
  await dataprovider.logout();
  router.push('/login');
};
</script>

<style scoped>
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
