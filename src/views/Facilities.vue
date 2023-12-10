<template>
    <h4>Übersicht aller Kälteanlagen</h4>

    <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
        Hier können Sie alle Ihre Kälteanlagen anlegen, einsehen und bearbeiten.
        Jede Kälteanlage resuliert in eine Eingabe für den Bericht.
    </InlineMessage>

    <Toolbar class="mb-2">
        <template #end>
            <Button icon="fa-solid fa-plus" @click="selectedValue = clone(emptyFacility); showDialog = true" class="mr-1" />
        </template>
    </Toolbar>

    <!-- choose equivalent modal -->
    <Dialog id="choose-equivalent" v-model:visible="showChooseEquivalent" modal header="Kältemittel auswählen"
        :class="{ 'w-8': windowWidth > 990, 'w-full': windowWidth < 990, 'h-screen': windowWidth < 990 }">
        <SmartEquivalentList v-model="selectedValue.equivalent"
            :filter-by="{ scope: [1, 2, 3], category: ['Technische Gase'] }" />
        <div class="mt-4">
            <Button label="Ok" @click="showChooseEquivalent = false;" />
            <Button class="ml-1" label="Auswahl leeren"
                @click="selectedValue.equivalent = null; showChooseEquivalent = false;" />
            <Button class="ml-1" label="Abbrechen" @click="selectedValue = originalValue; showChooseEquivalent = false;" />
        </div>
    </Dialog>

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
                <InputText class="w-full" v-model="selectedValue.comment" id="facility-comment" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Ein freies Kommentarfeld.
                </InlineMessage>
            </div>
            <div class="field">
                <label for="facility-amountValue">Inhalt</label>
                <InputNumber class="w-full" v-model="selectedValue.amountValue" id="facility-amountValue"
                    :use-grouping="false" :suffix="choosenEquivalent ? ' ' + choosenEquivalent.in : ''"
                    :min-fraction-digits="0" :max-fraction-digits="10" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Der Inhalt an Kältemittel in der Anlage. Wird mit dem Äquivalent verrechnet.
                </InlineMessage>
            </div>
            <!-- cooling -->
            <div class="field">
                <label for="facility-equivalent">Kältemittel</label>
                <div>
                    <div v-if="selectedValue.equivalent != null && selectedValue.equivalent !== ''"
                        @click="showChooseEquivalent = true"
                        class="bg-teal-300 text-white border-round m-2 flex align-items-center justify-content-center cursor-pointer p-2">
                        {{ global.equivalentDict[selectedValue.equivalent]?.specification1 ?? 'Reference error' }}
                    </div>
                    <Button v-else label="Auswählen" @click="showChooseEquivalent = true" />
                </div>
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Hier kann ein Äquivalent zugeordnet werden. Neue Äquivalente können unter dem Benutzermenü >
                    "Äquivalente verwalten" hinzugefügt werden.
                    Gelistet werden außerdem alle ausgelieferten Äquivalente. Ist kein Äquivalent ausgewählt, ist die
                    Eingabe in [kg] CO2-Äquivalenten ohne weiteren Faktor.
                </InlineMessage>
            </div>

            <!-- helping information -->
            <div class="field" v-if="computedSumCalculation !== ''">
                <label for="facility-sum">Berechnungsschritte</label>
                <p style="white-space: pre-wrap;">
                    {{ computedSumCalculation }}
                </p>
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Hier werden alle Berechnugnsschritte angezeigt, die zur Berechnung der Menge (Jahr) verwendet werden.
                    Dies können z.B. Umrechnungsfaktoren sein.
                </InlineMessage>
            </div>
            <div class="field">
                <label for="facility-sum">Menge (berechnet)</label>
                <InputNumber :disabled="true" class="w-full" v-model="computedSumValue" id="facility-sum"
                    :use-grouping="true" :min-fraction-digits="0" :max-fraction-digits="10" :suffix="' kg'" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Die Berechnung erfolgt automatisch aus dem Eingabewert und dem Äquivalent.
                </InlineMessage>
            </div>
        </div>
        <div>
            <Button :label="selectedValue.id === 'new' ? 'Anlegen' : 'Speichern'" @click="save" />
        </div>
    </Dialog>

    <ConfirmPopup></ConfirmPopup>
    <DataTable v-if="global.equivalents.length > 0" :value="data" class="cst-no-hover">
        <!-- <Column field="id" header="ID"></Column> -->
        <Column field="name" header="Name"></Column>
        <Column field="manufacturer" header="Hersteller"></Column>
        <Column field="model" header="Modell/Typ"></Column>
        <Column field="comment" header="Kommentar"></Column>
        <Column field="equivelant" header="GWP">
            <template #body="{ data }">
                {{ global.equivalentDict[data.equivalent]?.specification1 ?? 'Reference error' }}
            </template>
        </Column>
        <Column field="equivelant" header="Inhalt">
            <template #body="{ data }">
                {{ data.amountValue }} {{ global.equivalentDict[data.equivalent]?.in ?? ' ' }}
            </template>
        </Column>

        <Column header="">
            <template #body="{ data }">
                <div class="flex">
                    <Button icon="fa-solid fa-edit"
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
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import InlineMessage from 'primevue/inlinemessage';
import SmartEquivalentList from './../components/SmartEquivalentList.vue';
import { EquivalentEntry, FacilityEntry, InputEntry } from './../services/types';
import dataprovider from "./../services/dataprovider";
import { Ref, ref, computed, ComputedRef } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from './../stores/global';
import { error } from './../services/toast';
import { useConfirm } from 'primevue/useconfirm';
// import { getSumForInput, getCalculationSteps } from "./../services/reporting";
import { parse, string, object, number, minLength, maxLength, minValue } from "valibot";

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
    comment: string([maxLength(255, 'Kommentar zu lang')]),
    equivalent: string('Es muss ein valides Äquivalent ausgewählt werden.', [minLength(1, 'Es muss ein valides Äquivalent ausgewählt werden.'), maxLength(255, 'Es muss ein valides Äquivalent ausgewählt werden.')]),
    amountValue: number([minValue(0, 'Inhalt muss größer als 0 sein')]),
});

// main data for table
const data: Ref<FacilityEntry[]> = ref([]);

// calulate name of choosen equivalent
const showChooseEquivalent = ref(false);
const choosenEquivalent: ComputedRef<null | EquivalentEntry> = computed(() => {
    try {
        return global.equivalentDict[selectedValue.value.equivalent ?? ""];
    } catch (e) {
        return null;
    }
});

// new and edit dialog
const showDialog = ref(false);

const emptyFacility: FacilityEntry = {
    id: 'new',
    name: '',
    manufacturer: '',
    model: '',
    comment: '',
    equivalent: '',
    amountValue: 0,
};

const selectedValue: Ref<FacilityEntry> = ref(emptyFacility);
const originalValue: Ref<FacilityEntry> = ref(emptyFacility);

const computedSumValue = computed(() => {
    // return getSumForInput(selectedValue.value, global.equivalentDict);
    return -1; // not implemented yet
});
const computedSumCalculation: ComputedRef<string> = computed(() => {
    if (selectedValue.value.equivalent != null && selectedValue.value.equivalent !== '' && selectedValue.value.amountValue != null && selectedValue.value.amountValue > 0) {
        // return getCalculationSteps(selectedValue.value, global.equivalentDict).join('\n');
        return '-not implemented yet-';
    } else {
        return '';
    }
});

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
            data.value.push(created);

            showDialog.value = false;
            selectedValue.value = clone(emptyFacility);
        } else {
            const updated = await dataprovider.updateFacility(selectedValue.value);
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
    data.value = await dataprovider.readFacilities();
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