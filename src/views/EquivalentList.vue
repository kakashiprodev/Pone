<template>
    <Toolbar>
        <template #start>
            <Button icon="fa-solid fa-plus" @click="selectedValue = emptyEquivalent(); showDialog = true" />
        </template>
    </Toolbar>

    <InlineMessage v-if="global.showTooltips" class="w-full mt-3 mb-3" severity="info">
        Hier werden alle Äquivalente angezeigt, die für die Berechnung der CO2-Äquivalente verwendet werden können.
        Die System Einträge können nicht editiert oder gelöscht werden.
        Überliegende Berechnungen bedeuten, dass der Faktor in Kette mit dem überliegenden Faktor berechnet wird.
        Hierbei entspricht die Ausgangseinheit des Eingabewertes der Eingangseinheit des überliegenden Faktors.
    </InlineMessage>

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
                <label for="equivalent-name">Name*</label>
                <InputText class="w-full" v-model="selectedValue.name" id="equivalent-name" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">Name des Umrechnungsfaktors.
                </InlineMessage>
            </div>
            <div class="field">
                <label for="equivalent-comment">Kommentar</label>
                <InputText class="w-full" v-model="selectedValue.comment" id="equivalent-comment" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">Eine optionale Bemerung zur
                    Eingabe.</InlineMessage>
            </div>
            <div class="field">
                <label for="equivalent-unit-in">Einheit Eingang*</label>
                <InputText class="w-full" v-model="selectedValue.in" id="equivalent-unit-in" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">Der "Eingang" entspricht der
                    Einheit in der die Werte eingegeben werden.</InlineMessage>
            </div>
            <div class="field">
                <label for="equivalent-unit-out">Einheit Ausgang*</label>
                <InputText class="w-full" v-model="selectedValue.out" id="equivalent-unit-out" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">Der "Ausgang" entspricht der
                    Einheit in die umgerechnet wird. Wenn keine übergeordnete Berechnung verknüpft wird muss(!) Die
                    Ausgangseinheit kg-CO2 entsprechen.</InlineMessage>
            </div>
            <div class="field">
                <label for="equivalent-source">Quelle*</label>
                <InputText class="w-full" :value="'Benutzereingabe'" id="equivalent-source" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">Angabe woher der Faktor stammt
                    (Berechnungsgrundlage)</InlineMessage>
            </div>
            <div class="field">
                <label for="equivalent-validity">Gültigkeit (Jahr)*</label>
                <InputNumber class="w-full" v-model="selectedValue.year" id="equivalent-validity" :use-grouping="false" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">In welchem Jahr is dieser Wert
                    gültig</InlineMessage>
            </div>
            <div class="field">
                <label for="equivalent-monthlyValues">Monatliche Eingaben?</label>
                <div>
                    <Checkbox v-model="selectedValue.monthlyValues" id="equivalent-monthlyValues" :binary="true" />
                </div>
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">Wenn dies aktiviert wird,
                    können monatliche Eingaben erfolgen. Der Jahresmittelwert wird dann autoamtisch errechnet.
                </InlineMessage>
            </div>
            <div v-show="selectedValue.monthlyValues">
                <div class="grid mt-1">
                    <div
                        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Jan" }}
                    </div>
                    <div
                        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Feb" }}
                    </div>
                    <div
                        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Mar" }}
                    </div>
                    <div
                        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Apr" }}
                    </div>
                </div>
                <div class="grid mt-1">
                    <div class="col-3 small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.jan" :min-fraction-digits="0"
                            :max-fraction-digits="10" />
                    </div>
                    <div class="col-3 small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.feb" :min-fraction-digits="0"
                            :max-fraction-digits="10" />
                    </div>
                    <div class="col-3 small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.mar" :min-fraction-digits="0"
                            :max-fraction-digits="10" />
                    </div>
                    <div class="col-3 small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.apr" :min-fraction-digits="0"
                            :max-fraction-digits="10" />
                    </div>
                </div>
                <div class="grid mt-1">
                    <div
                        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Mai" }}
                    </div>
                    <div
                        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Jun" }}
                    </div>
                    <div
                        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Jul" }}
                    </div>
                    <div
                        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Aug" }}
                    </div>
                </div>
                <div class="grid mt-1">
                    <div class="col-3 small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.may" :min-fraction-digits="0"
                            :max-fraction-digits="10" />
                    </div>
                    <div class="col-3 small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.jun" :min-fraction-digits="0"
                            :max-fraction-digits="10" />
                    </div>
                    <div class="col-3 small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.jul" :min-fraction-digits="0"
                            :max-fraction-digits="10" />
                    </div>
                    <div class="col-3 small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.aug" :min-fraction-digits="0"
                            :max-fraction-digits="10" />
                    </div>
                </div>
                <div class="grid mt-1">
                    <div
                        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Sep" }}
                    </div>
                    <div
                        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Okt" }}
                    </div>
                    <div
                        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Nov" }}
                    </div>
                    <div
                        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center">
                        {{ "Dez" }}
                    </div>
                </div>
                <div class="grid mt-1">
                    <div class="col-3 small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.sep" :min-fraction-digits="0"
                            :max-fraction-digits="10" />
                    </div>
                    <div class="col-3 small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.oct" :min-fraction-digits="0"
                            :max-fraction-digits="10" />
                    </div>
                    <div class="col-3 small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.nov" :min-fraction-digits="0"
                            :max-fraction-digits="10" />
                    </div>
                    <div class="col-3 small-width-ctm">
                        <InputNumber :use-grouping="false" v-model="selectedValue.dec" :min-fraction-digits="0"
                            :max-fraction-digits="10" />
                    </div>
                </div>
            </div>
            <div class="field">
                <label for="equivalent-value-year">Faktor (Jahresdurschnitt)*</label>
                <InputNumber v-if="!selectedValue.monthlyValues" class="w-full" v-model="selectedValue.avgValue"
                    id="equivalent-value-year" :use-grouping="false" :min-fraction-digits="0" :max-fraction-digits="10" />
                <div v-else>{{ roundString(selectedValue.avgValue) }} (automatisch berechnet)</div>
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">Der Jahresdurchschnittswert
                    als Faktor [Ausgangseinheit-pro-Eingangseinheit]</InlineMessage>
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
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Wenn eine überliegende Berechnung gewählt wird, muss die Ausgangseinheit der überliegenden Berechnung
                    mit der Eingangseinheit dieses Faktors übereinstimmen.
                    In dem Fall wird beim Berechnen der CO2-Äquivalete der überliegende Faktor in Kette mit diesem Faktors
                    berechnet.
                </InlineMessage>
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
import { parse, string, object, number, boolean, minLength, maxLength } from "valibot";
import { roundString } from './../pipes';
import InlineMessage from 'primevue/inlinemessage';

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
        avgValue: null as any,
        monthlyValues: false,
        project: global.selectedProject?.id ?? '',
        jan: null,
        feb: null,
        mar: null,
        apr: null,
        may: null,
        jun: null,
        jul: null,
        aug: null,
        sep: null,
        oct: null,
        nov: null,
        dec: null,
        parent: null,
        year: global.selectedReport?.year ?? ((new Date()).getFullYear() - 1),
    }
}

const equivalentSchema = object({
    id: string([minLength(1), maxLength(255)]),
    name: string([minLength(4), maxLength(255)]),
    comment: string(),
    in: string([minLength(1), maxLength(10)]),
    out: string([minLength(1), maxLength(10)]),
    // source: string(),
    avgValue: number(),
    monthlyValues: boolean(),
    // project: string(),
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
        console.log(JSON.parse(JSON.stringify(selectedValue.value)));

        // set all monthly values to null if monthlyValues is false
        if (!selectedValue.value.monthlyValues) {
            selectedValue.value.jan = 0;
            selectedValue.value.feb = 0;
            selectedValue.value.mar = 0;
            selectedValue.value.apr = 0;
            selectedValue.value.may = 0;
            selectedValue.value.jun = 0;
            selectedValue.value.jul = 0;
            selectedValue.value.aug = 0;
            selectedValue.value.sep = 0;
            selectedValue.value.oct = 0;
            selectedValue.value.nov = 0;
            selectedValue.value.dec = 0;
        }

        parse(equivalentSchema, selectedValue.value);

        // check if parent is set. If not the output unit must be kg-CO2
        if (selectedValue.value.parent == null && selectedValue.value.out !== 'kg') {
            throw new Error("Wenn kein überliegender Faktor gewählt wird, muss die Ausgangseinheit [kg] (CO2-Äquivalente) sein.");
        }
        // if a parent is set. check if the output unit is the same as the input unit of the parent
        if (selectedValue.value.parent != null
            && selectedValue.value.parent !== ""
            && selectedValue.value.out !== global.equivalentDict[selectedValue.value.parent]?.in) {
            throw new Error("Die Ausgangseinheit muss der Eingangseinheit des überliegenden Faktors entsprechen.");
        }

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
        message: 'Soll der Faktor wirklich gelöscht werden?',
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