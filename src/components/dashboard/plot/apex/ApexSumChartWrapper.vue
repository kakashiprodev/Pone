<template>
  <h4 v-if="label">
    {{ label }}
  </h4>
  <div>
    <apexchart
      width="100%"
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
import { round, toTons } from '../../../../services/pipes/index';
import { useGlobalStore } from '../../../../stores/global';
import { getMonochromeColorPalette } from './../../../../services/colors';

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
    type: String as PropType<'polarArea' | 'radar' | 'pie' | 'donut'>,
    required: false,
    default: 'polarArea',
  },
  decimals: {
    type: Number,
    required: false,
    default: 0,
  },
});

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
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    plotOptions: {
      [props.type === 'donut' ? 'pie' : '_']: {
        donut: {
          size: '20%',
        },
      },
    },
    legend: {
      show: true,
      position: 'bottom',
    },
    labels: categories.value,
    colors: colors.value,
    tooltip: {
      y: {
        formatter: function (value: number) {
          return (
            value.toLocaleString() + (globalStore.displayInTons ? ' to' : ' kg')
          );
        },
      },
    },
  };
});
const colors = ref<string[]>([]);

const sum = (data: number[]) => {
  return data.reduce((a, b) => a + b, 0);
};

/**
 * render the chart with prop data
 */
const renderChart = () => {
  try {
    if (props.data) {
      const series: number[] = [];
      // get sum of all entries for each key in timeseries
      Object.keys(props.data.timeseries).forEach((key) => {
        const sumOfKey = sum(
          props.data.timeseries[key].map((entry) => entry.sum),
        );
        series.push(round(toTons(sumOfKey)));
      });

      // add colors
      colors.value = getMonochromeColorPalette(
        Object.keys(props.data.timeseries).length,
      );

      chartData.value =
        props.type === 'polarArea' ||
        props.type === 'pie' ||
        props.type === 'donut'
          ? series
          : [
              {
                name: 'Sum',
                data: series,
              },
            ];

      categories.value = Object.keys(props.data.timeseries);
      if (categories.value.length === 3 && categories.value[0] === '1') {
        categories.value = ['Scope 1', 'Scope 2', 'Scope 3'];
      }
    }
  } catch (error) {
    console.error('Error rendering chart', error);
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
