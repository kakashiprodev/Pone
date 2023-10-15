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
    },
    {
        label: 'Gesamtübersicht',
        icon: 'fa-solid fa-list',
        to: '/inputs',
    },
    {
        label: 'Scope 1',
        icon: 'fa-solid fa-1',
        to: '/scope1',
    },
    {
        label: 'Scope 2',
        icon: 'fa-solid fa-2',
        to: '/scope1',
    },
    {
        label: 'Scope 3',
        icon: 'fa-solid fa-3',
        to: '/scope1',
    },
]);
</script>