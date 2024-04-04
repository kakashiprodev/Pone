<template>
  <!-- ZEILE -->
  <HorizontalTwoColLayout>
    <template #left>
      <ScopeDescription :scope="props.scope + ''" />
    </template>
    <template #right>
      <div class="report-chart-wrapper">
        <ApexSumChartWrapper
          label="CO&#8322; Emissionen, aufgeteilt nach Scope"
          v-if="sumGroupedByCategory"
          type="donut"
          :data="sumGroupedByCategory"
        />
      </div>
    </template>
  </HorizontalTwoColLayout>
  <ReportSpacer />

  <!-- ZEILE -->
  <HorizontalOneColLayout>
    <ApexSumChartWrapper
      label="CO&#8322; Emissionen, aufgeteilt nach Kategorie"
      v-if="sumGroupedByCategory"
      type="radar"
      :data="sumGroupedByCategory"
    />
  </HorizontalOneColLayout>

  <!-- ZEILE -->
  <HorizontalOneColLayout>
    <TextBarList
      label="CO&#8322; Emissionen, aufgeteilt nach Anlage"
      :data="facilityList"
      :header="['Anlagenname', 'Aktiv/Inaktiv', 'CO&#8322; Emissionen']"
      :use-maximum-as-reference="true"
    />
  </HorizontalOneColLayout>
  <ReportSpacer />

  <!-- ZEILE -->
  <HorizontalTwoColLayout>
    <template #left>
      <ApexTreemapWrapper
        v-if="sumGroupedByFacility"
        label="CO&#8322; Emissionen, aufgeteilt nach Anlage"
        :data="sumGroupedByFacility"
      />
    </template>
    <template #right>
      <ApexTreemapWrapper
        v-if="sumGroupedByCategory"
        label="CO&#8322; Emissionen, aufgeteilt nach Kategorie"
        :data="sumGroupedByCategory"
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
  AggregatedReportResult,
  ReportTimeseriesQuery,
} from '../../../services/reporting/index';
import ApexSumChartWrapper from '../plot/apex/ApexSumChartWrapper.vue';
import ScopeDescription from './ScopeDescription.vue';
import ReportSpacer from './ReportSpacer.vue';
import TextBarList from '../plot/custom/TextBarList.vue';
import ApexTreemapWrapper from '../plot/apex/ApexTreemapWrapper.vue';
import HorizontalOneColLayout from './HorizontalOneColLayout.vue';
// import { error } from '../../services/toast';

const global = useGlobalStore();

// ------------------- FILTER -------------------
const props = defineProps({
  sites: {
    type: Object as PropType<string[]>,
    required: true,
  },
  scope: {
    type: Number as PropType<number>,
    required: true,
  },
});

// data variables
const sumGroupedByCategory = ref<AggregatedReportResult | null>(null);
const sumGroupedByFacility = ref<AggregatedReportResult | null>(null);
const facilityList: Ref<{ name: string; value: number; status: boolean }[]> =
  ref([]);

/**
 * Get the data for the report
 */
const getData = async () => {
  // get the data
  sumGroupedByCategory.value = await getGroupedReportData(
    <ReportTimeseriesQuery>{
      projectId: global.selectedProject?.id || '',
      siteIds: props.sites,
      years: [global.selectedReport?.year ?? -1],
      filter: {
        scope: [props.scope],
      },
    },
    'category',
  );

  sumGroupedByFacility.value = await getGroupedReportData(
    <ReportTimeseriesQuery>{
      projectId: global.selectedProject?.id || '',
      siteIds: props.sites,
      years: [global.selectedReport?.year ?? -1],
      filter: {
        scope: [props.scope],
      },
    },
    'facility',
  );

  // get the list
  const d = [];
  for (const category in sumGroupedByFacility.value.timeseries) {
    if (sumGroupedByFacility.value != null) {
      const item = sumGroupedByFacility.value.timeseries[category];
      // get sum of all entries in i
      let sum = 0;
      for (let j = 0; j < item.length; j++) {
        sum += item[j].sum;
      }
      d.push({
        name: category,
        value: sum,
        status: true,
      });
    }
  }
  facilityList.value = d;
};

onMounted(() => {
  getData();
});
</script>

<style scoped lang="scss">
.report-chart-wrapper {
  min-height: 18rem; // prevents jumping of height

  @media (min-width: 1600px) {
    min-height: 25rem;
  }

  @media (min-width: 1920px) {
    min-height: 32rem;
  }
}
</style>
