<template>
    <DataTable :value="data">
        <Column field="id" header="ID"></Column>
        <Column field="scope" header="Scope"></Column>
        <Column field="name" header="Name"></Column>
        <Column field="value" header="Value"></Column>
        <Column field="equivalent" header="Equivalent"></Column>
        <Column field="manualEquivalent" header="Manual Equivalent"></Column>
        <Column field="validity" header="Validity"></Column>
        <Column field="timestamp" header="Timestamp"></Column>
    </DataTable>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { UserInput } from './../services/types';
import DataProvider from "./../services/dataprovider";
import { Ref, ref } from 'vue';

const data: Ref<UserInput[]> = ref([]);

const getData = async () => {
    data.value = await DataProvider.readUserInputs();
}

getData();
</script>