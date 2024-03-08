<template>
  <!-- ZEILE -->
  <HorizontalTwoColLayout>
    <template #left>
      <ReportHeader />
    </template>
    <template #right>
      <ApexSumChartWrapper
        label="CO2 Emissionen, aufgeteilt nach Scope"
        v-if="sumGroupedByScope"
        type="donut"
        :data="sumGroupedByScope"
      />
    </template>
  </HorizontalTwoColLayout>
  <ReportSpacer />

  <!-- ZEILE -->
  <HorizontalOneColLayout>
    <ScopeDescription scope="all" />
  </HorizontalOneColLayout>
  <ReportSpacer />

  <div style="overflow-x: scroll; width: 100%" v-if="false">
    <Timeline
      layout="horizontal"
      :align="'top'"
      :value="[
        {
          year: 2019,
          status: 'Gesamt: 1000t',
        },
        {
          year: 2020,
          status: 'Gesamt: 1000t',
        },
      ]"
    >
      <template #opposite="{ item }">
        <small class="p-text-secondary">{{ item.year }}</small>
      </template>
      <template #content="{ item }">
        <div
          style="
            height: 180px;
            width: 150px;
            padding: 5px;
            display: block;
            background-color: aqua;
          "
        >
          {{ item.status }}
        </div>
      </template>
    </Timeline>
  </div>

  <!-- ZEILE -->
  <HorizontalOneColLayout>
    <TextBarList
      v-if="yearlyList"
      label="Mengen der letzten Berichtsjahre"
      :data="yearlyList"
      :show-status-column="false"
      :header="['Jahr', 'Status', 'Menge']"
      :use-maximum-as-reference="true"
    />
  </HorizontalOneColLayout>
  <ReportSpacer />

  <!-- ZEILE -->
  <HorizontalOneColLayout>
    <ApexSumChartWrapper
      v-if="sumGroupedByCategory"
      type="radar"
      :data="sumGroupedByCategory"
    />
  </HorizontalOneColLayout>
  <ReportSpacer />

  <!-- ZEILE -->
  <HorizontalTwoColLayout>
    <template #left>
      <ApexGroupedChartWrapper
        v-if="sumGroupedByScopeAndYear != null"
        label="CO2 Emissionen, aufgeteilt nach Scope und Jahr"
        :data="sumGroupedByScopeAndYear"
        :horizontal="true"
        :stacked="true"
        type="bar"
      />
    </template>
    <template #right>
      <ApexTreemapWrapper
        v-if="sumGroupedByScope"
        label="CO2 Emissionen, aktueller Berichtszeitraum"
        :data="sumGroupedByScope"
      />
    </template>
  </HorizontalTwoColLayout>
  <ReportSpacer />
</template>

<script setup lang="ts">
import { PropType, Ref, onMounted, ref } from 'vue';
import { useGlobalStore } from '../../../stores/global';
import HorizontalTwoColLayout from './HorizontalTwoColLayout.vue';
import {
  getGroupedReportData,
  getYearlyGroupedReportData,
  AggregatedReportResult,
  AggregatedReportResultYearlyGrouped,
  ReportTimeseriesQuery,
} from '../../../services/reporting/index';
import ApexSumChartWrapper from '../plot/apex/ApexSumChartWrapper.vue';
import ReportHeader from './ReportHeader.vue';
import ScopeDescription from './ScopeDescription.vue';
import ApexGroupedChartWrapper from '../plot/apex/ApexGroupedChartWrapper.vue';
import ReportSpacer from './ReportSpacer.vue';
import TextBarList from '../plot/custom/TextBarList.vue';
import ApexTreemapWrapper from '../plot/apex/ApexTreemapWrapper.vue';
import Timeline from 'primevue/timeline';
import HorizontalOneColLayout from './HorizontalOneColLayout.vue';
import Config from '../../../config';
// import { error } from '../../services/toast';

const global = useGlobalStore();

// ------------------- FILTER -------------------
const props = defineProps({
  sites: {
    type: Object as PropType<string[]>,
    required: true,
  },
});
// const availableScopes = [
//   { label: 'Scope 1', value: 1 },
//   { label: 'Scope 2', value: 2 },
//   { label: 'Scope 3', value: 3 },
// ];
const selectedScopes = ref<number[]>([]);
// years. the last year and the past 5 years before
const availableYears: number[] = [];
const lastYear = new Date().getFullYear() - 1;
for (let i = 0; i < 5; i++) {
  availableYears.push(lastYear - i);
}
// const selectedYears = ref<number[]>([lastYear]);

// get all necessary data
const sumGroupedByScope = ref<AggregatedReportResult | null>(null);
const sumGroupedByScopeAndYear =
  ref<AggregatedReportResultYearlyGrouped | null>(null);
const sumGroupedByCategory = ref<AggregatedReportResult | null>(null);
const yearlyList: Ref<{ name: string; value: number; status: boolean }[]> = ref(
  [],
);

/**
 * Get the data for the report
 */
const getData = async () => {
  // get the data
  sumGroupedByScope.value = await getGroupedReportData(
    <ReportTimeseriesQuery>{
      projectId: global.selectedProject?.id || '',
      siteIds: props.sites,
      years: [global.selectedReport?.year ?? -1],
      filter: {
        scope:
          selectedScopes.value.length > 0 ? selectedScopes.value : undefined,
      },
    },
    'scope',
  );

  sumGroupedByScopeAndYear.value = await getYearlyGroupedReportData(
    <ReportTimeseriesQuery>{
      projectId: global.selectedProject?.id || '',
      siteIds: props.sites,
      years: availableYears,
      filter: {
        scope:
          selectedScopes.value.length > 0 ? selectedScopes.value : undefined,
      },
    },
    'scope',
  );

  // map each stat value per year to one data array
  const d = [];
  const reportYear = global.selectedReport?.year || -1;
  for (const key in Object.keys(sumGroupedByScopeAndYear.value.yearlyGrouped)) {
    const year = Object.keys(sumGroupedByScopeAndYear.value.yearlyGrouped)[key];
    const yearAsNumber = parseInt(year);
    let color = Config.colors.data2;
    if (yearAsNumber === reportYear) {
      color = Config.colors.data6;
    } else if (yearAsNumber > reportYear) {
      color = Config.colors.typo;
    }
    d.push({
      name: year + '',
      value: sumGroupedByScopeAndYear.value.yearlyGrouped[year].stat.sum,
      status: true,
      color,
    });
  }
  yearlyList.value = d;

  sumGroupedByCategory.value = await getGroupedReportData(
    <ReportTimeseriesQuery>{
      projectId: global.selectedProject?.id || '',
      siteIds: props.sites,
      years: availableYears,
      filter: {
        scope:
          selectedScopes.value.length > 0 ? selectedScopes.value : undefined,
      },
    },
    'category',
  );
};

onMounted(() => {
  getData();
});
</script>

<style scoped>
.report {
  width: 90%;
  margin: 0 auto;
  margin-top: 2rem;
}
</style>
