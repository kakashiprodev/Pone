<template>
  <h2>Übersicht aller Eingaben</h2>

  <ScopeInfoBox v-if="preSelectedScope != 'all'" :scope="preSelectedScope" />

  <InlineMessage
    severity="info"
    v-if="globalStore.showTooltips"
    class="w-full mb-2"
  >
    Hier können Sie alle Eingaben für den aktuellen Bericht einsehen und
    bearbeiten. Die Eingaben können außerdem als CSV-Datei exportiert werden.
  </InlineMessage>

  <div class="w-full p-3 mb-3">
    <MeterGroup :value="sumsByCategory" />
  </div>

  <Toolbar class="mb-2">
    <template #start>
      <template v-if="preSelectedScope === 'all'">
        <label class="ml-2">Zeige Scopes:</label>
        <Checkbox
          id="scope1Active"
          v-model="scope1Active"
          value="1"
          class="ml-3"
          :binary="true"
        />
        <label class="ml-1" for="scope1Active">1</label>
        <Checkbox
          id="scope2Active"
          v-model="scope2Active"
          value="1"
          class="ml-4"
          :binary="true"
        />
        <label class="ml-1" for="scope2Active">2</label>
        <Checkbox
          id="scope3Active"
          v-model="scope3Active"
          value="1"
          class="ml-4"
          :binary="true"
        />
        <label class="ml-1" for="scope3Active">3</label>
      </template>
      <span class="ml-4"
        >Menge:
        {{
          roundStringWithDecimals(
            displayInTons ? toTons(sumValue) : sumValue,
            3,
          )
        }}{{ displayInTons ? ' to' : ' kg' }}
      </span>
    </template>
    <template #end>
      <Button
        icon="fa-solid fa-wand-magic-sparkles"
        @click="
          selectedValue = clone(emptyInput);
          showComfortInput = true;
        "
        class="mr-1"
      />
      <Button
        icon="fa-solid fa-plus"
        @click="
          selectedValue = clone(emptyInput);
          showDialog = true;
        "
        class="mr-1"
      />
      <Button icon="fa-solid fa-download" @click="download()" />
    </template>
  </Toolbar>

  <!-- choose equivalent modal for non-comfort input -->
  <Dialog
    id="choose-equivalent"
    v-model:visible="showChooseEquivalent"
    modal
    header="Äquivalent auswählen"
    :class="{
      'w-3/5': windowWidth > 990,
      'w-full': windowWidth < 990,
      'h-screen': windowWidth < 990,
    }"
  >
    <SmartEquivalentList
      v-model="selectedValue.equivalent"
      :filter-by="{
        scope: selectedValue.scope ? [selectedValue.scope] : [1, 2, 3],
      }"
      :hide-scope-input="preSelectedScope != 'all'"
    />
    <div class="mt-4">
      <Button
        label="Ok"
        @click="
          showChooseEquivalent = false;
          updateNameAndCategory();
        "
      />
      <Button
        class="ml-1"
        label="Auswahl leeren"
        @click="
          selectedValue.equivalent = null;
          showChooseEquivalent = false;
        "
      />
      <Button
        class="ml-1"
        label="Abbrechen"
        @click="
          selectedValue = originalValue;
          showChooseEquivalent = false;
        "
      />
    </div>
  </Dialog>

  <!-- choose facility modal -->
  <Dialog
    id="choose-facility"
    v-model:visible="showChooseFacility"
    modal
    header="Anlage auswählen"
    :class="{
      'w-3/5': windowWidth > 990,
      'w-full': windowWidth < 990,
      'h-screen': windowWidth < 990,
    }"
  >
    <FacilityChooser v-model="selectedValue.facility" />
    <div class="mt-4">
      <Button label="Ok" @click="showChooseFacility = false" />
      <Button
        class="ml-1"
        label="Auswahl leeren"
        @click="
          selectedValue.facility = null;
          showChooseFacility = false;
        "
      />
      <Button
        class="ml-1"
        label="Abbrechen"
        @click="
          selectedValue = originalValue;
          showChooseFacility = false;
        "
      />
    </div>
  </Dialog>

  <!-- comfort input -->
  <Dialog
    modal
    header="Komforteingabe"
    id="create-input-comfort"
    v-model:visible="showComfortInput"
    :class="{ 'w-3/4': true }"
    maximizable
  >
    <div class="flex flex-col gap-4">
      <!-- step 1 -->
      <div class="flex flex-col gap-2" v-if="actualComfortStep === 0">
        <SmartEquivalentList
          v-model="selectedValue.equivalent"
          :comfort-mode="true"
          :rowsPerPage="5"
          :visible-columns="['source', 'in', 'out', 'fullName', 'avgValue']"
          :showColumnChooser="false"
          @change="updateNameAndCategory"
          :hide-scope-input="preSelectedScope != 'all'"
          :filter-by="{
            scope:
              preSelectedScope === 'all' ? [1] : [parseInt(preSelectedScope)],
          }"
        />
      </div>

      <!-- step 2 -->
      <div class="flex flex-col gap-4" v-if="actualComfortStep === 1">
        <div class="flex flex-col gap-2">
          <label for="userinput-category">Kategorie</label>
          <InputText
            class="w-full"
            v-model="selectedValue.category"
            id="userinput-category"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="userinput-name">Name</label>
          <InputText
            class="w-full"
            v-model="selectedValue.name"
            id="userinput-name"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="userinput-comment">Kommentar</label>
          <InputText
            class="w-full"
            v-model="selectedValue.comment"
            id="userinput-comment"
          />
        </div>
      </div>

      <!-- step 3 -->
      <div class="flex flex-col gap-4" v-if="actualComfortStep === 2">
        <p>Soll der Eingabe eine Anlage zugeordnet werden?</p>
        <div class="flex flex-col gap-2">
          <label for="userinput-equivalent">Anlage</label>
          <div>
            <div
              v-if="
                selectedValue.facility != null && selectedValue.facility !== ''
              "
              @click="showChooseFacility = true"
              class="bg-teal-300 text-white rounded-sm m-2 flex items-center justify-center cursor-pointer p-2"
            >
              {{
                globalStore.facilitiesDict[selectedValue.facility]?.name ??
                'Reference error'
              }}
            </div>
            <Button
              v-else
              label="Auswählen"
              @click="showChooseFacility = true"
            />
          </div>
        </div>
      </div>

      <!-- step 4 -->
      <div class="flex flex-col gap-4" v-if="actualComfortStep === 3">
        <div>
          <MonthlyOrYearlyInput
            v-model="selectedValue"
            :input-unit="choosenEquivalent ? ' ' + choosenEquivalent.in : ''"
          />
        </div>
        <!-- helping information -->
        <div
          class="flex flex-col gap-2"
          v-if="globalStore.showTooltips && computedSumCalculation !== ''"
        >
          <label for="userinput-sum">Berechnungsschritte</label>
          <p style="white-space: pre-wrap">
            {{ computedSumCalculation }}
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <label for="userinput-sum">Menge (berechnet)</label>
          <InputNumber
            :disabled="true"
            class="w-full"
            v-model="scaledSumValue"
            id="userinput-sum"
            :use-grouping="true"
            :min-fraction-digits="0"
            :max-fraction-digits="3"
            :suffix="displayInTons ? ' to' : ' kg'"
          />
        </div>
      </div>

      <!-- Step Buttons -->
      <div class="flex items-center justify-center">
        <Button
          :label="'Zurück'"
          @click="decStep"
          class="grow mr-1"
          :disabled="actualComfortStep === 0"
        />
        <Button
          v-if="actualComfortStep < 3"
          :label="'Weiter'"
          @click="incStep"
          class="grow ml-1"
          :disabled="
            actualComfortStep === 0 && selectedValue.equivalent == null
          "
        />
        <Button
          v-else
          :label="'Anlegen'"
          @click="save"
          class="grow ml-1"
          :disabled="selectedValue.rawValue == null"
        />
      </div>
    </div>
  </Dialog>

  <Dialog
    id="edit-create-input"
    v-model:visible="showDialog"
    modal
    :header="selectedValue.id === 'new' ? 'Anlegen' : 'Bearbeiten'"
    :class="{
      'w-2/4': windowWidth > 990,
      'w-full': windowWidth < 990,
      'h-screen': windowWidth < 990,
    }"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label for="userinput-scope">Scope</label>
        <Dropdown
          class="w-full"
          id="userinput-scope"
          v-model="selectedValue.scope"
          :options="[1, 2, 3]"
        />
        <InlineMessage
          v-if="globalStore.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          Auswahl des Scopes für den die Eingabe gilt.
        </InlineMessage>
      </div>
      <div class="flex flex-col gap-2">
        <label for="userinput-equivalent">Äquivalent</label>
        <div>
          <div
            v-if="
              selectedValue.equivalent != null &&
              selectedValue.equivalent !== ''
            "
            @click="showChooseEquivalent = true"
            class="bg-teal-300 text-white rounded-sm m-2 flex items-center justify-center cursor-pointer p-2"
          >
            {{
              globalStore.equivalentDict[selectedValue.equivalent]
                ?.specification1 ?? 'Reference error'
            }}
          </div>
          <Button
            v-else
            label="Auswählen"
            @click="showChooseEquivalent = true"
          />
        </div>
        <InlineMessage
          v-if="globalStore.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          Hier kann ein Äquivalent zugeordnet werden. Neue Äquivalente können
          unter dem Benutzermenü > "Äquivalente verwalten" hinzugefügt werden.
          Gelistet werden außerdem alle ausgelieferten Äquivalente. Ist kein
          Äquivalent ausgewählt, ist die Eingabe in [{{
            displayInTons ? ' to' : ' kg'
          }}] CO<sub>2</sub>-Äquivalenten ohne weiteren Faktor.
        </InlineMessage>
      </div>
      <div class="flex flex-col gap-2">
        <label for="userinput-category">Kategorie</label>
        <InputText
          class="w-full"
          v-model="selectedValue.category"
          id="userinput-category"
        />
        <InlineMessage
          v-if="globalStore.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          Die Angabe einer Kategorie dient der späteren Auswertung und besseren
          Sortierbarkeit. Es können beliebige Kategorien angelegt werden.
        </InlineMessage>
      </div>
      <div class="flex flex-col gap-2">
        <label for="userinput-equivalent">Anlage (optional)</label>
        <div>
          <div
            v-if="
              selectedValue.facility != null && selectedValue.facility !== ''
            "
            @click="showChooseFacility = true"
            class="bg-teal-300 text-white rounded-sm m-2 flex items-center justify-center cursor-pointer p-2"
          >
            {{
              globalStore.facilitiesDict[selectedValue.facility]?.name ??
              'Reference error'
            }}
          </div>
          <Button v-else label="Auswählen" @click="showChooseFacility = true" />
        </div>
        <InlineMessage
          v-if="globalStore.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          Hier kann ein Äquivalent zugeordnet werden. Neue Äquivalente können
          unter dem Benutzermenü > "Äquivalente verwalten" hinzugefügt werden.
          Gelistet werden außerdem alle ausgelieferten Äquivalente. Ist kein
          Äquivalent ausgewählt, ist die Eingabe in [{{
            displayInTons ? ' to' : ' kg'
          }}] CO<sub>2</sub>-Äquivalenten ohne weiteren Faktor.
        </InlineMessage>
      </div>
      <div class="flex flex-col gap-2">
        <label for="userinput-name">Name</label>
        <InputText
          class="w-full"
          v-model="selectedValue.name"
          id="userinput-name"
        />
        <InlineMessage
          v-if="globalStore.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          Bezeichnung der Eingabe. Diese wird in der Liste und im Bericht als
          Name angezeigt.
        </InlineMessage>
      </div>
      <div class="flex flex-col gap-2">
        <label for="userinput-comment">Kommentar</label>
        <InputText
          class="w-full"
          v-model="selectedValue.comment"
          id="userinput-comment"
        />
        <InlineMessage
          v-if="globalStore.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          Eine optionale Beschreibung der Eingabe.
        </InlineMessage>
      </div>
      <div>
        <MonthlyOrYearlyInput
          v-model="selectedValue"
          :input-unit="choosenEquivalent ? ' ' + choosenEquivalent.in : ''"
        />
        <InlineMessage
          v-if="globalStore.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          Der Eingabewert vor dem Umrechnen in CO<sub>2</sub>-Äquivalente. Wird
          mit dem Äquivalent verrechnet.
        </InlineMessage>
      </div>
      <!-- helping information -->
      <div
        class="flex flex-col gap-2"
        v-if="globalStore.showTooltips && computedSumCalculation !== ''"
      >
        <label for="userinput-sum">Berechnungsschritte</label>
        <p style="white-space: pre-wrap">
          {{ computedSumCalculation }}
        </p>
        <InlineMessage
          v-if="globalStore.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          Hier werden alle Berechnugnsschritte angezeigt, die zur Berechnung der
          Menge (Jahr) verwendet werden. Dies können z.B. Umrechnungsfaktoren
          sein.
        </InlineMessage>
      </div>
      <div class="flex flex-col gap-2">
        <label for="userinput-sum">Menge (berechnet)</label>
        <InputNumber
          :disabled="true"
          class="w-full"
          v-model="scaledSumValue"
          id="userinput-sum"
          :use-grouping="true"
          :min-fraction-digits="0"
          :max-fraction-digits="3"
          :suffix="displayInTons ? ' to' : ' kg'"
        />
        <InlineMessage
          v-if="globalStore.showTooltips"
          class="w-full mt-1"
          severity="info"
        >
          Die Berechnung erfolgt automatisch aus dem Eingabewert und dem
          Äquivalent.
        </InlineMessage>
      </div>
      <div>
        <Button
          :label="selectedValue.id === 'new' ? 'Anlegen' : 'Speichern'"
          @click="save"
        />
      </div>
    </div>
  </Dialog>

  <ConfirmPopup></ConfirmPopup>
  <DataTable
    :showGridlines="false"
    v-if="globalStore.equivalents.length > 0"
    :value="data"
    class="cst-no-hover text-sm"
  >
    <!-- <Column field="id" header="ID"></Column> -->
    <Column
      field="scope"
      header="Scope"
      sortable
      v-if="preSelectedScope === 'all'"
    >
      <template #body="{ data }">
        <span class="flex justify-center">
          {{ data.scope }}
        </span>
      </template>
    </Column>
    <Column field="category" header="Kategorie" sortable></Column>
    <Column field="name" header="Name" sortable></Column>
    <Column field="rawValue" header="Eingabewert" sortable>
      <template #body="{ data }">
        <Chip class="flex justify-end text-right bg-slate-200 text-sm">
          {{ roundStringWithDecimals(data.rawValue, 3) }}
          {{
            globalStore.equivalentDict[data.equivalent]?.in ?? 'Reference error'
          }}
        </Chip>
      </template>
    </Column>
    <Column field="equivalent" header="Äquivalent" sortable>
      <template #body="{ data }">
        <div v-if="data.equivalent != null && data.equivalent !== ''">
          {{
            globalStore.equivalentDict[data.equivalent]?.specification1 ??
            'Reference error'
          }}
        </div>
        <div v-else></div>
      </template>
    </Column>
    <Column field="facility" header="Anlage" sortable>
      <template #body="{ data }">
        {{ globalStore.facilitiesDict[data.facility]?.name ?? '' }}
      </template>
    </Column>
    <Column field="sumValue" header="Menge (Jahr)" sortable>
      <template #body="{ data }">
        <Chip class="flex justify-end text-right bg-slate-200 text-sm">
          {{
            roundStringWithDecimals(
              displayInTons ? toTons(data.sumValue) : data.sumValue,
              3,
            )
          }}
          {{ displayInTons ? ' to' : ' kg' }}
        </Chip>
      </template>
    </Column>
    <Column field="comment" header="Kommentar"></Column>
    <Column header="">
      <template #body="{ data }">
        <div class="flex">
          <Button
            icon="fa-solid fa-edit"
            @click="
              selectedValue = data;
              originalValue = clone(data);
              showDialog = true;
            "
          />
          <Button
            icon="fa-solid fa-trash"
            class="ml-1"
            @click="deleteEntry(data, $event)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import SmartEquivalentList from '../../components/equivalents/SmartEquivalentList.vue';
import FacilityChooser from '../../components/facilities/FacilityChooser.vue';
import ScopeInfoBox from '../../components/equivalents/ScopeInfoBox.vue';
import MonthlyOrYearlyInput from '../../components/equivalents/MonthlyOrYearlyInput.vue';
import { EquivalentEntry, InputEntry } from '../../services/types';
import { Ref, ref, computed, watch, ComputedRef, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { error } from '../../services/ui/toast';
import { useConfirm } from 'primevue/useconfirm';
import {
  getSumForInput,
  getCalculationSteps,
} from '../../services/reporting/index';
import {
  parse,
  string,
  object,
  number,
  minLength,
  maxLength,
  minValue,
  maxValue,
  nullable,
  boolean,
} from 'valibot';
import { round, roundStringWithDecimals, toTons } from '../../services/pipes';
import { MeterItem } from 'primevue/metergroup';
import { getMonochromeColorPalette } from '@/services/colors';
import { globalStore, inputStore } from '@/main';

const route = useRoute();

// input validation
const inputEntrySchema = object({
  id: string('Die ID scheint korrupt zu sein.'),
  name: string([minLength(1, 'Name zu kurz'), maxLength(255, 'Name zu lang')]),
  scope: number([
    minValue(1, 'Scope muss zwischen 1 und 3 liegen'),
    maxValue(3, 'Scope muss zwischen 1 und 3 liegen'),
  ]),
  comment: string([maxLength(255, 'Kommentar zu lang')]),
  rawValue: number('Ein Wert muss angegeben werden.'),
  parent: nullable(string([maxLength(255, 'Referenz auf parent zu lang')])),
  monthlyValues: boolean('monthlyValues muss ein boolean sein.'),
  rawValueJan: number('rawValueJan muss ein number sein.'),
  rawValueFeb: number('rawValueFeb muss ein number sein.'),
  rawValueMar: number('rawValueMar muss ein number sein.'),
  rawValueApr: number('rawValueApr muss ein number sein.'),
  rawValueMay: number('rawValueMay muss ein number sein.'),
  rawValueJun: number('rawValueJun muss ein number sein.'),
  rawValueJul: number('rawValueJul muss ein number sein.'),
  rawValueAug: number('rawValueAug muss ein number sein.'),
  rawValueSep: number('rawValueSep muss ein number sein.'),
  rawValueOct: number('rawValueOct muss ein number sein.'),
  rawValueNov: number('rawValueNov muss ein number sein.'),
  rawValueDec: number('rawValueDec muss ein number sein.'),
  equivalent: nullable(
    string([maxLength(255, 'Referenz auf equivalents zu lang')]),
  ),
  report: string([
    minLength(1, 'Referenz auf Report ist inkorrekt'),
    maxLength(255, 'Referenz auf Report ist inkorrekt'),
  ]),
  category: nullable(string([maxLength(255, 'Kategorie zu lang')])),
});

// inner state
const scope1Active = ref(true);
const scope2Active = ref(true);
const scope3Active = ref(true);
const windowWidth = ref(window.innerWidth);
const displayInTons = computed(() => {
  return globalStore.displayInTons;
});

// comfort input stepper
const showComfortInput = ref(false);
const actualComfortStep = ref(0);
const incStep = () => {
  actualComfortStep.value++;
};
const decStep = () => {
  actualComfortStep.value--;
};
watch(
  () => showComfortInput.value,
  () => {
    if (!showComfortInput.value) {
      // reset all on close
      actualComfortStep.value = 0;
    }
  },
);

// get "scope" from route
const preSelectedScope = ref('all');
const preSelectedFacility = ref(null as null | string);

/**
 * Set the filters depending on the route
 */
const setRouteFilter = () => {
  // filter by scope if set
  const scopeParam = route.params.scope; // "1", "2", "3", "all"
  const facilityParam = route.params.facility; // "some-id-string"
  // is param is not an Array and is one of the valid strings then return only the number
  // else return 1
  preSelectedScope.value =
    !Array.isArray(scopeParam) &&
    ['1', '2', '3', 'all'].indexOf(scopeParam) > -1
      ? scopeParam
      : 'all';
  if (preSelectedScope.value === 'all') {
    scope1Active.value = true;
    scope2Active.value = true;
    scope3Active.value = true;
  } else {
    scope1Active.value = preSelectedScope.value === '1';
    scope2Active.value = preSelectedScope.value === '2';
    scope3Active.value = preSelectedScope.value === '3';
  }

  preSelectedFacility.value =
    !Array.isArray(facilityParam) && facilityParam != null
      ? facilityParam
      : null;
};

// main data
const data = computed(() => {
  if (preSelectedScope.value === 'all') {
    return inputStore.allScopes;
  } else {
    return inputStore.allScopes.filter(
      (item) => item.scope === parseInt(preSelectedScope.value),
    );
  }
});

// wait for changes in the route
watch(route, () => {
  setRouteFilter();
});

// choose equivalent
const showChooseEquivalent = ref(false);
const choosenEquivalent: ComputedRef<null | EquivalentEntry> = computed(() => {
  try {
    return globalStore.equivalentDict[selectedValue.value.equivalent ?? ''];
  } catch (e) {
    return null;
  }
});

// choose facility
const showChooseFacility = ref(false);

// watch globalStore.selectedReport to reload the report
watch(
  () => globalStore.selectedReport,
  async () => {
    await globalStore.changeReport();
    await inputStore.readUserInputs();
  },
);

// new and empty input element
const showDialog = ref(false);
const emptyInput: InputEntry = {
  id: 'new',
  name: '',
  comment: '',
  report: globalStore.selectedReport?.id ?? '',
  scope: 1,
  sumValue: 0,
  equivalent: null,
  category: null,
  facility: null,
  parent: null,
  rawValue: null as any,
  monthlyValues: false,
  rawValueJan: null as any,
  rawValueFeb: null as any,
  rawValueMar: null as any,
  rawValueApr: null as any,
  rawValueMay: null as any,
  rawValueJun: null as any,
  rawValueJul: null as any,
  rawValueAug: null as any,
  rawValueSep: null as any,
  rawValueOct: null as any,
  rawValueNov: null as any,
  rawValueDec: null as any,
};
const clone = (input: InputEntry) => {
  const c = JSON.parse(JSON.stringify(input));
  if (preSelectedScope.value === '1') c.scope = 1;
  else if (preSelectedScope.value === '2') c.scope = 2;
  else if (preSelectedScope.value === '3') c.scope = 3;
  if (preSelectedFacility.value != null) c.facility = preSelectedFacility.value;
  return c;
};
const selectedValue: Ref<InputEntry> = ref(emptyInput);
const originalValue: Ref<InputEntry> = ref(emptyInput);

// check selectedValue.rawValue for changes to update the input fields
watch(
  () => selectedValue.value.rawValue,
  () => {
    if (!selectedValue.value.monthlyValues) {
      const keys: (keyof InputEntry)[] = [
        'rawValueJan',
        'rawValueFeb',
        'rawValueMar',
        'rawValueApr',
        'rawValueMay',
        'rawValueJun',
        'rawValueJul',
        'rawValueAug',
        'rawValueSep',
        'rawValueOct',
        'rawValueNov',
        'rawValueDec',
      ];
      keys.forEach((key) => {
        // @ts-ignore
        selectedValue.value[key] = round(selectedValue.value.rawValue / 12, 3);
      });
    }
  },
);

// watch selectedValue.equivalent in comfort mode to change the name and comment
const updateNameAndCategory = () => {
  if (
    selectedValue.value.equivalent != null &&
    selectedValue.value.equivalent !== ''
  ) {
    const equivalent =
      globalStore.equivalentDict[selectedValue.value.equivalent];
    if (equivalent == null) {
      error(
        'Äquivalent wurde im Cache nicht gefunden. Bitte laden Sie die Seite neu.',
      );
      return;
    }
    selectedValue.value.name = equivalent.specification1;
    selectedValue.value.comment = equivalent.comment ?? '';
    selectedValue.value.category = equivalent.category;
  }
};

// sum calculation
const computedSumValue = computed(() => {
  return getSumForInput(selectedValue.value, globalStore.equivalentDict);
});
const scaledSumValue = computed(() => {
  return displayInTons.value
    ? toTons(computedSumValue.value)
    : computedSumValue.value;
});
const computedSumCalculation: ComputedRef<string> = computed(() => {
  if (
    selectedValue.value.equivalent != null &&
    selectedValue.value.equivalent !== '' &&
    selectedValue.value.rawValue != null &&
    selectedValue.value.rawValue > 0
  ) {
    return getCalculationSteps(
      selectedValue.value,
      globalStore.equivalentDict,
    ).join('\n');
  } else {
    return '';
  }
});

/**
 * Save the input to the database
 */
const save = async () => {
  try {
    // validate
    parse(inputEntrySchema, selectedValue.value);

    if (selectedValue.value.id === 'new') {
      const toCreate = clone(selectedValue.value);
      delete toCreate.id;
      const created = await inputStore.addInput(toCreate);
      data.value.push(created);

      showDialog.value = false;
      showComfortInput.value = false;

      selectedValue.value = clone(emptyInput);
    } else {
      const updated = await inputStore.updateInput(selectedValue.value);
      const index = data.value.findIndex((item) => item.id === updated.id);
      data.value[index] = updated;

      showDialog.value = false;
      showComfortInput.value = false;
    }
  } catch (e) {
    error((e + '').replace('ValiError: ', ''));
  }
};

/**
 * Delete an entry
 */
const confirm = useConfirm();
const deleteEntry = async (entry: InputEntry, event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Soll das Element wirklich gelöscht werden?',
    icon: 'fa-solid fa-question',
    accept: async () => {
      try {
        await inputStore.dropInput(entry);
      } catch (e) {
        error(e + '');
      }
    },
  });
};

// watch data to caclulate the sum of all sumValues
const sumValue = computed(() => {
  return data.value.reduce((acc, item) => {
    return acc + item.sumValue;
  }, 0);
});

/**
 * Calculate the relative percentage part for the whole sum by category
 * Will get the sumValue as whole sum and calculate the percentage part for each category
 */
const sumsByCategory = computed(() => {
  const relativeSums: MeterItem[] = [];
  // { label: 'Apps', color: '#34d399', value: 16 }

  data.value.forEach((item) => {
    const index = relativeSums.findIndex((i) => i.label === item.category);
    if (index === -1) {
      relativeSums.push({
        label: item.category ?? '',
        color: '#34d399',
        value: item.sumValue,
        icon: '',
      });
    } else {
      relativeSums[index].value += item.sumValue;
    }
  });
  // then calculate the percentage
  relativeSums.forEach((item) => {
    item.value = (item.value / sumValue.value) * 100;
  });
  // add colors
  const colors = getMonochromeColorPalette(relativeSums.length);
  relativeSums.forEach((item, index) => {
    item.color = colors[index];
  });
  return relativeSums;
});

/**
 * Download the data as CSV
 */
const download = async () => {
  // export data as CSV and download
  let csv =
    'ID;Name;Kommentar;Projekt;Scope;Menge;Eingabewert;Äquivalent;Gültigkeit\r\n';
  csv += data.value
    .map((item) => {
      return [
        item.id,
        item.name,
        item.comment,
        item.report,
        item.scope,
        item.sumValue,
        item.rawValue,
        item.equivalent,
        'item.year', // HACK!!!
      ].join(';');
    })
    .join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Eingaben_Export.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
};

/**
 * Lifecycle hook
 */
onMounted(async () => {
  setRouteFilter();
  await globalStore.refreshEquivalents();
  await inputStore.readUserInputs();
});
</script>

<style>
.cst-no-hover > * > * > .p-datatable-tbody > tr:focus {
  outline: none !important;
}
</style>
