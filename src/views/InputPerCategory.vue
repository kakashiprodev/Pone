<template>
    <h5>
        {{ global.categories.find((item) => item.name === category)?.label ?? 'Category not found' }}
    </h5>

    <Toolbar class="mb-2">
        <template #end>
            <Button icon="fa-solid fa-plus" @click="selectedValue = clone(emptyInput); showDialog = true" class="mr-1" />
        </template>
    </Toolbar>

    <Dialog id="edit-create-input" v-model:visible="showDialog" modal
        :header="selectedValue.id === 'new' ? 'Anlegen' : 'Bearbeiten'"
        :class="{ 'w-6': windowWidth > 990, 'w-full': windowWidth < 990, 'h-screen': windowWidth < 990 }">

        <div>
            <div class="field">
                <label for="userinput-name">Vorauswahl</label>
                <Listbox v-model="selectedPreset" :options="presets" filter optionLabel="name" class="w-full"
                    @change="selectPreset" />
            </div>
            <div class="field">
                <label for="userinput-name">Name</label>
                <InputText class="w-full" v-model="selectedValue.name" id="userinput-name" />
            </div>
            <div class="field">
                <label for="userinput-comment">Kommentar</label>
                <InputText class="w-full" v-model="selectedValue.comment" id="userinput-comment" />
            </div>
            <div class="field">
                <label for="userinput-rawvalue">
                    Eingabewert {{ choosenEquivalent ? ' in ' + choosenEquivalent.in : '' }}
                </label>
                <InputNumber class="w-full" v-model="selectedValue.rawValue" id="userinput-rawvalue" :use-grouping="false"
                    :suffix="choosenEquivalent ? ' ' + choosenEquivalent.in : ''" />
            </div>
            <!-- helping information -->
            <div class="field">
                <label for="userinput-sum">Berechnung</label>
                <p style="white-space: pre-wrap;">
                    {{ computedSumCalculation }}
                </p>
            </div>
            <div class="field">
                <label for="userinput-sum">Menge (berechnet)</label>
                <InputNumber :disabled="true" class="w-full" v-model="computedSumValue" id="userinput-sum"
                    :use-grouping="false" suffix=" to" />
            </div>
        </div>
        <div>
            <Button :label="selectedValue.id === 'new' ? 'Anlegen' : 'Speichern'" @click="save" />
        </div>
    </Dialog>

    <ConfirmPopup></ConfirmPopup>
    <DataTable v-if="global.equivalents.length > 0" :value="data" class="cst-no-hover">
        <Column field="name" header="Name"></Column>
        <Column field="rawValue" header="Eingabewert"></Column>
        <Column field="equivalent" header="Äquivalent">
            <template #body="{ data }">
                <div v-if="data.equivalent != null && data.equivalent !== ''">
                    {{ global.equivalentDict[data.equivalent]?.name ?? 'Reference error' }}
                </div>
                <div v-else>
                </div>
            </template>
        </Column>
        <Column field="sumValue" header="Menge (Jahr)">
            <template #body="{ data }">
                {{ data.sumValue }} [to]
            </template>
        </Column>
        <Column field="comment" header="Kommentar"></Column>
        <Column header="">
            <template #body="{ data }">
                <div class="flex">
                    <Button icon="fa-solid fa-edit"
                        @click="selectedValue = data; originalValue = clone(data); showDialog = true" />
                    <Button icon="fa-solid fa-trash" class="ml-1" @click="deleteEntry(data, $event)" />
                </div>
            </template>
        </Column>
    </DataTable>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import ConfirmPopup from 'primevue/confirmpopup';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Listbox from 'primevue/listbox';
import { Equivalent, InputEntry, PresetEntry } from './../services/types';
import dataprovider from "./../services/dataprovider";
import { Ref, ref, computed, watch, ComputedRef } from 'vue';
import { useRoute } from 'vue-router';
import { useGlobalStore } from './../stores/global';
import { error } from './../services/toast';
import { useConfirm } from 'primevue/useconfirm';
import { getSumForInput, getCalculationSteps } from "./../services/reporting";

const windowWidth = ref(window.innerWidth);
const global = useGlobalStore();

// get "category" from route
const route = useRoute();
const category = computed(() => {
    return route.params.category;
});
// on change
watch(category, async () => {
    await getData();
});

// actual choosen equivalent. to show the name and unit in the input field
const choosenEquivalent: ComputedRef<null | Equivalent> = computed(() => {
    try {
        return global.equivalentDict[selectedValue.value.equivalent ?? ""];
    } catch (e) {
        return null;
    }
});

const showDialog = ref(false);
const emptyInput: InputEntry = {
    id: 'new',
    name: '',
    comment: '',
    report: global.selectedReport?.id ?? '',
    scope: 1,
    sumValue: 0.1,
    rawValue: 0.1,
    equivalent: null,
    category: global.categories.find((item) => item.name === category.value)?.id ?? null,
}
const clone = (input: InputEntry) => {
    return JSON.parse(JSON.stringify(input));
}
const selectedValue: Ref<InputEntry> = ref(emptyInput);
const originalValue: Ref<InputEntry> = ref(emptyInput);

// preset selection
const selectedPreset = ref('');

const selectPreset = (val: any) => {
    console.log(val);
    selectedValue.value.name = val.value.name;
    selectedValue.value.equivalent = val.value.equivalent;
}

const computedSumValue = computed(() => {
    return getSumForInput(selectedValue.value, global.equivalentDict);
});
const computedSumCalculation: ComputedRef<string> = computed(() => {
    if (selectedValue.value.equivalent != null && selectedValue.value.equivalent !== '') {
        return getCalculationSteps(selectedValue.value, global.equivalentDict).join('\n');
    } else {
        return '';
    }
});
const save = async () => {
    try {
        if (selectedValue.value.id === 'new') {
            const toCreate = clone(selectedValue.value);
            delete toCreate.id;
            const created = await dataprovider.createUserInput(toCreate);
            data.value.push(created);
            showDialog.value = false;
            selectedValue.value = clone(emptyInput);
        } else {
            const updated = await dataprovider.updateUserInput(selectedValue.value);
            const index = data.value.findIndex((item) => item.id === updated.id);
            data.value[index] = updated;
            showDialog.value = false;
        }
    } catch (e) {
        error(e + "");
    }
}

/**
 * Delete an entry
 */
const confirm = useConfirm();
const deleteEntry = async (entry: InputEntry, event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Soll der Wert wirklich gelöscht werden?',
        icon: 'fa-solid fa-question',
        accept: async () => {
            try {
                await dataprovider.deleteUserInput(entry.id);
                const index = data.value.findIndex((item) => item.id === entry.id);
                data.value.splice(index, 1);
            } catch (e) {
                error(e + "");
            }
        },
    });
}

// get data
const data: Ref<InputEntry[]> = ref([]);
const presets: Ref<PresetEntry[]> = ref([]);

/**
 * Load presets for the category
 */
const getData = async () => {
    data.value = [];
    // get the id of the category and load the presets
    const id = global.categories.find((item) => item.name === category.value)?.id;
    if (id) {
        presets.value = global.presets.filter((item) => item.category === id);
        // load the inputs
        data.value = await dataprovider.readUserInputs({
            category: [id],
        });
    } else {
        console.error('Category "' + category.value + '" not found');
    }
}
getData();
</script>

<style>
/* .cst-no-hover>*>*>.p-datatable-tbody>tr:focus {
    outline: none !important;
} */
</style>