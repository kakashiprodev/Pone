<template>
  <div class="mt-5">
    <apexchart
      width="100%"
      :height="chartHeight"
      :series="chartData"
      :type="CHART_TYPE"
      :options="chartOptions"
      @animationEnd="onAnimationEnd"
      @updated="onChartUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ActionWithPercentage } from '@/services/types.ts';
import { computed, ref } from 'vue';
import { toChartAxisDate } from '@/services/helper';
import config from '@/config';

const CHART_TYPE = 'rangeBar';

const chartLoading = ref(true);

const chartHeight = computed(() => props.actions.length * 100 + 'px');

const minDate = ref(new Date().getTime());
const maxDate = ref(new Date().getTime());

const onAnimationEnd = () => {
  chartLoading.value = false;
};
const onChartUpdated = () => {
  chartLoading.value = false;
};

const chartOptions = ref<any>({
  chart: {
    id: 'dumbbell-chart',
    type: 'rangeBar',
    zoom: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
  },
  colors: [config.colors.data1, config.colors.data5],
  plotOptions: {
    bar: {
      horizontal: true,
      isDumbbell: true,
      dumbbellColors: [[config.colors.data1, config.colors.data5]],
    },
  },
  legend: {
    show: true,
    showForSingleSeries: true,
    position: 'top',
    horizontalAlign: 'left',
    customLegendItems: ['Geplantes Datum', 'Tatsächliches Datum'],
    fontSize: '15px',
  },
  xaxis: {
    lines: {
      show: true,
    },
    type: 'datetime',
    min: minDate,
    max: maxDate,
    labels: {
      style: {
        fontSize: '12px',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        fontSize: '12px',
      },
    },
  },
});

const props = defineProps<{
  actions: ActionWithPercentage[];
}>();

/**
 * map the chart data based on props.actions
 */
const mapChartData = () => [
  {
    name: 'series-1',
    data: props.actions.map((action) => {
      return {
        x: action.name,
        y: [
          // if only "planned" or only "Is" is set, this ensures that the single point is displayed correctly
          toChartAxisDate(action.finishedUntilPlanned) ||
            toChartAxisDate(action.finishedUntilIs),
          toChartAxisDate(action.finishedUntilIs) ||
            toChartAxisDate(action.finishedUntilPlanned),
        ],
      };
    }),
  },
];

// no reactivity necessary here. If it becomes necessary,
// use a watcher and trigger a rerender of the <apexchart> component
let chartData = mapChartData();

// necessary to calc the min and max date, otherwise apexcharts cuts of the max dates
const calcMinAndMaxValues = (
  chartDataArray: Array<{ x: string; y: Array<number | string> }>,
) => {
  let min = minDate.value;
  let max = maxDate.value;
  chartDataArray.forEach((point) => {
    if (typeof point.y[0] === 'number' && point.y[0] < min) min = point.y[0];
    if (typeof point.y[1] === 'number' && point.y[1] < min) min = point.y[1];
    if (typeof point.y[0] === 'number' && point.y[0] > max) max = point.y[0];
    if (typeof point.y[1] === 'number' && point.y[1] > max) max = point.y[1];
  });
  if (min) minDate.value = min;
  if (max) maxDate.value = max;
};

calcMinAndMaxValues(chartData[0].data);
</script>
