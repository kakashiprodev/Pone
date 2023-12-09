<template>
    <div v-if="true">
        <FormLine label="Filter auf Scope" v-if="!categoriesFilteredByScope">
            <MultiSelect v-model="filter.scope" :options="[1, 2, 3]" class="w-full" />
        </FormLine>
        <FormLine label="Filter auf Kategorie">
            <MultiSelect v-model="filter.category" :options="filteredCategories" class="w-full" />
        </FormLine>
        <FormLine label="Name">
            <InputText v-model="filter.text" placeholder="Allgemeiner Textfiler auf alle Namen und Spezifikationen"
                class="w-full" />
        </FormLine>
    </div>

    <!-- Column Chooser -->
    <div class="grid">
        <div class="col-8">
        </div>
        <div class="col-4">
            <MultiSelect v-model="_visibleColumns" :options="columnsInTable" option-label="label" option-value="value"
                class="w-full" />
        </div>
    </div>
    <DataTable class="cst-no-hover" :value="filteredEquivalents" selection-mode="single" v-model:selection="selection"
        dataKey="id" paginator :rows="10" v-if="true">
        <!-- <Column field="id" header="Id"></Column> -->
        <Column field="scope" header="Scope" v-if="_visibleColumns.includes('scope')" sortable></Column>
        <Column field="category" header="Kategorie" v-if="_visibleColumns.includes('category')" sortable></Column>
        <Column field="specification1" header="Spezifikation 1" v-if="_visibleColumns.includes('specification1')" sortable>
        </Column>
        <Column field="specification2" header="Spezifikation 2" v-if="_visibleColumns.includes('specification2')" sortable>
        </Column>
        <Column field="specification3" header="Spezifikation 3" v-if="_visibleColumns.includes('specification3')" sortable>
        </Column>
        <Column field="addName1" header="Zusatzname" v-if="_visibleColumns.includes('addName1')" sortable></Column>
        <Column header="Name" v-if="_visibleColumns.includes('fullName')" sortable>
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
        <Column field="source" header="Quelle" v-if="_visibleColumns.includes('source')" sortable></Column>
        <Column field="parent" header="Verkettet?" v-if="_visibleColumns.includes('parent')" sortable>
            <template #body="{ data }">
                <span>{{ data.parent != null && data.parent !== '' ? 'Ja' : 'Nein' }}</span>
            </template>
        </Column>
        <Column field="in" header="Eingabe Einheit" v-if="_visibleColumns.includes('in')" sortable></Column>
        <Column field="out" header="Ausgabe Einheit" v-if="_visibleColumns.includes('out')" sortable></Column>

        <!-- Action Columns -->
        <Column header="" v-if="showEditColumns">
            <template #body="{ data }">
                <div v-if="data.source === 'Benutzereingabe'" class="flex">
                    <Button icon="fa-solid fa-edit" @click="forwardEdit(data, $event)" />
                    <Button icon="fa-solid fa-trash" @click="forwardDelete(data, $event)" class="ml-1" />
                </div>
                <div v-else>
                    -
                </div>
            </template>
        </Column>
    </DataTable>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import MultiSelect from 'primevue/multiselect';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useGlobalStore } from "./../stores/global";
import { PropType, Ref, ref, watch } from 'vue';
import { EquivalentEntry } from './../services/types';
import FormLine from './FormLine.vue';
// import { Equivalent } from './../services/types';

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
    // console.log('filterEquivalents', filter.value);
    filteredEquivalents.value = global.equivalents.filter((equivalent) => {
        // console.log('equivalent', equivalent);
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
            if (!filter.value.addName1.includes(equivalent.addName1)) {
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
                !equivalent.addName1.toLowerCase().includes(filterNameLower)
            ) {
                return false;
            }
        }
        return true;
    });
}
watch(
    () => filter,
    () => {
        console.log('filter changed');
        filterEquivalents();
    },
    { deep: true }
);

// visible columns
const _visibleColumns: Ref<string[]> = ref([]);
const columnsInTable = [
    { value: 'scope', label: 'Scope' },
    { value: 'category', label: 'Kategorie' },
    { value: 'fullName', label: 'Name' }, // calculated column
    { value: 'specification1', label: 'Spezifikation 1' },
    { value: 'specification2', label: 'Spezifikation 2' },
    { value: 'specification3', label: 'Spezifikation 3' },
    { value: 'addName1', label: 'Zusatzname' },
    { value: 'source', label: 'Quelle' },
    { value: 'parent', label: 'Verkettete Berechnung' },
    { value: 'in', label: 'Einheit Eingabe' },
    { value: 'out', label: 'Einheit Ausgabe' },
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
        default: false,
    },
});
if (props.visibleColumns) {
    _visibleColumns.value = props.visibleColumns;
} else {
    _visibleColumns.value = [
        'scope',
        'category',
        'source',
        'in',
        'fullName',
    ]
}
if (props.filterBy) {
    console.log('set filter by parent', props.filterBy);
    filter.value = props.filterBy;
} else {
    console.log('set filter by default');
    filter.value = {
        scope: [1, 2, 3],
    };
}

const filteredCategories = ref<string[]>([]);
if (props.categoriesFilteredByScope) {
    const scope = props.categoriesFilteredByScope;
    if (scope === '1' || scope === '2' || scope === '3') {
        const all: any = global.equivalentFilters.category;
        filteredCategories.value = all['scope' + props.categoriesFilteredByScope];
        filter.value.scope = [parseInt(props.categoriesFilteredByScope)];
        // remove "scope" from visible columns
        const index = _visibleColumns.value.indexOf('scope');
        if (index > -1) {
            _visibleColumns.value.splice(index, 1);
        }
    } else {
        console.error('categoriesFilteredByScope must be 1, 2 or 3');
    }
} else {
    filteredCategories.value = global.equivalentFilters.category.all;
}

// selection
const selection: Ref<null | EquivalentEntry> = ref(null);

if (props.modelValue) {
    console.log('set selection by prop', props.modelValue);
    const id = props.modelValue;
    const equivalent = global.equivalents.find((equivalent) => equivalent.id === id);
    if (equivalent) {
        selection.value = equivalent;
        filter.value.text = equivalent.specification1;
    }
}

// component output is the selected equivalent
const emits = defineEmits(['update:modelValue', 'update:selected', 'edit', 'delete']);
watch(selection, (value) => {
    if (value) {
        console.log('selection changed', value);
        emits('update:modelValue', value.id);
        emits('update:selected', value);
    }
});

// forware events from action column
const forwardEdit = (data: EquivalentEntry, event: any) => {
    emits('edit', { data, event });
}
const forwardDelete = (data: EquivalentEntry, event: any) => {
    emits('delete', { data, event });
}

// refresh trigger
watch(
    () => props.refresh,
    () => {
        console.log('refresh trigger');
        filterEquivalents();
    }
);
</script>