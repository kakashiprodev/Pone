<template>
    <h4>Übersicht aller Maßnahmen</h4>
    <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
        Hier können Sie alle Maßnahmen für das Projekt einsehen und bearbeiten.
    </InlineMessage>

    <Toolbar class="mb-2">
        <template #end>
            <Button icon="fa-solid fa-plus" @click="selectedAction = clone(emptyAction); showDialog = true" class="mr-1" />
            <Button icon="fa-solid fa-download" @click="download()" />
        </template>
    </Toolbar>

    <Dialog id="edit-create-action" v-model:visible="showDialog" modal
        :header="selectedAction.id === 'new' ? 'Anlegen' : 'Bearbeiten'"
        :class="{ 'w-8': windowWidth > 990, 'w-full': windowWidth < 990, 'h-screen': windowWidth < 990 }">
        <div>
            <div class="field">
                <label for="action-name">Name</label>
                <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
                    Der Name der Maßnahme für die Übersicht und Diagramme.
                </InlineMessage>
                <InputText class="w-full" v-model="selectedAction.name" id="action-name" />
            </div>
            <div class="field">
                <label for="action-shortDescription">Kurzbeschreibung</label>
                <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
                    Eine Kurzbeschreibung für das Berichtswesen.
                </InlineMessage>
                <Editor id="action-shortDescription" v-model="selectedAction.shortDescription" editorStyle="height: 80px"
                    class="w-full" />
            </div>
            <div class="field">
                <label for="action-longDescription">Langbeschreibung</label>
                <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
                    Eine ausführlichere Beschreibung der Maßnahme.
                </InlineMessage>
                <Editor id="action-longDescription" v-model="selectedAction.longDescription" editorStyle="height: 280px"
                    class="w-full" />
            </div>
            <div class="field">
                <label for="action-targetInTons">Ziel in Tonnen</label>
                <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
                    Die angestrebte Einsparung der Maßnahe in Tonnen CO2 Äquivalenten.
                </InlineMessage>
                <InputNumber class="w-full" v-model="selectedAction.targetInTons" id="action-targetInTons" />
            </div>
            <div class="field">
                <label for="action-responsible">Verantwortlich</label>
                <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
                    Der Name der Verantwortlichen Person für die Maßnahme als Ansprechpartner.
                </InlineMessage>
                <InputText class="w-full" v-model="selectedAction.responsible" id="action-responsible" />
            </div>
            <div class="field">
                <label for="action-finishedUntil">Fertigstellungsdatum</label>
                <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
                    Die geplante Fertigstellung der Maßnahme. Kann im Berichtswesen als Gantt Diagramm dargestellt werden.
                </InlineMessage>
                <Calendar id="action-finishedUntil" v-model="selectedAction.finishedUntil" class="w-full" />
            </div>
            <div class="field">
                <label for="action-status">Status</label>
                <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
                    Der aktuelle Status der Maßnahme.
                </InlineMessage>
                <Dropdown id="action-status" v-model="selectedAction.status" class="w-full"
                    :options="Object.keys(statusTranslations).map((key) => ({ label: statusTranslations[key], value: key }))"
                    option-label="label" option-value="value" />
            </div>
            <div class="field">
                <label for="action-progress">Fortschritt</label>
                <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
                    Der Fortschritt der Maßnahme in Prozent.
                </InlineMessage>
                <Slider id="action-progress" v-model="selectedAction.progress" class="w-full" />
            </div>
        </div>
        <div>
            <Button :label="selectedAction.id === 'new' ? 'Anlegen' : 'Speichern'" @click="save" />
        </div>
    </Dialog>

    <ConfirmPopup></ConfirmPopup>
    <DataTable v-if="actions.length > 0" :value="actions" class="cst-no-hover">
        <Column field="name" header="Name"></Column>
        <Column field="status" header="Status">
            <template #body="{ data }">
                {{ statusTranslations[data.status] || '' }}
            </template>
        </Column>
        <Column field="finishedUntil" header="Fertigstellungsdatum">
            <template #body="{ data }">
                <!-- formatiertes deutsches Datum -->
                {{ new Date(data.finishedUntil).getMonth() + 1 }}/{{ new Date(data.finishedUntil).getFullYear() }}
            </template>
        </Column>
        <!-- <Column field="shortDescription" header="Kurzbeschreibung"></Column>
        <Column field="longDescription" header="Langbeschreibung"></Column> -->
        <Column field="targetInTons" header="Ziel in Tonnen"></Column>
        <Column field="responsible" header="Verantwortlich"></Column>
        <Column field="progress" header="Fortschritt">
            <template #body="{ data }">
                {{ data.progress }} %
            </template>
        </Column>
        <Column header="">
            <template #body="{ data }">
                <div class="flex">
                    <Button icon="fa-solid fa-edit"
                        @click="selectedAction = data; originalAction = clone(data); showDialog = true" />
                    <Button icon="fa-solid fa-trash" class="ml-1" @click="deleteEntry(data, $event)" />
                </div>
            </template>
        </Column>
    </DataTable>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGlobalStore } from './../stores/global';
import { ActionEntry } from './../services/types';
import dataprovider from "./../services/dataprovider";
import { error } from './../services/toast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import ConfirmPopup from 'primevue/confirmpopup';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import InlineMessage from 'primevue/inlinemessage';
import Calendar from 'primevue/calendar';
import Editor from 'primevue/editor';
import Slider from 'primevue/slider';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import { useConfirm } from 'primevue/useconfirm';

const global = useGlobalStore();
const windowWidth = ref(window.innerWidth);
const showDialog = ref(false);
const emptyAction: ActionEntry = {
    id: 'new',
    project: '',
    name: '',
    shortDescription: '',
    longDescription: '',
    targetInTons: 0,
    responsible: '',
    finishedUntil: '',
    status: 'open',
    progress: 0
};
const clone = (input: ActionEntry) => JSON.parse(JSON.stringify(input));
const selectedAction = ref(emptyAction);
const originalAction = ref(emptyAction);

/** 
 * status translations dict
*/
const statusTranslations: any = {
    open: 'Geplant',
    inProgress: 'In Bearbeitung',
    finished: 'Abgeschlossen',
    canceled: 'Abgebrochen',
};

/**
 * Action list
 */
const actions = ref<ActionEntry[]>([]);

/**
 * Save an action
 */
const save = async () => {
    try {
        if (selectedAction.value.id === 'new') {
            const toCreate = clone(selectedAction.value);
            delete toCreate.id;
            const created = await dataprovider.createAction(toCreate);
            actions.value.push(created);
            showDialog.value = false;
            selectedAction.value = clone(emptyAction);
        } else {
            const updated = await dataprovider.updateAction(selectedAction.value);
            const index = actions.value.findIndex((item) => item.id === updated.id);
            actions.value[index] = updated;
            showDialog.value = false;
        }
    } catch (e) {
        error(e + "");
    }
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
                error(e + "");
            }
        },
    });
}

/**
 * Load the data from the server
 */
const getData = async () => {
    try {
        actions.value = await dataprovider.readActions();
    } catch (e) {
        error(e + "");
    }
};
getData();

/**
 * Download the data as CSV
 */
const download = async () => {
    // export data as CSV and download
    let csv = 'ID;Name;Kurzbeschreibung;Langbeschreibung;Ziel in Tonnen;Verantwortlich;Fertigstellungsdatum;Status;Fortschritt\r\n';
    csv += actions.value.map((item) => {
        return [
            item.id,
            item.name,
            item.shortDescription,
            item.longDescription,
            item.targetInTons,
            item.responsible,
            item.finishedUntil,
            item.status,
            item.progress,
        ].join(';');
    }).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Massnahmen_Export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
};
</script>