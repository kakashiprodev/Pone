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
import {
  computed,
  defineProps,
  PropType, ref,
  watch,
} from 'vue';
import { AggregatedReportResult } from '../../../../services/reporting/index';

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
    required: true
  },
  annotations: {
    type: Object as PropType<{
      actions: Array<any>
      targets: Array<any>
    }>
  },
});

const chartOptions = ref({
  id: 'ForecastChart',
  chart: {
    id: 'ForecastChart',
    type: 'bar',
    toolbar: {
      show: false,
    }
  },
  legend: {
    position: 'top',
  },
  annotations: {
    xaxis: props.annotations?.actions,
    points: props.annotations?.targets,
  },
  stroke: {
    width: [0, 4]
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
