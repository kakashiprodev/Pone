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
      <GenericForm :definition="formEntries" v-model="selectedAction" />
      <div>
        <Button
          :label="selectedAction.id === 'new' ? 'Anlegen' : 'Speichern'"
          @click="save"
        />
      </div>
    </div>
  </Dialog>

  <ConfirmPopup></ConfirmPopup>

  <ActionList
    :actions="actions"
    :filter="filter"
    @copy="
      (data: ActionEntry) => {
        selectedAction = clone(data);
        selectedAction.id = 'new';
        showDialog = true;
      }
    "
    @edit="
      (data: ActionEntry) => {
        selectedAction = data;
        originalAction = clone(data);
        showDialog = true;
      }
    "
    @delete="deleteEntry"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GenericForm from '@/components/forms/GenericForm.vue';
import { useGlobalStore } from '../../stores/global';
import { ActionEntry } from '../../services/types';
import dataprovider from '../../services/dataprovider';
import statusTranslations from '../../services/statusTranslations.ts';
import { error } from '../../services/ui/toast';
import { useConfirm } from 'primevue/useconfirm';
import * as v from 'valibot';
import { GenericFormEntry } from '@/services/types/form.ts';
import { useI18n } from 'vue-i18n';
import { getEmptyAction } from '@/factory/action.ts';
import { getActionsAsCsv } from '@/services/csv/download.ts';
import ActionList from '@/components/actions/ActionList.vue';

const { t } = useI18n();
const global = useGlobalStore();
const windowWidth = ref(window.innerWidth);
const showDialog = ref(false);

const actionEntrySchema = v.object({
  id: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  responsible: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  status: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  progress: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  relevant: v.boolean(),
  site: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  description_before: v.pipe(v.string(), v.minLength(1), v.maxLength(4000)),
  description_after: v.pipe(v.string(), v.minLength(1), v.maxLength(4000)),
  target_value_absolut_planned: v.pipe(v.number(), v.minValue(0)),
  target_value_absolut_is: v.pipe(v.number(), v.minValue(0)),
  description_target_value: v.pipe(v.string(), v.maxLength(4000)),
  finished_until_planned: v.date(),
  finished_until_is: v.nullable(v.string()),
  category: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  costs_planned: v.pipe(v.number(), v.minValue(0)),
  costs_is: v.pipe(v.number(), v.minValue(0)),
  roi: v.pipe(v.number(), v.minValue(0)),
  description_costs: v.pipe(v.string(), v.maxLength(4000)),
  avoidance_costs: v.pipe(v.number(), v.minValue(0)),
});

const formEntries: GenericFormEntry[] = [
  { label: t('actions.active') + '?', key: 'relevant', type: 'checkbox' },
  {
    label: t('actions.name') + '*',
    key: 'name',
    type: 'text',
    required: true,
    validation: v.pick(actionEntrySchema, ['name']),
  },
  {
    label: t('actions.descriptionBefore') + '*',
    key: 'description_before',
    type: 'textarea',
    required: true,
    validation: v.pick(actionEntrySchema, ['description_before']),
  },
  {
    label: t('actions.descriptionAfter'),
    key: 'description_after',
    type: 'textarea',
    validation: v.pick(actionEntrySchema, ['description_after']),
  },
  {
    label: t('actions.targetValuePlanned') + '*',
    key: 'target_value_absolut_planned',
    type: 'number',
    required: true,
    validation: v.pick(actionEntrySchema, ['target_value_absolut_planned']),
  },
  {
    label: t('actions.targetValueIs'),
    key: 'target_value_absolut_is',
    type: 'number',
    validation: v.pick(actionEntrySchema, ['target_value_absolut_is']),
  },
  {
    label: t('actions.targetValueDescription'),
    key: 'description_target_value',
    type: 'textarea',
    validation: v.pick(actionEntrySchema, ['description_target_value']),
  },
  {
    label: t('actions.responsible'),
    key: 'responsible',
    type: 'text',
    validation: v.pick(actionEntrySchema, ['responsible']),
  },
  {
    label: t('actions.status'),
    key: 'status',
    type: 'select',
    options: [
      { label: statusTranslations.open, value: 'open' },
      { label: statusTranslations.inProgress, value: 'in_progress' },
      { label: statusTranslations.finished, value: 'completed' },
    ],
    optionsKey: 'value',
    optionsLabel: 'label',
    validation: v.pick(actionEntrySchema, ['status']),
  },
  { label: t('actions.progress'), key: 'progress', type: 'slider' },
  {
    label: t('actions.finishedUntilPlanned'),
    key: 'finished_until_planned',
    type: 'datetime',
    validation: v.pick(actionEntrySchema, ['finished_until_planned']),
  },
  {
    label: t('actions.finishedUntilIs'),
    key: 'finished_until_is',
    type: 'datetime',
    validation: v.pick(actionEntrySchema, ['finished_until_is']),
  },
  {
    label: t('actions.category'),
    key: 'category',
    type: 'select',
    options: [
      'Steigerung der Energieeffizienz',
      'Ausbau erneuerbare Energien',
      'Organisatorische Maßnahme',
      'Kompensation',
    ],
    validation: v.pick(actionEntrySchema, ['category']),
  },
  {
    label: t('actions.costsPlanned'),
    key: 'costs_planned',
    type: 'number',
    validation: v.pick(actionEntrySchema, ['costs_planned']),
  },
  {
    label: t('actions.costsIs'),
    key: 'costs_is',
    type: 'number',
    validation: v.pick(actionEntrySchema, ['costs_is']),
  },
  {
    label: t('actions.roi'),
    key: 'roi',
    type: 'number',
    validation: v.pick(actionEntrySchema, ['roi']),
  },
  {
    label: t('actions.descriptionCosts') + '*',
    key: 'description_costs',
    type: 'textarea',
    validation: v.pick(actionEntrySchema, ['description_costs']),
  },
  {
    label: t('actions.avoidanceCosts'),
    key: 'avoidance_costs',
    type: 'number',
    validation: v.pick(actionEntrySchema, ['avoidance_costs']),
  },
];

const clone = (input: ActionEntry) => JSON.parse(JSON.stringify(input));
const selectedAction = ref(getEmptyAction(global.selectedSite?.id ?? ''));
const originalAction = ref(global.selectedSite?.id ?? '');

/**
 * Action list
 */
const actions = ref<ActionEntry[]>([]);

/**
 * Save an action
 */
const save = async () => {
  try {
    v.parse(actionEntrySchema, selectedAction.value);
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
      selectedAction.value = clone(
        getEmptyAction(global.selectedSite?.id ?? ''),
      );
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
  selectedAction.value = clone(getEmptyAction(global.selectedSite?.id ?? ''));
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
const filter = ref('');
const getData = async () => {
  try {
    actions.value = await dataprovider.readActions();
  } catch (e) {
    error(e + '');
  }
};

/**
 * Download the data as CSV
 */
const download = async () => {
  await getActionsAsCsv(actions.value);
};

onMounted(async () => {
  while (global.isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  await getData();
});
</script>
