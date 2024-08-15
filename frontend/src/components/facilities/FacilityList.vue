<template>
  <!-- Info Dialog for description -->
  <Dialog
    id="info-dialog"
    v-model:visible="showDescriptionDialog"
    modal
    :header="$t('facilities.description')"
    style="width: 45%"
  >
    <Editor
      v-if="selectedValue"
      class="w-full"
      v-model="selectedValue.description"
      editorStyle="height: 160px; width: 100%;"
      :readonly="true"
    >
      <template v-slot:toolbar>
        <span>
          <span v-show="false"> dummy </span>
        </span>
      </template>
    </Editor>
  </Dialog>

  <!-- Table -->
  <DataTable
    v-if="facilities.length > 0"
    :value="filteredData"
    class="cst-no-hover text-sm"
    :showGridlines="false"
  >
    <!-- <Column field="id" header="ID"></Column> -->
    <Column field="name" :header="$t('facilities.table.name')">
      <template #body="{ data }">
        <Chip class="text-sm">{{ data.name }}</Chip>
      </template>
    </Column>
    <Column
      field="manufacturer"
      :header="$t('facilities.table.manufacturer')"
    ></Column>
    <Column field="model" :header="$t('facilities.table.model')"></Column>
    <Column :header="$t('facilities.table.description')">
      <template #body="{ data }">
        <Button
          icon="fa-solid fa-info-circle"
          @click="showDescription(data)"
        ></Button>
      </template>
    </Column>

    <Column header="">
      <template #body="{ data }">
        <div class="flex">
          <Button
            icon="fa-solid fa-table-list"
            @click="openFacility(data)"
            v-tooltip.bottom="{
              value: $t('facilities.showInputs'),
              showDelay: 500,
              hideDelay: 300,
            }"
          />
          <Button
            icon="fa-solid fa-edit"
            class="ml-1"
            @click="emit('edit', data)"
            v-tooltip.bottom="{
              value: $t('facilities.edit'),
              showDelay: 500,
              hideDelay: 300,
            }"
          />
          <Button
            icon="fa-solid fa-trash"
            class="ml-1"
            @click="emit('delete', data, $event)"
            v-tooltip.bottom="{
              value: $t('facilities.delete'),
              showDelay: 500,
              hideDelay: 300,
            }"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { FacilityEntry } from '@/services/types';
import { ref, watch, defineEmits, Ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const emit = defineEmits(['edit', 'delete', 'copy', 'update:triggerRefresh']);

const filteredData: Ref<FacilityEntry[]> = ref([]);

const props = defineProps<{
  facilities: FacilityEntry[];
  filter: string;
  showOnlyActive: boolean;
  triggerRefresh: boolean;
}>();
watch(
  () => props.facilities,
  () => {
    filterData();
  },
);
watch(
  () => props.filter,
  () => {
    filterData();
  },
);
watch(
  () => props.triggerRefresh,
  () => {
    filterData();
    emit('update:triggerRefresh', false);
  },
);
watch(
  () => props.showOnlyActive,
  () => {
    filterData();
  },
);

/**
 * filter the table by a global string filter
 */
const filterData = () => {
  let filtered = props.facilities;
  if (props.filter !== '') {
    filtered = props.facilities.filter((item) => {
      return (
        item.name.toLowerCase().includes(props.filter.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(props.filter.toLowerCase()) ||
        item.model?.toLowerCase().includes(props.filter.toLowerCase()) ||
        item.description?.toLowerCase().includes(props.filter.toLowerCase())
      );
    });
  }
  // filter for active
  filtered = filtered.filter((item) => {
    if (props.showOnlyActive === false) {
      return true;
    }
    return item.shutdownDate == null || item.shutdownDate === '';
  });
  filteredData.value = filtered;
};

/**
 * show info dialog
 */
const showDescriptionDialog = ref(false);
const selectedValue = ref<FacilityEntry | null>(null);
const showDescription = (data: FacilityEntry) => {
  selectedValue.value = data;
  showDescriptionDialog.value = true;
};

/**
 * Open facility inputs
 */
const openFacility = (data: FacilityEntry) => {
  router.push({ name: 'inputs-facility', params: { facility: data.id } });
};

onMounted(() => {
  filterData();
});
</script>

<style>
.cst-no-hover > * > * > .p-datatable-tbody > tr:focus {
  outline: none !important;
}
</style>
