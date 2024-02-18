<template>
  <!-- <SmartInput :data="demo" /> -->
  <div class="report" v-if="global.selectedReport">
    <TabView v-if="!global.isLoading">
      <TabPanel header="Gesamtauswertung">
        <SumCharts />
      </TabPanel>

      <TabPanel header="Soll/Ist-Vergleich">
        <ForecastChart />
      </TabPanel>

      <TabPanel header="Aktionen">
        <ActionOverview />
      </TabPanel>

      <TabPanel header="Gesamt-Bericht">
        <ReportPrint />
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import ForecastChart from '../../components/dashboard/ForecastChart.vue';
import SumCharts from '../../components/dashboard/SumCharts.vue';
import ReportPrint from '../../components/dashboard/ReportPrint.vue';
import ActionOverview from '../../components/dashboard/actions/ActionOverview.vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../../stores/global';
import { error } from '../../services/toast';

const global = useGlobalStore();
const router = useRouter();

// ensure that a report is selected
if (!global.selectedReport && global.isLoggedIn) {
  error('Bitte legen Sie einen zunächst einen Bericht an.');
  router.push({ name: 'reportConfig' });
}
</script>

<style scoped>
.report {
  width: 80%;
  margin: 0 auto;
  margin-top: 2rem;
}
</style>
