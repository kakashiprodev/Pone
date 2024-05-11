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
import config from '@/config.ts';

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
        borderColor: config.colors.data5,
        label: {
          borderColor: config.colors.data5,
          style: {
            color: '#fff',
            background: config.colors.data5,
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
            size: 4,
            fillColor: config.colors.data7,
            strokeColor: config.colors.data7,
            radius: 2,
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
  },
  annotations,
  stroke: {
    width: [0, 4],
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded',
    },
  },
  xaxis: {
    categories: props.labels,
  },
  dataLabels: {
    enabled: false,
  },
});
</script>
