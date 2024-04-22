<template>
  <div class="mt-5">
    <apexchart
      width="100%"
      :height="chartHeight"
      :series="chartData"
      :type="CHART_TYPE"
      :options="chartOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { ActionWithPercentage } from '@/services/types.ts';
import { computed, onMounted, ref } from 'vue';
import { toReadableDate } from '@/services/pipes';
import config from '@/config';

const CHART_TYPE = 'rangeBar';

const chartHeight = computed(() => props.actions.length * 100 + 'px');

const chartData = ref<any>([
  {
    name: 'series-1',
    data: [],
  },
]);

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
  },
});

const props = defineProps<{
  actions: ActionWithPercentage[];
}>();

const renderChart = () => {
  chartData.value = [
    {
      name: 'series-1',
      data: props.actions.map((action) => {
        return {
          x: action.name,
          y: [
            toReadableDate(action.finishedUntilPlanned),
            toReadableDate(action.finishedUntilIs),
          ],
        };
      }),
    },
  ];
};

onMounted(() => {
  renderChart();
});
</script>
