<template>
  <div class="mt-5">
    <p v-if="chartLoading">Lade Dumbbell Chart...</p>
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
import { computed, onMounted, ref } from 'vue';
import { toReadableDate } from '@/services/pipes';
import config from '@/config';

const CHART_TYPE = 'rangeBar';

const chartLoading = ref(true);

const chartHeight = computed(() => props.actions.length * 100 + 'px');

const chartDataReady = ref(false);
const minDate = ref(new Date().getTime());
const maxDate = ref(new Date().getTime());

const chartData = ref<any>([
  {
    name: 'series-1',
    data: [],
  },
]);

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
  },
  xaxis: {
    lines: {
      show: true,
    },
    type: 'datetime',
    min: minDate,
    max: maxDate,
  },
});

const props = defineProps<{
  actions: ActionWithPercentage[];
}>();

// necessary to calc the min and max date, otherwise apexcharts cuts of the max dates
const calcMinAndMaxValues = (
  chartDataArray: Array<{ x: string; y: Array<number> }>,
) => {
  let min = minDate.value;
  let max = maxDate.value;
  chartDataArray.forEach((point) => {
    if (point.y[0] < min) min = point.y[0];
    if (point.y[1] < min) min = point.y[1];
    if (point.y[0] > max) max = point.y[0];
    if (point.y[1] > max) max = point.y[1];
  });
  if (min) minDate.value = min;
  if (max) maxDate.value = max;
};

const renderChart = () => {
  chartData.value = [
    {
      name: 'series-1',
      data: props.actions.map((action) => {
        return {
          x: action.name,
          y: [
            // if only "planned" or only "Is" is set, this ensures that the single point is displayed correctly
            toReadableDate(action.finishedUntilPlanned) ||
              toReadableDate(action.finishedUntilIs),
            toReadableDate(action.finishedUntilIs) ||
              toReadableDate(action.finishedUntilPlanned),
          ],
        };
      }),
    },
  ];
  calcMinAndMaxValues(chartData.value[0].data);
  chartDataReady.value = true;
};

onMounted(() => {
  renderChart();
});
</script>
