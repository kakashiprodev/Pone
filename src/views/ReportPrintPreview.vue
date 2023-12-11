<template>
    <div class="report-page">
        <h3>
            DAS IST NUR EINE VORSCHAU UND NICHT DRUCKBAR!
        </h3>

        <ReportHeader />
        <SumCharts />
        <ActionOverview />
        <ForecastChart />
    </div>
</template>

<script setup lang="ts">
import SumCharts from './../components/SumCharts.vue';
import ForecastChart from './../components/ForecastChart.vue';
import ActionOverview from './../components/ActionOverview.vue';
import ReportHeader from './../components/ReportHeader.vue';

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