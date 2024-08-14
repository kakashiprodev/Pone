<template>
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
      <GenericForm :definition="formEntriesYearlyFocus" v-model="reportForm" />
    </template>
  </Card>

  <div class="flex justify-end mt-3" v-if="showSaveButton">
    <Button
      label="Speichern"
      icon="pi pi-arrow-right"
      iconPos="right"
      @click="validateAndSave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { ReportEntry } from '../../services/types';
import * as v from 'valibot';
import { useI18n } from 'vue-i18n';
import GenericForm from '@/components/forms/GenericForm.vue';
import { GenericFormEntry } from '@/services/types/form';
import { error } from '@/services/ui/toast';
import { debounce } from '@/services/helper';

const { t } = useI18n();

const emit = defineEmits(['update:modelValue', 'save', 'formIsValid']);
const props = defineProps<{
  modelValue: ReportEntry;
  showSaveButton: boolean;
}>();
const reportForm = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

/**
 * The schema for the report data
 */
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

const validateAndSave = () => {
  try {
    v.parse(reportSchemaGeneral, reportForm.value);
    v.parse(reportSchemaContact, reportForm.value);
    v.parse(reportSchemaYearlyFocus, reportForm.value);
    emit('update:modelValue', reportForm.value);
    emit('save');
  } catch (e) {
    error((e + '').replace('ValiError: ', ''));
  }
};

const validateForm = debounce(() => {
  try {
    v.parse(reportSchemaGeneral, reportForm.value);
    v.parse(reportSchemaContact, reportForm.value);
    v.parse(reportSchemaYearlyFocus, reportForm.value);
    emit('update:modelValue', reportForm.value);
    emit('formIsValid', true);
  } catch (e) {
    emit('formIsValid', false, { error: e + '' });
  }
}, 500);

watch(reportForm.value, () => {
  validateForm();
});

onMounted(() => {
  validateForm();
});
</script>
