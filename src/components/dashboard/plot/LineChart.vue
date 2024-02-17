<template>
  <h4>Compare over time</h4>
  <Chart
    v-if="chartData"
    :type="'line'"
    :data="chartData"
    :options="scopeChartOptions"
    class="h-30rem"
  />
  <div v-else class="m-auto mt-5 w-1">
    <ProgressSpinner />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, defineProps, PropType, watch } from 'vue';
import Chart from 'primevue/chart';
import ProgressSpinner from 'primevue/progressspinner';

interface TimeseriesEntry {
  year: number;
  timestamp: string;
  sum: number;
}

interface AggregatedReportResult {
  stat: {
    sum: number;
  };
  timeseries: {
    [name: string]: TimeseriesEntry[];
  };
}

const props = defineProps({
  data: {
    type: Object as PropType<AggregatedReportResult>,
    required: true,
  },
});

const chartData: Ref<any> = ref(null);

const scopeChartOptions = {
  indexAxis: 'x', // Typically, line charts use the x-axis for labels
  maintainAspectRatio: false,
  aspectRatio: 0.8,
  plugins: {
    legend: {
      position: 'top', // Adjusted for better readability in line charts
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
        display: true, // Adjusted to show grid lines for better readability
        drawBorder: true,
      },
    },
    y: {
      ticks: {
        color: '#333333',
      },
      grid: {
        color: '#333333',
        drawBorder: true,
      },
    },
  },
};

const renderChart = () => {
  const firstKey = Object.keys(props.data.timeseries)[0];
  const labels = props.data.timeseries[firstKey].map((entry) => entry.year);

  const data = {
    labels,
    datasets: Object.keys(props.data.timeseries).map((key) => {
      return {
        label: key,
        data: props.data.timeseries[key].map((entry) => entry.sum),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      };
    }),
    // {
    //   label: 'Sum',
    //   data: sums,
    //   backgroundColor: 'rgba(54, 162, 235, 0.2)',
    //   borderColor: 'rgb(54, 162, 235)',
    //   borderWidth: 2,
    //   fill: true,
    // },
  };

  console.log(data);

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
