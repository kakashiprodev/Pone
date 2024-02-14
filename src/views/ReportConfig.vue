<template>
  <h2>Berichte</h2>
  <p>
    Hier legen Sie die Berichtszeiträume für das ausgewählte Projekt fest.
    Jeder Bericht umfasst ein Jahr.
  </p>
  <Toolbar>
    <template #start>
      <span>Ausgewählter Bericht</span>
      <Dropdown v-model="global.selectedReport" :options="global.reports" optionLabel="year" placeholder="Select a Report"
        :disabled="reportForm?.id === 'new'" class="ml-3" />
      <Button icon="fa-solid fa-plus" @click="reportForm = global.getNewReport()" label="Hinzufügen"
        :disabled="reportForm?.id === 'new'" class="ml-1" />
      <ConfirmDialog />
      <Button v-if="global.selectedReport" icon="fa-solid fa-trash" @click="confirmDelete(global.selectedReport, $event)"
        label="Löschen" :disabled="reportForm?.id === 'new'" class="ml-1" />
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

  <template v-if="reportForm">

    <Card class="mt-1">
      <template #title>
        Basisdaten des CO2-Berichts
      </template>
      <template #content>
        <div class="field grid" v-for="entry in Object.entries(reportSchemaGeneral.object)" :key="entry[0]">
          <template v-if="!(entry[0] === 'id') && !(entry[0] === 'site')">
            <label :for="entry[0]" class="col-12 mb-2 md:col-4 md:mb-0">{{
              reportTranslations[entry[0]]?.label
            }}</label>
            <div class="col-12 md:col-8">
              <InputText v-if="entry[1].schema === 'string'" :id="entry[0]" v-model="reportForm[entry[0]]"
                class="w-full" />
              <!-- <InputNumber v-if="entry[1].schema === 'number'" :id="entry[0]" v-model="reportForm[entry[0]]"
                  :useGrouping="false" class="w-full" /> -->
            </div>
          </template>
        </div>
      </template>
    </Card>

    <Card class="mt-1">
      <template #title>
        Ansprechpartner
      </template>
      <template #content>
        <div class="field grid" v-for="entry in Object.entries(reportSchemaContact.object)" :key="entry[0]">
          <label :for="entry[0]" class="col-12 mb-2 md:col-4 md:mb-0">{{
            reportTranslations[entry[0]]?.label
          }}</label>
          <div class="col-12 md:col-8">
            <InputText v-if="entry[1].schema === 'string'" :id="entry[0]" v-model="reportForm[entry[0]]" class="w-full" />
            <!-- <InputNumber v-if="entry[1].schema === 'number'" :id="entry[0]" v-model="reportForm[entry[0]]"
                :useGrouping="false" class="w-full" /> -->
          </div>
        </div>
      </template>
    </Card>

    <Card class="mt-1">
      <template #title>
        Unternehmenszahlen
      </template>
      <template #content>
        <div class="field grid" v-for="entry in Object.entries(reportSchemaYearlyFocus.object)" :key="entry[0]">
          <label :for="entry[0]" class="col-12 mb-2 md:col-4 md:mb-0">{{
            reportTranslations[entry[0]]?.label
          }}</label>
          <div class="col-12 md:col-8">
            <!-- <InputText v-if="entry[1].schema === 'string'" :id="entry[0]" v-model="reportForm[entry[0]]"
                class="w-full" /> -->
            <InputNumber v-if="entry[1].schema === 'number'" :id="entry[0]" v-model="reportForm[entry[0]]"
              :useGrouping="false" class="w-full" />
          </div>
        </div>
      </template>
    </Card>

    <div>
      <Button class="mt-3" v-if="reportForm" @click="saveReport()"
        :label="reportForm.id === 'new' ? 'Hinzufügen' : 'Speichern'" />
      <Button v-if="reportForm.id === 'new'" class="ml-3" label="Abbrechen" @click="reportForm = global.selectedReport" />
    </div>
  </template>
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
import Card from 'primevue/card';
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
  nullable,
} from 'valibot';
import { error, info } from './../services/toast';

const global = useGlobalStore();
const confirm = useConfirm();

const reportForm: Ref<null | ReportEntry> = ref(global.selectedReport);
// watch for changes in the selected report to update the form
watch(() => global.selectedReport, () => {
  reportForm.value = global.selectedReport;
});
const reportSchemaGeneral = object({
  id: string(),
  site: string('Es ist kein Standort angegeben.', [minLength(4, 'Die Angabe Projekt ist fehlerhaft.'), maxLength(15, 'Die Angabe Projekt ist fehlerhaft.')]),
  year: number([minValue(1900, 'Es muss ein gültiges Jahr angegeben werden.'), maxValue(2100, 'Es muss ein gültiges Jahr angegeben werden.')]),
  companyName: string([minLength(1, 'Der Firmenname muss zwischen 1 und 255 Zeichen liegen.'), maxLength(255, 'Der Firmenname muss zwischen 1 und 255 Zeichen liegen.')]),
  companyStreet: string([minLength(2, 'Der Straßenname muss zwischen 2 und 255 Zeichen liegen'), maxLength(255, 'Der Straßenname muss zwischen 2 und 255 Zeichen liegen')]),
  companyPostal: string([minLength(4, 'Die Postleitzahl muss min. 4 Zeichen beinhalten'), maxLength(6, 'Die Postleitzahl kann max 5 Zeichen beinhalten')]),
  companyCity: string([minLength(2, 'Die Stadt muss zwischen 2 und 255 Zeichen lang sein'), maxLength(255, 'Die Stadt muss zwischen 2 und 255 Zeichen lang sein')]),
  companyCountry: string([minLength(2, 'Das Land muss zwischen 2 und 255 Zeichen lang sein'), maxLength(255, 'Das Land muss zwischen 2 und 255 Zeichen lang sein')]),
  companyDomain: string([minLength(2, 'Die Branche muss zwischen 2 und 255 Zeichen lang sein'), maxLength(255, 'Die Branche muss zwischen 2 und 255 Zeichen lang sein')]),
});

const reportSchemaContact = object({
  contactName: string([minLength(2, 'Der Kontaktname muss zwischen 2 und 255 Zeichen lang sein'), maxLength(255, 'Der Kontaktname muss zwischen 2 und 255 Zeichen lang sein')]),
  contactTelephone: string([minLength(2, 'Die Telefonnummer muss min. 2 Zeichen lang sein'), maxLength(255, 'Die Telefonnummer kann max 255 Zeichen lang sein')]),
  contactEmail: string([email()]),
  contactDomain: string([minLength(2, 'Die Abteilung muss zwischen 2 und 255 Zeichen lang sein'), maxLength(255, 'Die Abteilung muss zwischen 2 und 255 Zeichen lang sein')]),
});

const reportSchemaYearlyFocus = object({
  countEmployees: number([minValue(1, 'Die Anzahl Mitarbeiter muss min. 1 betragen')]),
  businessTurnover: number([minValue(0, 'Der Umsatz muss min. 0 betragen')]),
  baseYear: number([minValue(1900, 'Bitte ein gültiges Basisjahr angeben'), maxValue(2100, 'Bitte ein gültiges Basisjahr angeben')]),
  sumEmissions: nullable(number()),
});

const reportTranslations: {
  [name: string]: {
    label: string,
    category: string,
  }
} = {
  id: { label: 'Report-ID', category: 'general' },
  site: { label: 'Projekt-ID', category: 'general' },
  year: { label: 'Jahr', category: 'general' },
  companyName: { label: 'Firmenname', category: 'general' },
  companyStreet: { label: 'Straße', category: 'general' },
  companyPostal: { label: 'PLZ', category: 'general' },
  companyCity: { label: 'Stadt', category: 'general' },
  companyCountry: { label: 'Land', category: 'general' },
  companyDomain: { label: 'Branche', category: 'general' },
  contactName: { label: 'Ansprechpartner', category: 'contact' },
  contactTelephone: { label: 'Telefon', category: 'contact' },
  contactEmail: { label: 'E-Mail', category: 'contact' },
  contactDomain: { label: 'Abteilung', category: 'contact' },
  countEmployees: { label: 'Anzahl Mitarbeiter', category: 'yearly-focus' },
  businessTurnover: { label: 'Jahresumsatz', category: 'yearly-focus' },
  baseYear: { label: 'Referenzjahr', category: 'yearly-focus' },
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
        await global.ensureLatestReport();
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
    parse(reportSchemaGeneral, reportForm.value);
    parse(reportSchemaContact, reportForm.value);
    parse(reportSchemaYearlyFocus, reportForm.value);
    if (reportForm.value.id === 'new') {
      reportForm.value = await global.addReport(reportForm.value);
    } else {
      reportForm.value = await global.updateReport(reportForm.value);
    }
    info('Bericht gespeichert');
  } catch (e) {
    error((e + "").replace("ValiError: ", ""));
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