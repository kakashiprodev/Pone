<template>
  <h2>Äquivalente und Faktoren</h2>
  <Toolbar :class="{ 'mb-3': !global.showTooltips }">
    <template #end>
      <Button icon="fa-solid fa-download" @click="csvDownload" />
      <Button
        icon="fa-solid fa-plus"
        @click="
          selectedValue = emptyEquivalent();
          showDialog = true;
        "
        class="ml-2"
      />
    </template>
  </Toolbar>

  <InlineMessage
    v-if="global.showTooltips"
    class="w-full mt-3 mb-3"
    severity="info"
  >
    Hier werden alle Äquivalente angezeigt, die für die Berechnung der
    CO2-Äquivalente verwendet werden können. Die System Einträge können nicht
    editiert oder gelöscht werden. Überliegende Berechnungen bedeuten, dass der
    Faktor in Kette mit dem überliegenden Faktor berechnet wird. Hierbei
    entspricht die Ausgangseinheit des Eingabewertes der Eingangseinheit des
    überliegenden Faktors.
  </InlineMessage>

  <!-- Dialog to choose the parent equivalent if needed -->
  <Dialog
    v-model:visible="showChooseEquivalent"
    modal
    header="Wählen Sie einen Faktor"
    :class="{
      'w-6': windowWidth > 990,
      'w-full': windowWidth < 990,
      'h-screen': windowWidth < 990,
    }"
  >
    <DataTable class="cst-no-hover mt-3" :value="filteredEquivalents">
      <Column field="name" header="Name"></Column>
      <Column field="comment" header="Kommentar"></Column>
      <Column field="in" header="Eingang"></Column>
      <Column field="out" header="Ausgang"></Column>
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
    <Button label="Abbrechen" @click="showChooseEquivalent = false" />
  </Dialog>

  <!-- Dialog to add a new equivalent -->
  <Dialog
    v-model:visible="showDialog"
    modal
    :header="selectedValue.id === 'new' ? 'Anlegen' : 'Bearbeiten'"
    :class="{
      'w-6': windowWidth > 990,
      'w-full': windowWidth < 990,
      'h-screen': windowWidth < 990,
    }"
  >
    <div>
      <!-- Naming -->
      <div class="field">
        <label for="equivalent-name">Scope*</label>
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
          Zu welchem Scope gehört der Umrechnungsfaktor.
        </InlineMessage>
      </div>
      <div class="field">
        <label for="equivalent-category">Kategorie*</label>
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
          Die Kategorie wird für die Filterung verwendet.
        </InlineMessage>
      </div>
      <div class="field">
        <label for="equivalent-spec1">Spezifikation 1 (Hauptname)*</label>
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
          Dies ist der Hauptname. Es können bis zu drei Spezifikationen
          angegeben werden, falls Unterscheidungsmerkmale benötigt werden.
        </InlineMessage>
      </div>
      <div class="field">
        <label for="equivalent-spec2">Spezifikation 2</label>
        <InputText
          class="w-full"
          v-model="selectedValue.specification2"
          id="equivalent-spec2"
        />
      </div>
      <div class="field">
        <label for="equivalent-spec3">Spezifikation 3</label>
        <InputText
          class="w-full"
          v-model="selectedValue.specification3"
          id="equivalent-spec3"
        />
      </div>
      <div class="field">
        <label for="equivalent-alt-name">Zusätzlicher Name</label>
        <InputText
          class="w-full"
          v-model="selectedValue.addName1"
          id="equivalent-alt-name"
        />
        <InlineMessage
          v-if="global.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          Dies kann z.B. ein chemisches Formelzeichen sein oder eine alternative
          technische Bezeichnung zur besseren Suchbarkeit.
        </InlineMessage>
      </div>
      <div class="field">
        <label for="equivalent-comment">Kommentar</label>
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
          Eine optionale Bemerkung zur Eingabe.
        </InlineMessage>
      </div>

      <!-- Technical -->
      <div class="field">
        <label for="equivalent-unit-in">Einheit Eingang*</label>
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
          Der "Eingang" entspricht der Einheit in der die Werte eingegeben
          werden.
        </InlineMessage>
      </div>
      <div class="field">
        <label for="equivalent-unit-out">Einheit Ausgang*</label>
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
          Der "Ausgang" entspricht der Einheit in die umgerechnet wird. Wenn
          keine übergeordnete Berechnung verknüpft wird muss(!) Die
          Ausgangseinheit kg-CO2 entsprechen.
        </InlineMessage>
      </div>
      <div class="field">
        <label for="equivalent-source">Quelle*</label>
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
          Angabe woher der Faktor stammt (Berechnungsgrundlage)
        </InlineMessage>
      </div>
      <div class="field">
        <label for="equivalent-monthlyValues">Monatliche Eingaben?</label>
        <div>
          <Checkbox
            v-model="selectedValue.monthlyValues"
            id="equivalent-monthlyValues"
            :binary="true"
          />
        </div>
        <InlineMessage
          v-if="global.showTooltips"
          class="w-full mt-1"
          severity="info"
          >Wenn dies aktiviert wird, können monatliche Eingaben erfolgen. Der
          Jahresmittelwert wird dann autoamtisch errechnet.
        </InlineMessage>
      </div>
      <div v-show="selectedValue.monthlyValues">
        <div class="grid mt-1">
          <div
            class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
          >
            {{ 'Jan' }}
          </div>
          <div
            class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
          >
            {{ 'Feb' }}
          </div>
          <div
            class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
          >
            {{ 'Mar' }}
          </div>
          <div
            class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
          >
            {{ 'Apr' }}
          </div>
        </div>
        <div class="grid mt-1">
          <div class="col-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.jan"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.feb"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.mar"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.apr"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
        </div>
        <div class="grid mt-1">
          <div
            class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
          >
            {{ 'Mai' }}
          </div>
          <div
            class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
          >
            {{ 'Jun' }}
          </div>
          <div
            class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
          >
            {{ 'Jul' }}
          </div>
          <div
            class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
          >
            {{ 'Aug' }}
          </div>
        </div>
        <div class="grid mt-1">
          <div class="col-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.may"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.jun"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.jul"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.aug"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
        </div>
        <div class="grid mt-1">
          <div
            class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
          >
            {{ 'Sep' }}
          </div>
          <div
            class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
          >
            {{ 'Okt' }}
          </div>
          <div
            class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
          >
            {{ 'Nov' }}
          </div>
          <div
            class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
          >
            {{ 'Dez' }}
          </div>
        </div>
        <div class="grid mt-1">
          <div class="col-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.sep"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.oct"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.nov"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
          <div class="col-3 small-width-ctm">
            <InputNumber
              :use-grouping="false"
              v-model="selectedValue.dec"
              :min-fraction-digits="0"
              :max-fraction-digits="10"
            />
          </div>
        </div>
      </div>
      <div class="field">
        <label for="equivalent-value-year">Faktor (Jahresdurschnitt)*</label>
        <InputNumber
          v-if="!selectedValue.monthlyValues"
          class="w-full"
          v-model="selectedValue.avgValue"
          id="equivalent-value-year"
          :use-grouping="false"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
        />
        <div v-else>
          {{ roundString(selectedValue.avgValue) }} (automatisch berechnet)
        </div>
        <InlineMessage
          v-if="global.showTooltips"
          class="w-full mt-1"
          severity="info"
          >Der Jahresdurchschnittswert als Faktor
          [Ausgangseinheit-pro-Eingangseinheit]</InlineMessage
        >
      </div>
      <div class="field">
        <label for="equivalent-parent-selector"
          >Überliegende Berechnung (optional)</label
        >
        <div>
          <Button
            :label="
              selectedValue.parent
                ? global.equivalentDict[selectedValue.parent].specification1
                : 'Wählen Sie einen Faktor'
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
          Wenn eine überliegende Berechnung gewählt wird, muss die
          Ausgangseinheit der überliegenden Berechnung mit der Eingangseinheit
          dieses Faktors übereinstimmen. In dem Fall wird beim Berechnen der
          CO2-Äquivalete der überliegende Faktor in Kette mit diesem Faktors
          berechnet.
        </InlineMessage>
      </div>
    </div>
    <div>
      <Button
        :label="selectedValue.id === 'new' ? 'Anlegen' : 'Speichern'"
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
  />
</template>

<script setup lang="ts">
import { getAverageEquivalent } from '../../services/reporting/index';
import { useGlobalStore } from '../../stores/global';
import { Ref, ref, watchEffect, computed } from 'vue';
import { EquivalentEntry } from '../../services/types';
import { error, info } from '../../services/ui/toast';
import { useConfirm } from 'primevue/useconfirm';
import {
  parse,
  string,
  object,
  number,
  boolean,
  minLength,
  maxLength,
  minValue,
  maxValue,
  nullable,
} from 'valibot';
import { roundString } from '../../services/pipes';
import SmartEquivalentList from '../../components/equivalents/SmartEquivalentList.vue';

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
    addName1: '',
    category: 'Benutzereingaben',
    specification1: '',
    specification2: '',
    specification3: '',
    comment: '',
    in: '',
    out: '',
    source: 'Benutzereingabe',
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
  };
};

const equivalentSchema = object({
  id: string([minLength(3, 'ID zu kurz'), maxLength(255, 'ID zu lang')]),
  category: string([
    minLength(3, 'Kategorie zu kurz'),
    maxLength(255, 'Kategorie zu lang'),
  ]),
  scope: number([
    minValue(1, 'Scope muss zwischen 1 und 3 liegen'),
    maxValue(3, 'Scope muss zwischen 1 und 3 liegen'),
  ]),
  specification1: string([
    minLength(1, 'Spezifikation 1 zu kurz'),
    maxLength(255, 'Spezifikation 1 zu lang'),
  ]),
  specification2: nullable(string([maxLength(255, 'Spezifikation 2 zu lang')])),
  specification3: nullable(string([maxLength(255, 'Spezifikation 3 zu lang')])),
  addName1: nullable(string([maxLength(255, 'Zusatzname zu lang')])),
  comment: nullable(string([maxLength(255, 'Kommentar zu lang')])),
  in: string([
    minLength(1, 'Eingangseinheit zu kurz'),
    maxLength(10, 'Eingangseinheit zu lang'),
  ]),
  out: string([
    minLength(1, 'Ausgangseinheit zu kurz'),
    maxLength(10, 'Ausgangseinheit zu lang'),
  ]),
  source: string([
    minLength(1, 'Quelle zu kurz'),
    maxLength(255, 'Quelle zu lang'),
  ]),
  avgValue: number('Es muss ein Faktor angegeben werden.', [
    minValue(0, 'Faktor muss größer als 0 sein'),
  ]),
  monthlyValues: boolean(),
  jan: nullable(
    number([minValue(0, 'Faktor für Januar muss größer als 0 sein')]),
  ),
  feb: nullable(
    number([minValue(0, 'Faktor für Februar muss größer als 0 sein')]),
  ),
  mar: nullable(
    number([minValue(0, 'Faktor für März muss größer als 0 sein')]),
  ),
  apr: nullable(
    number([minValue(0, 'Faktor für April muss größer als 0 sein')]),
  ),
  may: nullable(number([minValue(0, 'Faktor für Mai muss größer als 0 sein')])),
  jun: nullable(
    number([minValue(0, 'Faktor für Juni muss größer als 0 sein')]),
  ),
  jul: nullable(
    number([minValue(0, 'Faktor für Juli muss größer als 0 sein')]),
  ),
  aug: nullable(
    number([minValue(0, 'Faktor für August muss größer als 0 sein')]),
  ),
  sep: nullable(
    number([minValue(0, 'Faktor für September muss größer als 0 sein')]),
  ),
  oct: nullable(
    number([minValue(0, 'Faktor für Oktober muss größer als 0 sein')]),
  ),
  nov: nullable(
    number([minValue(0, 'Faktor für November muss größer als 0 sein')]),
  ),
  dec: nullable(
    number([minValue(0, 'Faktor für Dezember muss größer als 0 sein')]),
  ),
  parent: nullable(
    string([maxLength(255, 'ID für überliegendes Äquivalent zu kurz')]),
  ),
  project: nullable(
    string([
      minLength(3, 'ID für Projekt zu kurz'),
      maxLength(255, 'ID für Projekt zu kurz'),
    ]),
  ),
});

const selectedValue: Ref<EquivalentEntry> = ref(emptyEquivalent());

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
    if (
      selectedValue.value.parent == null &&
      selectedValue.value.out !== 'kg'
    ) {
      throw new Error(
        'Wenn kein überliegender Faktor gewählt wird, muss die Ausgangseinheit [kg] (CO2-Äquivalente) sein.',
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
</script>

<style>
div.small-width-ctm > * > input.p-inputnumber-input {
  width: 100%;
}

.cst-no-hover > * > * > .p-datatable-tbody > tr:focus {
  outline: none !important;
}
</style>
