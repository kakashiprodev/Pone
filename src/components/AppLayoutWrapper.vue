<template>
    <AppLayout>
        <template #logo>
            <img src="./../assets/logo-transparent.webp" class="cursor-pointer" @click="router.push({ name: 'home' })"
                style="height: 40px;">
        </template>

        <template #center>
            <ul class="list-none">
                <li style="float: left;" class="ml-5">
                    <router-link to="/actions">
                        <i class="fa-solid fa-list-check text-800"></i>
                        <span class="ml-2 text-500">Maßnahmen</span>
                    </router-link>
                </li>
                <li style="float: left;" class="ml-5">
                    <router-link to="/report-config">
                        <i class="fa-solid fa-building text-800"></i>
                        <span class="ml-2 text-500">Berichtsdaten {{ global.selectedReport?.year }}</span>
                    </router-link>
                </li>
                <li style="float: left;" class="ml-5">
                    <div class="flex align-content-start flex-wrap">
                        <InputSwitch class="flex align-items-center justify-content-center mt-1"
                            v-model="global.showTooltips" />
                        <span class="ml-2 text-600">Zeige Hilfe</span>
                    </div>
                </li>
            </ul>
        </template>

        <template #sidebar>
            <ul class="mt-5 list-none text-900 sidebar-menu" v-if="global.isLoggedIn">
                <template v-for="(item) in sidebarItems">
                    <li v-if="item.visible" class="mb-3">
                        <router-link :to="item.to ?? ''" :exact-active-class="'active-route'">
                            <i :class="item.icon"></i>
                        </router-link>
                    </li>
                </template>
            </ul>
        </template>

        <template #submenu>
            <ul class="list-none m-0 p-0">
                <li>
                    <a href="/#/project-config"
                        class="text-800 flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                        <i class="fa-solid fa-people-group mr-3"></i>
                        <span>Projekte verwalten</span>
                    </a>
                    <a href="/#/equivalents"
                        class="text-800 flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                        <i class="fa-solid fa-list mr-3"></i>
                        <span>Äquivalente verwalten</span>
                    </a>
                    <a href="/#/user"
                        class="text-800 flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                        <i class="fa-solid fa-user mr-3"></i>
                        <span>Benutzerprofil</span>
                    </a>
                    <a @click="logout()"
                        class="text-800 flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
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
import { useGlobalStore } from "./../stores/global";
import { useRouter } from 'vue-router';
import InputSwitch from 'primevue/inputswitch';
import dataprovider from './../services/dataprovider';

const router = useRouter();
const global = useGlobalStore();

const sidebarItems = [
    {
        label: 'Dashboard',
        icon: 'fa-solid fa-chart-line',
        to: '/dashboard',
        visible: true,
    },
    {
        label: 'Scope 1',
        icon: 'fa-solid fa-1',
        to: '/inputs/scope/1',
        visible: true,
    },
    {
        label: 'Scope 2',
        icon: 'fa-solid fa-2',
        to: '/inputs/scope/2',
        visible: true,
    },
    {
        label: 'Scope 3',
        icon: 'fa-solid fa-3',
        to: '/inputs/scope/3',
        visible: true,
    },
    {
        label: 'Gesamtübersicht',
        icon: 'fa-solid fa-list',
        to: '/inputs',
        visible: true,
    },
    {
        label: 'Anlagen',
        icon: 'fa-solid fa-industry',
        to: '/facilities',
        visible: true,
    },
    {
        label: "Assistent",
        icon: "fa-solid fa-magic",
        to: "/assistant",
        visible: true,
    }
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
    color: black;
}
</style>