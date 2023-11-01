<template>
    <Toolbar>
        <template #start>
            <Button icon="fa-solid fa-plus" @click="selectedValue = emptyEquivalent(); showDialog = true" />
        </template>
    </Toolbar>

    <Dialog v-model:visible="showChooseEquivalent" modal header="Wählen Sie einen Faktor"
        :class="{ 'w-6': windowWidth > 990, 'w-full': windowWidth < 990, 'h-screen': windowWidth < 990 }">
        <DataTable class="cst-no-hover mt-3" :value="filteredEquivalents">
            <Column field="name" header="Name"></Column>
            <Column field="comment" header="Kommentar"></Column>
            <Column field="in" header="Eingang"></Column>
            <Column field="out" header="Ausgang"></Column>
            <Column header="">
                <template #body="{ data }">
                    <Button icon="fa-solid fa-check"
                        @click="selectedValue.parent = data.id; showChooseEquivalent = false" />
                </template>
            </Column>
        </DataTable>
        <Button label="Abbrechen" @click="showChooseEquivalent = false;" />
    </Dialog>

    <Dialog v-model:visible="showDialog" modal :header="selectedValue.id === 'new' ? 'Anlegen' : 'Bearbeiten'"
        :class="{ 'w-6': windowWidth > 990, 'w-full': windowWidth < 990, 'h-screen': windowWidth < 990 }">
        <div>
            <div class="field">
                <label for="equivalent-name">Name</label>
                <InputText class="w-full" v-model="selectedValue.name" id="equivalent-name" />
            </div>
            <div class="field">
                <label for="equivalent-comment">Kommentar</label>
                <InputText class="w-full" v-model="selectedValue.comment" id="equivalent-comment" />
            </div>
            <div class="field">
                <label for="equivalent-unit-in">Einheit Eingang</label>
                <InputText class="w-full" v-model="selectedValue.in" id="equivalent-unit-in" />
            </div>
            <div class="field">
                <label for="equivalent-unit-out">Einheit Ausgang</label>
                <InputText class="w-full" v-model="selectedValue.out" id="equivalent-unit-out" />
            </div>
            <div class="field">
                <label for="equivalent-source">Quelle</label>
                <InputText class="w-full"
                    :value="selectedValue.source != null ? global.sourcesDict[selectedValue.source].name : 'Benutzereingabe'"
                    id="equivalent-source" disabled="true" />
            </div>
            <div class="field">
                <label for="equivalent-validity">Gültigkeit (Jahr)</label>
                <InputNumber class="w-full" v-model="selectedValue.year" id="equivalent-validity" :use-grouping="false" />
            </div>
            <div class="field">
                <label for="equivalent-monthlyValues">Monatliche Eingaben?</label>
                <div>
                    <Checkbox v-model="selectedValue.monthlyValues" id="equivalent-monthlyValues" :binary="true" />
                </div>
            </div>
            <div v-show="selectedValue.monthlyValues">
                <div class="grid">
                    <div
                        class="col-1 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Jan" }}
                    </div>
                    <div
                        class="col-1 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Feb" }}
                    </div>
                    <div
                        class="col-1 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Mar" }}
                    </div>
                    <div
                        class="col-1 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Apr" }}
                    </div>
                    <div
                        class="col-1 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Mai" }}
                    </div>
                    <div
                        class="col-1 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Jun" }}
                    </div>
                    <div
                        class="col-1 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Jul" }}
                    </div>
                    <div
                        class="col-1 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Aug" }}
                    </div>
                    <div
                        class="col-1 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Sep" }}
                    </div>
                    <div
                        class="col-1 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Okt" }}
                    </div>
                    <div
                        class="col-1 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Nov" }}
                    </div>
                    <div
                        class="col-1 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Dez" }}
                    </div>
                </div>
                <div class="grid">
                    <div class="col-1 small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.jan" />
                    </div>
                    <div class="col-1 small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.feb" />
                    </div>
                    <div class="col-1  small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.mar" />
                    </div>
                    <div class="col-1  small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.apr" />
                    </div>
                    <div class="col-1  small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.may" />
                    </div>
                    <div class="col-1  small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.jun" />
                    </div>
                    <div class="col-1  small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.jul" />
                    </div>
                    <div class="col-1  small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.aug" />
                    </div>
                    <div class="col-1  small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.sep" />
                    </div>
                    <div class="col-1  small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.oct" />
                    </div>
                    <div class="col-1  small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.nov" />
                    </div>
                    <div class="col-1  small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.dec" />
                    </div>
                </div>
            </div>
            <div class="field">
                <label for="equivalent-value-year">Wert (Jahresdurschnitt)</label>
                <InputNumber v-if="!selectedValue.monthlyValues" class="w-full" v-model="selectedValue.avgValue"
                    id="equivalent-value-year" :use-grouping="false" />
                <div v-else>{{ roundString(selectedValue.avgValue) }} (automatisch berechnet)</div>
            </div>
            <div class="field">
                <label for="equivalent-parent-selector">Überliegende Berechnung (optional)</label>
                <div>
                    <Button
                        :label="selectedValue.parent ? global.equivalentDict[selectedValue.parent].name : 'Wählen Sie einen Faktor'"
                        @click="showChooseEquivalent = true" />
                    <Button v-if="selectedValue.parent" icon="fa-solid fa-trash" @click="selectedValue.parent = null"
                        class="ml-1" />
                </div>
            </div>
        </div>
        <div>
            <Button :label="selectedValue.id === 'new' ? 'Anlegen' : 'Speichern'" @click="save" />
        </div>
    </Dialog>

    <ConfirmPopup></ConfirmPopup>
    <DataTable class="cst-no-hover mt-3" v-if="global.equivalents.length > 0" :value="global.equivalents">
        <!-- <Column field="id" header="Id"></Column> -->
        <Column field="name" header="Name"></Column>
        <Column field="comment" header="Kommentar"></Column>
        <Column field="source" header="Quelle">
            <template #body="{ data }">
                <span>{{ global.sourcesDict[data.source]?.name ?? "Benutzereingabe" }}</span>
            </template>
        </Column>
        <Column header="Jahres Durschnittswert">
            <template #body="{ data }">
                <span>{{ roundString(data.avgValue) }}</span>
            </template>
        </Column>
        <Column header="Einheit">
            <template #body="{ data }">
                <span>{{ data.in }}/{{ data.out }}</span>
            </template>
        </Column>
        <Column header="Überliegend">
            <template #body="{ data }">
                <span v-if="data.parent">{{ global.equivalentDict[data.parent]?.name }}</span>
            </template>
        </Column>
        <Column header="">
            <template #body="{ data }">
                <div v-if="data.source.length < 1" class="flex">
                    <Button icon="fa-solid fa-edit" @click="selectedValue = data; showDialog = true" />
                    <Button icon="fa-solid fa-trash" @click="deleteEquivalent(data, $event)" class="ml-1" />
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
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import ConfirmPopup from 'primevue/confirmpopup';
import { getAverageEquivalent } from "./../services/reporting";
import { useGlobalStore } from "./../stores/global";
import { Ref, ref, watchEffect, computed } from 'vue';
import { Equivalent } from './../services/types';
import { error, info } from './../services/toast';
import { useConfirm } from "primevue/useconfirm";
import { parse, string, object, number, boolean } from "valibot";
import { roundString } from './../pipes';

const windowWidth = ref(window.innerWidth);

const confirm = useConfirm();
const global = useGlobalStore();
global.refreshEquivalents();

const showDialog = ref(false);
const showChooseEquivalent = ref(false);

const filteredEquivalents = computed(() => {
    if (selectedValue.value.out !== '') {
        return global.equivalents.filter(e => e.in === selectedValue.value.out);
    } else {
        return global.equivalents;
    }
});

const emptyEquivalent = (): Equivalent => {
    return {
        id: 'new',
        name: '',
        comment: '',
        in: '',
        out: '',
        source: null,
        avgValue: 0.1,
        monthlyValues: false,
        project: global.selectedProject?.id ?? '',
        jan: 0.1,
        feb: 0.1,
        mar: 0.1,
        apr: 0.1,
        may: 0.1,
        jun: 0.1,
        jul: 0.1,
        aug: 0.1,
        sep: 0.1,
        oct: 0.1,
        nov: 0.1,
        dec: 0.1,
        parent: null,
        year: global.selectedReport?.year ?? ((new Date()).getFullYear() - 1),
    }
}

const equivalentSchema = object({
    id: string(),
    name: string(),
    comment: string(),
    in: string(),
    out: string(),
    // source: string(),
    avgValue: number(),
    monthlyValues: boolean(),
    project: string(),
    jan: number(),
    feb: number(),
    mar: number(),
    apr: number(),
    may: number(),
    jun: number(),
    jul: number(),
    aug: number(),
    sep: number(),
    oct: number(),
    nov: number(),
    dec: number(),
    // parent: string(),
    year: number(),
});

const selectedValue: Ref<Equivalent> = ref(emptyEquivalent());

// calculate avg value for the year
watchEffect(() => {
    if (selectedValue.value.monthlyValues) {
        console.log("recalc avg");
        selectedValue.value.avgValue = Math.round(getAverageEquivalent(selectedValue.value) * 10000) / 10000;
    }
});

const save = async () => {
    // validate inputs
    try {
        parse(equivalentSchema, selectedValue.value);
        if (selectedValue.value.id === 'new') {
            // make a copy and drop the id
            const insert: any = { ...selectedValue.value };
            delete insert.id;
            const e = await global.addEquivalent(insert);
            if (e != null) {
                selectedValue.value = e;
                showDialog.value = false;
            }
        } else {
            const u = await global.updateEquivalent(selectedValue.value);
            if (u != null) {
                selectedValue.value = u;
                showDialog.value = false;
            }
        }
        info('Erfolgreich gespeichert');
    } catch (e) {
        error(e + "");
    }
}

const deleteEquivalent = async (equivalent: Equivalent, event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Soll der Wert wirklich gelöscht werden?',
        icon: 'fa-solid fa-question',
        accept: async () => {
            try {
                await global.dropEquivalent(equivalent);
            } catch (e) {
                error(e + "");
            }
        },
    });
}
</script>

<style>
div.small-width-ctm>*>input.p-inputnumber-input {
    width: 100%;
}

.cst-no-hover>*>*>.p-datatable-tbody>tr:focus {
    outline: none !important;
}
</style>