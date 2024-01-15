<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, watch, Ref } from 'vue';

const route = useRoute();
const home = { icon: 'pi pi-home', to: '/' };
const breadcrumbRoutes: Ref<any> = ref([]);

const setBreadcrumbRoutes = () => {
    if (route.meta.breadcrumb) {
        breadcrumbRoutes.value = route.meta.breadcrumb;

        return;
    }

    breadcrumbRoutes.value = route.fullPath
        .split('/')
        .filter((item) => item !== '')
        .filter((item) => isNaN(Number(item)))
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1));
};

watch(
    route,
    () => {
        setBreadcrumbRoutes();
    },
    { immediate: true }
);
</script>

<template>
    <nav class="layout-breadcrumb">
        <ol>
            <li>
                <router-link :to="home.to" style="color: inherit">
                    <i :class="home.icon"></i>
                </router-link>
            </li>
            <li class="layout-breadcrumb-chevron">/</li>
            <template v-for="(breadcrumbRoute, i) in breadcrumbRoutes" :key="breadcrumbRoute">
                <li>{{ breadcrumbRoute }}</li>
                <li v-if="i !== breadcrumbRoutes.length - 1" class="layout-breadcrumb-chevron">/</li>
            </template>
        </ol>
    </nav>
</template>
