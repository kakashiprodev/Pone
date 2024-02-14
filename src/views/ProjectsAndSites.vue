<template>
    <h2>Projekte (/Unternehmen)</h2>
    <Card>
        <template #content>
            <ProjectDefinition />
        </template>
    </Card>
    <h2>Standorte</h2>
    <Card class="mt-2">
        <template #content>
            <SiteDefinition />
        </template>
    </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import SiteDefinition from '../components/SiteDefinition.vue';
import ProjectDefinition from '../components/ProjectDefinition.vue';
</script>