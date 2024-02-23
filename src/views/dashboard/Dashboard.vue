<template>
  <!-- <SmartInput :data="demo" /> -->
  <div class="report" v-if="global.selectedReport">
    <TabView v-if="!global.isLoading">
      <TabPanel header="CO2-Bilanzierung">
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

      <TabPanel header="Soll/Ist-Vergleich"> </TabPanel>

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
import { useGlobalStore } from '../../stores/global';
//import { ref } from 'vue';
// import { error } from '../../services/toast';

const global = useGlobalStore();

// const selectedReport = ref<string>(global.selectedReport?.id ?? '');
// const selectedSites = ref<string[]>([global.selectedSite?.id ?? '']);
</script>

<style scoped>
.report {
  width: 90%;
  margin: 0 auto;
  margin-top: 2rem;
}
</style>
