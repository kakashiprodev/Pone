<template>
  <h2>Demo for Dasbboard DataEngine</h2>
  <Toolbar>
    <template #start>
      <span>Project: </span>
      <span class="ml-1">{{ global.selectedProject?.name }}</span>
      <span class="ml-5"> Choose site(s): </span>
      <MultiSelect
        class="ml-2"
        :options="global.sites"
        v-model="selectedSiteIds"
        option-label="name"
        option-value="id"
        placeholder="Select a Site"
      />
      <span class="ml-5"> Choose year(s): </span>
      <MultiSelect
        class="ml-2"
        :options="availableYears"
        v-model="selectedYears"
        placeholder="Select a Year"
      />
      <span class="ml-5"> Filter?</span>
      <Checkbox v-model="useFilter" class="ml-2" :binary="true" />
    </template>
  </Toolbar>

  <Toolbar>
    <template #start>
      <span> Choose scopes: </span>
      <MultiSelect
        class="ml-2"
        :options="[1, 2, 3]"
        v-model="selectedScopes"
        placeholder="Select a Scope"
      />
      <span class="ml-5"> Choose categorie(s): </span>
      <MultiSelect
        class="ml-2 w-20rem"
        :options="availableCategories"
        v-model="selectedCategories"
        placeholder="Select a Category"
        :maxSelectedLabels="3"
        display="chip"
      />
      <span class="ml-5"> Choose facilitie(s): </span>
      <MultiSelect
        class="ml-2"
        :options="availableFacilities"
        option-label="name"
        option-value="id"
        v-model="selectedFacilities"
        placeholder="Select a Facility"
      />
    </template>
  </Toolbar>

  <Toolbar>
    <template #start>
      <span> Choose Function: </span>
      <Dropdown
        class="ml-2"
        :options="['getPlainReportData', 'getGroupedReportData']"
        v-model="selectedFunction"
        placeholder="Select a Function"
      />
      <span class="ml-5"> GroupBy: </span>
      <Dropdown
        class="ml-2"
        :options="availableGroupBy"
        v-model="selectedGroupBy"
        placeholder="How to group the data?"
      />
    </template>
    <template #end>
      <Button label="Get Data!" icon="pi pi-refresh" @click="getData" />
    </template>
  </Toolbar>

  <Card>
    <template #content>
      <p>
        The repoting Engine works on cached data. So it should be no problem to
        handle many requests. So you can make one query for each diagram.
      </p>
      <p v-if="selectedFunction === 'getPlainReportData'">
        This function 'getPlainReportData' returns a plain timeseries of the
        data like it is stored in the database with additional information added
        to which site and project the data belongs.
      </p>
      <p v-else-if="selectedFunction === 'getGroupedReportData'">
        This function 'getGroupedReportData' returns a grouped data as sum for
        the selected groupBy. It will return simple timeseries based on the
        groupBy. The timeseries always returns one value per year.
      </p>
    </template>
  </Card>

  <DemoShowCase :query="plainDataQuery" :result="plainData" />
</template>

<script setup lang="ts">
import {
  getPlainReportData,
  ReportTimeseriesQuery,
  getGroupedReportData,
  ReportGroupBy,
} from '../../services/reporting/index';
import { ref, onMounted, Ref, computed, ComputedRef } from 'vue';
import DemoShowCase from './DemoShowCase.vue';
import Toolbar from 'primevue/toolbar';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import Card from 'primevue/card';

// get necessary data (project, sites, reports) from store
import { useGlobalStore } from './../../stores/global';
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
      facilities:
        useFilter.value && selectedCategories.value.length
          ? selectedFacilities.value
          : undefined,
    },
  };
});
const plainData: Ref<any> = ref(null);

const getData = async () => {
  if (selectedFunction.value === 'getPlainReportData') {
    plainData.value = await getPlainReportData(plainDataQuery.value);
  } else if (selectedFunction.value === 'getGroupedReportData') {
    plainData.value = await getGroupedReportData(
      plainDataQuery.value,
      selectedGroupBy.value,
    );
  }
};
onMounted(() => {
  // getData();
});
</script>
../../services/reporting/reporting
