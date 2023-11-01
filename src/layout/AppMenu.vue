<template>
    <ul class="layout-menu mt-5">
        <template v-for="(item, i) in model" :key="item">
            <AppMenuItem :item="item" root :index="i" />

            <li class="menu-separator"></li>
        </template>
    </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

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
        label: 'Kühlmittelverlust und Isoliergase',
        icon: 'fa-solid fa-cloud',
        to: '/inputPerCategory/gases',
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