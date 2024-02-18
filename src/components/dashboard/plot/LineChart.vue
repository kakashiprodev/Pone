<template>
  <h4>Compare over time</h4>
  <Chart
    v-if="chartData"
    :type="'line'"
    :data="chartData"
    :options="scopeChartOptions"
    class="h-30rem"
  />
</template>

<script setup lang="ts">
import {
  ref,
  Ref,
  onMounted,
  defineProps,
  PropType,
  watch,
  ComputedRef,
  computed,
} from 'vue';
import { AggregatedReportResult } from '../../../services/reporting/index';

const props = defineProps({
  data: {
    type: Object as PropType<AggregatedReportResult>,
    required: true,
  },
  stacked: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const chartData: Ref<any> = ref(null);

const scopeChartOptions: ComputedRef<any> = computed(() => {
  return {
    responsive: true,
    indexAxis: 'x',
    plugins: {
      legend: {
        position: 'top',
        display: true,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#333333',
          font: {
            weight: 500,
          },
        },
        grid: {
          display: true,
        },
        title: {
          display: true,
          text: 'X',
        },
      },
      y: {
        stacked: props.stacked,
        title: {
          display: true,
          text: 'Y',
        },
      },
    },
  };
});

const renderChart = () => {
  if (props.data == null || Object.keys(props.data.timeseries).length === 0) {
    return;
  }
  const firstKey = Object.keys(props.data.timeseries)[0];
  const labels = props.data.timeseries[firstKey].map((entry) => entry.year);

  const data = {
    labels,
    datasets: Object.keys(props.data.timeseries).map((key) => {
      return {
        label: key,
        data: props.data.timeseries[key].map((entry) => entry.sum),
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      };
    }),
  };

  chartData.value = data;
};

watch(
  () => props.data,
  () => {
    renderChart();
  },
  { deep: true },
);

onMounted(() => {
  if (props.data) {
    renderChart();
  }
});
</script>
