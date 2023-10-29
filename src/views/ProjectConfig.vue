<template>
    <div>
        <Toolbar>
            <template #start>
                <span>Ausgewähltes Projekt</span>
                <Dropdown v-model="global.selectedProject" :options="global.projects" optionLabel="name"
                    placeholder="Projekt wählen" />
                <Button icon="fa-solid fa-plus" @click="addProject()" label="Add" />
                <Button v-if="global.selectedProject" icon="fa-solid fa-trash"
                    @click="confirmDelete(global.selectedProject, $event)" label="Delete" />
            </template>
        </Toolbar>

        <div v-if="global.reports.length === 0" class="card">
            <p>Es sind keine Projekte vorhanden. Bitte legen Sie mind. ein Projekt an.</p>
            <Button icon="fa-solid fa-plus" @click="projectForm = emptyProject()" label="Bericht anlegen" />
        </div>

        <div class="card">
            <div class="card">
                <h5>Basisdaten des Projekts</h5>
                <div class="field grid">
                    <label for="id" class="col-12 mb-2 md:col-4 md:mb-0">ID</label>
                    <div class="col-12 md:col-8">
                        <InputText id="id" class="w-full" disabled="true" />
                    </div>
                </div>
                <div class="field grid">
                    <label for="projectname" class="col-12 mb-2 md:col-4 md:mb-0">Projektname</label>
                    <div class="col-12 md:col-8">
                        <InputText id="projectname" class="w-full" />
                    </div>
                </div>
            </div>

            <Button class="mt-3" v-if="global.selectedReport" @click="saveProject()"
                :label="global.selectedReport.id === 'new' ? 'Hinzufügen' : 'Speichern'" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue';
import { useGlobalStore } from './../stores/global';
import { useConfirm } from "primevue/useconfirm";
import { ProjectEntry } from './../services/types';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Toolbar from 'primevue/toolbar';
import { minLength, maxLength, object, string, parse } from 'valibot';
import { error } from './../services/toast';

const global = useGlobalStore();
const confirm = useConfirm();

const emptyProject = (): ProjectEntry => {
    return {
        id: '',
        name: '',
    }
};

const projectForm: Ref<ProjectEntry> = ref(global.selectedProject ?? emptyProject());
const projectSchema = object({
    id: string([minLength(1)]),
    project: string([minLength(4), maxLength(255)]),
});

const addProject = () => {
    global.selectedProject = null;
    global.selectedProject = emptyProject();
};

const confirmDelete = async (project: ProjectEntry, event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Soll dieses Projekt wirklich gelöscht werden?',
        icon: 'fa-solid fa-question',
        accept: async () => {
            try {
                await global.dropProject(project);
                projectForm.value = global.selectedProject ?? emptyProject();
            } catch (e) {
                error(e + "");
            }
        },
    });
};

const saveProject = async () => {
    try {
        parse(projectSchema, projectForm.value);
        if (projectForm.value.id === 'new') {
            projectForm.value = await global.addProject(projectForm.value);
        } else {
            projectForm.value = await global.updateProject(projectForm.value);
        }
    } catch (e) {
        error(e + "")
    }
};
</script>