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
  companyName: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  companyStreet: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
  companyPostal: v.pipe(v.string(), v.minLength(4), v.maxLength(6)),
  companyCity: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
  companyCountry: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
  companyDomain: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
});

const reportSchemaContact = v.object({
  contactName: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
  contactTelephone: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
  contactEmail: v.pipe(v.string(), v.email()),
  contactDomain: v.pipe(v.string(), v.minLength(2), v.maxLength(255)),
});

const reportSchemaYearlyFocus = v.object({
  countEmployees: v.pipe(v.number(), v.minValue(1)),
  businessTurnover: v.pipe(v.number(), v.minValue(0)),
  baseYear: v.pipe(v.number(), v.minValue(1900), v.maxValue(2100)),
  sumEmissions: v.nullable(v.number()),
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
    key: 'companyName',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaGeneral, ['companyName']),
  },
  {
    label: t('settings.reportSettings.companyStreet') + '*',
    key: 'companyStreet',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaGeneral, ['companyStreet']),
  },
  {
    label: t('settings.reportSettings.companyPostal') + '*',
    key: 'companyPostal',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaGeneral, ['companyPostal']),
  },
  {
    label: t('settings.reportSettings.companyCity') + '*',
    key: 'companyCity',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaGeneral, ['companyCity']),
  },
  {
    label: t('settings.reportSettings.companyCountry') + '*',
    key: 'companyCountry',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaGeneral, ['companyCountry']),
  },
  {
    label: t('settings.reportSettings.companyDomain') + '*',
    key: 'companyDomain',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaGeneral, ['companyDomain']),
  },
];

const formEntriesContact: GenericFormEntry[] = [
  {
    label: t('settings.userSettings.name') + '*',
    key: 'contactName',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaContact, ['contactName']),
  },
  {
    label: t('settings.userSettings.phone') + '*',
    key: 'contactTelephone',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaContact, ['contactTelephone']),
  },
  {
    label: t('settings.userSettings.email') + '*',
    key: 'contactEmail',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaContact, ['contactEmail']),
  },
  {
    label: t('settings.userSettings.department') + '*',
    key: 'contactDomain',
    type: 'text',
    required: true,
    validation: v.pick(reportSchemaContact, ['contactDomain']),
  },
];

const formEntriesYearlyFocus: GenericFormEntry[] = [
  {
    label: t('settings.reportSettings.countEmployees') + '*',
    key: 'countEmployees',
    type: 'number',
    required: true,
    validation: v.pick(reportSchemaYearlyFocus, ['countEmployees']),
  },
  {
    label: t('settings.reportSettings.yearlyFocus') + '*',
    key: 'businessTurnover',
    type: 'number',
    required: true,
    settings: {
      suffix: '€',
    },
    validation: v.pick(reportSchemaYearlyFocus, ['businessTurnover']),
  },
  {
    label: t('settings.reportSettings.refYear') + '*',
    key: 'baseYear',
    type: 'number',
    settings: { thousandSeparator: false },
    required: true,
    validation: v.pick(reportSchemaYearlyFocus, ['baseYear']),
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
