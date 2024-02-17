<template>
  <div ref="plotterdiv" style="width: 100%"></div>
</template>

<script setup lang="ts">
import * as Plot from '@observablehq/plot';
import { ref, Ref, onMounted, defineProps, PropType, watch } from 'vue';
import { AggregatedReportResult } from '../../../services/reporting/index';

/*
interface AggregatedReportResult {
  stat: {
    sum: number; // over all data
  };
  timeseries: {
    [name: string]: {
      year: number;
      timestamp: string;
      sum: number;
    }[];
  };
}

sample plot:
Plot.plot({
    grid: true,
    width: window.innerWidth - 5,
    marks: [
      Plot.lineY(aapl, {
        x: 'Date',
        y: Math.random,
        tip: 'xy',
        marker: 'circle',
        stroke: '#453243',
      }),
      Plot.lineY(aapl, {
        x: 'Date',
        y: Math.random,
        tip: 'xy',
        stroke: '#4e79a7',
      }),
    ],
  });
*/

// reference to the div element
const plotterdiv: Ref<any> = ref(null);

const props = defineProps({
  data: {
    type: Object as PropType<AggregatedReportResult>,
    required: true,
  },
});
const series = Object.values(props.data.timeseries);

watch(
  () => props.data,
  () => {
    console.log('data changed');
    renderChart();
  },
  { deep: true },
);

const renderChart = async () => {
  // fist clear the div
  plotterdiv.value.innerHTML = '';

  const plot = Plot.plot({
    y: {
    grid: true,
    label: "CO2 kg"
  },
    color: {legend: true},
    width: window.innerWidth - 5,
    marks: [
      series.map((s) => {
        return Plot.lineY(s, {
          x: 'timestamp',
          y: 'sum',
          tip: 'xy',
          marker: 'circle',
          stroke: '#453243',
        });
      }),
    ],
  });
  plotterdiv.value.appendChild(plot);
};

onMounted(() => {
  renderChart();
});
</script>
