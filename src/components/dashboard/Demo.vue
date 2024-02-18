<template>
  <h2>Demo for Dasbboard DataEngine</h2>

  <!-- Form for query -->
  <div>
    <HorizontalTwoColHeader label="Main" class="mt-2" />

    <HorizontalTwoColEntry label="Project" class="mt-2">
      <label>{{ global.selectedProject?.name }}</label>
    </HorizontalTwoColEntry>
    <HorizontalTwoColEntry label="Choose the Sites" class="mt-2">
      <MultiSelect
        id="sites"
        :options="global.sites"
        v-model="selectedSiteIds"
        option-label="name"
        option-value="id"
        placeholder="Select a Site"
        class="w-full"
      />
    </HorizontalTwoColEntry>
    <HorizontalTwoColEntry label="Choose Years" class="mt-2">
      <MultiSelect
        id="years"
        :options="availableYears"
        v-model="selectedYears"
        placeholder="Select a Year"
        class="w-full"
      />
    </HorizontalTwoColEntry>

    <!-- Form for filters -->
    <HorizontalTwoColHeader label="Filters" class="mt-2" />
    <HorizontalTwoColEntry label="Use Filter" class="mt-2">
      <Checkbox v-model="useFilter" id="Use Filter" :binary="true" />
    </HorizontalTwoColEntry>
    <HorizontalTwoColEntry label="Scopes" class="mt-2">
      <MultiSelect
        id="scopes"
        :options="[1, 2, 3]"
        v-model="selectedScopes"
        placeholder="Select a Scope"
        class="w-full"
      />
    </HorizontalTwoColEntry>
    <HorizontalTwoColEntry label="Categories" class="mt-2">
      <MultiSelect
        id="categories"
        :options="availableCategories"
        v-model="selectedCategories"
        placeholder="Select a Category"
        :maxSelectedLabels="1"
        display="chip"
        class="w-full"
      />
    </HorizontalTwoColEntry>
    <HorizontalTwoColEntry label="Facilities" class="mt-2">
      <MultiSelect
        id="facilities"
        :options="availableFacilities"
        option-label="name"
        option-value="name"
        v-model="selectedFacilities"
        placeholder="Select a Facility"
        class="w-full"
      />
    </HorizontalTwoColEntry>

    <!-- Form for function -->
    <HorizontalTwoColHeader label="Aggregation type" class="mt-2" />
    <HorizontalTwoColEntry label="Function" class="mt-2">
      <Dropdown
        id="function"
        :options="availableFunctions"
        option-label="name"
        option-value="id"
        v-model="selectedFunction"
        placeholder="Select a Function"
        class="w-full"
      />
    </HorizontalTwoColEntry>
    <HorizontalTwoColEntry
      v-show="selectedFunction !== 'getPlainReportData'"
      label="GroupBy"
      class="mt-2"
    >
      <Dropdown
        id="groupBy"
        :options="availableGroupBy"
        v-model="selectedGroupBy"
        placeholder="How to group the data?"
        class="w-full"
      />
    </HorizontalTwoColEntry>

    <HorizontalTwoColEntry
      v-show="selectedFunction !== 'getPlainReportData'"
      label="Stacked Charts?"
    >
      <Checkbox v-model="stackedCharts" id="stackedCharts" :binary="true" />
    </HorizontalTwoColEntry>

    <HorizontalTwoColEntry label="" class="mt-2">
      <div class="w-full flex justify-content-end">
        <Button @click="getData()" label="Let´s get data!" />
      </div>
    </HorizontalTwoColEntry>
  </div>

  <!-- RESULTS -->
  <TabView class="mt-2">
    <!-- Plot result -->
    <TabPanel header="Plot data">
      <div v-if="selectedFunction === 'getPlainReportData'">
        <Card>
          <template #content>
            This data cannot be plotted as a Chart here.
          </template>
        </Card>
      </div>
      <TabView v-else>
        <TabPanel header="Bar Vertical">
          <BarChart
            v-if="
              selectedFunction === 'getGroupedReportData' && reportDataGrouped
            "
            type="simpleGrouped"
            :data="reportDataGrouped"
            index-axis="x"
          />
          <BarChart
            v-if="
              selectedFunction === 'getYearlyGroupedReportData' &&
              reportDataYearlyGrouped
            "
            type="yearlyGrouped"
            :data="reportDataYearlyGrouped"
            :stacked="stackedCharts"
            index-axis="x"
          />
        </TabPanel>
        <TabPanel header="Bar Horizontal">
          <BarChart
            v-if="
              selectedFunction === 'getGroupedReportData' && reportDataGrouped
            "
            type="simpleGrouped"
            :data="reportDataGrouped"
            index-axis="y"
          />
          <BarChart
            v-if="
              selectedFunction === 'getYearlyGroupedReportData' &&
              reportDataYearlyGrouped
            "
            type="yearlyGrouped"
            :data="reportDataYearlyGrouped"
            :stacked="stackedCharts"
            index-axis="y"
          />
        </TabPanel>
        <TabPanel header="Line-Chart">
          <LineChart
            v-if="
              selectedFunction === 'getGroupedReportData' && reportDataGrouped
            "
            :data="reportDataGrouped"
            :stacked="stackedCharts"
          />
          <p v-else>
            The function 'getYearlyGroupedReportData' returns a three level data
            structure. It is not possible to plot this data as a line chart.
          </p>
        </TabPanel>
        <TabPanel header="Radar-Chart">
          <RadarChart
            v-if="
              selectedFunction === 'getGroupedReportData' && reportDataGrouped
            "
            :data="reportDataGrouped"
          />
          <p v-else>
            The function 'getYearlyGroupedReportData' returns a three level data
            structure. It is not possible to plot this data as a Radar chart.
          </p>
        </TabPanel>
        <TabPanel header="Pole-Area-Chart">
          <PoleAreaChart
            v-if="
              selectedFunction === 'getGroupedReportData' && reportDataGrouped
            "
            :data="reportDataGrouped"
          />
          <p v-else>
            The function 'getYearlyGroupedReportData' returns a three level data
            structure. It is not possible to plot this data as a Pole-Area
            chart.
          </p>
        </TabPanel>
      </TabView>
    </TabPanel>

    <!-- Data result -->
    <TabPanel header="Data">
      <Card>
        <template #content>
          <p>
            The repoting Engine works on cached data. So it should be no problem
            to handle many requests. So you can make one query for each diagram.
          </p>
          <p v-if="selectedFunction === 'getPlainReportData'">
            This function 'getPlainReportData' returns a plain timeseries of the
            data like it is stored in the database with additional information
            added to which site and project the data belongs.
          </p>
          <p v-else-if="selectedFunction === 'getGroupedReportData'">
            This function 'getGroupedReportData' returns a grouped data as sum
            for the selected groupBy. It will return simple timeseries based on
            the groupBy. The timeseries always returns one value per year.
          </p>
        </template>
      </Card>
      <DemoShowCase
        v-if="selectedFunction === 'getPlainReportData' && plainData"
        :query="plainDataQuery"
        :result="plainData"
      />
      <DemoShowCase
        v-if="selectedFunction === 'getGroupedReportData' && reportDataGrouped"
        :query="plainDataQuery"
        :result="reportDataGrouped"
      />
      <DemoShowCase
        v-if="
          selectedFunction === 'getYearlyGroupedReportData' &&
          reportDataYearlyGrouped
        "
        :query="plainDataQuery"
        :result="reportDataYearlyGrouped"
      />
    </TabPanel>
  </TabView>
</template>

<script setup lang="ts">
import {
  getPlainReportData,
  ReportTimeseriesQuery,
  getGroupedReportData,
  getYearlyGroupedReportData,
  ReportGroupBy,
  TimeseriesDataEntry,
  AggregatedReportResult,
  AggregatedReportResultYearlyGrouped,
} from '../../services/reporting/index';
import { ref, Ref, computed, ComputedRef } from 'vue';
import DemoShowCase from './DemoShowCase.vue';
import BarChart from './plot/BarChart.vue';
import LineChart from './plot/LineChart.vue';
import RadarChart from './plot/RadarChart.vue';
import PoleAreaChart from './plot/PoleAreaChart.vue';
import HorizontalTwoColEntry from '../forms/HorizontalTwoColEntry.vue';
import HorizontalTwoColHeader from '../forms/HorizontalTwoCoHeader.vue';
import { useGlobalStore } from './../../stores/global';

// get necessary data (project, sites, reports) from store
const global = useGlobalStore();

// a list of the last 5 years dynamically generated
const availableYears = ref(
  Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i),
);

// a lost of all categories
const availableCategories = computed(() => {
  return global.equivalentFilters.category.all;
});

const availableFacilities = computed(() => {
  return global.facilities;
});

const availableFunctions = [
  { name: 'Plain Report Data as timeseries', id: 'getPlainReportData' },
  { name: 'Report Data (simple grouped)', id: 'getGroupedReportData' },
  {
    name: 'Report Data (grouped by Year and Key)',
    id: 'getYearlyGroupedReportData',
  },
];

// users choice
const selectedSiteIds: Ref<string[]> = ref(global.sites.map((s) => s.id));
const selectedYears: Ref<number[]> = ref(availableYears.value);
const useFilter: Ref<boolean> = ref(true);
// users filter
const selectedScopes: Ref<number[]> = ref([1, 2, 3]);
const selectedCategories: Ref<string[]> = ref([]);
const selectedFacilities: Ref<string[]> = ref([]);
// users choice of function
const selectedFunction: Ref<string> = ref('getGroupedReportData');
// users choice of groupBy
const availableGroupBy: ReportGroupBy[] = ['scope', 'category', 'facility'];
const selectedGroupBy: Ref<ReportGroupBy> = ref('scope');
const stackedCharts = ref(false);

/**
 * Build the query for the report
 */
const plainDataQuery: ComputedRef<ReportTimeseriesQuery> = computed(() => {
  return {
    projectId: global.selectedProject?.id || '',
    siteIds: selectedSiteIds.value,
    years: selectedYears.value,
    filter: {
      scope:
        useFilter.value && selectedScopes.value.length > 0
          ? selectedScopes.value
          : undefined,
      category:
        useFilter.value && selectedCategories.value.length > 0
          ? selectedCategories.value
          : undefined,
      facility:
        useFilter.value && selectedFacilities.value.length
          ? selectedFacilities.value
          : undefined,
    },
  };
});

/**
 * The result of the query
 */
const plainData: Ref<null | TimeseriesDataEntry[]> = ref(null);
const reportDataGrouped: Ref<null | AggregatedReportResult> = ref(null);
const reportDataYearlyGrouped: Ref<null | AggregatedReportResultYearlyGrouped> =
  ref(null);

/**
 * This function is called when the user clicks the button to get the data.
 */
const getData = async () => {
  if (selectedFunction.value === 'getPlainReportData') {
    plainData.value = await getPlainReportData(plainDataQuery.value);
  } else if (selectedFunction.value === 'getGroupedReportData') {
    reportDataGrouped.value = await getGroupedReportData(
      plainDataQuery.value,
      selectedGroupBy.value,
    );
  } else if (selectedFunction.value === 'getYearlyGroupedReportData') {
    reportDataYearlyGrouped.value = await getYearlyGroupedReportData(
      plainDataQuery.value,
      selectedGroupBy.value,
    );
  }
};
</script>
