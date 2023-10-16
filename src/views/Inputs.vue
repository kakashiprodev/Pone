<template>
    <Toolbar>
        <template #start>
            <Button icon="fa-solid fa-plus" />
        </template>
    </Toolbar>

    <DataTable :value="data">
        <!-- <Column field="id" header="ID"></Column> -->
        <Column v-if="scope === 'all'" field="scope" header="Scope"></Column>
        <Column field="name" header="Name"></Column>
        <Column field="sumValue" header="Wert"></Column>
        <Column field="sumValue" header="CO2 Wertigkeit">
            <template #body="{ data }">
                {{ getSumForInput(data.sumValue) }}
            </template>
        </Column>
        <Column field="equivalent" header="Equivalent">
            <template #body="{ data }">
                <div v-if="data.expand?.equivalent?.name">
                    {{ data.expand.equivalent.name }},
                    {{ data.expand.equivalent.avgValue }} {{ data.expand.equivalent.unit }}
                </div>
                <div v-else>
                    {{ "no equivalent" }}
                </div>
            </template>
        </Column>
        <!-- <Column field="manualEquivalent" header="Manual Equivalent"></Column> -->
    </DataTable>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { UserInput } from './../services/types';
import DataProvider from "./../services/dataprovider";
import { Ref, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import { getSumForInput } from "./../services/reporting";

const route = useRoute();

const data: Ref<UserInput[]> = ref([]);
const scope = computed(() => {
    const param = route.params.scope;
    return (param === '' || Array.isArray(param)) ? 'all' : param;
});
watch(scope, () => {
    getData();
});

const getData = async () => {
    console.log('getData', scope.value);
    const query: any = {};
    if (scope.value !== 'all') {
        query['scope'] = scope.value;
    }
    data.value = await DataProvider.readUserInputs(query);
}

// initial get data
getData();
</script>