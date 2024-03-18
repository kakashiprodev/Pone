<template>
  <div class="action-characteristics">
    <Panel header="Ist-Zustand" class="mb-3" toggleable>
      <span v-html="action.descriptionBefore"></span>
    </Panel>
    <Panel header="Soll-Zustand" toggleable class="mb-3">
      <span v-html="action.descriptionAfter"></span>
    </Panel>
    <Panel header="Geplante Einsparung" class="mb-3">
      {{ action.targetValueAbsolutPlanned }} kg-CO<sub>2</sub>/Jahr
    </Panel>
    <Panel header="Tatsächliche Einsparung" class="mb-3">
      {{ action.targetValueAbsolutIs }} kg-CO<sub>2</sub>/Jahr
    </Panel>
    <Panel header="Zielwerte" class="mb-3" toggleable>
      <span v-html="action.descriptionTargetValue"></span>
    </Panel>
    <Panel header="Verantwortlich" class="mb-3">
      <span v-html="action.responsible"></span>
    </Panel>
    <Panel header="Status" class="mb-3">
      {{ getStatusTranslation(action.status) }}
    </Panel>
    <Panel header="Fortschritt" class="mb-3">
      <ProgressBar :value="action.progress" />
    </Panel>
    <Panel header="Geplantes Fertigstellungsdatum" class="mb-3">
      {{ action.finishedUntilPlanned?.toLocaleDateString() }}
    </Panel>
    <Panel header="Tatsächliches Fertigstellungsdatum" class="mb-3">
      {{ action.finishedUntilIs?.toLocaleDateString() }}
    </Panel>
    <Panel header="Kategorie" class="mb-3">
      {{ action.category }}
    </Panel>
    <Panel header="Geplante Kosten" class="mb-3">
      {{ action.costsPlanned.toLocaleString() }}
    </Panel>
    <Panel header="Tatsächliche Kosten" class="mb-3">
      {{ action.costsIs.toLocaleString() }}
    </Panel>
    <Panel header="ROI (return on Investment" class="mb-3">
      {{ action.roi }}
    </Panel>
    <Panel header="Beschreibung der Kosten" class="mb-3" toggleable>
      <span v-html="action.descriptionCosts.toLocaleString()"></span>
    </Panel>
    <Panel header="Vermeidungskosten" class="mb-3">
      {{ action.avoidanceCosts.toLocaleString() }}
    </Panel>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { ActionEntry } from '../../../services/types.ts';
import statusTranslations from '../../../services/statusTranslations.ts';

defineProps({
  action: {
    type: Object as PropType<ActionEntry>,
    required: true,
  },
});

// provide the status translation for the template
const getStatusTranslation = (status: string) => {
  return statusTranslations[status as keyof typeof statusTranslations];
};
</script>
