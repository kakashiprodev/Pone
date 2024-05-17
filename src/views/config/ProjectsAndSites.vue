<template>
  <h2>Unternehmen</h2>
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
import SiteDefinition from '../../components/project/SiteDefinition.vue';
import ProjectDefinition from '../../components/project/ProjectDefinition.vue';
</script>
