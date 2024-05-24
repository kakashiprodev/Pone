<template>
  <Card>
    <template #header>
      <div class="psm-report-header">
        <h3>Geplante Maßnahmen</h3>
      </div>
    </template>
    <template #content>
      <Dialog
        :header="`Steckbrief ${selectedAction?.name}`"
        v-model:visible="actionCharacteristicsVisible"
        class="action-overview__dialog"
      >
        <ActionCharacteristics v-if="selectedAction" :action="selectedAction" />
      </Dialog>

      <template v-if="Object.keys(categorySumDict).length > 0">
        <div class="flex">
          <ApexGaugeWrapper
            v-for="cat in Object.keys(categorySumDict)"
            :key="cat"
            :label="cat"
            :data="Math.round(categorySumDict[cat].precentagePart)"
            unit="%"
          />
        </div>
      </template>

      <DataTable :value="actions" class="mt-5" :showGridlines="false">
        <Column header="Jahr">
          <template #body="{ data }">
            <span class="flex justify-end text-right font-bold">
              <span
                v-if="
                  data.finished_until_is != null && data.finished_until_is != ''
                "
              >
                {{ dateToYear(data.finished_until_is) }}
              </span>
              <span v-else>
                {{ dateToYear(data.finished_until_planned) }}
              </span>
            </span>
          </template>
        </Column>
        <Column field="name" header="Name"></Column>
        <Column header="Beschreibung (Ziel)">
          <template #body="{ data }">
            <div class="flex content-center flex-wrap">
              <span
                v-html="data.description_target_value"
                style="cursor: pointer"
                class="hover:text-blue-500"
                @click="
                  selectedAction = data;
                  actionCharacteristicsVisible = true;
                "
              ></span>
            </div>
          </template>
        </Column>
        <Column field="category" header="Kategorie"></Column>
        <Column header="Status">
          <template #body="{ data }">
            <ProgressBarWithTarget
              v-if="data.progress < 100"
              color="grey"
              :value="data.target_value_planned"
              :targetValue="data.target_value_planned"
            >
            </ProgressBarWithTarget>

            <ProgressBarWithTarget
              v-else
              :color="Config.colors.data2"
              :value="data.target_value_is"
              :targetValue="data.target_value_is"
            >
            </ProgressBarWithTarget>
          </template>
        </Column>
        <Column header="Menge">
          <template #body="{ data }">
            <span class="flex justify-end text-right">
              <nobr v-if="data.progress < 100">
                {{ toTons(data.target_value_absolut_planned).toLocaleString() }}
                to
              </nobr>
              <nobr v-else>
                {{ toTons(data.target_value_absolut_is) }}/{{
                  toTons(data.target_value_absolut_planned)
                }}
                to
              </nobr>
            </span>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>

  <Card>
    <template #header>
      <div class="psm-report-header">
        <h3>Roadmap</h3>
      </div>
    </template>
    <template #content>
      <action-dumbbell-chart-wrapper v-if="actions.length" :actions="actions" />
    </template>
  </Card>
</template>

<script setup lang="ts">
import dataprovider from '../../../services/dataprovider';
import { ref, Ref, onMounted } from 'vue';
import { ActionEntry, ActionWithPercentage } from '../../../services/types';
import { useGlobalStore } from '../../../stores/global';
import { dateToYear, toTons } from '../../../services/pipes/index';
import ProgressBarWithTarget from '../../dashboard/plot/custom/ProgressBarWithTarget.vue';
import ActionCharacteristics from './ActionCharacteristics.vue';
import ApexGaugeWrapper from '../../dashboard/plot/apex/ApexGaugeWrapper.vue';
import ActionDumbbellChartWrapper from './ActionDumbbellChartWrapper.vue';
import Config from '../../../config';

/*
// table "actions"
export interface ActionEntry {
  id: string;

  // PM
  responsible: string;
  status: 'open' | 'inProgress' | 'finished' | 'canceled';
  progress: number; // 0-100

  relevant: boolean; // if false the action is not used in the calculation
  site: string; // reference on table sites
  name: string; // normal text

  descriptionBefore: string; // rich text
  descriptionAfter: string; // rich text

  targetValueAbsolutPlanned: number; // planned target value to save
  targetValueAbsolutIs: number; // actual target value to save
  descriptionTargetValue: string; // rich text

  finishedUntilPlanned: string | Date | null; // date
  finishedUntilIs: string | Date | null; // date

  category: string;

  costsPlanned: number;
  costsIs: number;
  roi: number; // return of investment
  descriptionCosts: string; // description of costs
  avoidanceCosts: number; // de="vermeidungskosten"
}
*/
const global = useGlobalStore();
const actionCharacteristicsVisible = ref(false);
const selectedAction = ref<ActionEntry | null>(null);

interface ActionCategorySumDict {
  [key: string]: {
    sumAbsolute: number; // if entry is not finished then the planned value is used
    precentagePart: number;
  };
}

const actions: Ref<ActionWithPercentage[]> = ref([]);
const categorySumDict: Ref<ActionCategorySumDict> = ref({});

const getData = async () => {
  try {
    if (!global.selectedReport) {
      console.error('No report selected');
      return;
    }
    const acts = await dataprovider.readActions();
    // order by date. if "finishedUntilIs" is null or empty then use "finishedUntilPlanned"
    // both can be string, Date or null or ""
    acts.sort((a, b) => {
      const aDate = a.finished_until_is ?? a.finished_until_planned;
      const bDate = b.finished_until_is ?? b.finished_until_planned;
      if (aDate == null || aDate === '') {
        return 1;
      }
      if (bDate == null || bDate === '') {
        return -1;
      }
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });

    // calulate sum of all planned target values
    const sumPlanned = acts.reduce(
      (acc, act) => acc + (act.target_value_absolut_planned ?? 0),
      0,
    );
    // calulate sum of all actual target values
    const sumIs = acts.reduce(
      (acc, act) => acc + (act.target_value_absolut_is ?? 0),
      0,
    );
    const biggerValue = sumPlanned > sumIs ? sumPlanned : sumIs;

    // add a precentage value to each action for planned and actual target value
    // also group all entries by category and creat a dictionary with the sum of all planned and actual target values
    const actsWithPercentage: ActionWithPercentage[] = acts.map((act) => {
      const plannedPercentage =
        (act.target_value_absolut_planned / biggerValue) * 100;
      const isPercentage = (act.target_value_absolut_is / biggerValue) * 100;

      // add the planned and actual target value to the category dictionary
      if (categorySumDict.value[act.category]) {
        categorySumDict.value[act.category].sumAbsolute +=
          act.progress < 100
            ? act.target_value_absolut_planned
            : act.target_value_absolut_is;
      } else {
        categorySumDict.value[act.category] = {
          sumAbsolute:
            act.progress < 100
              ? act.target_value_absolut_planned
              : act.target_value_absolut_is,
          precentagePart: 0,
        };
      }

      return {
        ...act,
        target_value_planned: plannedPercentage,
        // relation between the target value ant the real value
        target_value_is: isPercentage,
      };
    });
    // console.log('actsWithPercentage', actsWithPercentage);

    // calculate the percentage part of each category.
    const sum = Object.values(categorySumDict.value).reduce(
      (acc, cat) => acc + cat.sumAbsolute,
      0,
    );
    for (const key in categorySumDict.value) {
      categorySumDict.value[key].precentagePart =
        (categorySumDict.value[key].sumAbsolute / sum) * 100;
    }

    actions.value = actsWithPercentage;
  } catch (e) {
    console.error(e);
  }
};
onMounted(async () => {
  while (global.isLoading) {
    console.log('waiting for global store to load');
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  await getData();
});
</script>

<style lang="scss">
.action-overview {
  &__dialog {
    width: 95%;
    max-width: 80rem;
  }
}
.p-dialog-title {
  color: var(--primary-color);
}
</style>
