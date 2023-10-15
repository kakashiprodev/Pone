<template>
    <!-- <SmartInput :data="demo" /> -->
    <div class="report" v-if="!loading">
        <div v-if="chartData.datasets.length > 0">
            <h1 class="text-center">Auswertung {{ global.selectedYear }}</h1>
            <Chart style="margin: 0 auto;" type="pie" :data="chartData" :options="chartOptions" class="w-full md:w-30rem" />
        </div>
        <div v-else>
            <h1 class="text-center mt-5">Noch keine Daten für das Jahr {{ global.selectedYear }} vorhanden</h1>
        </div>

        <div v-if="chartDataScope1.datasets.length > 0">
            <h2 class="text-center">Scope 1</h2>
            <Chart v-if="chartDataScope1.datasets.length > 0" type="bar" :data="chartDataScope1"
                :options="scopeChartOptions" class="h-30rem" />
        </div>
        <div v-if="chartDataScope2.datasets.length > 0">
            <h2 class="text-center">Scope 2</h2>
            <Chart type="bar" :data="chartDataScope2" :options="scopeChartOptions" class="h-30rem" />
        </div>
        <div v-if="chartDataScope3.datasets.length > 0">
            <h2 class="text-center">Scope 3</h2>
            <Chart type="bar" :data="chartDataScope3" :options="scopeChartOptions" class="h-30rem" />
        </div>
    </div>
    <div v-else class="m-auto mt-5 w-1">
        <ProgressSpinner />
    </div>
</template>

<script setup lang="ts">
import Chart from 'primevue/chart';
import { getScopeSums } from "./../services/reporting";
import { ref, Ref } from 'vue';
import { useGlobalStore } from './../stores/global';
import ProgressSpinner from 'primevue/progressspinner';

const loading = ref(true);

const global = useGlobalStore();
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
            // labels: {
            //     fontColor: 'black',
            // }
            display: false,
        }
    },
    scales: {
        x: {
            ticks: {
                color: '#333333',
                font: {
                    weight: 500
                }
            },
            grid: {
                display: false,
                drawBorder: false
            }
        },
        y: {
            ticks: {
                color: '#333333',
            },
            grid: {
                color: '#333333',
                drawBorder: false
            }
        }
    }
};

const chartOptions = ref({
    plugins: {
        legend: {
            labels: {
                usePointStyle: true
            }
        }
    }
});

const loadDasboard = async () => {
    const data = await getScopeSums();
    console.log(data);

    chartData.value = {
        labels: ['Scope 1', 'Scope 2', 'Scope 3'],
        datasets: [
            {
                data: [data.scope1.sum, data.scope2.sum, data.scope3.sum],
            }
        ]
    }

    chartDataScope1.value = {
        labels: data.scope1.list.map((item: any) => item.name),
        datasets: data.scope1.list.map((item: any) => {
            return {
                data: [item.value],
                backgroundColor: '#555555',
                label: item.name,
            }
        }),
    }
    chartDataScope2.value = {
        labels: data.scope2.list.map((item: any) => item.name),
        datasets: data.scope2.list.map((item: any) => {
            return {
                data: [item.value],
                backgroundColor: '#555555',
                label: item.name,
            }
        }),
    }
    chartDataScope3.value = {
        labels: data.scope3.list.map((item: any) => item.name),
        datasets: data.scope3.list.map((item: any) => {
            return {
                data: [item.value],
                backgroundColor: '#555555',
                label: item.name,
            }
        }),
    }

    loading.value = false;
}

loadDasboard();

// import SmartInput from "./../components/SmartInput.vue";

// export interface FlexibleInput {
//     id: string;
//     name: string;
//     label: string;
//     type: 'dropdown' | 'option' | 'number' | 'text' | 'checkbox' | 'slider';
//     //parent: string;
//     //value: null | string | number;
//     children?: FlexibleInput[];
//     // is type == 'text' or 'number' then this is the unit
//     // unit?: (this['type'] extends 'number' | 'text' ? string : undefined);
//     // equivalent?: (this['type'] extends 'number' | 'text' ? string : undefined);
// }

// const demo: FlexibleInput[] = [
//     {
//         id: "1",
//         name: "flotte",
//         label: "Flottenverbauch",
//         type: 'dropdown',
//         children: [
//             {
//                 id: "21",
//                 name: "benzin",
//                 label: "Benzin",
//                 type: 'option',
//                 children: [
//                     {
//                         id: "211",
//                         name: "benzin_small",
//                         label: "Benzin klein",
//                         type: 'option',
//                     },
//                     {
//                         id: "212",
//                         name: "benzin_medium",
//                         label: "Benzin mittel",
//                         type: 'option',

//                     },
//                 ]
//             },
//             {
//                 id: "22",
//                 name: "diesel",
//                 label: "Diesel",
//                 type: 'option',
//                 children: [
//                     {
//                         id: "221",
//                         name: "diesel_big",
//                         label: "Diesel groß",
//                         type: 'number',
//                     },
//                     {
//                         id: "222",
//                         name: "diesel_small",
//                         label: "Diesel klein",
//                         type: 'number',
//                     },
//                 ]
//             },
//         ]
//     }
// ];
</script>

<style scoped>
.report {
    width: 80%;
    margin: 0 auto;
    margin-top: 2rem;
}
</style>