<template>
  <Card v-if="query">
    <template #subtitle> Query </template>
    <template #content>
      <pre>
        {{ JSON.stringify(query, null, 2) }}
      </pre>
    </template>
  </Card>
  <Card v-if="result">
    <template #subtitle> Result </template>
    <template #content>
      <pre>
        {{ JSON.stringify(result, null, 2) }}
      </pre>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import { defineProps } from 'vue';

defineProps({
  query: {
    type: Object,
    required: false,
  },
  result: {
    type: Object,
    required: false,
  },
});
</script>
