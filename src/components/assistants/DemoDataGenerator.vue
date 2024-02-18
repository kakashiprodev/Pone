<template>
  <h2>Demo Data Generator</h2>
  <Toolbar>
    <template #start>
      <span>Project: </span>
      <span class="ml-1">{{ selectedProject?.name }}</span>
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
        :max-selected-labels="2"
        display="chip"
      />
    </template>
  </Toolbar>

  <Toolbar class="mt-2">
    <template #start>
      <span class="ml-5"> Number of records: </span>
      <InputNumber class="ml-2" v-model="numberOfRecords" mode="decimal" />
      <span class="ml-2"> Range Min: </span>
      <InputNumber class="ml-2" v-model="rangeMin" mode="decimal" />
      <span class="ml-2"> Range Max: </span>
      <InputNumber class="ml-2" v-model="rangeMax" mode="decimal" />
    </template>
    <template #end>
      <ConfirmDialog />
      <Button
        label="Delete all data!"
        severity="danger"
        icon="pi pi-refresh"
        @click="deleteDataForReports"
        :disabled="loading"
      />
      <Button
        class="ml-2"
        label="Generate Data!"
        icon="pi pi-refresh"
        @click="generateData"
        :disabled="loading"
      />
    </template>
  </Toolbar>

  <Card class="mt-2">
    <template #content>
      <p>
        Generate demo data based on random numbers and the selected reports.
      </p>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, Ref, computed } from 'vue';
import { useGlobalStore } from './../../stores/global';
import { useConfirm } from 'primevue/useconfirm';
import { error, info } from '../../services/toast';
import dataprovider from '../../services/dataprovider';
import { EquivalentEntry, InputEntry } from '../../services/types';
import { getSumForInput } from '../../services/reporting';

// get necessary data (project, sites, reports) from store
const global = useGlobalStore();
const confirm = useConfirm();

// a list of the last 5 years dynamically generated
const availableYears = ref(
  Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i),
);
const selectedYears: Ref<number[]> = ref(availableYears.value);

// users choice
const selectedSiteIds: Ref<string[]> = ref(global.sites.map((s) => s.id));
const selectedProject = computed(() => global.selectedProject);
const numberOfRecords = ref(10);
const rangeMin = ref(5000);
const rangeMax = ref(10000);

// visibility
const loading = ref(false);

/**
 * Helper to get all reports for the selected sites and years
 */
const getReports = async () => {
  const allReports = [];
  for (const siteId of selectedSiteIds.value) {
    const reports = await dataprovider.readReports(siteId);
    // filter all unrelevant years
    const relevantReports = reports.filter((r) =>
      selectedYears.value.includes(r.year),
    );
    allReports.push(...relevantReports);
  }
  return allReports;
};

/**
 * Delete all data for the selected report(s)
 */
const deleteDataForReports = async (event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Sollen die Daten wirklich alle gelöscht werden?',
    icon: 'fa-solid fa-question',
    accept: async () => {
      loading.value = true;
      const allReports = await getReports();
      try {
        for (const report of allReports) {
          console.log(
            'Deleting data for report: ' +
              report.year +
              ' for site ' +
              report.site,
          );
          await dataprovider.deleteAllUserInputsForReport(report.id);
        }
        info('Daten wurden gelöscht');
      } catch (e) {
        error(e + '');
      }
      loading.value = false;
    },
  });
};

/**
 * select a random equivalent for a given scope
 * from the available data global.equivalents filtered by the selected scope
 */
const getRandomEquivalentByScope = (scope: number) => {
  const equivalents = global.equivalents.filter((e) => e.scope === scope);
  const randomIndex = Math.floor(Math.random() * equivalents.length);
  return equivalents[randomIndex];
};

/**
 * A helper that will generate a rawInputValue for a given equivalent.
 * This is tricky since the rawInputValue is multiplied with one or more factors in "data.sumValue = getSumForInput(data, globalStore.equivalentDict);"
 * This helper needs to check the factors and calculate the rawInputValue accordingly.
 * This function gets a value in a given range and returns the value that will be used as rawInputValue.
 */
const getRawInputValueForEquivalent = (
  input: InputEntry,
  equivalent: EquivalentEntry,
  resultMin: number,
  resultMax: number,
) => {
  // make a demo calculation for the rawInputValue with a value of 1
  const resultingValueFor1 = getSumForInput(
    {
      ...input,
      equivalent: equivalent.id,
      rawValue: 1,
    } as InputEntry,
    global.equivalentDict,
  );
  // now we know how strong the rawInputValue is multiplied
  // we can calculate the rawInputValue for the given range
  const rawInputValue =
    (resultMin + Math.random() * (resultMax - resultMin)) / resultingValueFor1;
  return rawInputValue;
};

/**
 * Generate demo data inputs for the selected report(s)
 */
const generateData = async () => {
  loading.value = true;
  const allReports = await getReports();
  for (const report of allReports) {
    for (let x = 0; x < numberOfRecords.value; x++) {
      // get random scope. this can be 1,2,3
      const scope = Math.floor(Math.random() * 3) + 1;
      const e = getRandomEquivalentByScope(scope);
      const input: InputEntry = {
        id: 'new',
        name: 'Demo Input ' + x,
        scope: scope,
        comment: 'Demo Comment ' + x,
        sumValue: 0,
        equivalent: e.id,
        report: report.id,
        category: e.category,
        facility: null,
        parent: null,
        rawValue: 1,
        monthlyValues: false,
        rawValueJan: 1 / 12,
        rawValueFeb: 1 / 12,
        rawValueMar: 1 / 12,
        rawValueApr: 1 / 12,
        rawValueMay: 1 / 12,
        rawValueJun: 1 / 12,
        rawValueJul: 1 / 12,
        rawValueAug: 1 / 12,
        rawValueSep: 1 / 12,
        rawValueOct: 1 / 12,
        rawValueNov: 1 / 12,
        rawValueDec: 1 / 12,
      };
      // calculate the sumValue for the input
      input.rawValue = getRawInputValueForEquivalent(
        input,
        e,
        rangeMin.value,
        rangeMax.value,
      );
      await dataprovider.createUserInput(input);
    }
  }
  info('Daten wurden generiert');
  loading.value = false;
};
</script>
