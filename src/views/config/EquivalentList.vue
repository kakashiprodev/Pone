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
          selectedValue = emptyEquivalent();
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
        :header="$t('equivalent.choose.name')"
      ></Column>
      <Column
        field="comment"
        :header="$t('equivalent.choose.comment')"
      ></Column>
      <Column field="in" :header="$t('equivalent.choose.in')"></Column>
      <Column field="out" :header="$t('equivalent.choose.out')"></Column>
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
      :label="$t('equivalent.choose.cancel')"
      @click="showChooseEquivalent = false"
    />
  </Dialog>

  <!-- Dialog to add a new equivalent -->
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
    <div class="flex flex-col gap-4">
      <!-- Naming -->
      <div class="flex flex-col gap-2">
        <label for="equivalent-name">{{ $t('equivalents.scope') }}*</label>
        <InputNumber
          class="w-full"
          v-model="selectedValue.scope"
          id="equivalent-scope"
        />
        <InlineMessage
          v-if="global.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          {{ $t('equivalents.scopeInline') }}
        </InlineMessage>
      </div>
      <div class="flex flex-col gap-2">
        <label for="equivalent-category"
          >{{ $t('equivalents.category') }}*</label
        >
        <InputText
          class="w-full"
          v-model="selectedValue.category"
          id="equivalent-category"
        />
        <InlineMessage
          v-if="global.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          {{ $t('equivalents.categoryInline') }}
        </InlineMessage>
      </div>
      <div class="flex flex-col gap-2">
        <label for="equivalent-spec1">{{ $t('equivalents.spec1') }}*</label>
        <InputText
          class="w-full"
          v-model="selectedValue.specification1"
          id="equivalent-spec1"
        />
        <InlineMessage
          v-if="global.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          {{ $t('equivalents.spec1Inline') }}
        </InlineMessage>
      </div>
      <div class="flex flex-col gap-2">
        <label for="equivalent-spec2">{{ $t('equivalents.spec2') }}</label>
        <InputText
          class="w-full"
          v-model="selectedValue.specification2"
          id="equivalent-spec2"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="equivalent-spec3">{{ $t('equivalents.spec3') }}</label>
        <InputText
          class="w-full"
          v-model="selectedValue.specification3"
          id="equivalent-spec3"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="equivalent-alt-name">{{ $t('equivalents.addName') }}</label>
        <InputText
          class="w-full"
          v-model="selectedValue.add_name1"
          id="equivalent-alt-name"
        />
        <InlineMessage
          v-if="global.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          {{ $t('equivalents.addNameInline') }}
        </InlineMessage>
      </div>
      <div class="flex flex-col gap-2">
        <label for="equivalent-comment">{{ $t('equivalents.comment') }}</label>
        <InputText
          class="w-full"
          v-model="selectedValue.comment"
          id="equivalent-comment"
        />
        <InlineMessage
          v-if="global.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          {{ $t('equivalents.commentInline') }}
        </InlineMessage>
      </div>

      <!-- Technical -->
      <div class="flex flex-col gap-2">
        <label for="equivalent-unit-in">{{ $t('equivalents.unitIn') }}*</label>
        <InputText
          class="w-full"
          v-model="selectedValue.in"
          id="equivalent-unit-in"
        />
        <InlineMessage
          v-if="global.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          {{ $t('equivalents.unitInInline') }}
        </InlineMessage>
      </div>
      <div class="flex flex-col gap-2">
        <label for="equivalent-unit-out"
          >{{ $t('equivalents.unitOut') }}*</label
        >
        <InputText
          class="w-full"
          v-model="selectedValue.out"
          id="equivalent-unit-out"
        />
        <InlineMessage
          v-if="global.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          <span v-html="$t('equivalents.unitOutInline')" />
        </InlineMessage>
      </div>
      <div class="flex flex-col gap-2">
        <label for="equivalent-source">{{ $t('equivalents.source') }}*</label>
        <InputText
          class="w-full"
          :value="'Benutzereingabe'"
          id="equivalent-source"
        />
        <InlineMessage
          v-if="global.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          {{ $t('equivalents.sourceInline') }}
        </InlineMessage>
      </div>
      <div class="flex flex-col gap-2">
        <label for="equivalent-monthlyValues"
          >{{ $t('equivalents.monthlyValues') }}?</label
        >
        <div>
          <Checkbox
            v-model="selectedValue.monthly_values"
            id="equivalent-monthlyValues"
            :binary="true"
          />
        </div>
        <InlineMessage
          v-if="global.showTooltips"
          class="w-full mt-1"
          severity="info"
          >{{ $t('equivalents.monthlyValuesInline') }}
        </InlineMessage>
      </div>
      <div v-show="selectedValue.monthly_values">
        <div class="grid grid-cols-12 mt-1">
          <div
            class="col-span-3 items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
          >
            {{ $t('equivalents.month.1') }}
          </div>
          <div
            class="col-span-3 items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
          >
            {{ $t('equivalents.month.2') }}
          </div>
          <div
            class="col-span-3 items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
          >
            {{ $t('equivalents.month.3') }}
          </div>
          <div
            class="col-span-3 items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
          >
            {{ $t('equivalents.month.4') }}
          </div>
        </div>
        <div class="grid grid-cols-12 mt-1">
          <div class="col-span-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.jan"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-span-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.feb"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-span-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.mar"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-span-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.apr"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
        </div>
        <div class="grid grid-cols-12 mt-1">
          <div
            class="col-span-3 items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
          >
            {{ $t('equivalents.month.5') }}
          </div>
          <div
            class="col-span-3 items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
          >
            {{ $t('equivalents.month.6') }}
          </div>
          <div
            class="col-span-3 items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
          >
            {{ $t('equivalents.month.7') }}
          </div>
          <div
            class="col-span-3 items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
          >
            {{ $t('equivalents.month.8') }}
          </div>
        </div>
        <div class="grid grid-cols-12 mt-1">
          <div class="col-span-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.may"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-span-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.jun"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-span-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.jul"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-span-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.aug"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
        </div>
        <div class="grid grid-cols-12 mt-1">
          <div
            class="col-span-3 items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
          >
            {{ $t('equivalents.month.9') }}
          </div>
          <div
            class="col-span-3 items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
          >
            {{ $t('equivalents.month.10') }}
          </div>
          <div
            class="col-span-3 items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
          >
            {{ $t('equivalents.month.11') }}
          </div>
          <div
            class="col-span-3 items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
          >
            {{ $t('equivalents.month.12') }}
          </div>
        </div>
        <div class="grid grid-cols-12 mt-1">
          <div class="col-span-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.sep"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-span-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.oct"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-span-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.nov"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-span-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.dec"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <label for="equivalent-value-year"
          >{{ $t('equivalents.avgValue') }}*</label
        >
        <InputNumber
          v-if="!selectedValue.monthly_values"
          class="w-full"
          v-model="selectedValue.avg_value"
          id="equivalent-value-year"
          :use-grouping="false"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
        />
        <div v-else>
          {{ roundString(selectedValue.avg_value) }} ({{
            $t('equivalents.autoCalc')
          }})
        </div>
        <InlineMessage
          v-if="global.showTooltips"
          class="w-full mt-1"
          severity="info"
          >{{ $t('equivalents.autoCalcInline') }}</InlineMessage
        >
      </div>
      <div class="flex flex-col gap-2">
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
import { roundString } from '../../services/pipes';
import SmartEquivalentList from '../../components/equivalents/SmartEquivalentList.vue';
import { importCsvFile } from '../../services/csv/import';
import * as v from 'valibot';

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

const emptyEquivalent = (): EquivalentEntry => {
  return {
    id: 'new',
    scope: 3,
    add_name1: '',
    category: 'Benutzereingaben',
    specification1: '',
    specification2: '',
    specification3: '',
    comment: '',
    in: '',
    out: '',
    source: 'Benutzereingabe',
    avg_value: null as any,
    monthly_values: false,
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

const equivalentSchema = v.object({
  id: v.pipe(v.string(), v.minLength(3), v.maxLength(255)),
  category: v.pipe(v.string(), v.minLength(3), v.maxLength(255)),
  scope: v.pipe(v.number(), v.minValue(1), v.maxValue(3)),
  specification1: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  specification2: v.nullable(v.pipe(v.string(), v.maxLength(255))),
  specification3: v.nullable(v.pipe(v.string(), v.maxLength(255))),
  add_name1: v.nullable(v.pipe(v.string(), v.maxLength(255))),
  comment: v.nullable(v.pipe(v.string(), v.maxLength(255))),
  in: v.pipe(v.string(), v.minLength(1), v.maxLength(10)),
  out: v.pipe(v.string(), v.minLength(1), v.maxLength(10)),
  source: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  avg_value: v.pipe(v.number(), v.minValue(0)),
  monthly_values: v.boolean(),
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

/*
const formEntries = [
  { label: 'ID*', key: 'id', type: 'text', required: true, validation: v.pick(equivalentSchema, ['id']) },
  { label: 'Kategorie*', key: 'category', type: 'text', required: true, validation: v.pick(equivalentSchema, ['category']) },
  { label: 'Scope*', key: 'scope', type: 'number', required: true, validation: v.pick(equivalentSchema, ['scope']) },
  { label: 'Spezifikation 1*', key: 'specification1', type: 'text', required: true, validation: v.pick(equivalentSchema, ['specification1']) },
  { label: 'Spezifikation 2', key: 'specification2', type: 'text', validation: v.pick(equivalentSchema, ['specification2']) },
  { label: 'Spezifikation 3', key: 'specification3', type: 'text', validation: v.pick(equivalentSchema, ['specification3']) },
  { label: 'Zusatzname', key: 'add_name1', type: 'text', validation: v.pick(equivalentSchema, ['add_name1']) },
  { label: 'Kommentar', key: 'comment', type: 'textarea', validation: v.pick(equivalentSchema, ['comment']) },
  { label: 'Eingangseinheit*', key: 'in', type: 'text', required: true, validation: v.pick(equivalentSchema, ['in']) },
  { label: 'Ausgangseinheit*', key: 'out', type: 'text', required: true, validation: v.pick(equivalentSchema, ['out']) },
  { label: 'Quelle*', key: 'source', type: 'text', required: true, validation: v.pick(equivalentSchema, ['source']) },
  { label: 'Durchschnittswert*', key: 'avg_value', type: 'number', required: true, validation: v.pick(equivalentSchema, ['avg_value']) },
  { label: 'Monatliche Werte', key: 'monthly_values', type: 'checkbox', validation: v.pick(equivalentSchema, ['monthly_values']) },
  { label: 'Januar', key: 'jan', type: 'number', validation: v.pick(equivalentSchema, ['jan']) },
  { label: 'Februar', key: 'feb', type: 'number', validation: v.pick(equivalentSchema, ['feb']) },
  { label: 'März', key: 'mar', type: 'number', validation: v.pick(equivalentSchema, ['mar']) },
  { label: 'April', key: 'apr', type: 'number', validation: v.pick(equivalentSchema, ['apr']) },
  { label: 'Mai', key: 'may', type: 'number', validation: v.pick(equivalentSchema, ['may']) },
  { label: 'Juni', key: 'jun', type: 'number', validation: v.pick(equivalentSchema, ['jun']) },
  { label: 'Juli', key: 'jul', type: 'number', validation: v.pick(equivalentSchema, ['jul']) },
  { label: 'August', key: 'aug', type: 'number', validation: v.pick(equivalentSchema, ['aug']) },
  { label: 'September', key: 'sep', type: 'number', validation: v.pick(equivalentSchema, ['sep']) },
  { label: 'Oktober', key: 'oct', type: 'number', validation: v.pick(equivalentSchema, ['oct']) },
  { label: 'November', key: 'nov', type: 'number', validation: v.pick(equivalentSchema, ['nov']) },
  { label: 'Dezember', key: 'dec', type: 'number', validation: v.pick(equivalentSchema, ['dec']) },
  { label: 'Überliegendes Äquivalent', key: 'parent', type: 'text', validation: v.pick(equivalentSchema, ['parent']) },
  { label: 'Projekt', key: 'project', type: 'text', validation: v.pick(equivalentSchema, ['project']) },
];
 */

const selectedValue: Ref<EquivalentEntry> = ref(emptyEquivalent());

// calculate avg value for the year
watchEffect(() => {
  if (selectedValue.value.monthly_values) {
    selectedValue.value.avg_value =
      Math.round(getAverageEquivalent(selectedValue.value) * 10000) / 10000;
  }
});

const save = async () => {
  // validate inputs
  try {
    console.log(JSON.parse(JSON.stringify(selectedValue.value)));

    // set all monthly values to null if monthlyValues is false
    if (!selectedValue.value.monthly_values) {
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
  const delimiter = ';';
  const eol = '\r\n';
  const toLocalStr = (v: any | null) => {
    if (v == null) {
      return '';
    } else if (typeof v === 'string') {
      return v;
    } else if (typeof v === 'number') {
      return v.toLocaleString();
    } else if (typeof v === 'boolean') {
      return v ? '1' : '0';
    } else {
      return v;
    }
  };
  const header = [
    { val: 'id', name: 'ID' },
    { val: 'scope', name: 'Scope' },
    { val: 'category', name: 'Kategorie' },
    { val: 'specification1', name: 'Spezifikation 1' },
    { val: 'specification2', name: 'Spezifikation 2' },
    { val: 'specification3', name: 'Spezifikation 3' },
    { val: 'addName1', name: 'Zusatzname' },
    { val: 'comment', name: 'Kommentar' },
    { val: 'in', name: 'Eingang' },
    { val: 'out', name: 'Ausgang' },
    { val: 'source', name: 'Quelle' },
    { val: 'avgValue', name: 'Faktor' },
    { val: 'monthlyValues', name: 'Monatliche Eingaben' },
    { val: 'jan', name: 'Wert-Jan (monatlich)' },
    { val: 'feb', name: 'Wert Feb (monatlich)' },
    { val: 'mar', name: 'Wert Mar (monatlich)' },
    { val: 'apr', name: 'Wert Apr (monatlich)' },
    { val: 'may', name: 'Wert May (monatlich)' },
    { val: 'jun', name: 'Wert Jun (monatlich)' },
    { val: 'jul', name: 'Wert Jul (monatlich)' },
    { val: 'aug', name: 'Wert Aug (monatlich)' },
    { val: 'sep', name: 'Wert Sep (monatlich)' },
    { val: 'oct', name: 'Wert Oct (monatlich)' },
    { val: 'nov', name: 'Wert Nov (monatlich)' },
    { val: 'dec', name: 'Wert Dec (monatlich)' },
    { val: 'parent', name: 'Überliegende Berechnung (ID)' },
    { val: 'project', name: 'Projekt' },
  ];

  const lines = global.equivalents
    .map((e: any) => {
      return header.map((h) => toLocalStr(e[h.val])).join(delimiter);
    })
    .join(eol);
  const csv = header.map((h) => h.name).join(delimiter) + eol + lines;
  const blob = new Blob([csv], { type: 'text/csv;charset=windows-1252;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'equivalents.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
