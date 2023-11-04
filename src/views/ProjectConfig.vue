<template>
    <div>
        <h5>
            Projekte
        </h5>
        <p>
            Hier können Sie Projekte anlegen und verwalten. Pro Kunde und Standort sollte ein Projekt angelegt werden.
            Ein Projekt kann mehrere Berichte enthalten.
        </p>
        <Toolbar>
            <template #start>
                <span>Ausgewähltes Projekt</span>
                <Dropdown v-model="global.selectedProject" :options="global.projects" optionLabel="name"
                    placeholder="Projekt wählen" class="ml-3" style="width: 300px;" :disabled="projectForm?.id === 'new'" />
                <Button icon="fa-solid fa-plus" @click="addProject()" label="Neues Projekt hinzufügen" class="ml-1" />
                <ConfirmDialog />
                <Button v-if="selectedProject" icon="fa-solid fa-trash" @click="confirmDelete(selectedProject, $event)"
                    label="Delete" class="ml-1" :disabled="projectForm?.id === 'new'" />
            </template>
        </Toolbar>

        <div v-if="global.isLoading" class="card mt-2">
            <p>Wird geladen...</p>
        </div>
        <div v-else-if="global.reports.length === 0" class="card mt-2">
            <p>Es sind keine Projekte vorhanden. Bitte legen Sie mind. ein Projekt an.</p>
            <Button icon="fa-solid fa-plus" @click="projectForm = emptyProject()" label="Projekt anlegen" />
        </div>

        <div v-if="projectForm" class="mt-2">
            <div class="card">
                <h5>Basisdaten des Projekts</h5>
                <div class="field grid">
                    <label for="id" class="col-12 mb-2 md:col-4 md:mb-0">ID</label>
                    <div class="col-12 md:col-8">
                        <InputText id="id" class="w-full" disabled="true" v-model="projectForm.id" />
                    </div>
                </div>
                <div class="field grid">
                    <label for="projectname" class="col-12 mb-2 md:col-4 md:mb-0">Projektname</label>
                    <div class="col-12 md:col-8">
                        <InputText id="projectname" class="w-full" v-model="projectForm.name" />
                    </div>
                </div>
                <div class="field grid">
                    <label for="targetDefined" class="col-12 mb-2 md:col-4 md:mb-0">Klimaziel für Projekt
                        definieren?</label>
                    <div class="col-12 md:col-8">
                        <Checkbox id="targetDefined" v-model="projectForm.targetDefined" :binary="true" />
                    </div>
                </div>
                <div class="field grid" v-if="projectForm.targetDefined">
                    <label for="targetYear" class="col-12 mb-2 md:col-4 md:mb-0">Angestrebte Klimaneutralität bis
                        Jahr</label>
                    <div class="col-12 md:col-8">
                        <InputNumber :useGrouping="false" :min="1960" :max="2100" id="targetYear" class="w-full"
                            v-model="projectForm.targetYear" />
                    </div>
                </div>
            </div>

            <Button class="mt-3" @click="saveProject()" :label="projectForm.id === 'new' ? 'Hinzufügen' : 'Speichern'" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, Ref, computed, ComputedRef, watch } from 'vue';
import { useGlobalStore } from './../stores/global';
import { useConfirm } from "primevue/useconfirm";
import { ProjectEntry } from './../services/types';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Toolbar from 'primevue/toolbar';
import Checkbox from 'primevue/checkbox';
import ConfirmDialog from 'primevue/confirmdialog';
import InputNumber from 'primevue/inputnumber';
import { minLength, maxLength, object, string, parse } from 'valibot';
import { error, info } from './../services/toast';

const global = useGlobalStore();
const confirm = useConfirm();

const emptyProject = (): ProjectEntry => {
    return {
        id: 'new',
        name: '',
        targetDefined: false,
        targetYear: 2050,
    }
};

const selectedProject: ComputedRef<null | ProjectEntry> = computed(() => {
    return global.selectedProject;
});

watch(selectedProject, (newValue) => {
    if (!newValue) {
        return;
    }
    projectForm.value = newValue;
});

const projectForm: Ref<null | ProjectEntry> = ref(selectedProject.value);
const projectSchema = object({
    id: string([minLength(1)]),
    name: string([minLength(4), maxLength(255)]),
});

const addProject = () => {
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
                error(e + "");
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
        error(e + "")
    }
};

const init = async () => {
    while (global.isLoading) {
        console.log('waiting for global store to load');
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('global store loaded');
    console.log(global.projects);
    console.log(global.selectedProject);
    projectForm.value = selectedProject.value ?? emptyProject();
}
init();
</script>