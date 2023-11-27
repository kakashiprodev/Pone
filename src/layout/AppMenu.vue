<template>
    <ul class="layout-menu mt-5" v-if="global.isLoggedIn">
        <template v-for="(item, i) in model" :key="item">
            <AppMenuItem :item="item" root :index="i" />

            <li class="menu-separator"></li>
        </template>
    </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
import { useGlobalStore } from './../stores/global';
const global = useGlobalStore();

const model = ref([
    {
        label: 'Dashboard',
        icon: 'fa-solid fa-chart-line',
        to: '/dashboard',
        visible: true,
    },
    // {
    //     label: 'Scope 1',
    //     icon: 'fa-solid fa-1',
    //     to: '/inputs/scope1',
    //     visible: true,
    // },
    // {
    //     label: 'Scope 2',
    //     icon: 'fa-solid fa-2',
    //     to: '/inputs/scope2',
    //     visible: true,
    // },
    // {
    //     label: 'Scope 3',
    //     icon: 'fa-solid fa-3',
    //     to: '/inputs/scope3',
    //     visible: true,
    // },
    {
        label: 'Gesamtübersicht',
        icon: 'fa-solid fa-list',
        to: '/inputs',
        visible: true,
    },
    {
        label: 'Flottenverbrauch',
        icon: 'fa-solid fa-gas-pump',
        to: '/inputPerCategory/mobility',
        visible: true,
    },
    {
        label: 'Direkte Verbrennung',
        icon: 'fa-solid fa-fire',
        to: '/inputPerCategory/combustion',
        visible: true,
    },
    {
        label: 'Raumheizung',
        icon: 'fa-solid fa-fire-flame-curved',
        to: '/inputPerCategory/room-heating',
        visible: true,
    },
    {
        label: 'Kühlmittelverlust und Isoliergase',
        icon: 'fa-solid fa-cloud',
        to: '/inputPerCategory/insulating-gases',
        visible: true,
    },
    // {
    //     label: 'Äquivalente',
    //     icon: 'fa-solid fa-hashtag',
    //     to: '/equivalents',
    //     visible: true,
    // },
]);
</script>