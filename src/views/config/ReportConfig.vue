<template>
  <h2>Berichte</h2>
  <p>
    Hier legen Sie die Berichtszeiträume für das ausgewählte Projekt fest. Jeder
    Bericht umfasst ein Jahr.
  </p>
  <Toolbar class="w-full">
    <template #start>
      <div class="flex gap-2 items-center">
        <span>Ausgewählter Bericht</span>
        <Chip class="text-lg bg-slate-200">
          {{ global.selectedReport?.year }}
        </Chip>
      </div>
    </template>
    <template #end>
      <div class="grow flex gap-1">
        <Button
          icon="fa-solid fa-plus"
          @click="reportForm = global.getNewReport()"
          label="Hinzufügen"
          v-show="reportForm?.id !== 'new'"
        />
        <Button
          v-if="global.targetOnSiteForProject.length < 1"
          icon="fa-solid fa-copy"
          @click="copyTargetsFromYearBefore()"
          v-tooltip="'Ziele aus dem Vorjahr kopieren'"
        />

        <ConfirmDialog />
        <Button
          v-if="global.selectedReport"
          icon="fa-solid fa-trash"
          @click="confirmDelete(global.selectedReport, $event)"
          label="Löschen"
          v-show="reportForm?.id !== 'new'"
        />
        <Button
          v-if="reportForm?.id === 'new'"
          label="Abbrechen"
          @click="reportForm = global.selectedReport"
          severity="warning"
        />
        <Button
          v-if="reportForm"
          @click="saveReport()"
          :label="reportForm.id === 'new' ? 'Hinzufügen' : 'Speichern'"
        />
      </div>
    </template>
  </Toolbar>

  <div v-if="global.reports.length === 0" class="card">
    <p>
      Es sind noch keine Berichte vorhanden. Bitte legen Sie einen neuen Bericht
      an.
    </p>
    <Button
      icon="fa-solid fa-plus"
      @click="reportForm = global.getNewReport()"
      label="Bericht anlegen"
    />
  </div>

  <template v-if="reportForm">
    <Card class="mt-1">
      <template #title> Basisdaten des CO<sub>2</sub>-Berichts </template>
      <template #content>
        <div
          class="mb-4 grid grid-cols-12"
          v-for="entry in Object.entries(reportSchemaGeneral.object)"
          :key="entry[0]"
        >
          <template v-if="!(entry[0] === 'id') && !(entry[0] === 'site')">
            <label
              :for="entry[0]"
              class="col-span-12 mb-2 md:col-span-4 md:mb-0"
              :class="{
                'font-bold text-green-600':
                  entry[0] === 'year' && reportForm.id === 'new',
              }"
              >{{ reportTranslations[entry[0]]?.label }}</label
            >
            <div class="col-span-12 md:col-span-8">
              <InputText
                v-if="entry[1].schema === 'string'"
                :id="entry[0]"
                v-model="reportForm[entry[0]]"
                class="w-full"
              />
              <InputNumber
                v-if="entry[1].schema === 'number'"
                :id="entry[0]"
                v-model="reportForm[entry[0]]"
                :useGrouping="
                  reportTranslations[entry[0]]?.numberGrouping ?? false
                "
                class="w-full"
                :variant="'filled'"
              />
            </div>
          </template>
        </div>
      </template>
    </Card>

    <Card class="mt-1">
      <template #title> Ansprechpartner </template>
      <template #content>
        <div
          class="mb-4 grid grid-cols-12"
          v-for="entry in Object.entries(reportSchemaContact.object)"
          :key="entry[0]"
        >
          <label
            :for="entry[0]"
            class="col-span-12 mb-2 md:col-span-4 md:mb-0"
            >{{ reportTranslations[entry[0]]?.label }}</label
          >
          <div class="col-span-12 md:col-span-8">
            <InputText
              v-if="entry[1].schema === 'string'"
              :id="entry[0]"
              v-model="reportForm[entry[0]]"
              class="w-full"
            />
            <!-- <InputNumber v-if="entry[1].schema === 'number'" :id="entry[0]" v-model="reportForm[entry[0]]"
                :useGrouping="false" class="w-full" /> -->
          </div>
        </div>
      </template>
    </Card>

    <Card class="mt-1">
      <template #title> Unternehmenszahlen </template>
      <template #content>
        <div
          class="mb-4 grid grid-cols-12"
          v-for="entry in Object.entries(reportSchemaYearlyFocus.object)"
          :key="entry[0]"
        >
          <label
            :for="entry[0]"
            class="col-span-12 mb-2 md:col-span-4 md:mb-0"
            >{{ reportTranslations[entry[0]]?.label }}</label
          >
          <div class="col-span-12 md:col-span-8">
            <!-- <InputText v-if="entry[1].schema === 'string'" :id="entry[0]" v-model="reportForm[entry[0]]"
                class="w-full" /> -->
            <InputNumber
              v-if="entry[1].schema === 'number'"
              :id="entry[0]"
              v-model="reportForm[entry[0]]"
              :useGrouping="
                reportTranslations[entry[0]]?.numberGrouping ?? false
              "
              :suffix="reportTranslations[entry[0]]?.suffix ?? ''"
              class="w-full"
            />
          </div>
        </div>
      </template>
    </Card>
  </template>
</template>

<script setup lang="ts">
import { ref, Ref, watch } from 'vue';
import { useGlobalStore } from '../../stores/global';
import { useConfirm } from 'primevue/useconfirm';
import { ReportEntry } from '../../services/types';
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
import { error, info } from '../../services/ui/toast';

const global = useGlobalStore();
const confirm = useConfirm();

const reportForm: Ref<null | ReportEntry> = ref(global.selectedReport);
// watch for changes in the selected report to update the form
watch(
  () => global.selectedReport,
  () => {
    reportForm.value = global.selectedReport;
  },
);
const reportSchemaGeneral = object({
  id: string(),
  site: string('Es ist kein Standort angegeben.', [
    minLength(4, 'Die Angabe Projekt ist fehlerhaft.'),
    maxLength(15, 'Die Angabe Projekt ist fehlerhaft.'),
  ]),
  year: number([
    minValue(1900, 'Es muss ein gültiges Jahr angegeben werden.'),
    maxValue(2100, 'Es muss ein gültiges Jahr angegeben werden.'),
  ]),
  company_name: string([
    minLength(1, 'Der Firmenname muss zwischen 1 und 255 Zeichen liegen.'),
    maxLength(255, 'Der Firmenname muss zwischen 1 und 255 Zeichen liegen.'),
  ]),
  company_street: string([
    minLength(2, 'Der Straßenname muss zwischen 2 und 255 Zeichen liegen'),
    maxLength(255, 'Der Straßenname muss zwischen 2 und 255 Zeichen liegen'),
  ]),
  company_postal: string([
    minLength(4, 'Die Postleitzahl muss min. 4 Zeichen beinhalten'),
    maxLength(6, 'Die Postleitzahl kann max 5 Zeichen beinhalten'),
  ]),
  company_city: string([
    minLength(2, 'Die Stadt muss zwischen 2 und 255 Zeichen lang sein'),
    maxLength(255, 'Die Stadt muss zwischen 2 und 255 Zeichen lang sein'),
  ]),
  company_country: string([
    minLength(2, 'Das Land muss zwischen 2 und 255 Zeichen lang sein'),
    maxLength(255, 'Das Land muss zwischen 2 und 255 Zeichen lang sein'),
  ]),
  company_domain: string([
    minLength(2, 'Die Branche muss zwischen 2 und 255 Zeichen lang sein'),
    maxLength(255, 'Die Branche muss zwischen 2 und 255 Zeichen lang sein'),
  ]),
});

const reportSchemaContact = object({
  contact_name: string([
    minLength(2, 'Der Kontaktname muss zwischen 2 und 255 Zeichen lang sein'),
    maxLength(255, 'Der Kontaktname muss zwischen 2 und 255 Zeichen lang sein'),
  ]),
  contact_telephone: string([
    minLength(2, 'Die Telefonnummer muss min. 2 Zeichen lang sein'),
    maxLength(255, 'Die Telefonnummer kann max 255 Zeichen lang sein'),
  ]),
  contact_email: string([email()]),
  contact_domain: string([
    minLength(2, 'Die Abteilung muss zwischen 2 und 255 Zeichen lang sein'),
    maxLength(255, 'Die Abteilung muss zwischen 2 und 255 Zeichen lang sein'),
  ]),
});

const reportSchemaYearlyFocus = object({
  count_employees: number([
    minValue(1, 'Die Anzahl Mitarbeiter muss min. 1 betragen'),
  ]),
  business_turnover: number([minValue(0, 'Der Umsatz muss min. 0 betragen')]),
  base_year: number([
    minValue(1900, 'Bitte ein gültiges Basisjahr angeben'),
    maxValue(2100, 'Bitte ein gültiges Basisjahr angeben'),
  ]),
  sumEmissions: nullable(number()),
});

const reportTranslations: {
  [name: string]: {
    label: string;
    category: string;
    numberGrouping?: boolean;
    suffix?: string;
  };
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
  countEmployees: {
    label: 'Anzahl Mitarbeiter',
    category: 'yearly-focus',
    numberGrouping: true,
  },
  businessTurnover: {
    label: 'Jahresumsatz',
    category: 'yearly-focus',
    numberGrouping: true,
    suffix: '€',
  },
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

const copyTargetsFromYearBefore = async () => {
  if (reportForm.value != null) {
    const yearBefore = reportForm.value.year - 1;
    const reportBefore = global.reports.find((r) => r.year === yearBefore);
    if (reportBefore) {
      const res = await global.copyTargets(
        reportBefore.id,
        reportForm.value.id,
      );
      info(
        `${res.copied} Ziele aus dem Jahr ${
          reportForm.value.year - 1
        } wurden ins Berichtsjahr ${reportForm.value.year} kopiert.`,
      );
    }
  }
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
      // if the report was added then copy all report targets to the new report. This will be the year before
      await copyTargetsFromYearBefore();
    } else {
      reportForm.value = await global.updateReport(reportForm.value);
    }
    info('Bericht gespeichert');
  } catch (e) {
    error((e + '').replace('ValiError: ', ''));
  }
};

const init = async () => {
  while (global.isLoading) {
    console.log('waiting for global store to load');
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  if (global.selectedReport) {
    reportForm.value = global.selectedReport;
  }
};
init();
</script>
