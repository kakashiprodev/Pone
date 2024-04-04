<template>
  <div class="report-page">
    <h3 class="mb-5" style="color: red">
      DAS IST NUR EINE VORSCHAU UND NICHT DRUCKBAR!
    </h3>

    <h2>CO<sub>2</sub>-Bilanzierung Gesamt</h2>
    <ReportSumYear :sites="[global.selectedSite?.id ?? '']" />

    <h2>Scope 1</h2>
    <ReportSumScope :scope="1" :sites="[global.selectedSite?.id ?? '']" />

    <h2>Scope 2</h2>
    <ReportSumScope :scope="2" :sites="[global.selectedSite?.id ?? '']" />

    <h2>Scope 3</h2>
    <ReportSumScope :scope="3" :sites="[global.selectedSite?.id ?? '']" />

    <h2>Maßnahmen</h2>
    <ActionOverview />
  </div>
</template>

<script setup lang="ts">
import ReportSumScope from '../../components/dashboard/report/ReportSumScope.vue';
import ReportSumYear from '../../components/dashboard/report/ReportSumYear.vue';
import ActionOverview from '../../components/dashboard/actions/ActionOverview.vue';

import { useGlobalStore } from '../../stores/global';
const global = useGlobalStore();
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: rgb(204, 204, 204);
  font-family: Verdana, 'Lucida Sans Unicode', sans-serif;
  font-size: 0.8em;
}

@media screen {
  .report-page {
    background: #fff;
    width: 21cm;
    /* height: 29.7cm; */
    display: block;
    margin: 0 auto;
    margin-bottom: 0.5cm;
    box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
    padding: 2cm;
  }
}

@page {
  size: auto;
  margin: 0;
}

@media print {
  page[size='A4'] {
    margin: 0 !important;
    box-shadow: none !important;
  }

  .report-page {
    margin: 0 auto;
    padding: 2cm;
    box-shadow: none !important;
  }
}
</style>
