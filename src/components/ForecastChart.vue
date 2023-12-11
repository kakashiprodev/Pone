
<template>
    <h1>
        Soll/Ist-Analyse
    </h1>
    <p>
        Die Soll/Ist-Analyse wertet die bekannten Berichtsdaten aus und zeigt die gesetzten Jahresziele im Vergleich.
        Die angegebenen Maßnahmen im Projekt werden dabei ab Ihrem Inbetriebnahmedatum berücksichtigt.
        Der Refernzwert ist der älteste Berichtswert des Projekts.
    </p>
    <!-- Chart as Bar-Chart -->
    <Chart type="bar" :data="barChartYear" class="h-30rem mt-5" />
    <!-- Chart as Line-Chart -->
    <Chart type="line" :data="barChartYear" class="h-30rem mt-5" />
</template>

<script setup lang="ts">
import Chart from 'primevue/chart';
import { calculateEmissions, EmissionResult, EmissionValues } from './../services/forecast';
import dataprovider from './../services/dataprovider';
import { ref, Ref } from 'vue';
import { error, warn } from './../services/toast';

// Chart preparation
function prepareChartData(emissionValues: EmissionValues[]) {
    const labels = emissionValues.map(result => new Date(result.date).getFullYear());
    const refValues = emissionValues.map(result => result.refValue);
    const targetValues = emissionValues.map(result => result.targetValue);
    const realValuesWithActions = emissionValues.map(result => result.realValueWithActions);

    const datasets = [
        {
            label: 'Referenzwert',
            data: refValues,
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        },
        {
            label: 'Zielwert',
            data: targetValues,
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        },
        {
            label: 'Tatsächlicher Wert mit Maßnahmen',
            data: realValuesWithActions,
            backgroundColor: 'rgba(75, 192, 192, 0.8)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }
    ];
    return { labels, datasets };
}


// Get data
const oldValues = [
    { year: 2020, value: 5000 },
    { year: 2021, value: 4500 }
];

const reportData: Ref<null | EmissionResult> = ref(null);
const barChartYear: Ref<null | any> = ref(null);

/**
 * Load report data initially
 */
const getData = async () => {
    const targets = await dataprovider.readTargets();
    const actions = await dataprovider.readActions();

    if (targets.length === 0) {
        error('Es wurden noch keine Ziele im Projekt definiert. Bitte legen Sie zuerst Ziele an.');
    } else {
        if (actions.length === 0) {
            warn('Es wurden noch keine Maßnahmen im Projekt definiert. Das Ergebnis resultiert nur aus den gesetzen Zielen.');
        }
        reportData.value = calculateEmissions(oldValues, targets, actions, oldValues[0].year);
        barChartYear.value = prepareChartData(reportData.value.yearlyResults);
    }
}
getData();

</script>