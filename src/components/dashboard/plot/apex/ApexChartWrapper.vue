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
import { roundArray, toTonsArray } from '../../../../pipes/index';
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
  horizontal: {
    type: Boolean,
    required: false,
    default: false,
  },
  stacked: {
    type: Boolean,
    required: false,
    default: false,
  },
  type: {
    type: String as PropType<'bar' | 'line' | 'area'>,
    required: false,
    default: 'bar',
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
          name: 'Marine Sprite 1',
          data: [44, 55, 41, 37, 22, 43, 21],
        },
        {
          name: 'Striking Calf',
          data: [53, 32, 33, 52, 13, 43, 32],
        },
        {
          name: 'Tank Picture',
          data: [12, 17, 11, 9, 15, 11, 20],
        },
        {
          name: 'Bucket Slope',
          data: [9, 7, 5, 8, 6, 9, 4],
        },
        {
          name: 'Reborn Kid',
          data: [25, 12, 19, 32, 25, 24, 10],
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

export interface AggregatedReportResultYearlyGrouped {
  stat: {
    sum: number; // over all data
  };
  yearlyGrouped: {
    [year: string]: {
      stat: {
        sum: number; // over all data for the year
      };
      grouped: {
        [name: string]: number; // sum for each groupBy value
      };
      timeseries: {
        [name: string]: {
          // timeseries for each groupBy value
          name: string;
          year: number;
          timestamp: string;
          sum: number;
        }[];
      };
    };
  };
}
*/
interface ChartData {
  name: string;
  data: number[];
}

const chartData: Ref<ChartData[]> = ref([]);

const categories = ref<string[]>([]);
const chartOptions: ComputedRef<any> = computed(() => {
  return {
    chart: {
      type: props.type,
      stacked: props.stacked,
      // stackType: '100%',
    },
    xaxis: {
      categories: categories.value,
    },
    plotOptions: {
      bar: {
        horizontal: props.horizontal,
      },
    },
  };
});

/**
 * render the chart with prop data
 */
const renderChart = () => {
  console.log('render chart');
  if (props.data) {
    const series = Object.keys(props.data.timeseries).map((key) => {
      return {
        name: key,
        data: roundArray(
          toTonsArray(
            props.data.timeseries[key].map((entry) => entry.sum),
            globalStore.displayInTons,
          ),
        ),
      };
    });
    chartData.value = series;

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
