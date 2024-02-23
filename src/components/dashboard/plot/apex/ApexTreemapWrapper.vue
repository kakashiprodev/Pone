<template>
  <h4 v-if="label">
    {{ label }}
  </h4>
  <div>
    <apexchart
      :width="width"
      type="treemap"
      :options="chartOptions"
      :series="chartData"
    ></apexchart>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  Ref,
  onMounted,
  defineProps,
  PropType,
  watch,
  computed,
  ComputedRef,
} from 'vue';
import { AggregatedReportResult } from '../../../../services/reporting/index';
import { round, toTons } from '../../../../pipes/index';
import { useGlobalStore } from '../../../../stores/global';

const globalStore = useGlobalStore();

const props = defineProps({
  label: {
    type: String,
    required: false,
  },
  data: {
    type: Object as PropType<AggregatedReportResult>,
    required: true,
  },
  decimals: {
    type: Number,
    required: false,
    default: 0,
  },
});

// max width of the chart via window.innerWidth
const width = ref(window.innerWidth - 400);

/**
 * demo chart:
 series: [
  {
  data: [
    {
      x: 'New Delhi',
      y: 218
    },
    {
      x: 'Kolkata',
      y: 149
    },
    ...
  ]
 */

/*
export interface AggregatedReportResult {
  stat: {
    sum: number; // over all data
  };
  timeseries: {
    [name: string]: {
      name: string;
      year: number;
      timestamp: string;
      sum: number;
    }[];
  };
}
*/
interface ChartData {
  data: {
    x: string;
    y: number;
  }[];
}

const chartData: Ref<ChartData[]> = ref([]);

const categories = ref<string[]>([]);
const chartOptions: ComputedRef<any> = computed(() => {
  return {
    chart: {
      type: 'treemap',
    },
    xaxis: {
      categories: categories.value,
    },
    plotOptions: {},
  };
});

const sum = (data: number[]) => {
  return data.reduce((a, b) => a + b, 0);
};

/**
 * render the chart with prop data
 */
const renderChart = () => {
  console.log('render chart');
  if (props.data) {
    const series = Object.keys(props.data.timeseries).map((key) => {
      return {
        x: key,
        y: round(
          toTons(
            sum(props.data.timeseries[key].map((entry) => entry.sum)),
            globalStore.displayInTons,
          ),
        ),
      };
    });
    chartData.value = [
      {
        data: series,
      },
    ];

    categories.value = props.data.timeseries[
      Object.keys(props.data.timeseries)[0]
    ].map((entry) => entry.year.toString());
  }
};

watch(
  () => props.data,
  () => {
    renderChart();
  },
  { deep: true },
);

onMounted(() => {
  if (props.data || props.data) {
    renderChart();
  }
});
</script>
