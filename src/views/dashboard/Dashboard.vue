<template>
  <!-- <SmartInput :data="demo" /> -->
  <div class="report" v-if="global.selectedReport" style="max-width: 1200px">
    <TabView v-if="!global.isLoading && !loading">
      <TabPanel :header="$t('dashboard.reportSumYear')">
        <ReportSumYear :sites="[global.selectedSite?.id ?? '']" />
      </TabPanel>

      <TabPanel :header="$t('dashboard.scope', { scope: '1' })">
        <ReportSumScope :scope="1" :sites="[global.selectedSite?.id ?? '']" />
      </TabPanel>
      <TabPanel :header="$t('dashboard.scope', { scope: '2' })">
        <ReportSumScope :scope="2" :sites="[global.selectedSite?.id ?? '']" />
      </TabPanel>
      <TabPanel :header="$t('dashboard.scope', { scope: '3' })">
        <ReportSumScope :scope="3" :sites="[global.selectedSite?.id ?? '']" />
      </TabPanel>

      <TabPanel :header="$t('dashboard.comparison')">
        <ForecastChart />
      </TabPanel>

      <TabPanel :header="$t('dashboard.actionsAndTargets')">
        <ActionOverview />
      </TabPanel>

      <TabPanel
        :header="$t('dashboard.reportExport')"
        v-if="global.isGlobalAdmin"
      >
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
import { ref, watch } from 'vue';

const loading = ref(false);
const global = useGlobalStore();

// watch global.selectedReport to reload the report
watch(
  () => global.selectedReport,
  async () => {
    loading.value = true;
    await global.changeReport();
    loading.value = false;
  },
);
</script>

<style scoped>
.report {
  width: 100%;
  max-width: 105rem;
  margin: 0 auto;
  margin-top: 2rem;
}
</style>
