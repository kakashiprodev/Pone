<template>
  <div style="max-width: 25%">
    <div class="m-auto text-center w-full">
      <h4 v-if="label">
        {{ label }}
      </h4>
    </div>

    <div>
      <apexchart
        width="100%"
        :options="chartOptions"
        :series="series"
      ></apexchart>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType, computed, ComputedRef } from 'vue';
import Config from '../../../../config';

const props = defineProps({
  label: {
    type: String,
    required: false,
  },
  data: {
    type: Number as PropType<number>,
    required: true,
  },
  unit: {
    type: String,
    required: false,
  },
});

const series = computed(() => {
  return [props.data];
});
const chartOptions: ComputedRef<any> = computed(() => {
  return {
    // series: [props.data],
    chart: {
      type: 'radialBar',
      offsetY: -20,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: '#e7e7e7',
          strokeWidth: '97%',
          margin: 5, // margin is in pixels
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            color: Config.colors.grey,
            opacity: 1,
            blur: 2,
          },
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            offsetY: -2,
            fontSize: '22px',
          },
        },
      },
    },
    grid: {
      padding: {
        top: -10,
      },
    },
    labels: [props.unit ?? ''],
    colors: [Config.colors.data2],
  };
});
</script>
