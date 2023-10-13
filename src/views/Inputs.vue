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
import { input } from 'src/services/types';


const data: input[] = [
    {
        id: "1",
        scope: "scope1",
        name: "object1",
        value: 10,
        equivalent: 20,
        manualEquivalent: null,
        validity: "P1M",
        timestamp: "2022-01-01T00:00:00.000Z"
    },
    {
        id: "2",
        scope: "scope2",
        name: "object2",
        value: 5,
        equivalent: 10,
        manualEquivalent: 15,
        validity: "P1Y",
        timestamp: "2022-02-01T00:00:00.000Z"
    },
    {
        id: "3",
        scope: "scope3",
        name: "object3",
        value: 100,
        equivalent: 200,
        manualEquivalent: null,
        validity: "P1M",
        timestamp: "2022-03-01T00:00:00.000Z"
    }
];
</script>