<template>
  <div>
    <p v-if="global.showTooltips">
      <InlineMessage severity="info" class="w-full">
        {{ $t('settings.projectSettings.companiesInline') }}
      </InlineMessage>
    </p>
    <Toolbar>
      <template #start>
        <span>{{ $t('settings.projectSettings.selectedProject') }}</span>
        <Dropdown
          v-model="global.selectedProject"
          :options="global.projects"
          optionLabel="name"
          :placeholder="$t('settings.projectSettings.projectSelectPlaceholder')"
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
        {{ $t('settings.projectSettings.noProjects') }}
      </p>
      <Button
        icon="fa-solid fa-plus"
        @click="projectForm = getEmptyProject()"
        :label="$t('settings.projectSettings.createProject')"
      />
    </div>

    <div v-if="projectForm" class="mt-2" v-show="showEditEntry">
      <div class="mt-5">
        <div class="mb-4 grid grid-cols-12 flex items-center">
          <label for="image" class="col-span-12 mb-2 md:col-span-4 md:mb-0">
            {{ $t('settings.projectSettings.logoOfCompany') }}
          </label>
          <div class="flex flex-col gap-2">
            <img
              v-if="logoUrl !== ''"
              :src="logoUrl"
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
            {{ $t('settings.projectSettings.projectName') }}
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
            {{ $t('settings.projectSettings.projectNameInline') }}
          </InlineMessage>
        </div>
      </div>

      <div>
        <Button
          @click="saveProject()"
          :label="
            projectForm.id === 'new'
              ? $t('settings.projectSettings.add')
              : $t('global.save')
          "
        />
        <Button class="ml-2" @click="cancel()" :label="$t('global.cancel')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, computed, ComputedRef, watch, onMounted } from 'vue';
import { useGlobalStore } from '../../stores/global';
import { useConfirm } from 'primevue/useconfirm';
import { ProjectEntry } from '../../services/types';
import * as v from 'valibot';
import { error, info } from '../../services/ui/toast';
import dataprovider from '@/services/dataprovider';
import { getEmptyProject } from '@/factory/project';

const global = useGlobalStore();
const confirm = useConfirm();

const showEditEntry = ref(false);

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
const projectSchema = v.object({
  id: v.nullable(v.pipe(v.string(), v.minLength(1))),
  name: v.pipe(v.string(), v.minLength(1)),
});

const addProject = () => {
  showEditEntry.value = true;
  projectForm.value = getEmptyProject();
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
    v.parse(projectSchema, projectForm.value);
    if (projectForm.value.id === 'new') {
      projectForm.value = await global.addProject(projectForm.value);
      global.selectedProject = projectForm.value;
      projectForm.value = selectedProject.value ?? getEmptyProject();
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

  if (!file) {
    return;
  }

  // delete old image if necessary
  if (projectForm.value.logoId) {
    await dataprovider.deleteImage(projectForm.value.logoId);
  }
  const uploadedMediaEntry = await dataprovider.uploadImage(file);
  projectForm.value.logoId = uploadedMediaEntry.id;
  await global.updateProject(projectForm.value);
};

const cancel = () => {
  showEditEntry.value = false;
  projectForm.value = global.selectedProject;
};

const init = async () => {
  while (global.isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  projectForm.value = selectedProject.value ?? getEmptyProject();
};

const logoUrl = ref('');
onMounted(async () => {
  init();
  if (global.selectedProject?.logoId != null) {
    logoUrl.value = await dataprovider.getImageAsObjectUrl(
      global.selectedProject.logoId,
    );
  } else {
    return '';
  }
});
</script>
