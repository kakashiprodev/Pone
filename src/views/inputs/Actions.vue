<template>
  <h4>{{ $t('actions.overview') }}</h4>
  <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
    {{ $t('actions.inlineMsg') }}
  </InlineMessage>

  <Toolbar class="mb-2">
    <template #start>
      <InputText
        v-model="filter"
        :placeholder="$t('actions.filter')"
        class="mr-1"
      />
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
        <label for="action-relevant" class="w-full"
          >{{ $t('actions.active') }}?</label
        >
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.activeInline') }}
        </InlineMessage>
        <Checkbox
          v-model="selectedAction.relevant"
          id="action-relevant"
          :binary="true"
        />
      </div>

      <!-- Name -->
      <div class="flex flex-col gap-2">
        <label for="action-name" class="w-full"
          >{{ $t('actions.name') }}*</label
        >
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.nameInline') }}
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
          >{{ $t('actions.descriptionBefore') }}*</label
        >
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.descriptionBeforeInline') }}
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
        <label for="action-descriptionAfter" class="w-full">{{
          $t('actions.descriptionAfter')
        }}</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.descriptionAfterInline') }}
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
        <label
          for="action-targetValueAbsolutPlanned"
          class="w-full"
          v-html="$t('actions.targetValuePlanned') + '*'"
        ></label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
          v-html="$t('actions.targetValuePlannedInline')"
        ></InlineMessage>
        <InputNumber
          class="w-full"
          v-model="selectedAction.target_value_absolut_planned"
          id="action-targetValueAbsolutPlanned"
        />
      </div>

      <!-- Target Value Absolute Is -->
      <div class="flex flex-col gap-2">
        <label
          for="action-targetValueAbsolutIs"
          class="w-full"
          v-html="$t('actions.targetValueIs')"
        ></label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
          v-html="$t('actions.targetValueIsInline')"
        >
        </InlineMessage>
        <InputNumber
          class="w-full"
          v-model="selectedAction.target_value_absolut_is"
          id="action-targetValueAbsolutIs"
        />
      </div>

      <!-- Description Target Value -->
      <div class="flex flex-col gap-2">
        <label for="action-descriptionTargetValue" class="w-full">{{
          $t('actions.targetValueDescription')
        }}</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.targetValueDescriptionInline') }}
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
        <label for="action-responsible" class="w-full">{{
          $t('actions.responsible')
        }}</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.responsibleInline') }}
        </InlineMessage>
        <InputText
          class="w-full"
          v-model="selectedAction.responsible"
          id="action-responsible"
        />
      </div>

      <!-- Status -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-status">{{
          $t('actions.status')
        }}</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.statusInline') }}
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
        <label class="w-full" for="action-progress">{{
          $t('actions.progress')
        }}</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.progressInline') }}
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
        <label class="w-full" for="action-finishedUntilPlanned">{{
          $t('actions.finishedUntilPlanned')
        }}</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.finishedUntilPlannedInline') }}
        </InlineMessage>
        <Calendar
          class="w-full"
          v-model="selectedAction.finished_until_planned"
          id="action-finishedUntilPlanned"
        />
      </div>

      <!-- Finished Until Is -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-finishedUntilIs">{{
          $t('actions.finishedUntilIs')
        }}</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.finishedUntilIsInline') }}
        </InlineMessage>
        <Calendar
          class="w-full"
          v-model="selectedAction.finished_until_is"
          id="action-finishedUntilIs"
        />
      </div>

      <!-- Category -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-category">{{
          $t('actions.category')
        }}</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.categoryInline') }}
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
        <label class="w-full" for="action-costsPlanned">{{
          $t('actions.costsPlanned')
        }}</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.costsPlannedInline') }}
        </InlineMessage>
        <InputNumber
          class="w-full"
          v-model="selectedAction.costs_planned"
          id="action-costsPlanned"
        />
      </div>

      <!-- Costs Is -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-costsIs">{{
          $t('actions.costsIs')
        }}</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.costsIsInline') }}
        </InlineMessage>
        <InputNumber
          class="w-full"
          v-model="selectedAction.costs_is"
          id="action-costsIs"
        />
      </div>

      <!-- ROI -->
      <div class="flex flex-col gap-2">
        <label class="w-full" for="action-roi">{{ $t('actions.roi') }}</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.roiInline') }}
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
          >{{ $t('actions.descriptionCosts') }}*</label
        >
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.descriptionCostsInline') }}
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
        <label class="w-full" for="action-avoidanceCosts">{{
          $t('actions.avoidanceCosts')
        }}</label>
        <InlineMessage
          severity="info"
          v-if="global.showTooltips"
          class="w-full mb-2"
        >
          {{ $t('actions.avoidanceCostsInline') }}
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
    <Column field="name" :header="$t('actions.table.name')"></Column>
    <Column field="status" :header="$t('actions.table.status')">
      <template #body="{ data }">
        {{ statusTranslations[data.status] || '' }}
      </template>
    </Column>
    <Column
      field="finished_until_planned"
      :header="$t('actions.table.finishedUntilPlanned')"
    >
      <template #body="{ data }">
        <!-- formatiertes deutsches Datum -->
        {{ new Date(data.finished_until_planned).getMonth() + 1 }}/{{
          new Date(data.finished_until_planned).getFullYear()
        }}
      </template>
    </Column>
    <!-- <Column field="shortDescription" header="Kurzbeschreibung"></Column>
        <Column field="longDescription" header="Langbeschreibung"></Column> -->
    <Column
      field="target_value_absolut_planned"
      :header="$t('actions.table.targetValueAbsolutePlanned')"
    >
      <template #body="{ data }">
        <Chip class="text-sm"
          >{{ toTons(data.target_value_absolut_planned)
          }}{{ getGlobalUnit() }}</Chip
        >
      </template>
    </Column>
    <Column
      field="responsible"
      :header="$t('actions.table.responsible')"
    ></Column>
    <Column field="progress" :header="$t('actions.table.progress')">
      <template #body="{ data }">
        <Chip class="text-sm">{{ data.progress }}%</Chip>
      </template>
    </Column>
    <Column field="relevant" :header="$t('actions.table.relevant')">
      <template #body="{ data }">
        {{ data.relevant ? $t('actions.table.yes') : $t('actions.table.no') }}
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
import { ref, watch, onMounted } from 'vue';
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
  nullable,
  date,
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
  finished_until_planned: null,
  finished_until_is: null,
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
    minValue(-1, 'Ziel muss größer als 0 sein'),
  ]),
  target_value_absolut_is: number('Kein Ziel angegeben', [
    minValue(-1, 'Ziel muss größer als 0 sein'),
  ]),
  description_target_value: string(
    'Keine Beschreibung des Zielwerts angegeben',
    [
      minLength(1, 'Beschreibung zu kurz'),
      maxLength(4000, 'Beschreibung zu lang'),
    ],
  ),
  finished_until_planned: date('Kein Fertigstellungsdatum angegeben'),
  finished_until_is: nullable(string('Kein Fertigstellungsdatum angegeben')),

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

onMounted(async () => {
  while (global.isLoading) {
    // console.log('waiting for global store to load');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  await getData();
});
</script>
