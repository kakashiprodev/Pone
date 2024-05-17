<template>
  <h4 v-if="label">
    {{ label }}
  </h4>
  <div>
    <Chart
      v-if="chartData"
      :type="'bar'"
      :data="chartData"
      :options="scopeChartOptions"
      class="h-96"
    />
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
import {
  AggregatedReportResult,
  AggregatedReportResultYearlyGrouped,
} from '../../../../services/reporting/index';

const props = defineProps({
  label: {
    type: String,
    required: false,
  },
  data: {
    type: Object as PropType<
      AggregatedReportResult | AggregatedReportResultYearlyGrouped
    >,
    required: true,
  },
  type: {
    type: String as PropType<'simpleGrouped' | 'yearlyGrouped'>,
    required: false,
    default: 'simpleGrouped',
  },
  stacked: {
    type: Boolean,
    required: false,
    default: false,
  },
  indexAxis: {
    type: String as PropType<'x' | 'y'>,
    required: false,
    default: 'y',
  },
});

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

const chartData: Ref<any> = ref(null);

const scopeChartOptions: ComputedRef<any> = computed(() => {
  return {
    indexAxis: props.indexAxis,
    // maintainAspectRatio: false,
    // aspectRatio: 0.8,
    plugins: {
      legend: {
        position: 'center',
        display: true,
      },
    },
    scales: {
      x: {
        stacked: props.stacked,
        // ticks: {
        //   color: '#333333',
        //   font: {
        //     weight: 500,
        //   },
        // },
        // grid: {
        //   display: false,
        //   drawBorder: false,
        // },
      },
      y: {
        stacked: props.stacked,
        // ticks: {
        //   color: '#333333',
        // },
        // grid: {
        //   color: '#333333',
        //   drawBorder: false,
        // },
      },
    },
  };
});

const renderYearlyGroupedChart = () => {
  // check if type is 'AggregatedReportResultYearlyGrouped'
  if ('yearlyGrouped' in props.data) {
    const d = props.data as AggregatedReportResultYearlyGrouped;
    // the yearlyGrouped will be visualized as a stacked bar chart.
    // Each bar is a year and the stack is the sum of the grouped values!
    // The data is already grouped by year and groupBy value. So we can directly use it.
    // d.yearlyGrouped is an object with the years as keys
    // the values are objects in the "grouped" property inside the yearlyGrouped object
    const labels = Object.keys(d.yearlyGrouped);
    const datasets = [];
    for (const group in d.yearlyGrouped[labels[0]].grouped) {
      datasets.push({
        label: group,
        data: labels.map((year) => d.yearlyGrouped[year].grouped[group]),
        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
          Math.random() * 255,
        )}, ${Math.floor(Math.random() * 255)}, 0.5)`,
      });
    }
    const data = {
      labels,
      datasets,
    };
    chartData.value = data;
  }
};

const renderSimpleGroupedChart = () => {
  // check if type is 'AggregatedReportResult'
  if ('timeseries' in props.data) {
    const d = props.data as AggregatedReportResult;
    const labels = Object.keys(d.timeseries);
    const data = {
      labels,
      datasets: [
        {
          label: 'Sum',
          data: labels.map((name) =>
            d.timeseries[name].reduce((acc, curr) => acc + curr.sum, 0),
          ),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
      ],
    };
    chartData.value = data;
  }
};

/**
 * Render the chart initially and on data change
 */
const renderChart = () => {
  try {
    if (props.type === 'yearlyGrouped') {
      renderYearlyGroupedChart();
    } else {
      renderSimpleGroupedChart();
    }
  } catch (error) {
    console.error('Error rendering chart:', error);
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
