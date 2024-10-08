<template>
  <!-- ZEILE -->
  <HorizontalTwoColLayout>
    <template #left>
      <ScopeDescription :scope="props.scope + ''" />
    </template>
    <template #right>
      <Card>
        <template #header>
          <div class="psm-report-header">
            <h3 v-html="$t('report.sumScope.headingCategory')" />
          </div>
        </template>
        <template #content>
          <div
            class="report-chart-wrapper"
            v-if="
              sumGroupedByCategory &&
              Object.keys(sumGroupedByCategory.timeseries).length > 0
            "
          >
            <ApexSumChartWrapper type="donut" :data="sumGroupedByCategory" />
          </div>
          <div v-else>
            <p>{{ $t('report.noDataForReport') }}</p>
          </div>
        </template>
      </Card>
    </template>
  </HorizontalTwoColLayout>
  <ReportSpacer />

  <!-- ZEILE. Show radar chart only if at least 3 categories are inside the report -->
  <HorizontalOneColLayout
    v-if="sumGroupedByCategory && Object.keys(sumGroupedByCategory).length > 2"
  >
    <Card>
      <template #header>
        <div class="psm-report-header">
          <h3 v-html="$t('report.sumScope.headingScope')" />
        </div>
      </template>
      <template #content>
        <div class="report-chart-wrapper">
          <ApexSumChartWrapper type="radar" :data="sumGroupedByCategory" />
        </div>
      </template>
    </Card>
  </HorizontalOneColLayout>

  <!-- ZEILE -->
  <HorizontalOneColLayout>
    <Card>
      <template #header>
        <div class="psm-report-header">
          <h3 v-html="$t('report.sumScope.headingFacility')" />
        </div>
      </template>
      <template #content>
        <div
          class="report-chart-wrapper"
          v-if="facilityList && facilityList.length > 0"
        >
          <TextBarList
            :data="facilityList"
            :header="[
              $t('report.sumScope.facilityName'),
              $t('report.sumScope.activeInactive'),
              $t('report.sumScope.co2emissions'),
            ]"
            :use-maximum-as-reference="false"
          />
        </div>
        <div v-else>
          <p>{{ $t('report.noDataForReport') }}</p>
        </div>
      </template>
    </Card>
  </HorizontalOneColLayout>
  <ReportSpacer />

  <!-- ZEILE -->
  <HorizontalTwoColLayout>
    <template #left>
      <Card>
        <template #header>
          <div class="psm-report-header">
            <h3 v-html="$t('report.sumScope.headingFacility')" />
          </div>
        </template>
        <template #content>
          <div
            class="report-chart-wrapper"
            v-if="
              sumGroupedByFacility &&
              Object.keys(sumGroupedByFacility.timeseries).length > 0
            "
          >
            <ApexTreemapWrapper :data="sumGroupedByFacility" />
          </div>
          <div v-else>
            <p>{{ $t('report.noDataForReport') }}</p>
          </div>
        </template>
      </Card>
    </template>
    <template #right>
      <Card>
        <template #header>
          <div class="psm-report-header">
            <h3 v-html="$t('report.sumScope.headingCategory')" />
          </div>
        </template>
        <template #content>
          <div
            class="report-chart-wrapper"
            v-if="
              sumGroupedByCategory &&
              Object.keys(sumGroupedByCategory.timeseries).length > 0
            "
          >
            <ApexTreemapWrapper :data="sumGroupedByCategory" />
          </div>
          <div v-else>
            <p>{{ $t('report.noDataForReport') }}</p>
          </div>
        </template>
      </Card>
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
  const queryCategory: ReportTimeseriesQuery = {
    projectId: global.selectedProject?.id || '',
    siteIds: props.sites,
    filter: {
      scope: [props.scope],
      years: [global.selectedReport?.year ?? -1],
    },
  };
  sumGroupedByCategory.value = await getGroupedReportData(
    queryCategory,
    'category',
  );

  const queryFacility: ReportTimeseriesQuery = {
    projectId: global.selectedProject?.id || '',
    siteIds: props.sites,
    filter: {
      scope: [props.scope],
      years: [global.selectedReport?.year ?? -1],
    },
  };
  sumGroupedByFacility.value = await getGroupedReportData(
    queryFacility,
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
