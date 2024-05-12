<template>
  <h4 v-if="label">
    {{ label }}
  </h4>
  <div>
    <apexchart
      v-if="chartData"
      width="100%"
      type="bar"
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
import { AggregatedReportResultYearlyGrouped } from '../../../../services/reporting/index';
import { roundArray, toTonsArray } from '../../../../services/pipes/index';
import { useGlobalStore } from '../../../../stores/global';
import { getMonochromeColorPalette } from './../../../../services/colors';

const globalStore = useGlobalStore();

const props = defineProps({
  label: {
    type: String,
    required: false,
  },
  data: {
    type: Object as PropType<AggregatedReportResultYearlyGrouped>,
    required: true,
  },
  type: {
    type: String as PropType<'bar'>,
    required: false,
    default: 'bar',
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
  decimals: {
    type: Number,
    required: false,
    default: 0,
  },
});

/*
demo chartData:

 [
   {
     name: 'Q1 Budget',
     group: 'budget',
     data: [44000, 55000, 41000, 67000, 22000, 43000]
   },
   {
     name: 'Q1 Actual',
     group: 'actual',
     data: [48000, 50000, 40000, 65000, 25000, 40000]
   },
   {
     name: 'Q2 Budget',
     group: 'budget',
     data: [13000, 36000, 20000, 8000, 13000, 27000]
   },
   {
     name: 'Q2 Actual',
     group: 'actual',
     data: [20000, 40000, 25000, 10000, 12000, 28000]
   }
]
*/

/*
demo data property:

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

const chartData: Ref<any> = ref(null);

const colors = ref<string[]>([]);
const categories = ref<string[]>([]);
const chartOptions: ComputedRef<any> = computed(() => {
  return {
    chart: {
      type: 'bar',
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

/**
 * render the chart with prop data
 */
const renderChart = () => {
  try {
    if (props.data) {
      colors.value = getMonochromeColorPalette(
        Object.keys(props.data.yearlyGrouped).length,
      );
      const series = [];
      const data = props.data.yearlyGrouped;
      const years = Object.keys(data);
      categories.value = years;
      const grouped: any = {};
      for (const year of years) {
        const yearData = data[year];
        for (const group in yearData.grouped) {
          if (grouped[group]) {
            grouped[group].push(yearData.grouped[group]);
          } else {
            grouped[group] = [yearData.grouped[group]];
          }
        }
      }
      for (const group in grouped) {
        series.push({
          name: group,
          data: roundArray(
            toTonsArray(grouped[group], globalStore.displayInTons),
            props.decimals,
          ),
        });
      }
      chartData.value = series;
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
