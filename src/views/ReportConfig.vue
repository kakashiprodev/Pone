<template>
    <div>
        <Toolbar>
            <template #start>
                <span>Ausgewählter Bericht</span>
                <Dropdown v-model="global.selectedReport" :options="global.reports" optionLabel="year"
                    placeholder="Select a Report" />
                <Button icon="fa-solid fa-plus" @click="addReport()" label="Add" />
                <Button v-if="global.selectedReport" icon="fa-solid fa-trash"
                    @click="confirmDelete(global.selectedReport, $event)" label="Delete" />
            </template>
        </Toolbar>

        <div v-if="global.reports.length === 0" class="card">
            <p>Es sind noch keine Berichte vorhanden. Bitte legen Sie einen neuen Bericht an.</p>
            <Button icon="fa-solid fa-plus" @click="global.selectedReport = global.getNewReport()"
                label="Bericht anlegen" />
        </div>

        <div class="card">
            <div class="card">
                <h5>Basisdaten des CO2-Berichts</h5>
                <div class="field grid" v-for="entry in Object.entries(reportSchema.object)" :key="entry[0]">
                    <label :for="entry[0]" class="col-12 mb-2 md:col-4 md:mb-0">{{ reportTranslations[entry[0]] }}</label>
                    <div class="col-12 md:col-8">
                        <InputText v-if="entry[1].schema === 'string'" :id="entry[0]" v-model="reportForm[entry[0]]"
                            class="w-full" />
                        <InputNumber v-if="entry[1].schema === 'number'" :id="entry[0]" v-model="reportForm[entry[0]]"
                            :useGrouping="false" class="w-full" />
                    </div>
                </div>
            </div>

            <Button class="mt-3" v-if="global.selectedReport" @click="saveReport()"
                :label="global.selectedReport.id === 'new' ? 'Hinzufügen' : 'Speichern'" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue';
import { useGlobalStore } from './../stores/global';
import { useConfirm } from "primevue/useconfirm";
import { ReportEntry } from './../services/types';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Toolbar from 'primevue/toolbar';
import { minLength, maxLength, object, string, number, minValue, maxValue, email } from 'valibot';
import { error } from './../services/toast';

const global = useGlobalStore();
const confirm = useConfirm();

const reportForm: Ref<ReportEntry> = ref(global.selectedReport || global.getNewReport());
const reportSchema = object({
    id: string(),
    project: string([minLength(4), maxLength(255)]),
    year: number([minValue(1900), maxValue(2100)]),
    companyName: string([minLength(4), maxLength(255)]),
    companyStreet: string([minLength(4), maxLength(255)]),
    companyPostal: string([minLength(4), maxLength(5)]),
    companyCity: string([minLength(4), maxLength(255)]),
    companyCountry: string([minLength(4), maxLength(255)]),
    contactName: string([minLength(8), maxLength(255)]),
    contactTelephone: string([minLength(8), maxLength(255)]),
    contactEmail: string([email()]),
    contactDomain: string([minLength(8), maxLength(255)]),
    countEmployees: number([minValue(1)]),
    businessTurnover: number([minValue(0)]),
    baseYear: number([minValue(1900), maxValue(2100)]),
    baseEquivalentSource: string([minLength(4), maxLength(255)]),
});

const reportTranslations = {
    id: "ID",
    project: "Projekt",
    year: "Jahr",
    companyName: "Firmenname",
    companyStreet: "Straße",
    companyPostal: "PLZ",
    companyCity: "Stadt",
    companyCountry: "Land",
    contactName: "Ansprechpartner",
    contactTelephone: "Telefon",
    contactEmail: "E-Mail",
    contactDomain: "Abteilung",
    countEmployees: "Anzahl Mitarbeiter",
    businessTurnover: "Jahresumsatz",
    baseYear: "Referenzjahr",
    baseEquivalentSource: "Quelle",
};

const addReport = () => {
    global.selectedReport = null;
    global.selectedReport = global.getNewReport();
};

const confirmDelete = async (report: ReportEntry, event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Soll dieser Zeitraum wirklich gelöscht werden?',
        icon: 'fa-solid fa-question',
        accept: async () => {
            await global.dropReport(report);
        },
    });
};

const saveReport = async () => {
    try {
        if (global.selectedReport?.id === 'new') {
            reportForm.value = await global.addReport(reportForm.value);
        } else {
            reportForm.value = await global.updateReport(reportForm.value);
        }
    } catch (e) {
        error(e + "")
    }
};
</script>