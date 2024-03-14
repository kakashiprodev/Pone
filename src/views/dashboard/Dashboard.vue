<template>
  <!-- <SmartInput :data="demo" /> -->
  <div class="report" v-if="global.selectedReport" style="max-width: 1200px;">
    <Toolbar class="mb-4">
      <template #start>
        <span>Ausgewählter Bericht</span>
        <Dropdown
          v-if="global.reports && global.selectedReport"
          v-model="global.selectedReport"
          :options="global.reports"
          optionLabel="year"
          placeholder="Select a Report"
          class="ml-3"
          @change="switchReport()"
        />
      </template>
    </Toolbar>
    <TabView v-if="!global.isLoading && !loading">
      <TabPanel header="Bilanzierung">
        <ReportSumYear :sites="[global.selectedSite?.id ?? '']" />
      </TabPanel>

      <TabPanel header="Scope 1">
        <ReportSumScope :scope="1" :sites="[global.selectedSite?.id ?? '']" />
      </TabPanel>
      <TabPanel header="Scope 2">
        <ReportSumScope :scope="2" :sites="[global.selectedSite?.id ?? '']" />
      </TabPanel>
      <TabPanel header="Scope 3">
        <ReportSumScope :scope="3" :sites="[global.selectedSite?.id ?? '']" />
      </TabPanel>

      <TabPanel header="Soll/Ist-Vergleich">
        <ForecastChart />
      </TabPanel>

      <TabPanel header="Maßnahmen und Ziele">
        <ActionOverview />
      </TabPanel>

      <TabPanel header="Bericht Export">
        <ReportPrint />
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import ReportSumScope from '../../components/dashboard/report/ReportSumScope.vue';
import ReportSumYear from '../../components/dashboard/report/ReportSumYear.vue';
import ActionOverview from '../../components/dashboard/actions/ActionOverview.vue';
import ReportPrint from '../../components/dashboard/report/ReportPrint.vue';
import ForecastChart from '../../components/dashboard/plot/custom/ForecastChart.vue';
import { useGlobalStore } from '../../stores/global';
import { ref } from 'vue';

const loading = ref(false);
const global = useGlobalStore();

const switchReport = async () => {
  loading.value = true;
  await global.changeReport();
  loading.value = false;
};
</script>

<style scoped>
.report {
  width: 90%;
  max-width: 105rem;
  margin: 0 auto;
  margin-top: 2rem;
}
</style>
