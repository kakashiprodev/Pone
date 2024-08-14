<template>
  <div v-if="true">
    <FormLine
      v-if="!comfortMode && !categoriesFilteredByScope && !hideScopeInput"
      :label="$t('equivalents.filterScope')"
    >
      <MultiSelect v-model="filter.scope" :options="[1, 2, 3]" class="w-full" />
    </FormLine>
    <HorizontalScopeSwitch v-else-if="!hideScopeInput" v-model="filter.scope" />

    <FormLine v-if="!comfortMode" :label="$t('equivalents.filterCat')">
      <MultiSelect
        v-model="filter.category"
        :options="filteredCategories"
        class="w-full"
      />
    </FormLine>
    <Listbox
      v-else
      v-model="filter.category"
      :options="filteredCategories"
      class="w-full mb-2"
      listStyle="max-height:250px"
    />

    <FormLine :label="$t('equivalents.name')">
      <InputText
        v-model="filter.text"
        :placeholder="$t('equivalents.namePlaceholder')"
        class="w-full"
      />
    </FormLine>

    <FormLine :label="$t('equivalents.source')" v-if="comfortMode">
      <MultiSelect
        v-model="filter.source"
        :options="global.equivalentFilters.source.all"
        class="w-full"
      />
    </FormLine>

    <FormLine :label="$t('equivalents.unit')" v-if="comfortMode">
      <MultiSelect
        v-model="filter.in"
        :options="global.equivalentFilters.unit.all"
        class="w-full"
      />
    </FormLine>
  </div>

  <!-- Column Chooser -->
  <div class="grid grid-cols-12 mt-1" v-if="showColumnChooser">
    <div class="col-span-8"></div>
    <div class="col-span-4">
      <MultiSelect
        v-model="_visibleColumns"
        :options="columnsInTable"
        option-label="label"
        option-value="value"
        class="w-full"
      />
    </div>
  </div>
  <DataTable
    :showGridlines="false"
    class="cst-no-hover"
    :value="filteredEquivalents"
    selection-mode="single"
    v-model:selection="selection"
    dataKey="id"
    paginator
    :rows="rowsPerPage"
    v-if="true"
    scrollHeight="300px"
  >
    <Column
      selectionMode="single"
      headerStyle="width: 3rem"
      v-if="showChooseColumn"
    ></Column>
    <!-- <Column field="id" header="Id"></Column> -->
    <Column
      field="scope"
      :header="$t('equivalents.table.scope')"
      v-if="_visibleColumns.includes('scope')"
      sortable
    ></Column>
    <Column
      field="category"
      :header="$t('equivalents.table.category')"
      v-if="_visibleColumns.includes('category')"
      sortable
    ></Column>
    <Column
      field="specification1"
      :header="$t('equivalents.table.spec1')"
      v-if="_visibleColumns.includes('specification1')"
      sortable
    >
    </Column>
    <Column
      field="specification2"
      :header="$t('equivalents.table.spec2')"
      v-if="_visibleColumns.includes('specification2')"
      sortable
    >
    </Column>
    <Column
      field="specification3"
      :header="$t('equivalents.table.spec3')"
      v-if="_visibleColumns.includes('specification3')"
      sortable
    >
    </Column>
    <Column
      field="add_name1"
      :header="$t('equivalents.table.addName')"
      v-if="_visibleColumns.includes('addName1')"
      sortable
    ></Column>
    <Column
      :header="$t('equivalents.table.name')"
      v-if="_visibleColumns.includes('fullName')"
      sortable
    >
      <template #body="{ data }">
        <span>
          {{ data.specification1 }}
          <template v-if="data.specification2 && data.specification2 !== ''">
            > {{ data.specification2 }}
          </template>
          <template v-if="data.specification3 && data.specification3 !== ''">
            > {{ data.specification3 }}
          </template>
        </span>
      </template>
    </Column>
    <Column
      field="in"
      :header="$t('equivalents.table.inputUnit')"
      v-if="_visibleColumns.includes('in')"
      sortable
    ></Column>
    <Column
      field="avg_value"
      :header="$t('equivalents.table.factor')"
      v-if="_visibleColumns.includes('avgValue')"
    ></Column>
    <Column
      field="out"
      :header="$t('equivalents.table.outputUnit')"
      v-if="_visibleColumns.includes('out')"
      sortable
    ></Column>

    <Column
      field="source"
      :header="$t('equivalents.table.source')"
      v-if="_visibleColumns.includes('source')"
      sortable
    ></Column>
    <Column
      field="parent"
      :header="$t('equivalents.table.parent') + '?'"
      v-if="_visibleColumns.includes('parent')"
      sortable
    >
      <template #body="{ data }">
        <span>{{
          data.parent != null && data.parent !== ''
            ? $t('global.yes')
            : $t('global.no')
        }}</span>
      </template>
    </Column>

    <!-- Action Columns -->
    <Column header="" v-if="showEditColumns">
      <template #body="{ data }">
        <div
          v-if="data.source === 'Benutzereingabe' || global.isGlobalAdmin"
          class="flex"
        >
          <Button icon="fa-solid fa-edit" @click="forwardEdit(data, $event)" />
          <Button
            icon="fa-solid fa-trash"
            @click="forwardDelete(data, $event)"
            class="ml-1"
          />
        </div>
        <div v-else>-</div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { useGlobalStore } from '../../stores/global';
import { PropType, Ref, ref, watch } from 'vue';
import { EquivalentEntry } from '../../services/types';
import FormLine from './FormLine.vue';
import HorizontalScopeSwitch from './HorizontalScopeSwitch.vue';
import { useI18n } from 'vue-i18n';

// import { Equivalent } from './../services/types';

const { t } = useI18n();

const global = useGlobalStore();
global.refreshEquivalents();

// filtered equivalents
interface EquivalentFilter {
  scope?: number[];
  category?: string[];
  specification1?: string[];
  specification2?: string[];
  specification3?: string[];
  addName1?: string[];
  source?: string[];
  parent?: boolean;
  in?: string[];
  out?: string[];
  text?: string;
}
const filteredEquivalents = ref(global.equivalents);

// filter function for the whole table
const filter: Ref<EquivalentFilter> = ref({});

// funtion to filter the table by all filter criteria arrays
const filterEquivalents = () => {
  filteredEquivalents.value = global.equivalents.filter((equivalent) => {
    // scope
    if (filter.value.scope && filter.value.scope.length > 0) {
      if (!filter.value.scope.includes(equivalent.scope)) {
        return false;
      }
    }
    // category
    if (filter.value.category && filter.value.category.length > 0) {
      if (!filter.value.category.includes(equivalent.category)) {
        return false;
      }
    }
    // specification1
    if (filter.value.specification1 && filter.value.specification1.length > 0) {
      if (!filter.value.specification1.includes(equivalent.specification1)) {
        return false;
      }
    }
    // specification2
    if (filter.value.specification2 && filter.value.specification2.length > 0) {
      if (!filter.value.specification2.includes(equivalent.specification2)) {
        return false;
      }
    }
    // specification3
    if (filter.value.specification3 && filter.value.specification3.length > 0) {
      if (!filter.value.specification3.includes(equivalent.specification3)) {
        return false;
      }
    }
    // addName1
    if (filter.value.addName1 && filter.value.addName1.length > 0) {
      if (!filter.value.addName1.includes(equivalent.add_name1)) {
        return false;
      }
    }
    // source
    if (filter.value.source && filter.value.source.length > 0) {
      if (!filter.value.source.includes(equivalent.source)) {
        return false;
      }
    }
    // parent
    if (filter.value.parent != null) {
      if (filter.value.parent && equivalent.parent == null) {
        return false;
      }
      if (!filter.value.parent && equivalent.parent != null) {
        return false;
      }
    }
    // in
    if (filter.value.in && filter.value.in.length > 0) {
      if (!filter.value.in.includes(equivalent.in)) {
        return false;
      }
    }
    // out
    if (filter.value.out && filter.value.out.length > 0) {
      if (!filter.value.out.includes(equivalent.out)) {
        return false;
      }
    }
    // free name input that can be some part of specification1, specification2, specification3 or addName1. compared lowercase
    if (filter.value.text && filter.value.text.length > 0) {
      const filterNameLower = filter.value.text.toLowerCase();
      if (
        !equivalent.specification1.toLowerCase().includes(filterNameLower) &&
        !equivalent.specification2.toLowerCase().includes(filterNameLower) &&
        !equivalent.specification3.toLowerCase().includes(filterNameLower) &&
        !equivalent.add_name1.toLowerCase().includes(filterNameLower)
      ) {
        return false;
      }
    }
    return true;
  });
};
watch(
  () => filter,
  () => {
    filterEquivalents();
  },
  { deep: true },
);

// visible columns
const _visibleColumns: Ref<string[]> = ref([]);
const columnsInTable = [
  { value: 'scope', label: t('equivalents.table.scope') },
  { value: 'category', label: t('equivalents.table.category') },
  { value: 'fullName', label: t('equivalents.table.name') }, // calculated column
  { value: 'specification1', label: t('equivalents.table.spec1') },
  { value: 'specification2', label: t('equivalents.table.spec2') },
  { value: 'specification3', label: t('equivalents.table.spec3') },
  { value: 'addName1', label: t('equivalents.table.addName') },
  { value: 'source', label: t('equivalents.table.source') },
  { value: 'parent', label: t('equivalents.table.parentLong') },
  { value: 'in', label: t('equivalents.table.inputUnit') },
  { value: 'out', label: t('equivalents.table.outputUnit') },
  { value: 'avgValue', label: t('equivalents.table.factorYear') },
];
// set the filter if it is passed as prop
const props = defineProps({
  filterBy: {
    type: Object as PropType<EquivalentFilter>,
    required: false,
  },
  categoriesFilteredByScope: {
    type: String as PropType<'1' | '2' | '3'>,
    required: false,
  },
  visibleColumns: {
    type: Array as PropType<string[]>,
    required: false,
  },
  modelValue: {},
  showEditColumns: {
    type: Boolean,
    required: false,
    default: false,
  },
  refresh: {
    type: Number,
    required: false,
    default: -1,
  },
  comfortMode: {
    type: Boolean,
    required: false,
    default: false,
  },
  rowsPerPage: {
    type: Number,
    required: false,
    default: 10,
  },
  showColumnChooser: {
    type: Boolean,
    required: false,
    default: true,
  },
  hideScopeInput: {
    type: Boolean,
    required: false,
    default: false,
  },
  showChooseColumn: {
    type: Boolean,
    required: false,
    default: true,
  },
});
if (props.visibleColumns) {
  _visibleColumns.value = props.visibleColumns;
} else {
  _visibleColumns.value = ['scope', 'category', 'source', 'in', 'fullName'];
}
if (props.filterBy) {
  filter.value = props.filterBy;
} else {
  filter.value = {
    scope: [1, 2, 3],
  };
}
if (props.categoriesFilteredByScope) {
  filter.value.scope = [parseInt(props.categoriesFilteredByScope)];
}

const filteredCategories = ref<string[]>([]);
const updateFilteredCategories = () => {
  const all: any = global.equivalentFilters.category;
  if (props.categoriesFilteredByScope || props.comfortMode) {
    const scope =
      'scope' +
      (filter.value.scope && filter.value.scope[0]
        ? filter.value.scope[0].toString()
        : '1');
    filteredCategories.value = all[scope];
    // remove "scope" from visible columns since it is already filtered
    const index = _visibleColumns.value.indexOf('scope');
    if (index > -1) {
      _visibleColumns.value.splice(index, 1);
    }
  } else {
    filteredCategories.value = global.equivalentFilters.category.all;
  }
};
updateFilteredCategories();
watch(
  () => filter.value.scope,
  () => updateFilteredCategories(),
);

// selection
const selection: Ref<null | EquivalentEntry> = ref(null);

if (props.modelValue) {
  const id = props.modelValue;
  const equivalent = global.equivalents.find(
    (equivalent) => equivalent.id === id,
  );
  if (equivalent) {
    selection.value = equivalent;
    filter.value.text = equivalent.specification1;
  }
}

// component output is the selected equivalent
const emits = defineEmits([
  'update:modelValue',
  'update:selected',
  'edit',
  'delete',
  'change',
]);
watch(selection, (value) => {
  if (value) {
    emits('update:modelValue', value.id);
    emits('update:selected', value);
    emits('change', true);
  }
});

// forware events from action column
const forwardEdit = (data: EquivalentEntry, event: any) => {
  emits('edit', { data, event });
};
const forwardDelete = (data: EquivalentEntry, event: any) => {
  emits('delete', { data, event });
};

// refresh trigger
watch(
  () => props.refresh,
  () => {
    filterEquivalents();
  },
);
</script>
