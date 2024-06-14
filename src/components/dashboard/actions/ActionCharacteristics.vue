<template>
  <div class="action-characteristics">
    <Panel :header="$t('actions.charTable.is')" class="mb-3" toggleable>
      <span v-html="action.description_before"></span>
    </Panel>
    <Panel :header="$t('actions.charTable.should')" toggleable class="mb-3">
      <span v-html="action.description_after"></span>
    </Panel>
    <Panel :header="$t('actions.charTable.targetValuePlanned')" class="mb-3">
      {{ action.targetValueAbsolut_planned }} kg-CO<sub>2</sub>/Jahr
    </Panel>
    <Panel :header="$t('actions.charTable.targetValueIs')" class="mb-3">
      {{ action.target_value_absolut_is }} kg-CO<sub>2</sub>/{{
        $t('actions.charTable.year')
      }}
    </Panel>
    <Panel
      :header="$t('actions.charTable.targetValues')"
      class="mb-3"
      toggleable
    >
      <span v-html="action.descriptionTargetValue"></span>
    </Panel>
    <Panel :header="$t('actions.charTable.responsible')" class="mb-3">
      <span v-html="action.responsible"></span>
    </Panel>
    <Panel :header="$t('actions.charTable.status')" class="mb-3">
      {{ getStatusTranslation(action.status) }}
    </Panel>
    <Panel :header="$t('actions.charTable.progress')" class="mb-3">
      <ProgressBar :value="action.progress" />
    </Panel>
    <Panel :header="$t('actions.charTable.finishedUntilPlanned')" class="mb-3">
      {{ toReadableDate(action.finished_until_planned) }}
    </Panel>
    <Panel :header="$t('actions.charTable.finishedUntilIs')" class="mb-3">
      {{ toReadableDate(action.finished_until_is) }}
    </Panel>
    <Panel :header="$t('actions.charTable.category')" class="mb-3">
      {{ action.category }}
    </Panel>
    <Panel :header="$t('actions.charTable.costsPlanned')" class="mb-3">
      {{ action.costs_planned.toLocaleString() }}
    </Panel>
    <Panel :header="$t('actions.charTable.costsIs')" class="mb-3">
      {{ action.costs_is.toLocaleString() }}
    </Panel>
    <Panel :header="$t('actions.charTable.roi')" class="mb-3">
      {{ action.roi }}
    </Panel>
    <Panel
      :header="$t('actions.charTable.description_costs')"
      class="mb-3"
      toggleable
    >
      <span v-html="action.descriptionCosts.toLocaleString()"></span>
    </Panel>
    <Panel :header="$t('actions.charTable.avoidance_costs')" class="mb-3">
      {{ action.avoidanceCosts.toLocaleString() }}
    </Panel>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { ActionEntry } from '../../../services/types.ts';
import statusTranslations from '../../../services/statusTranslations.ts';
import { toReadableDate } from '../../../services/pipes';

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
