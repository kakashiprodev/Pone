<template>
  <h4 v-if="label">
    {{ label }}
  </h4>
  <div v-if="chartOptions && props.data">
    <apexchart
      width="100%"
      type="bar"
      :options="chartOptions"
      :series="props.data"
    ></apexchart>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, PropType, ref } from 'vue';
import { AggregatedReportResult } from '../../../../services/reporting/index';
import { numbersFormatter } from '@/services/reporting/forecast.ts';

const props = defineProps({
  label: {
    type: String,
    required: false,
  },
  data: {
    type: Object as PropType<AggregatedReportResult>,
    required: true,
  },
  labels: {
    type: Array as PropType<Array<number>>,
    required: true,
  },
  annotations: {
    type: Object as PropType<{
      actions: Array<any>;
      targets: Array<any>;
    }>,
  },
});

const annotations = computed(() => {
  return {
    xaxis: props.annotations?.actions.map((action) => {
      return {
        x: action.x,
        strokeDashArray: 0,
        borderColor: '#454545',
        label: {
          borderColor: '#454545',
          style: {
            color: '#fff',
            background: '#666666',
            fontSize: '13px',
          },
          text: action.name,
        },
      };
    }),
    points: props.annotations?.targets.map((target) => {
      if (target)
        return {
          x: target.x,
          y: target.y,
          marker: {
            size: 3,
            radius: 3,
            cssClass: 'apexcharts-custom-class',
          },
        };
    }),
  };
});

const chartOptions = ref({
  id: 'ForecastChart',
  chart: {
    id: 'ForecastChart',
    type: 'bar',
    toolbar: {
      show: false,
    },
  },
  legend: {
    position: 'top',
    fontSize: '15px',
  },
  annotations,
  stroke: {
    width: [0, 0],
  },
  colors: ['#02434f', '#888888'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded',
    },
  },
  xaxis: {
    categories: props.labels,
    labels: {
      style: {
        fontSize: '12px',
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  yaxis: {
    labels: {
      formatter: (value: number) => numbersFormatter(value, 0),
      style: {
        fontSize: '12px',
      },
    },
  },
  tooltip: {
    y: {
      formatter: (value: number) => numbersFormatter(value, 2),
    },
  },
});
</script>
