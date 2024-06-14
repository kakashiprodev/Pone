<template>
  <div>
    <p v-if="global.showTooltips">
      <InlineMessage severity="info" class="w-full">
        Hier können Sie Projekte anlegen und verwalten. Ein Projekt kann mehrere
        Standorte enthalten. Ein Standort wiederrum enthält beliebig viele
        Jahresberichte.
      </InlineMessage>
    </p>
    <Toolbar>
      <template #start>
        <span>Ausgewähltes Projekt</span>
        <Dropdown
          v-model="global.selectedProject"
          :options="global.projects"
          optionLabel="name"
          placeholder="Projekt wählen"
          class="ml-3"
          style="width: 300px"
          :disabled="projectForm?.id === 'new'"
        />
        <Button
          icon="fa-solid fa-pen"
          @click="showEditEntry = true"
          class="ml-1"
        />
        <Button icon="fa-solid fa-plus" @click="addProject()" class="ml-1" />
        <ConfirmDialog />
        <Button
          v-if="selectedProject"
          icon="fa-solid fa-trash"
          @click="confirmDelete(selectedProject, $event)"
          class="ml-1"
          :disabled="projectForm?.id === 'new'"
        />
      </template>
    </Toolbar>

    <div v-if="global.projects.length === 0" class="card mt-2">
      <p>
        Es sind keine Projekte vorhanden. Bitte legen Sie mind. ein Projekt an.
      </p>
      <Button
        icon="fa-solid fa-plus"
        @click="projectForm = emptyProject()"
        label="Projekt anlegen"
      />
    </div>

    <div v-if="projectForm" class="mt-2" v-show="showEditEntry">
      <div class="mt-5">
        <div class="mb-4 grid grid-cols-12 flex items-center">
          <label for="image" class="col-span-12 mb-2 md:col-span-4 md:mb-0">
            Logo des Unternehmens
          </label>
          <div class="flex flex-col gap-2">
            <img
              v-if="projectForm.logo && projectForm.logo !== ''"
              :src="projectForm.logo"
              class="w-24 h-24 rounded-lg object-scale-down"
            />
            <FileUpload
              mode="basic"
              accept="image/*"
              customUpload
              @uploader="uploadImage"
              :auto="true"
            />
          </div>
        </div>

        <div class="mb-4 grid grid-cols-12 flex items-center">
          <label
            for="projectname"
            class="col-span-12 mb-2 md:col-span-4 md:mb-0"
          >
            Projektname
          </label>
          <div class="col-span-12 md:col-span-8">
            <InputText
              id="projectname"
              class="w-full"
              v-model="projectForm.name"
            />
          </div>
          <InlineMessage
            v-if="global.showTooltips"
            severity="info"
            class="w-full mt-2"
          >
            Der Projektname kann der Name der Organisation sein. Der Projektname
            kann auch Organisation und Standort im Namen enthalten. Die
            Mindestlänge ist 4 Zeichen.
          </InlineMessage>
        </div>
      </div>

      <div>
        <Button
          @click="saveProject()"
          :label="projectForm.id === 'new' ? 'Hinzufügen' : 'Speichern'"
        />
        <Button class="ml-2" @click="cancel()" label="Abbrechen" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, computed, ComputedRef, watch } from 'vue';
import { useGlobalStore } from '../../stores/global';
import { useConfirm } from 'primevue/useconfirm';
import { ProjectEntry } from '../../services/types';
import { minLength, maxLength, object, string, parse } from 'valibot';
import { error, info } from '../../services/ui/toast';
import dataprovider from '@/services/dataprovider';

const global = useGlobalStore();
const confirm = useConfirm();

const showEditEntry = ref(false);

const emptyProject = (): ProjectEntry => {
  return {
    id: 'new',
    name: '',
    logo: '',
    logo_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

const selectedProject: ComputedRef<null | ProjectEntry> = computed(() => {
  return global.selectedProject;
});

watch(selectedProject, async (newValue) => {
  if (!newValue) {
    return;
  }
  // load project specific data in store
  await global.changeProject(newValue);
  // refresh settings ui here
  projectForm.value = newValue;
});

const projectForm: Ref<null | ProjectEntry> = ref(selectedProject.value);
const projectSchema = object({
  id: string([minLength(1)]),
  name: string([minLength(4), maxLength(255)]),
  // targetYear: number(),
});

const addProject = () => {
  showEditEntry.value = true;
  projectForm.value = emptyProject();
};

const confirmDelete = async (project: ProjectEntry, event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Soll dieses Projekt wirklich gelöscht werden?',
    icon: 'fa-solid fa-question',
    accept: async () => {
      try {
        await global.dropProject(project);
        projectForm.value = selectedProject.value;
      } catch (e) {
        error(e + '');
      }
    },
  });
};

const saveProject = async () => {
  if (!projectForm.value) {
    return;
  }
  try {
    parse(projectSchema, projectForm.value);
    if (projectForm.value.id === 'new') {
      projectForm.value = await global.addProject(projectForm.value);
      global.selectedProject = projectForm.value;
      projectForm.value = selectedProject.value ?? emptyProject();
      info('Projekt wurde hinzugefügt');
    } else {
      projectForm.value = await global.updateProject(projectForm.value);
      info('Projekt wurde gespeichert');
    }
  } catch (e) {
    error(e + '');
  }
  showEditEntry.value = false;
};

const uploadImage = async (event: any) => {
  if (!projectForm.value) {
    return;
  }
  const file = event.files[0];

  // check if an logo is already uploaded
  if (projectForm.value.logo_id) {
    // delete old image
    await dataprovider.deleteImage(projectForm.value.logo_id);
  }
  const data = await dataprovider.uploadImage(file);
  // update project entry with image url
  projectForm.value.logo = data.url;
  projectForm.value.logo_id = data.id;
  await dataprovider.updateProject(projectForm.value);
};

const cancel = () => {
  showEditEntry.value = false;
  projectForm.value = global.selectedProject;
};

const init = async () => {
  while (global.isLoading) {
    // console.log('waiting for global store to load');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  console.log('global store loaded');
  projectForm.value = selectedProject.value ?? emptyProject();
};
init();
</script>
