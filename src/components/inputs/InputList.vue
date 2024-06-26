<template>
  <DataTable
    :showGridlines="false"
    v-if="globalStore.equivalents.length > 0"
    :value="filteredActions"
    class="cst-no-hover text-sm"
  >
    <!-- <Column field="id" header="ID"></Column> -->
    <Column
      field="scope"
      :header="$t('inputs.table.scope')"
      sortable
      v-if="preSelectedScope === 'all'"
    >
      <template #body="{ data }">
        <span class="flex justify-center">
          {{ data.scope }}
        </span>
      </template>
    </Column>
    <Column field="category" :header="$t('inputs.table.category')" sortable>
      <template #body="{ data }">
        <Chip
          class="flex text-sm text-white"
          :style="'background-color: ' + categoryColorList[data.category]"
        >
          {{ data.category }}
        </Chip>
      </template>
    </Column>
    <Column field="name" :header="$t('inputs.table.name')" sortable></Column>
    <Column field="rawValue" header="Eingabewert" sortable>
      <template #body="{ data }">
        <Chip class="flex justify-end text-right text-sm">
          {{ roundStringWithDecimals(data.raw_value, 0) }}
          {{ globalStore.equivalentDict[data.equivalent]?.in ?? '' }}
        </Chip>
      </template>
    </Column>
    <Column field="equivalent" :header="$t('inputs.table.equivalent')" sortable>
      <template #body="{ data }">
        <div v-if="data.equivalent != null && data.equivalent !== ''">
          {{
            globalStore.equivalentDict[data.equivalent]?.specification1 ?? ''
          }}
        </div>
        <div v-else></div>
      </template>
    </Column>
    <Column field="facility" :header="$t('inputs.table.facility')" sortable>
      <template #body="{ data }">
        {{ globalStore.facilitiesDict[data.facility]?.name ?? '' }}
      </template>
    </Column>
    <Column field="sumValue" :header="$t('inputs.table.amountYear')" sortable>
      <template #body="{ data }">
        <Chip class="flex justify-end text-right text-sm">
          {{
            globalStore.displayInTons
              ? roundStringWithDecimals(toTons(data.sum_value), 2)
              : roundStringWithDecimals(data.sum_value, 0)
          }}
          {{ globalStore.displayInTons ? ' to' : ' kg' }}
        </Chip>
      </template>
    </Column>
    <Column field="comment" :header="$t('inputs.table.comment')"></Column>
    <Column header="">
      <template #body="{ data }">
        <div class="flex">
          <Button icon="fa-solid fa-edit" @click="emit('edit', data)" />
          <Button
            icon="fa-solid fa-trash"
            class="ml-1"
            @click="
              (e) => {
                emit('delete', data, e);
              }
            "
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/stores/global';
import { ref, watch, defineEmits } from 'vue';
import { InputEntry } from '@/services/types';
import { roundStringWithDecimals, toTons } from '@/services/helper';
import { computed } from 'vue';
import { getMonochromeColorPalette } from '@/services/colors';

const globalStore = useGlobalStore();

const props = defineProps<{
  inputs: InputEntry[];
  filter: string;
  filterScopes: {
    '1': boolean;
    '2': boolean;
    '3': boolean;
  };
  triggerRefresh?: boolean;
  preSelectedScope: '1' | '2' | '3' | 'all';
}>();
watch(props, () => {
  filterData();
});
watch(
  () => props.triggerRefresh,
  () => {
    filterData();
  },
);

const emit = defineEmits(['delete', 'edit', 'copy', 'update:triggerRefresh']);

/**
 * get colors for the categories
 */
const activeCategories = ref(<string[]>[]);
// { [category: string]: string; // color }
const categoryColorList = computed(() => {
  const colors = getMonochromeColorPalette(activeCategories.value.length);
  let colorList: { [category: string]: string } = {};
  let i = 0;
  for (const category of activeCategories.value) {
    colorList[category] = colors[i];
    i++;
  }
  return colorList;
});

/**
 * Filtered action list
 */
const filteredActions = ref<InputEntry[]>([]);
let filterRunning = false;
const filterData = () => {
  if (filterRunning) {
    return;
  }
  filterRunning = true;
  let filtered = props.inputs;
  if (props.filter && props.filter !== '') {
    filtered = props.inputs.filter((item) => {
      return (
        item.name.toLowerCase().includes(props.filter.toLowerCase()) ||
        item.category?.toLowerCase().includes(props.filter.toLowerCase()) ||
        item.comment.toLowerCase().includes(props.filter.toLowerCase())
      );
    });
  }
  if (props.filterScopes) {
    filtered = filtered.filter((item) => {
      return (
        (props.filterScopes['1'] && item.scope === 1) ||
        (props.filterScopes['2'] && item.scope === 2) ||
        (props.filterScopes['3'] && item.scope === 3)
      );
    });
  }

  // count categories
  activeCategories.value = [];
  for (const item of filtered) {
    if (!activeCategories.value.includes(item.category ?? '')) {
      activeCategories.value.push(item.category ?? '');
    }
  }
  // return the filtered list
  filteredActions.value = filtered;
  filterRunning = false;
};
</script>
