<template>
  <div v-if="!loading && global.selectedReport">
    <div v-if="chartData.datasets.length > 0">
      <h1 class="text-center">Auswertung {{ global.selectedReport.year }}</h1>
      <Chart
        style="margin: 0 auto"
        type="pie"
        :data="chartData"
        :options="chartOptions"
        class="w-full md:w-30rem"
      />
    </div>
    <div v-else>
      <h1 class="text-center mt-5">
        Noch keine Daten für das Jahr {{ global.selectedReport.year }} vorhanden
      </h1>
    </div>

    <div v-if="chartDataScope1.datasets.length > 0" class="mt-5">
      <h2 class="text-center">Scope 1</h2>
      <Chart
        v-if="chartDataScope1.datasets.length > 0"
        type="bar"
        :data="chartDataScope1"
        :options="scopeChartOptions"
        class="h-30rem"
      />
    </div>
    <div v-if="chartDataScope2.datasets.length > 0" class="mt-5">
      <h2 class="text-center">Scope 2</h2>
      <Chart
        type="bar"
        :data="chartDataScope2"
        :options="scopeChartOptions"
        class="h-30rem"
      />
    </div>
    <div v-if="chartDataScope3.datasets.length > 0" class="mt-5">
      <h2 class="text-center">Scope 3</h2>
      <Chart
        type="bar"
        :data="chartDataScope3"
        :options="scopeChartOptions"
        class="h-30rem"
      />
    </div>
  </div>
  <div v-else class="m-auto mt-5 w-1">
    <ProgressSpinner />
  </div>
</template>

<script setup lang="ts">
import { getScopeSums } from '../../../services/reporting/index';
import { ref, Ref } from 'vue';
import { useGlobalStore } from '../../../stores/global';
import dataprovider from '../../../services/dataprovider';

const global = useGlobalStore();

const loading = ref(true);

const chartData: Ref<any> = ref({});
const chartDataScope1: Ref<any> = ref({});
const chartDataScope2: Ref<any> = ref({});
const chartDataScope3: Ref<any> = ref({});

const scopeChartOptions = {
  indexAxis: 'y',
  maintainAspectRatio: false,
  aspectRatio: 0.8,
  plugins: {
    legend: {
      position: 'right',
      display: true,
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#333333',
        font: {
          weight: 500,
        },
      },
      grid: {
        display: false,
        drawBorder: false,
      },
    },
    y: {
      ticks: {
        color: '#333333',
      },
      grid: {
        color: '#333333',
        drawBorder: false,
      },
    },
  },
};

const chartOptions = ref({
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
      },
    },
  },
});

const loadDasboard = async () => {
  const data = await getScopeSums();

  // save last result to database
  // get report
  const report = global.selectedReport;
  if (report) {
    report.sumEmissions = data.scope1.sum + data.scope2.sum + data.scope3.sum;
    await dataprovider.updateReport(report);
  }

  chartData.value = {
    labels: ['Scope 1', 'Scope 2', 'Scope 3'],
    datasets: [
      {
        data: [data.scope1.sum, data.scope2.sum, data.scope3.sum],
        backgroundColor: ['#6bc5b7', '#009ca6', '#00494e'],
        label: 'Mengen in [kg]',
      },
    ],
  };

  chartDataScope1.value = {
    labels: ['Mengen in [kg]'],
    datasets: data.scope1.list.map((item: any) => {
      return {
        data: [item.value],
        backgroundColor: '#6bc5b7',
        label: item.name,
      };
    }),
  };
  chartDataScope2.value = {
    labels: ['Mengen'],
    datasets: data.scope2.list.map((item: any) => {
      return {
        data: [item.value],
        backgroundColor: '#6bc5b7',
        label: item.name,
      };
    }),
  };
  chartDataScope3.value = {
    labels: ['Mengen'],
    datasets: data.scope3.list.map((item: any) => {
      return {
        data: [item.value],
        backgroundColor: '#6bc5b7',
        label: item.name,
      };
    }),
  };

  loading.value = false;
};

loadDasboard();
</script>