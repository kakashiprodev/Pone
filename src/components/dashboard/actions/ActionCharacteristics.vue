<template>
  <h4>
    {{ action.name }}
  </h4>
  <p>
    Ist-Zustand:
    <span v-html="action.descriptionBefore"></span>
  </p>
  <p>
    Soll-Zustand:
    <span v-html="action.descriptionAfter"></span>
  </p>
  <p>
    Geplante Einsparung:
    {{ action.targetValueAbsolutPlanned }} kg-CO2/Jahr
  </p>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { ActionEntry } from '../../../services/types';

defineProps({
  action: {
    type: Object as PropType<ActionEntry>,
    required: true,
  },
});
</script>
