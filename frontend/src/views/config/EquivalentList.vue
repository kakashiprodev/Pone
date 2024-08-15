<template>
  <h2>{{ $t('equivalents.heading') }}</h2>
  <Toolbar :class="{ 'mb-3': !global.showTooltips }">
    <template #end>
      <Button
        icon="fa-solid fa-download"
        @click="csvDownload"
        :disabled="requestPending"
      />
      <Button
        icon="fa-solid fa-plus"
        @click="
          selectedValue = getEmptyEquivalent(
            1,
            global.selectedProject?.id ?? '',
          );
          showDialog = true;
        "
        class="ml-2"
        :disabled="requestPending"
      />
      <FileUpload
        mode="basic"
        accept="text/*"
        customUpload
        @uploader="uploadCsv"
        :auto="true"
        class="ml-2"
        :disabled="requestPending"
      />
    </template>
  </Toolbar>

  <InlineMessage
    v-if="global.showTooltips"
    class="w-full mt-3 mb-3"
    severity="info"
  >
    <span v-html="$t('equivalents.helpText')"></span>
  </InlineMessage>

  <!-- Dialog to choose the parent equivalent if needed -->
  <Dialog
    v-model:visible="showChooseEquivalent"
    modal
    :header="$t('equivalents.choose.heading')"
    :class="{
      'w-3/5': windowWidth > 990,
      'w-full': windowWidth < 990,
      'h-screen': windowWidth < 990,
    }"
  >
    <DataTable
      class="cst-no-hover mt-3"
      :value="filteredEquivalents"
      :showGridlines="false"
    >
      <Column
        field="specification1"
        :header="$t('equivalents.choose.name')"
      ></Column>
      <Column
        field="comment"
        :header="$t('equivalents.choose.comment')"
      ></Column>
      <Column field="in" :header="$t('equivalents.choose.in')"></Column>
      <Column field="out" :header="$t('equivalents.choose.out')"></Column>
      <Column header="">
        <template #body="{ data }">
          <Button
            icon="fa-solid fa-check"
            @click="
              selectedValue.parent = data.id;
              showChooseEquivalent = false;
            "
          />
        </template>
      </Column>
    </DataTable>
    <Button
      :label="$t('equivalents.choose.cancel')"
      @click="showChooseEquivalent = false"
    />
  </Dialog>

  <!-- Dialog to add a new equivalent or edit one -->
  <Dialog
    v-model:visible="showDialog"
    modal
    :header="
      selectedValue.id === 'new'
        ? $t('equivalents.create')
        : $t('equivalents.edit')
    "
    :class="{
      'w-3/5': windowWidth > 990,
      'w-full': windowWidth < 990,
      'h-screen': windowWidth < 990,
    }"
  >
    <!-- form to edit the equivalent -->
    <GenericForm :definition="formEntries" v-model="selectedValue" />

    <!-- input for the monthly values -->
    <MonthlyOrYearlyInput
      v-model:value-equivalent="selectedValue"
      input-unit=""
    />

    <!-- choose a parent -->
    <div class="flex flex-col gap-2 mt-2">
      <label for="equivalent-parent-selector">{{
        $t('equivalents.wrappingCalcOptional')
      }}</label>
      <div class="flex flex-grow">
        <Button
          class="w-full"
          :label="
            selectedValue.parent
              ? global.equivalentDict[selectedValue.parent].specification1
              : $t('equivalents.chooseFactor')
          "
          @click="showChooseEquivalent = true"
        />
        <Button
          v-if="selectedValue.parent"
          icon="fa-solid fa-trash"
          @click="selectedValue.parent = null"
          class="ml-1"
        />
      </div>
      <InlineMessage
        v-if="global.showTooltips"
        class="w-full mt-1"
        severity="info"
      >
        <span v-html="$t('equivalents.wrappingCalcOptionalInline')" />
      </InlineMessage>
    </div>

    <div class="mt-5">
      <Button
        :label="
          selectedValue.id === 'new'
            ? $t('equivalents.create')
            : $t('equivalents.save')
        "
        @click="save"
      />
    </div>
  </Dialog>

  <ConfirmPopup></ConfirmPopup>

  <SmartEquivalentList
    :showEditColumns="true"
    @edit="
      selectedValue = $event.data;
      showDialog = true;
    "
    @delete="deleteEquivalent($event.data, $event.event)"
    :refresh="refreshTrigger"
    :showChooseColumn="false"
  />
</template>

<script setup lang="ts">
import { getAverageEquivalent } from '../../services/reporting/index';
import { useGlobalStore } from '../../stores/global';
import { Ref, ref, watchEffect, computed } from 'vue';
import { EquivalentEntry } from '../../services/types';
import { error, info } from '../../services/ui/toast';
import { useConfirm } from 'primevue/useconfirm';
import SmartEquivalentList from '../../components/equivalents/SmartEquivalentList.vue';
import { importCsvFile } from '../../services/csv/import';
import * as v from 'valibot';
import { getEmptyEquivalent } from '@/factory/equivalent';
import { getEquivalentsAsCsv } from '@/services/csv/download';
import { GenericFormEntry } from '@/services/types/form';
import GenericForm from '@/components/forms/GenericForm.vue';
import MonthlyOrYearlyInput from '@/components/equivalents/MonthlyOrYearlyInput.vue';

const windowWidth = ref(window.innerWidth);

const confirm = useConfirm();
const global = useGlobalStore();
global.refreshEquivalents();

const showDialog = ref(false);
const showChooseEquivalent = ref(false);

const filteredEquivalents = computed(() => {
  if (selectedValue.value.out !== '') {
    return global.equivalents.filter((e) => e.in === selectedValue.value.out);
  } else {
    return global.equivalents;
  }
});

const equivalentSchema = v.object({
  id: v.pipe(v.string(), v.minLength(3), v.maxLength(255)),
  category: v.pipe(v.string(), v.minLength(3), v.maxLength(255)),
  scope: v.pipe(v.number(), v.minValue(1), v.maxValue(3)),
  specification1: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  specification2: v.nullable(v.pipe(v.string(), v.maxLength(255))),
  specification3: v.nullable(v.pipe(v.string(), v.maxLength(255))),
  addName1: v.nullable(v.pipe(v.string(), v.maxLength(255))),
  comment: v.nullable(v.pipe(v.string(), v.maxLength(255))),
  in: v.pipe(v.string(), v.minLength(1), v.maxLength(10)),
  out: v.pipe(v.string(), v.minLength(1), v.maxLength(10)),
  source: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  avgValue: v.pipe(v.number(), v.minValue(0)),
  monthlyValues: v.boolean(),
  jan: v.nullable(v.pipe(v.number(), v.minValue(0))),
  feb: v.nullable(v.pipe(v.number(), v.minValue(0))),
  mar: v.nullable(v.pipe(v.number(), v.minValue(0))),
  apr: v.nullable(v.pipe(v.number(), v.minValue(0))),
  may: v.nullable(v.pipe(v.number(), v.minValue(0))),
  jun: v.nullable(v.pipe(v.number(), v.minValue(0))),
  jul: v.nullable(v.pipe(v.number(), v.minValue(0))),
  aug: v.nullable(v.pipe(v.number(), v.minValue(0))),
  sep: v.nullable(v.pipe(v.number(), v.minValue(0))),
  oct: v.nullable(v.pipe(v.number(), v.minValue(0))),
  nov: v.nullable(v.pipe(v.number(), v.minValue(0))),
  dec: v.nullable(v.pipe(v.number(), v.minValue(0))),
  parent: v.nullable(v.pipe(v.string(), v.maxLength(255))),
  project: v.nullable(v.pipe(v.string(), v.minLength(3), v.maxLength(255))),
});

const formEntries: GenericFormEntry[] = [
  {
    label: 'Scope*',
    key: 'scope',
    type: 'number',
    required: true,
    validation: v.pick(equivalentSchema, ['scope']),
  },
  {
    label: 'Kategorie*',
    key: 'category',
    type: 'text',
    required: true,
    validation: v.pick(equivalentSchema, ['category']),
  },
  {
    label: 'Spezifikation 1*',
    key: 'specification1',
    type: 'text',
    required: true,
    validation: v.pick(equivalentSchema, ['specification1']),
  },
  {
    label: 'Spezifikation 2',
    key: 'specification2',
    type: 'text',
    validation: v.pick(equivalentSchema, ['specification2']),
  },
  {
    label: 'Spezifikation 3',
    key: 'specification3',
    type: 'text',
    validation: v.pick(equivalentSchema, ['specification3']),
  },
  {
    label: 'Zusatzname',
    key: 'addName1',
    type: 'text',
    validation: v.pick(equivalentSchema, ['addName1']),
  },
  {
    label: 'Kommentar',
    key: 'comment',
    type: 'text',
    validation: v.pick(equivalentSchema, ['comment']),
  },
  {
    label: 'Eingangseinheit (welche Einheit soll der User eingeben?)*',
    key: 'in',
    type: 'select',
    options: [
      { label: 'kWh', value: 'kWh' },
      { label: 'Tonnen km', value: 'Tonnen km' },
      { label: 'km', value: 'km' },
      { label: 'l', value: 'l' },
      { label: 'm³', value: 'm³' },
      { label: 'Nm³', value: 'Nm³' },
      { label: 'kg', value: 'kg' },
    ],
    optionsKey: 'value',
    optionsLabel: 'label',
    required: true,
    validation: v.pick(equivalentSchema, ['in']),
  },
  {
    label: 'Ausgangseinheit (welche Einheit kommt heraus?)*',
    key: 'out',
    type: 'select',
    options: [
      { label: 'kWh', value: 'kWh' },
      { label: 'Tonnen km', value: 'Tonnen km' },
      { label: 'km', value: 'km' },
      { label: 'l', value: 'l' },
      { label: 'm³', value: 'm³' },
      { label: 'Nm³', value: 'Nm³' },
      { label: 'kg-CO2', value: 'kg' },
    ],
    optionsKey: 'value',
    optionsLabel: 'label',
    required: true,
    validation: v.pick(equivalentSchema, ['out']),
  },
  {
    label: 'Quelle*',
    key: 'source',
    type: 'text',
    required: true,
    validation: v.pick(equivalentSchema, ['source']),
  },
];

const selectedValue: Ref<EquivalentEntry> = ref(
  getEmptyEquivalent(1, global.selectedProject?.id ?? ''),
);

// calculate avg value for the year
watchEffect(() => {
  if (selectedValue.value.monthlyValues) {
    selectedValue.value.avgValue =
      Math.round(getAverageEquivalent(selectedValue.value) * 10000) / 10000;
  }
});

const save = async () => {
  // validate inputs
  try {
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

    v.parse(equivalentSchema, selectedValue.value);

    // check if parent is set. If not the output unit must be kg-CO-2
    if (
      selectedValue.value.parent == null &&
      selectedValue.value.out !== 'kg'
    ) {
      throw new Error(
        'Wenn kein überliegender Faktor gewählt wird, muss die Ausgangseinheit [kg] (Äquivalente) sein.',
      );
    }
    // if a parent is set. check if the output unit is the same as the input unit of the parent
    if (
      selectedValue.value.parent != null &&
      selectedValue.value.parent !== '' &&
      selectedValue.value.out !==
        global.equivalentDict[selectedValue.value.parent]?.in
    ) {
      throw new Error(
        'Die Ausgangseinheit muss der Eingangseinheit des überliegenden Faktors entsprechen.',
      );
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
    refreshTrigger.value++;
  } catch (e) {
    error((e + '').replace('ValiError: ', ''));
  }
};

let refreshTrigger = ref(0);
const deleteEquivalent = async (equivalent: EquivalentEntry, event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Soll der Faktor wirklich gelöscht werden?',
    icon: 'fa-solid fa-question',
    accept: async () => {
      try {
        await global.dropEquivalent(equivalent);
        info('Erfolgreich gelöscht');
        refreshTrigger.value++;
      } catch (e) {
        error(e + '');
      }
    },
  });
};

const csvDownload = async () => {
  await getEquivalentsAsCsv(global.equivalents);
};

const requestPending = ref(false);
const uploadCsv = async (event: any) => {
  requestPending.value = true;
  if (!event.files || event.files.length === 0) {
    return;
  }
  const file = event.files[0];
  await importCsvFile(file);
  requestPending.value = false;
};
</script>

<style>
div.small-width-ctm > * > input.p-inputnumber-input {
  width: 100%;
}

.cst-no-hover > * > * > .p-datatable-tbody > tr:focus {
  outline: none !important;
}
</style>
