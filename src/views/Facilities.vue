<template>
    <h4>Übersicht aller Anlagen</h4>

    <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
        Hier können Sie alle Ihre Anlagen anlegen, einsehen und bearbeiten. Jede Eingabe kann später einer Anlage zugewiesen
        werden.
    </InlineMessage>

    <Toolbar class="mb-2">
        <template #end>
            <Button icon="fa-solid fa-plus" @click="selectedValue = clone(emptyFacility); showDialog = true" class="mr-1" />
        </template>
    </Toolbar>

    <!-- edit and new modal dialog -->
    <Dialog id="edit-create-input" v-model:visible="showDialog" modal
        :header="selectedValue.id === 'new' ? 'Anlegen' : 'Bearbeiten'"
        :class="{ 'w-6': windowWidth > 990, 'w-full': windowWidth < 990, 'h-screen': windowWidth < 990 }">
        <div>
            <!-- Naming -->
            <div class="field">
                <label for="facility-name">Name</label>
                <InputText class="w-full" v-model="selectedValue.name" id="facility-name" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Der Name der Anlage.
                </InlineMessage>
            </div>
            <div class="field">
                <label for="facility-manufacturer">Hersteller</label>
                <InputText class="w-full" v-model="selectedValue.manufacturer" id="facility-manufacturer" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Der Hersteller der Anlage.
                </InlineMessage>
            </div>
            <div class="field">
                <label for="facility-model">Modell/Typ</label>
                <InputText class="w-full" v-model="selectedValue.model" id="facility-model" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Die Typenbezeichnung der Anlage (Typenschild, Seriennummer, etc.).
                </InlineMessage>
            </div>
            <div class="field">
                <label for="facility-comment">Kommentar</label>
                <InputText class="w-full" v-model="selectedValue.description" id="facility-comment" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Ein freies Kommentarfeld.
                </InlineMessage>
            </div>

            <div class="field">
                <label for="facility-shutdownDate">Stilllegedatum (wenn Anlage außer Betrieb gesetzt wird)</label>
                <Calendar v-model="selectedValue.shutdownDate" view="month" dateFormat="mm/yy" class="w-full" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Wenn dieses Datum gesetzt wird, wird die Anlage in der Auswertung nicht mehr berücksichtigt und in der
                    Liste
                    der Anlagen ausgeblendet.
                </InlineMessage>
            </div>
        </div>
        <div>
            <Button :label="selectedValue.id === 'new' ? 'Anlegen' : 'Speichern'" @click="save" />
        </div>
    </Dialog>

    <ConfirmPopup></ConfirmPopup>
    <DataTable v-if="global.facilities.length > 0" :value="data" class="cst-no-hover">
        <!-- <Column field="id" header="ID"></Column> -->
        <Column field="name" header="Name"></Column>
        <Column field="manufacturer" header="Hersteller"></Column>
        <Column field="model" header="Modell/Typ"></Column>
        <Column field="description" header="Beschreibung"></Column>

        <Column header="">
            <template #body="{ data }">
                <div class="flex">
                    <Button icon="fa-solid fa-table-list" @click="openFacility(data)" />
                    <Button icon="fa-solid fa-edit" class="ml-1"
                        @click="selectedValue = data; originalValue = clone(data); showDialog = true" />
                    <Button icon="fa-solid fa-trash" class="ml-1" @click="deleteEntry(data, $event)" />
                </div>
            </template>
        </Column>
    </DataTable>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import ConfirmPopup from 'primevue/confirmpopup';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import InlineMessage from 'primevue/inlinemessage';
import Calendar from 'primevue/calendar';
import { FacilityEntry, InputEntry } from './../services/types';
import dataprovider from "./../services/dataprovider";
import { Ref, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from './../stores/global';
import { error } from './../services/toast';
import { useConfirm } from 'primevue/useconfirm';
// import { getSumForInput, getCalculationSteps } from "./../services/reporting";
import { parse, string, object, minLength, maxLength } from "valibot";

// load global references
const router = useRouter();
const global = useGlobalStore();
global.refreshEquivalents();
const windowWidth = ref(window.innerWidth);
// ensure that a report is selected
if (!global.selectedReport && global.isLoggedIn) {
    error('Bitte legen Sie einen zunächst einen Bericht an.');
    router.push({ name: 'reportConfig' })
} else if (!global.isLoggedIn) {
    console.log('not logged in. skip report check');
}

// input validation
const facilityEntrySchema = object({
    id: string('Die ID scheint korrupt zu sein.'),
    name: string([minLength(1, 'Name zu kurz'), maxLength(255, 'Name zu lang')]),
    manufacturer: string([minLength(1, 'Hersteller zu kurz'), maxLength(255, 'Hersteller zu lang')]),
    model: string([maxLength(255, 'Modell zu lang')]),
    description: string([maxLength(255, 'Beschreibung ist zu lang')]),
});

// main data for table
const data: Ref<FacilityEntry[]> = ref([]);

// new and edit dialog
const showDialog = ref(false);

const emptyFacility: FacilityEntry = {
    id: 'new',
    name: '',
    manufacturer: '',
    model: '',
    description: '',
    project: global.selectedProject?.id ?? '',
    shutdownDate: null,
};

const selectedValue: Ref<FacilityEntry> = ref(emptyFacility);
const originalValue: Ref<FacilityEntry> = ref(emptyFacility);


/**
 * Open facility inputs
 */
const openFacility = (data: FacilityEntry) => {
    router.push({ name: 'inputs-facility', params: { facility: data.id } });
}

/**
 * Save an entry
 */
const clone = (objToClone: FacilityEntry) => {
    const c = JSON.parse(JSON.stringify(objToClone));
    return c;
}

const save = async () => {
    try {
        // validate
        console.log(selectedValue.value);
        parse(facilityEntrySchema, selectedValue.value);

        if (selectedValue.value.id === 'new') {
            const toCreate = clone(selectedValue.value);
            delete toCreate.id;
            const created = await dataprovider.createFacility(toCreate);
            created.shutdownDate = created.shutdownDate && created.shutdownDate !== '' ? new Date(created.shutdownDate) : null;
            data.value.push(created);

            showDialog.value = false;
            selectedValue.value = clone(emptyFacility);
        } else {
            const updated = await dataprovider.updateFacility(selectedValue.value);
            updated.shutdownDate = updated.shutdownDate && updated.shutdownDate !== '' ? new Date(updated.shutdownDate) : null;
            const index = data.value.findIndex((item) => item.id === updated.id);
            data.value[index] = updated;

            showDialog.value = false;
        }
    } catch (e) {
        error((e + "").replace("ValiError: ", ""));
    }
}

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
                data.value.splice(index, 1);
            } catch (e) {
                error(e + "");
            }
        },
    });
}

/**
 * Get all data
 */
const getData = async () => {
    await global.refreshFacilities();
    data.value = global.facilities;
}

/**
 * Init
 */
getData();
</script>

<style>
.cst-no-hover>*>*>.p-datatable-tbody>tr:focus {
    outline: none !important;
}
</style>