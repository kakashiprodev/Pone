<template>
  <h4>Übersicht aller Maßnahmen</h4>
  <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
    Hier können Sie alle Maßnahmen für das Projekt einsehen und bearbeiten.
  </InlineMessage>

  <Toolbar class="mb-2">
    <template #start>
      <InputText v-model="filter" placeholder="Filter" class="mr-1" />
    </template>
    <template #end>
      <Button icon="fa-solid fa-plus" @click="addNew()" class="mr-1" />
      <Button icon="fa-solid fa-download" @click="download()" />
    </template>
  </Toolbar>

  <Dialog
    id="edit-create-action"
    v-model:visible="showDialog"
    modal
    :header="selectedAction.id === 'new' ? 'Anlegen' : 'Bearbeiten'"
    :class="{
      'w-3/5': windowWidth > 990,
      'w-full': windowWidth < 990,
      'h-screen': windowWidth < 990,
    }"
  >
    <div class="flex flex-col gap-4">
      <!-- Relevant (Aktiv?) -->
      <div class="flex flex-col gap-2">
        <label for="action-relevant" class="w-full">Aktiv?</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Ist die Maßnahme aktiv und soll in den Berichten angezeigt werden?
        </InlineMessage>
        <Checkbox
          v-model="selectedAction.relevant"
          id="action-relevant"
          :binary="true"
        />
      </div>

      <!-- Name -->
      <div class="flex flex-col gap-2">
        <label for="action-name" class="w-full">Name*</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Der Name der Maßnahme für die Übersicht und Diagramme.
        </InlineMessage>
        <InputText
          class="w-full"
          v-model="selectedAction.name"
          id="action-name"
        />
      </div>

      <!-- Description Before -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-descriptionBefore"
          >Beschreibung (vorher)*</label
        >
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Eine Kurzbeschreibung für das Berichtswesen.
        </InlineMessage>
        <Editor
          class="w-full"
          v-model="selectedAction.description_before"
          id="action-descriptionBefore"
          editorStyle="height: 80px"
        />
      </div>

      <!-- Description After -->
      <div class="flex flex-col gap-2">
        <label for="action-descriptionAfter" class="w-full"
          >Beschreibung (nachher)</label
        >
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Eine Kurzbeschreibung für das Berichtswesen.
        </InlineMessage>
        <Editor
          class="w-full"
          v-model="selectedAction.description_after"
          id="action-descriptionAfter"
          editorStyle="height: 80px"
        />
      </div>

      <!-- Target Value Absolute Planned -->
      <div class="flex flex-col gap-2">
        <label for="action-targetValueAbsolutPlanned" class="w-full"
          >Geplante Einsparung in kg CO<sub>2</sub>*</label
        >
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Die angestrebte Einsparung der Maßnahe in kg CO<sub>2</sub>
          Äquivalenten.
        </InlineMessage>
        <InputNumber
          class="w-full"
          v-model="selectedAction.target_value_absolut_planned"
          id="action-targetValueAbsolutPlanned"
        />
      </div>

      <!-- Target Value Absolute Is -->
      <div class="flex flex-col gap-2">
        <label for="action-targetValueAbsolutIs" class="w-full"
          >Tatsächliche Einsparung in kg CO<sub>2</sub></label
        >
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Die tatsächliche Einsparung der Maßnahe in lg CO<sub>2</sub>
          Äquivalenten.
        </InlineMessage>
        <InputNumber
          class="w-full"
          v-model="selectedAction.target_value_absolut_is"
          id="action-targetValueAbsolutIs"
        />
      </div>

      <!-- Description Target Value -->
      <div class="flex flex-col gap-2">
        <label for="action-descriptionTargetValue" class="w-full"
          >Beschreibung der Zielwerte</label
        >
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Beschreibung wie die Zielwerte erreicht werden sollen.
        </InlineMessage>
        <Editor
          class="w-full"
          v-model="selectedAction.description_target_value"
          id="action-descriptionTargetValue"
          editorStyle="height: 80px"
        />
      </div>

      <!-- Responsible -->
      <div class="flex flex-col gap-2">
        <label for="action-responsible" class="w-full">Verantwortlich</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Wer ist für die Maßnahme verantwortlich?
        </InlineMessage>
        <InputText
          class="w-full"
          v-model="selectedAction.responsible"
          id="action-responsible"
        />
      </div>

      <!-- Status -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-status">Status</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Der aktuelle Status der Maßnahme.
        </InlineMessage>
        <Dropdown
          id="action-status"
          v-model="selectedAction.status"
          class="w-full"
          :options="
            Object.keys(statusTranslations).map((key) => ({
              label: statusTranslations[key],
              value: key,
            }))
          "
          option-label="label"
          option-value="value"
        />
      </div>

      <!-- Progress -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-progress">Fortschritt</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Der aktuelle Fortschritt der Maßnahme in %. (0-100)
        </InlineMessage>
        <Slider
          id="action-progress"
          v-model="selectedAction.progress"
          class="w-full mb-3"
          :step="5"
        />
      </div>

      <!-- Finished Until Planned -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-finishedUntilPlanned"
          >Geplantes Fertigstellungsdatum</label
        >
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Das geplante Fertigstellungsdatum der Maßnahme.
        </InlineMessage>
        <Calendar
          class="w-full"
          v-model="selectedAction.finished_until_planned"
          id="action-finishedUntilPlanned"
        />
      </div>

      <!-- Finished Until Is -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-finishedUntilIs"
          >Tatsächliches Fertigstellungsdatum</label
        >
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Das tatsächliche Fertigstellungsdatum der Maßnahme.
        </InlineMessage>
        <Calendar
          class="w-full"
          v-model="selectedAction.finished_until_is"
          id="action-finishedUntilIs"
        />
      </div>

      <!-- Category -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-category">Kategorie</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          In welche Kategorie fällt die Maßnahme?
        </InlineMessage>
        <Dropdown
          class="w-full"
          v-model="selectedAction.category"
          id="action-category"
          :options="[
            'Steigerung der Energieeffizienz',
            'Ausbau erneuerbare Energien',
            'Organisatorische Maßnahme',
            'Kompensation',
          ]"
        />
      </div>

      <!-- Costs Planned -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-costsPlanned">Geplante Kosten</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Eine Einschätzung der geplanten Kosten.
        </InlineMessage>
        <InputNumber
          class="w-full"
          v-model="selectedAction.costs_planned"
          id="action-costsPlanned"
        />
      </div>

      <!-- Costs Is -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-costsIs">Tatsächliche Kosten</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Die tatsächlichen Kosten der Maßnahme.
        </InlineMessage>
        <InputNumber
          class="w-full"
          v-model="selectedAction.costs_is"
          id="action-costsIs"
        />
      </div>

      <!-- ROI -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-roi"
          >ROI (Return on Investment)</label
        >
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Der Return on Investment der Maßnahme.
        </InlineMessage>
        <InputNumber
          class="w-full"
          v-model="selectedAction.roi"
          id="action-roi"
        />
      </div>

      <!-- Description Costs -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-descriptionCosts"
          >Beschreibung der Kosten*</label
        >
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Wie setzen sich die Kosten zusammen?
        </InlineMessage>
        <Editor
          class="w-full"
          v-model="selectedAction.description_costs"
          id="action-descriptionCosts"
          editorStyle="height: 80px"
        />
      </div>

      <!-- Avoidance Costs -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-avoidanceCosts"
          >Vermeidungskosten</label
        >
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          Wie viel Kosten werden durch die Maßnahme vermieden?
        </InlineMessage>
        <InputNumber
          class="w-full"
          v-model="selectedAction.avoidance_costs"
          id="action-avoidanceCosts"
        />
      </div>

      <div>
        <Button
          :label="selectedAction.id === 'new' ? 'Anlegen' : 'Speichern'"
          @click="save"
        />
      </div>
    </div>
  </Dialog>

  <ConfirmPopup></ConfirmPopup>
  <DataTable
    v-if="actions.length > 0"
    :value="filteredActions"
    class="cst-no-hover text-sm"
    :showGridlines="false"
  >
    <Column field="name" header="Name"></Column>
    <Column field="status" header="Status">
      <template #body="{ data }">
        {{ statusTranslations[data.status] || '' }}
      </template>
    </Column>
    <Column field="finished_until_planned" header="Fertigstellungsdatum">
      <template #body="{ data }">
        <!-- formatiertes deutsches Datum -->
        {{ new Date(data.finished_until_planned).getMonth() + 1 }}/{{
          new Date(data.finished_until_planned).getFullYear()
        }}
      </template>
    </Column>
    <!-- <Column field="shortDescription" header="Kurzbeschreibung"></Column>
        <Column field="longDescription" header="Langbeschreibung"></Column> -->
    <Column field="target_value_absolut_planned" header="Zieleinsparung">
      <template #body="{ data }">
        <Chip class="text-sm"
          >{{ toTons(data.target_value_absolut_planned)
          }}{{ getGlobalUnit() }}</Chip
        >
      </template>
    </Column>
    <Column field="responsible" header="Verantwortlich"></Column>
    <Column field="progress" header="Fortschritt">
      <template #body="{ data }">
        <Chip class="text-sm">{{ data.progress }}%</Chip>
      </template>
    </Column>
    <Column field="relevant" header="Relevant">
      <template #body="{ data }">
        {{ data.relevant ? 'Ja' : 'Nein' }}
      </template>
    </Column>
    <Column header="">
      <template #body="{ data }">
        <div class="flex">
          <Button
            icon="fa-solid fa-edit"
            @click="
              selectedAction = data;
              originalAction = clone(data);
              showDialog = true;
            "
          />
          <Button
            icon="fa-solid fa-trash"
            class="ml-1"
            @click="deleteEntry(data, $event)"
          />
          <Button
            icon="fa-solid fa-copy"
            class="ml-1"
            @click="
              selectedAction = clone(data);
              selectedAction.id = 'new';
              showDialog = true;
            "
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGlobalStore } from '../../stores/global';
import { ActionEntry } from '../../services/types';
import dataprovider from '../../services/dataprovider';
import statusTranslations from '../../services/statusTranslations.ts';
import { error } from '../../services/ui/toast';
import { useConfirm } from 'primevue/useconfirm';
import {
  parse,
  string,
  object,
  number,
  minLength,
  maxLength,
  minValue,
  boolean,
  // date,
  maxValue,
  // nullable,
} from 'valibot';
import { toTons, getGlobalUnit } from '@/services/pipes';

const global = useGlobalStore();
const windowWidth = ref(window.innerWidth);
const showDialog = ref(false);

const emptyAction: ActionEntry = {
  id: 'new',
  site: global.selectedSite?.id ?? '',
  name: '',
  description_before: '',
  description_after: '',
  target_value_absolut_planned: 0,
  target_value_absolut_is: 0,
  description_target_value: '',
  finished_until_planned: '',
  finished_until_is: '',
  category: '',
  costs_planned: 0,
  costs_is: 0,
  roi: 0,
  description_costs: '',
  avoidance_costs: 0,
  responsible: '',
  status: 'open',
  progress: 0,
  relevant: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
const clone = (input: ActionEntry) => JSON.parse(JSON.stringify(input));
const selectedAction = ref(emptyAction);
const originalAction = ref(emptyAction);

// validation form
const actionEntrySchema = object({
  id: string('Die ID scheint korrupt zu sein.'),
  responsible: string('Kein Verantwortlicher angegeben', [
    minLength(1, 'Verantwortlicher zu kurz'),
    maxLength(255, 'Verantwortlicher zu lang'),
  ]),
  status: string('Kein Status angegeben', [
    minLength(1, 'Status zu kurz'),
    maxLength(255, 'Status zu lang'),
  ]),
  progress: number('Kein Fortschritt angegeben', [
    minValue(0, 'Fortschritt muss größer als 0 sein'),
    maxValue(100, 'Fortschritt muss kleiner als 100 sein'),
  ]),
  relevant: boolean('Keine Relevanz angegeben'),
  site: string('Keine Site angegeben', [
    minLength(1, 'Site zu kurz'),
    maxLength(255, 'Site zu lang'),
  ]),
  name: string('Kein Name angegeben', [
    minLength(1, 'Name zu kurz'),
    maxLength(255, 'Name zu lang'),
  ]),
  description_before: string('Keine Beschreibung angegeben', [
    minLength(1, 'Beschreibung zu kurz'),
    maxLength(4000, 'Beschreibung zu lang'),
  ]),
  description_after: string('Keine Beschreibung angegeben', [
    minLength(1, 'Beschreibung zu kurz'),
    maxLength(4000, 'Beschreibung zu lang'),
  ]),
  target_value_absolut_planned: number('Kein Ziel angegeben', [
    minValue(0, 'Ziel muss größer als 0 sein'),
  ]),
  target_value_absolut_is: number('Kein Ziel angegeben', [
    minValue(0, 'Ziel muss größer als 0 sein'),
  ]),
  description_target_value: string(
    'Keine Beschreibung des Zielwerts angegeben',
    [
      minLength(1, 'Beschreibung zu kurz'),
      maxLength(4000, 'Beschreibung zu lang'),
    ],
  ),
  // finishedUntilPlanned: date('Kein Fertigstellungsdatum angegeben'),
  // finishedUntilIs: nullable(string('Kein Fertigstellungsdatum angegeben')),

  category: string('Keine Kategorie angegeben', [
    minLength(1, 'Kategorie zu kurz'),
    maxLength(255, 'Kategorie zu lang'),
  ]),
  costs_planned: number('Keine geplanten Kosten angegeben', [
    minValue(0, 'Kosten müssen größer als 0 sein'),
  ]),
  costs_is: number('Keine tatsächlichen Kosten angegeben', [
    minValue(0, 'Kosten müssen größer als 0 sein'),
  ]),
  roi: number('Kein ROI angegeben', [
    minValue(0, 'ROI muss größer als 0 sein'),
  ]),
  description_costs: string('Keine Kostenbeschreibung angegeben', [
    minLength(1, 'Beschreibung zu kurz'),
    maxLength(4000, 'Beschreibung zu lang'),
  ]),
  avoidance_costs: number('Keine Vermeidungskosten angegeben', [
    minValue(0, 'Vermeidungskosten müssen größer als 0 sein'),
  ]),
});

/**
 * Action list
 */
const actions = ref<ActionEntry[]>([]);

/**
 * Filtered action list
 */
const filter = ref('');
const filteredActions = ref<ActionEntry[]>([]);
const filterData = () => {
  let filtered = actions.value;
  if (filter.value !== '') {
    filtered = actions.value.filter((item) => {
      return item.name.toLowerCase().includes(filter.value.toLowerCase());
    });
  }
  filteredActions.value = filtered;
};
watch(
  () => filter.value,
  () => {
    filterData();
  },
);

/**
 * Save an action
 */
const save = async () => {
  try {
    parse(actionEntrySchema, selectedAction.value);
    if (selectedAction.value.id === 'new') {
      const toCreate = clone(selectedAction.value);
      delete toCreate.id;
      const created = await dataprovider.createAction(toCreate);
      created.finished_until_planned =
        created.finished_until_planned && created.finished_until_planned !== ''
          ? new Date(created.finished_until_planned)
          : null;
      actions.value.push(created);
      showDialog.value = false;
      selectedAction.value = clone(emptyAction);
    } else {
      const updated = await dataprovider.updateAction(selectedAction.value);
      updated.finished_until_planned =
        updated.finished_until_planned && updated.finished_until_planned !== ''
          ? new Date(updated.finished_until_planned)
          : null;
      const index = actions.value.findIndex((item) => item.id === updated.id);
      actions.value[index] = updated;
      showDialog.value = false;
    }
  } catch (e) {
    error((e + '').replace('ValiError: ', ''));
  }
};

/***
 * Add a new action
 */
const addNew = () => {
  selectedAction.value = clone(emptyAction);
  showDialog.value = true;
};

/**
 * Delete an action
 */
const confirm = useConfirm();
const deleteEntry = async (entry: ActionEntry, event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Soll der Eintrag wirklich gelöscht werden?',
    icon: 'fa-solid fa-question',
    accept: async () => {
      try {
        await dataprovider.deleteAction(entry.id);
        const index = actions.value.findIndex((item) => item.id === entry.id);
        actions.value.splice(index, 1);
      } catch (e) {
        error(e + '');
      }
    },
  });
};

/**
 * Load the data from the server
 */
const getData = async () => {
  try {
    filteredActions.value = [];
    actions.value = await dataprovider.readActions();
    filteredActions.value = actions.value;
    filter.value = '';
  } catch (e) {
    error(e + '');
  }
};
getData();

/**
 * Download the data as CSV
 */
const download = async () => {
  // export data as CSV and download
  let csv =
    'ID;Name;Verantwortlicher;Status;Fortschritt;Relevant;Standort;Beschreibung Vorher;Beschreibung Danach;Zielwert geplant;Zielwert tatsächlich;Beschreibung Zielwert;Fertigstellung geplant;Fertigstellung tatsächlich;Kategorie;Kosten geplant;Kosten tatsächlich;ROI;Kostenbeschreibung;Vermeidungs-Kosten\r\n';
  csv += actions.value
    .map((item) => {
      return [
        item.id,
        item.name,
        item.responsible,
        statusTranslations[item.status],
        item.progress,
        item.relevant ? 'Ja' : 'Nein',
        item.site,
        item.description_before,
        item.description_after,
        item.target_value_absolut_planned,
        item.target_value_absolut_is,
        item.description_target_value,
        item.finished_until_planned,
        item.finished_until_is,
        item.category,
        item.costs_planned,
        item.costs_is,
        item.roi,
        item.description_target_value,
        item.avoidance_costs,
      ].join(';');
    })
    .join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Massnahmen_Export.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
};
</script>
