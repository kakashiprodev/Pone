<template>
  <h4>Radar chart</h4>
  <div>
    <Chart
      v-if="chartData"
      :type="'radar'"
      :data="chartData"
      :options="scopeChartOptions"
      class="h-30rem"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, defineProps, PropType, watch } from 'vue';
import Chart from 'primevue/chart';
import { AggregatedReportResult } from '../../../services/reporting/index';

const props = defineProps({
  data: {
    type: Object as PropType<AggregatedReportResult>,
    required: true,
  },
});

const chartData: Ref<any> = ref(null);
/*
  const config = {
  type: 'radar',
  data: data,
  options: {
    elements: {
      line: {
        borderWidth: 3
      }
    }
  },
};
*/

const scopeChartOptions = {
  plugins: {
    legend: {
      position: 'right',
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
        display: false,
        drawBorder: false,
      },
    },
    y: {
      ticks: {
        color: '#333333',
      },
      grid: {
        color: '#333333',
        drawBorder: false,
      },
    },
  },
};

const renderChart = () => {
  const labels = Object.keys(props.data.timeseries);
  const data = {
    labels,
    datasets: [
      {
        label: 'Sum',
        data: labels.map((name) =>
          props.data.timeseries[name].reduce((acc, curr) => acc + curr.sum, 0),
        ),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
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
