<template>
  <!-- ZEILE "Unternehmensanschrift und Kuchendiagramm" -->
  <HorizontalTwoColLayout>
    <template #left>
      <Card class="h-full">
        <template #header>
          <div class="psm-report-header">
            <h3>{{ $t('report.company') }}</h3>
          </div>
        </template>
        <template #content>
          <ReportHeader />
        </template>
      </Card>
    </template>
    <template #right>
      <Card>
        <template #header>
          <div class="psm-report-header">
            <h3 v-html="$t('report.sumYear.headingScope')" />
          </div>
        </template>
        <template #content>
          <div
            class="report-chart-wrapper"
            v-if="
              sumGroupedByScope &&
              Object.keys(sumGroupedByScope?.timeseries).length > 0
            "
          >
            <ApexSumChartWrapper type="donut" :data="sumGroupedByScope" />
          </div>
          <div v-else>
            <p>{{ $t('report.noDataForReport') }}</p>
          </div>
        </template>
      </Card>
    </template>
  </HorizontalTwoColLayout>
  <ReportSpacer />

  <!-- ZEILE  "Beschreibung "-->
  <HorizontalOneColLayout>
    <ScopeDescription scope="all" />
  </HorizontalOneColLayout>
  <ReportSpacer />

  <!-- ZEILE "Mengen der letzten Berichtsjahre" -->
  <HorizontalOneColLayout>
    <Card>
      <template #header>
        <div class="psm-report-header">
          <h3>{{ $t('report.sumYear.amountLastYears') }}</h3>
        </div>
      </template>
      <template #content>
        <div
          class="report-chart-wrapper"
          v-if="yearlyList && yearlyList.length > 0"
        >
          <TextBarList
            :data="yearlyList"
            :show-status-column="false"
            :header="[
              $t('report.sumYear.year'),
              $t('report.sumYear.status'),
              $t('report.sumYear.amount'),
            ]"
            :use-maximum-as-reference="true"
          />
        </div>
        <div v-else>
          <p>{{ $t('report.noDataForReport') }}</p>
        </div>
      </template>
    </Card>
  </HorizontalOneColLayout>
  <ReportSpacer />

  <!-- ZEILE "Spiderdiagramm nach Kategorie" -->
  <HorizontalOneColLayout
    v-if="
      sumGroupedByCategory &&
      Object.keys(sumGroupedByCategory.timeseries).length > 3
    "
  >
    <Card>
      <template #header>
        <div class="psm-report-header">
          <h3>
            {{ $t('report.sumYear.divisionOrigins') }} ({{
              availableYears.join(', ')
            }})
          </h3>
        </div>
      </template>
      <template #content>
        <div class="report-chart-wrapper">
          <ApexSumChartWrapper type="radar" :data="sumGroupedByCategory" />
        </div>
      </template>
    </Card>
  </HorizontalOneColLayout>
  <ReportSpacer />

  <!-- ZEILE "Jahre und Scopes als horizontaler Balken" -->
  <HorizontalTwoColLayout>
    <template #left>
      <Card>
        <template #header>
          <div class="psm-report-header">
            <h3 v-html="$t('report.sumYear.headingScopeYear')" />
          </div>
        </template>
        <template #content>
          <div
            class="report-chart-wrapper"
            v-if="
              sumGroupedByScopeAndYear != null &&
              Object.keys(sumGroupedByScopeAndYear?.yearlyGrouped).length > 0
            "
          >
            <ApexGroupedChartWrapper
              :data="sumGroupedByScopeAndYear"
              :horizontal="true"
              :stacked="true"
              type="bar"
            />
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
            <h3 v-html="$t('report.sumYear.headingReportTime')" />
          </div>
        </template>
        <template #content>
          <div
            class="report-chart-wrapper"
            v-if="
              sumGroupedByScope &&
              Object.keys(sumGroupedByScope?.timeseries).length > 0
            "
          >
            <ApexTreemapWrapper :data="sumGroupedByScope" />
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
      filter: {
        scope:
          selectedScopes.value.length > 0 ? selectedScopes.value : [1, 2, 3],
        years: [global.selectedReport?.year ?? -1],
      },
    },
    'scope',
  );

  sumGroupedByScopeAndYear.value = await getYearlyGroupedReportData(
    <ReportTimeseriesQuery>{
      projectId: global.selectedProject?.id || '',
      siteIds: props.sites,
      filter: {
        scope:
          selectedScopes.value.length > 0 ? selectedScopes.value : [1, 2, 3],
        years: availableYears,
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
      filter: {
        scope:
          selectedScopes.value.length > 0 ? selectedScopes.value : [1, 2, 3],
        years: availableYears,
      },
    },
    'category',
  );
};

onMounted(() => {
  let thisYear = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    availableYears.push(thisYear);
    thisYear--;
  }
  getData();
});
</script>
