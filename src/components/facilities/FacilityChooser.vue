<template>
  <DataTable
    v-if="data != null && data.length > 0"
    :value="data"
    class="cst-no-hover"
    :selection-mode="'single'"
    v-model:selection="selectedValue"
    key="id"
  >
    <Column selectionMode="single" headerStyle="width: 3rem"></Column>
    <Column field="name" header="Name"></Column>
    <Column field="manufacturer" header="Hersteller"></Column>
    <Column field="model" header="Modell/Typ"></Column>
  </DataTable>
</template>

<script setup lang="ts">
import { FacilityEntry } from '../../services/types';
import { PropType, Ref, ref, watch } from 'vue';
import { useGlobalStore } from '../../stores/global';

// load global references
const global = useGlobalStore();

const emits = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: String as PropType<null | string>,
    required: false,
  },
});

const selectedValue: Ref<null | FacilityEntry> = ref(null);
watch(
  () => selectedValue.value,
  () => {
    console.log('selectedValue changed');
    console.log(selectedValue.value);
    if (selectedValue.value == null) {
      return;
    }
    emits('update:modelValue', selectedValue.value.id);
  },
);

// main data for table
const data: Ref<FacilityEntry[]> = ref([]);

/**
 * Get all data
 */
const getData = async () => {
  await global.refreshFacilities();
  data.value = global.facilities.filter(
    (f) => f.shutdownDate == null || f.shutdownDate === '',
  );
  if (props.modelValue != null) {
    const entry = global.facilitiesDict[props.modelValue] ?? null;
    if (entry != null) {
      selectedValue.value = entry;
    }
  }
};

/**
 * Init
 */
getData();
</script>

<style>
.cst-no-hover > * > * > .p-datatable-tbody > tr:focus {
  outline: none !important;
}
</style>
