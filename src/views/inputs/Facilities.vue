<template>
  <h4>{{ $t('facilities.heading') }}</h4>

  <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
    {{ $t('facilities.inlineMsg') }}
  </InlineMessage>

  <Toolbar class="mb-2">
    <template #start>
      <InputText
        v-model="filter"
        :placeholder="$t('facilities.filter')"
        class="mr-1"
      />
      <span class="flex content-center ml-2">
        <Checkbox v-model="onlyActive" class="ml-1" :binary="true" />
        <span class="ml-2">{{ $t('facilities.onlyActive') }}</span>
      </span>
    </template>
    <template #end>
      <Button
        icon="fa-solid fa-plus"
        @click="
          selectedValue = getEmtypFacility(global.selectedSite?.id ?? '');
          showDialog = true;
        "
        class="mr-1"
      />
    </template>
  </Toolbar>

  <!-- edit and new modal dialog -->
  <Dialog
    id="edit-create-input"
    v-model:visible="showDialog"
    modal
    :header="
      selectedValue.id === 'new'
        ? $t('facilities.create')
        : $t('facilities.edit')
    "
    :class="{
      'w-2/4': windowWidth > 990,
      'w-full': windowWidth < 990,
      'h-screen': windowWidth < 990,
    }"
  >
    <GenericForm :definition="formEntries" v-model="selectedValue" />
    <div class="mt-3">
      <Button
        :label="
          selectedValue.id === 'new'
            ? $t('facilities.create')
            : $t('facilities.save')
        "
        @click="save"
      />
    </div>
  </Dialog>

  <ConfirmPopup></ConfirmPopup>

  <FacilityList
    :facilities="data"
    :filter="filter"
    :showOnlyActive="onlyActive"
    v-model:triggerRefresh="triggerRefresh"
    @delete="deleteEntry"
    @edit="
      (data: FacilityEntry) => {
        selectedValue = data;
        originalValue = clone(data);
        showDialog = true;
      }
    "
  />
</template>

<script setup lang="ts">
import { FacilityEntry, InputEntry } from '../../services/types';
import dataprovider from '../../services/dataprovider';
import { ComputedRef, Ref, computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../../stores/global';
import { error, info } from '../../services/ui/toast';
import { useConfirm } from 'primevue/useconfirm';
import * as v from 'valibot';
import { useI18n } from 'vue-i18n';
import { getEmtypFacility } from '@/factory/facility';
import GenericForm from '@/components/forms/GenericForm.vue';
import { GenericFormEntry } from '@/services/types/form';
import FacilityList from '@/components/facilities/FacilityList.vue';

const { t } = useI18n();

// load global references
const router = useRouter();
const global = useGlobalStore();
global.refreshEquivalents();
const windowWidth = ref(window.innerWidth);
// ensure that a report is selected
if (!global.selectedReport && global.isLoggedIn) {
  error('Bitte legen Sie einen zunächst einen Bericht an.');
  router.push({ name: 'reportConfig' });
} else if (!global.isLoggedIn) {
  console.log('not logged in. skip report check');
}

// input validation
const facilityEntrySchema = v.object({
  id: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  manufacturer: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  model: v.pipe(v.string(), v.maxLength(255)),
  description: v.pipe(v.string(), v.maxLength(255)),
  shutdown_date: v.nullable(v.date()),
});

const formEntries: GenericFormEntry[] = [
  {
    label: t('facilities.name') + '*',
    key: 'name',
    type: 'text',
    required: true,
    validation: v.pick(facilityEntrySchema, ['name']),
  },
  {
    label: t('facilities.manufacturer') + '*',
    key: 'manufacturer',
    type: 'text',
    required: true,
    validation: v.pick(facilityEntrySchema, ['manufacturer']),
  },
  {
    label: t('facilities.model'),
    key: 'model',
    type: 'text',
    validation: v.pick(facilityEntrySchema, ['model']),
  },
  {
    label: t('facilities.description'),
    key: 'description',
    type: 'textarea',
    validation: v.pick(facilityEntrySchema, ['description']),
  },
  {
    label: t('facilities.facilityShutdownDate'),
    key: 'shutdown_date',
    type: 'date',
    validation: v.pick(facilityEntrySchema, ['shutdown_date']),
  },
];

// main data for table
const data: ComputedRef<FacilityEntry[]> = computed(() => global.facilities);
const filter = ref('');
const onlyActive = ref(true);

// new and edit dialog
const showDialog = ref(false);

const selectedValue: Ref<FacilityEntry> = ref(
  getEmtypFacility(global.selectedSite?.id ?? ''),
);
const originalValue: Ref<FacilityEntry> = ref(
  getEmtypFacility(global.selectedSite?.id ?? ''),
);

/**
 * Save an entry
 */
const clone = (objToClone: FacilityEntry) => {
  const c = JSON.parse(JSON.stringify(objToClone));
  return c;
};

const triggerRefresh = ref(false);
const save = async () => {
  try {
    // validate
    v.parse(facilityEntrySchema, selectedValue.value);

    if (selectedValue.value.id === 'new') {
      const toCreate = clone(selectedValue.value);
      delete toCreate.id;
      const created = await dataprovider.createFacility(toCreate);
      created.shutdown_date =
        created.shutdown_date && created.shutdown_date !== ''
          ? new Date(created.shutdown_date)
          : null;
      // add to global
      global.facilities.push(created);
      showDialog.value = false;
      selectedValue.value = getEmtypFacility(global.selectedSite?.id ?? '');
    } else {
      const updated = await dataprovider.updateFacility(selectedValue.value);
      updated.shutdown_date =
        updated.shutdown_date && updated.shutdown_date !== ''
          ? new Date(updated.shutdown_date)
          : null;
      const index = data.value.findIndex((item) => item.id === updated.id);
      global.facilities[index] = updated;

      showDialog.value = false;
    }
    triggerRefresh.value = true;
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
    message: 'Soll der Eintrag wirklich gelöscht werden?',
    icon: 'fa-solid fa-question',
    accept: async () => {
      try {
        await dataprovider.deleteFacility(entry.id);
        const index = data.value.findIndex((item) => item.id === entry.id);
        // remove from global
        global.facilities.splice(index, 1);
        info('Anlage wurde gelöscht');
        triggerRefresh.value = true;
      } catch (e) {
        error(e + '');
      }
    },
  });
};

/**
 * Get all data
 */
const getData = async () => {
  await global.refreshFacilities();
};

/**
 * Init
 */
onMounted(async () => {
  while (global.isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  await getData();
});
</script>
