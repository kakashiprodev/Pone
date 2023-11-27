<template>
  <div>
    <h5>Berichtszeiträume</h5>
    <p>
      Hier legen Sie die Berichtszeiträume für das ausgewählte Projekt fest.
      Jeder Bericht umfasst ein Jahr.
    </p>
    <Toolbar>
      <template #start>
        <span>Ausgewählter Bericht</span>
        <Dropdown v-model="global.selectedReport" :options="global.reports" optionLabel="year"
          placeholder="Select a Report" :disabled="reportForm?.id === 'new'" class="ml-3" />
        <Button icon="fa-solid fa-plus" @click="reportForm = global.getNewReport()" label="Hinzufügen"
          :disabled="reportForm?.id === 'new'" class="ml-1" />
        <ConfirmDialog />
        <Button v-if="global.selectedReport" icon="fa-solid fa-trash"
          @click="confirmDelete(global.selectedReport, $event)" label="Löschen" :disabled="reportForm?.id === 'new'"
          class="ml-1" />
      </template>
    </Toolbar>

    <div v-if="global.isLoading" class="card">
      <p>Wird geladen...</p>
    </div>
    <div v-else-if="global.reports.length === 0" class="card">
      <p>
        Es sind noch keine Berichte vorhanden. Bitte legen Sie einen neuen
        Bericht an.
      </p>
      <Button icon="fa-solid fa-plus" @click="reportForm = global.getNewReport()" label="Bericht anlegen" />
    </div>

    <div class="card mt-5" v-if="reportForm">
      <h5>Basisdaten des CO2-Berichts</h5>
      <div class="field grid" v-for="entry in Object.entries(reportSchema.object)" :key="entry[0]">
        <template v-if="entry[0] !== 'baseEquivalentSource'">
          <label :for="entry[0]" class="col-12 mb-2 md:col-4 md:mb-0">{{
            reportTranslations[entry[0]]
          }}</label>
          <div class="col-12 md:col-8">
            <InputText v-if="entry[1].schema === 'string'" :id="entry[0]" v-model="reportForm[entry[0]]" class="w-full"
              :disabled="entry[0] === 'id' || entry[0] === 'project'" />
            <InputNumber v-if="entry[1].schema === 'number'" :id="entry[0]" v-model="reportForm[entry[0]]"
              :useGrouping="false" class="w-full" />
          </div>
        </template>
      </div>
      <h5>Bevorzugte Datenquelle für Äquivalente</h5>
      <div class="field grid">
        <label for="datasource" class="col-12 mb-2 md:col-4 md:mb-0">Quelle</label>
        <div class="col-12 md:col-8">
          <Dropdown v-model="reportForm.baseEquivalentSource" :options="global.sources" optionLabel="name"
            optionValue="id" placeholder="Wählen Sie eine Quelle" class="w-full" />
        </div>
      </div>

      <Button class="mt-3" v-if="reportForm" @click="saveReport()"
        :label="reportForm.id === 'new' ? 'Hinzufügen' : 'Speichern'" />
      <Button v-if="reportForm.id === 'new'" class="ml-3" label="Abbrechen" @click="reportForm = global.selectedReport" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch } from 'vue';
import { useGlobalStore } from './../stores/global';
import { useConfirm } from 'primevue/useconfirm';
import { ReportEntry } from './../services/types';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import ConfirmDialog from 'primevue/confirmdialog';
import Toolbar from 'primevue/toolbar';
import {
  minLength,
  maxLength,
  object,
  string,
  number,
  minValue,
  maxValue,
  email,
  parse,
} from 'valibot';
import { error, info } from './../services/toast';

const global = useGlobalStore();
const confirm = useConfirm();

const reportForm: Ref<null | ReportEntry> = ref(global.selectedReport);
// watch for changes in the selected report to update the form
watch(() => global.selectedReport, () => {
  reportForm.value = global.selectedReport;
});
const reportSchema = object({
  id: string(),
  project: string(),
  year: number([minValue(1900), maxValue(2100)]),
  companyName: string([minLength(1), maxLength(255)]),
  companyStreet: string([minLength(2), maxLength(255)]),
  companyPostal: string([minLength(4), maxLength(6)]),
  companyCity: string([minLength(2), maxLength(255)]),
  companyCountry: string([minLength(4), maxLength(255)]),
  contactName: string([minLength(8), maxLength(255)]),
  contactTelephone: string([minLength(2), maxLength(255)]),
  contactEmail: string([email()]),
  contactDomain: string([minLength(2), maxLength(255)]),
  countEmployees: number([minValue(1)]),
  businessTurnover: number([minValue(0)]),
  baseYear: number([minValue(1900), maxValue(2100)]),
  baseEquivalentSource: string([minLength(4), maxLength(255)]),
});

const reportTranslations: any = {
  id: 'ID',
  project: 'Projekt-ID',
  year: 'Jahr',
  companyName: 'Firmenname',
  companyStreet: 'Straße',
  companyPostal: 'PLZ',
  companyCity: 'Stadt',
  companyCountry: 'Land',
  contactName: 'Ansprechpartner',
  contactTelephone: 'Telefon',
  contactEmail: 'E-Mail',
  contactDomain: 'Abteilung',
  countEmployees: 'Anzahl Mitarbeiter',
  businessTurnover: 'Jahresumsatz',
  baseYear: 'Referenzjahr',
  // baseEquivalentSource: "Quelle",
};

const confirmDelete = async (report: ReportEntry, event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Soll dieser Zeitraum wirklich gelöscht werden?',
    icon: 'fa-solid fa-question',
    accept: async () => {
      try {
        await global.dropReport(report);
        // get the next report with the highest year
        global.loadLatestReport();
        if (global.selectedReport) {
          reportForm.value = global.selectedReport;
        }
        info('Bericht wurde erfolgreich gelöscht');
      } catch (e) {
        error(e + '');
      }
    },
  });
};

const saveReport = async () => {
  if (!reportForm.value) {
    return;
  }
  try {
    parse(reportSchema, reportForm.value);
    if (reportForm.value.id === 'new') {
      reportForm.value = await global.addReport(reportForm.value);
    } else {
      reportForm.value = await global.updateReport(reportForm.value);
    }
    info('Bericht gespeichert');
  } catch (e) {
    error(e + '');
  }
};

const init = async () => {
  while (global.isLoading) {
    console.log('waiting for global store to load');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (global.selectedReport) {
    reportForm.value = global.selectedReport;
  }
};
init();
</script>