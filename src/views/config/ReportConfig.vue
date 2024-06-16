<template>
  <h2>{{ $t('settings.reportSettings.heading') }}</h2>
  <p>
    {{ $t('settings.reportSettings.subHeading') }}
  </p>
  <Toolbar class="w-full">
    <template #start>
      <div class="flex gap-2 items-center" v-show="reportForm?.id !== 'new'">
        <span>{{ $t('settings.reportSettings.currentReport') }}</span>
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
          :label="$t('settings.reportSettings.add')"
          v-show="reportForm?.id !== 'new'"
        />
        <Button
          v-if="
            global.targetOnSiteForProject.length < 1 && reportForm?.id !== 'new'
          "
          icon="fa-solid fa-copy"
          @click="copyTargetsFromYearBefore()"
          :v-tooltip="$t('settings.reportSettings.copyFromLastYear')"
        />

        <ConfirmDialog />
        <Button
          v-if="global.selectedReport"
          icon="fa-solid fa-trash"
          @click="confirmDelete(global.selectedReport, $event)"
          :label="$t('global.delete')"
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
          :label="
            reportForm.id === 'new'
              ? $t('settings.reportSettings.add')
              : $t('global.save')
          "
        />
      </div>
    </template>
  </Toolbar>

  <div v-if="global.reports.length === 0" class="card">
    <p>
      {{ $t('settings.reportSettings.noReports') }}
    </p>
    <Button
      icon="fa-solid fa-plus"
      @click="reportForm = global.getNewReport()"
      :label="$t('settings.reportSettings.addReport')"
    />
  </div>

  <template v-if="reportForm">
    <Card class="mt-1">
      <template #title
        ><span v-html="$t('settings.reportSettings.title')"
      /></template>
      <template #content>
        <GenericForm :definition="formEntriesGeneral" v-model="reportForm" />
      </template>
    </Card>

    <Card class="mt-1">
      <template #title>
        {{ $t('settings.reportSettings.contactName') }}
      </template>
      <template #content>
        <GenericForm :definition="formEntriesContact" v-model="reportForm" />
      </template>
    </Card>

    <Card class="mt-1">
      <template #title>
        {{ $t('settings.reportSettings.companyNumbers') }}
      </template>
      <template #content>
        <GenericForm
          :definition="formEntriesYearlyFocus"
          v-model="reportForm"
        />
      </template>
    </Card>
  </template>
</template>

<script setup lang="ts">
import { ref, Ref, watch } from 'vue';
import { useGlobalStore } from '../../stores/global';
import { useConfirm } from 'primevue/useconfirm';
import { ReportEntry } from '../../services/types';
import * as v from 'valibot';
import { error, info } from '../../services/ui/toast';
import { useI18n } from 'vue-i18n';
import GenericForm from '@/components/forms/GenericForm.vue';
import { GenericFormEntry } from '@/services/types/form';

const { t } = useI18n();
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

const reportSchemaGeneral = v.object({
  id: v.string(),
  site: v.pipe(v.string(), v.minLength(4), v.maxLength(100)),
  year: v.pipe(v.number(), v.minValue(1900), v.maxValue(2100)),
  company_name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  company_street: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
  company_postal: v.pipe(v.string(), v.minLength(4), v.maxLength(6)),
  company_city: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
  company_country: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
  company_domain: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
});

const reportSchemaContact = v.object({
  contact_name: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
  contact_telephone: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
  contact_email: v.pipe(v.string(), v.email()),
  contact_domain: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
});

const reportSchemaYearlyFocus = v.object({
  count_employees: v.pipe(v.number(), v.minValue(1)),
  business_turnover: v.pipe(v.number(), v.minValue(0)),
  base_year: v.pipe(v.number(), v.minValue(1900), v.maxValue(2100)),
  sum_emissions: v.nullable(v.number()),
});

const formEntriesGeneral: GenericFormEntry[] = [
  {
    label: t('settings.reportSettings.reportYear') + '*',
    key: 'year',
    type: 'number',
    required: true,
    validation: v.pick(reportSchemaGeneral, ['year']),
    settings: {
      min: 1900,
      max: 2100,
      thousandSeparator: false,
    },
  },
  {
    label: t('settings.reportSettings.companyName') + '*',
    key: 'company_name',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaGeneral, ['company_name']),
  },
  {
    label: t('settings.reportSettings.companyStreet') + '*',
    key: 'company_street',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaGeneral, ['company_street']),
  },
  {
    label: t('settings.reportSettings.companyPostal') + '*',
    key: 'company_postal',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaGeneral, ['company_postal']),
  },
  {
    label: t('settings.reportSettings.companyCity') + '*',
    key: 'company_city',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaGeneral, ['company_city']),
  },
  {
    label: t('settings.reportSettings.companyCountry') + '*',
    key: 'company_country',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaGeneral, ['company_country']),
  },
  {
    label: t('settings.reportSettings.companyDomain') + '*',
    key: 'company_domain',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaGeneral, ['company_domain']),
  },
];

const formEntriesContact: GenericFormEntry[] = [
  {
    label: t('settings.userSettings.name') + '*',
    key: 'contact_name',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaContact, ['contact_name']),
  },
  {
    label: t('settings.userSettings.phone') + '*',
    key: 'contact_telephone',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaContact, ['contact_telephone']),
  },
  {
    label: t('settings.userSettings.email') + '*',
    key: 'contact_email',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaContact, ['contact_email']),
  },
  {
    label: t('settings.userSettings.department') + '*',
    key: 'contact_domain',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaContact, ['contact_domain']),
  },
];

const formEntriesYearlyFocus: GenericFormEntry[] = [
  {
    label: t('settings.reportSettings.countEmployees') + '*',
    key: 'count_employees',
    type: 'number',
    required: true,
    validation: v.pick(reportSchemaYearlyFocus, ['count_employees']),
  },
  {
    label: t('settings.reportSettings.yearlyFocus') + '*',
    key: 'business_turnover',
    type: 'number',
    required: true,
    settings: {
      suffix: '€',
    },
    validation: v.pick(reportSchemaYearlyFocus, ['business_turnover']),
  },
  {
    label: t('settings.reportSettings.refYear') + '*',
    key: 'base_year',
    type: 'number',
    settings: { thousandSeparator: false },
    required: true,
    validation: v.pick(reportSchemaYearlyFocus, ['base_year']),
  },
];

/**
 * Confirm the deletion of a report
 */
const confirmDelete = async (report: ReportEntry, event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: t('settings.reportSettings.confirmDelete'),
    icon: 'fa-solid fa-question',
    accept: async () => {
      try {
        await global.dropReport(report);
        // get the next report with the highest year
        await global.ensureLatestReport();
        if (global.selectedReport) {
          reportForm.value = global.selectedReport;
        }
        info(t('settings.reportSettings.successDelete'));
      } catch (e) {
        error(e + '');
      }
    },
  });
};

/**
 * Copy all targets from the year before to the current report
 */
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

/**
 * Save the report to the database
 */
const saveReport = async () => {
  if (!reportForm.value) {
    return;
  }
  try {
    v.parse(reportSchemaGeneral, reportForm.value);
    v.parse(reportSchemaContact, reportForm.value);
    v.parse(reportSchemaYearlyFocus, reportForm.value);
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
    // console.log('waiting for global store to load');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (global.selectedReport) {
    reportForm.value = global.selectedReport;
  }
};
init();
</script>
