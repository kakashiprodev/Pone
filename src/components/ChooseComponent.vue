<template>
    <DataTable class="cst-no-hover" v-if="global.equivalents.length > 0" :value="global.equivalents" selection-mode="single"
        v-model:selection="selection" dataKey="id" style="height: 300px;">
        <!-- <Column field="id" header="Id"></Column> -->
        <Column field="name" header="Name"></Column>
        <Column field="comment" header="Kommentar"></Column>
        <Column field="source" header="Quelle">
            <template #body="{ data }">
                <span>{{ data.source }}</span>
                <span v-if="data.project === 'system'"> (Systemwert)</span>
            </template>
        </Column>
        <!-- <Column field="year" header="Gültigkeit (Jahr)"></Column> -->
        <Column field="avgValue" header="Jahres Durschnittswert"></Column>
        <Column field="unit" header="Einheit"></Column>
        <!-- <Column field="monthlyValues" header="Monatliche Eingaben?"></Column>
        <Column field="project" header="Projekt"></Column> -->
    </DataTable>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useGlobalStore } from "./../stores/global";
import { Ref, ref, watch } from 'vue';
import { InputEntry } from './../services/types';
// import { Equivalent } from './../services/types';

const global = useGlobalStore();
global.refreshEquivalents();

// v-model
const emits = defineEmits(['update:modelValue']);
const props = defineProps(['modelValue']);

const selection: Ref<null | InputEntry> = ref(null);
watch(selection, (value) => {
    if (value) {
        // console.log('update:modelValue', value);
        emits('update:modelValue', value.id);
    }
});

const setId = () => {
    // console.log('setValue', props.modelValue);
    selection.value = {
        id: props.modelValue,
    } as any;
}

// init
setId();
</script>