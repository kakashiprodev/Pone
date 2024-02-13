<template>
    <h5 class="mt-5">
        Standorte für das gewählte Projekt definieren.
    </h5>
    <InlineMessage v-if="global.showTooltips" severity="info" class="w-full mt-2 mb-4">
        Pro Projekt können mehrere Standorte definiert werden. Es muss mindestens ein Standort definiert sein.
        Der erste Standort ist der Hauptstandort und wurde vom System angelegt. Dieser kann jederzeit bearbeitet werden.
    </InlineMessage>

    <Toolbar>
        <template #start>
            <span>Ausgewählter Standort</span>
            <Dropdown v-model="global.selectedSite" :options="global.sites" optionLabel="name" placeholder="Standort wählen"
                class="ml-3" style="width: 300px;" :disabled="siteForm?.id === 'new'" />
            <Button icon="fa-solid fa-plus" @click="addEntry()" label="Hinzufügen" class="ml-1" />
            <ConfirmDialog />
            <Button v-if="global.selectedSite" icon="fa-solid fa-trash" @click="confirmDelete(global.selectedSite, $event)"
                label="Löschen" class="ml-1" :disabled="siteForm?.id === 'new'" />
        </template>
    </Toolbar>

    <div v-if="siteForm" class="mt-2">
        <div class="card">
            <h5>Basisdaten des Standorts</h5>
            <div class="field grid">
                <label for="id" class="col-12 mb-2 md:col-4 md:mb-0">ID</label>
                <div class="col-12 md:col-8">
                    <InputText id="id" class="w-full" disabled="true" v-model="siteForm.id" />
                </div>
                <InlineMessage v-if="global.showTooltips" severity="info" class="w-full mt-2">
                    Die ID wird automatisch vergeben und kann nicht geändert werden. Die Anzeige dient rein
                    Support-Zwecken.
                </InlineMessage>
            </div>
            <div class="field grid">
                <label for="name" class="col-12 mb-2 md:col-4 md:mb-0">Standortname</label>
                <div class="col-12 md:col-8">
                    <InputText id="name" class="w-full" v-model="siteForm.name" />
                </div>
                <InlineMessage v-if="global.showTooltips" severity="info" class="w-full mt-2">
                    Der Standortname kann frei bestimmt werden. Die Mindestlänge ist 3 Zeichen.
                </InlineMessage>
            </div>
        </div>

        <Button class="mt-3" @click="saveEntry()" :label="siteForm.id === 'new' ? 'Hinzufügen' : 'Speichern'" />
    </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from './../stores/global';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Toolbar from 'primevue/toolbar';
import InlineMessage from 'primevue/inlinemessage';
import { ref, Ref } from 'vue';
import { SiteEntry } from './../services/types';
import { useConfirm } from "primevue/useconfirm";
import { minLength, maxLength, object, string, parse } from 'valibot';
import { error, info } from './../services/toast';

const global = useGlobalStore();
const confirm = useConfirm();

const siteForm: Ref<null | SiteEntry> = ref(global.selectedSite);
const siteSchema = object({
    id: string([minLength(1)]),
    name: string([minLength(3), maxLength(255)]),
});

const addEntry = () => {
    if (!global.selectedProject) {
        return error('Es muss ein Projekt ausgewählt sein');
    }
    siteForm.value = {
        id: 'new',
        name: '',
        project: global.selectedProject.id,
    }
};

const confirmDelete = async (site: SiteEntry, event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Soll dieser Standort wirklich gelöscht werden? Damit werden alle Berichte, Ziele und Eingaben gelöscht!',
        icon: 'fa-solid fa-question',
        accept: async () => {
            try {
                await global.dropSite(site);
                siteForm.value = global.selectedSite;
            } catch (e) {
                error(e + "");
            }
        },
    });
};

const saveEntry = async () => {
    if (!siteForm.value) {
        return;
    }
    try {
        parse(siteSchema, siteForm.value);
        if (siteForm.value.id === 'new') {
            siteForm.value = await global.addSite(siteForm.value);
            global.selectedSite = siteForm.value;
            info('Standort wurde hinzugefügt');
        } else {
            siteForm.value = await global.updateSite(siteForm.value);
            info('Standort wurde gespeichert');
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
    siteForm.value = global.selectedSite;
}
init();
</script>