<script setup>
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
        icon: 'fa-solid fa-pen',
        to: '/inputs',
    },
    {
        label: 'Scope 1',
        icon: 'fa-solid fa-bolt',
        to: '/scope1',
    },
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <AppMenuItem :item="item" root :index="i" />

            <li class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
