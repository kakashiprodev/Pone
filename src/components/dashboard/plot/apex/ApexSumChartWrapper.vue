<template>
  <h4 v-if="label">
    {{ label }}
  </h4>
  <div>
    <apexchart
      :width="width"
      :type="props.type"
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
  type: {
    type: String as PropType<'polarArea' | 'radar' | 'pie'>,
    required: false,
    default: 'polarArea',
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
 * [
        {
          name: 'Sum',
          data: [44, 55, 41],
        },
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
  name: string;
  data: number[];
}

const chartData: Ref<ChartData[] | number[]> = ref([]);

const categories = ref<string[]>([]);
const chartOptions: ComputedRef<any> = computed(() => {
  return {
    chart: {
      type: 'radar',
    },
    xaxis: {
      categories: categories.value,
    },
    plotOptions: {},
    labels: categories.value,
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
    const series: number[] = [];
    // get sum of all entries for each key in timeseries
    Object.keys(props.data.timeseries).forEach((key) => {
      const sumOfKey = sum(
        props.data.timeseries[key].map((entry) => entry.sum),
      );
      series.push(round(toTons(sumOfKey, globalStore.displayInTons)));
    });

    chartData.value =
      props.type === 'polarArea' || props.type === 'pie'
        ? series
        : [
            {
              name: 'Sum',
              data: series,
            },
          ];

    categories.value = Object.keys(props.data.timeseries);
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
