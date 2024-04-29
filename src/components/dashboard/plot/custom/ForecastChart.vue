<template>
  <h2>Soll/Ist-Analyse</h2>
  <p>
    Die Soll/Ist-Analyse wertet die bekannten Berichtsdaten aus und zeigt die
    gesetzten Jahresziele im Vergleich. Die angegebenen Maßnahmen im Projekt
    werden dabei ab Ihrem Inbetriebnahmedatum berücksichtigt. Der Refernzwert
    ist der älteste Berichtswert des Projekts.
  </p>
  <!-- Chart as Mixed-Chart -->

  <ForecastChartWrapper
    v-if="barChartYear?.datasets?.length"
    :data="barChartYear.datasets"
    :labels="barChartYear?.labels"
    :annotations="annotations"
    label="Soll/Ist-Analyse"
  />
</template>

<script setup lang="ts">
import {
  calculateEmissions,
  getAverageValues,
  EmissionResult,
  EmissionValue,
  OldReportValues,
} from '../../../../services/reporting/forecast';
import dataprovider from '../../../../services/dataprovider';
import { ref, Ref } from 'vue';
import { error, warn } from '../../../../services/ui/toast';
import ForecastChartWrapper from '../../../../components/dashboard/plot/apex/ForecastChartWrapper.vue';

function prepareAnnotationsData(options: { actions: any[], targets: any[], labels: any[] }) {
  // prepare the actions to be displayed as xaxis-annotations
  if (options.actions) annotations.value.actions = options.actions.map((action) => {
    return {
      x: action.finishedUntilIs?.getFullYear(),
      name: action.name
    }
  })
  // map the values to be displayed as point annotations
  if (options.targets && options.labels) annotations.value.targets = options.targets.map((target, index) => {
    if (target) return {
      x: options.labels[index],
      y: target,

    }
  }).filter(el => !!el)
}

// Chart preparation
function prepareChartData(emissionValues: EmissionValue[], actions: any[]) {
  const labels = emissionValues.map((result) =>
    new Date(result.date).getFullYear(),
  );
  // const refValues = emissionValues.map(result => result.refValue);
  // const targetValues = emissionValues.map(result => result.targetValue);
  const realValuesWithActions = emissionValues.map(
    (result) => result.realValueWithActions,
  );
  // const realValueWithActionsInterpolated = emissionValues.map(
  //   (result) => result.realValueWithActionsInterpolated,
  // );
  const targetValueInterpolated = emissionValues.map(
    (result) => result.targetValueInterpolated,
  );
  prepareAnnotationsData({
    targets: targetValueInterpolated,
    actions,
    labels,
  })
  const realReportValues = emissionValues.map(
    (result) => result.realReportValue,
  );

  const datasets = [
    {
      type: 'bar',
      name: 'Berichtsdaten',
      data: realReportValues,
    },
    {
      type: 'bar',
      name: 'Erreichbarer Wert mit Maßnahmen',
      data: realValuesWithActions,
    },
    {
      type: 'line',
      name: 'Zielwert nach Projektvorgaben (linear interpoliert)',
      data: getAverageValues(targetValueInterpolated),
    },
  ];
  return { labels, datasets };
}

const reportData: Ref<null | EmissionResult> = ref(null);
const barChartYear: Ref<null | any> = ref(null);
const annotations: Ref<{
  actions: any[],
  targets: any[],
}> = ref({
  actions: [],
  targets: []
});



/**
 * Load report data initially
 */
const getData = async () => {
  // get report data
  const targets = await dataprovider.readTargets();
  const actions = await dataprovider.readActions();
  const reports = await dataprovider.readReports();
  const oldValues: OldReportValues[] = [];
  for (const report of reports) {
    if (report.sumEmissions && report.sumEmissions > 0) {
      oldValues.push({
        year: report.year,
        value: report.sumEmissions,
      });
    }
  }
  if (oldValues.length === 0) {
    error(
      'Es gibt noch keine nutzbaren Daten in den Berichten. Die Summe aus mind. einem Bericht muss > 0 sein.',
    );
    return;
  }
  if (targets.length === 0) {
    error(
      'Es wurden noch keine Ziele im Projekt definiert. Bitte legen Sie zuerst Ziele an.',
    );
    return;
  }
  if (actions.length === 0) {
    warn(
      'Es wurden noch keine Maßnahmen im Projekt definiert. Das Ergebnis resultiert nur aus den gesetzen Zielen.',
    );
  }
  reportData.value = calculateEmissions(
    oldValues,
    targets,
    actions,
    oldValues[0].year,
  );
  barChartYear.value = prepareChartData(reportData.value.yearlyResults, actions);
};
getData();
</script>