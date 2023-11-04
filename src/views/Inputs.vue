<template>
    <h4>Übersicht aller Eingaben</h4>
    <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
        Hier können Sie alle Eingaben für den aktuellen Bericht einsehen und bearbeiten.
        Die Eingaben können außerdem als CSV-Datei exportiert werden.
    </InlineMessage>
    <Toolbar class="mb-2">
        <template #start>
            <label class="ml-2">Zeige Scopes:</label>
            <Checkbox id="scope1Active" v-model="scope1Active" value="1" class="ml-3" :binary="true" @change="getData" />
            <label class="ml-1" for="scope1Active">1</label>
            <Checkbox id="scope2Active" v-model="scope2Active" value="1" class="ml-4" :binary="true" @change="getData" />
            <label class="ml-1" for="scope2Active">2</label>
            <Checkbox id="scope3Active" v-model="scope3Active" value="1" class="ml-4" :binary="true" @change="getData" />
            <label class="ml-1" for="scope3Active">3</label>

        </template>
        <template #end>
            <Button icon="fa-solid fa-plus" @click="selectedValue = clone(emptyInput); showDialog = true" class="mr-1" />
            <Button icon="fa-solid fa-download" @click="download()" />
        </template>
    </Toolbar>

    <Dialog id="choose-equivalent" v-model:visible="showChooseEquivalent" modal header="Äquivalent auswählen"
        :class="{ 'w-8': windowWidth > 990, 'w-full': windowWidth < 990, 'h-screen': windowWidth < 990 }">
        <ChooseComponent v-model="selectedValue.equivalent" />
        <div class="mt-4">
            <Button label="Ok" @click="showChooseEquivalent = false;" />
            <Button class="ml-1" label="Auswahl leeren"
                @click="selectedValue.equivalent = null; showChooseEquivalent = false;" />
            <Button class="ml-1" label="Abbrechen" @click="selectedValue = originalValue; showChooseEquivalent = false;" />
        </div>
    </Dialog>

    <Dialog id="edit-create-input" v-model:visible="showDialog" modal
        :header="selectedValue.id === 'new' ? 'Anlegen' : 'Bearbeiten'"
        :class="{ 'w-6': windowWidth > 990, 'w-full': windowWidth < 990, 'h-screen': windowWidth < 990 }">
        <div>
            <div class="field">
                <label for="userinput-scope">Scope</label>
                <Dropdown class="w-full" id="userinput-scope" v-model="selectedValue.scope" :options="[1, 2, 3]" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Auswahl des Scopes für den die Eingabe gilt.
                </InlineMessage>
            </div>
            <div class="field">
                <label for="userinput-name">Name</label>
                <InputText class="w-full" v-model="selectedValue.name" id="userinput-name" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Bezeichnung der Eingabe. Diese wird in der Liste und im Bericht als Name angezeigt.
                </InlineMessage>
            </div>
            <div class="field">
                <label for="userinput-comment">Kommentar</label>
                <InputText class="w-full" v-model="selectedValue.comment" id="userinput-comment" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Eine optionale Beschreibung der Eingabe.
                </InlineMessage>
            </div>
            <div class="field">
                <label for="userinput-equivalent">Äquivalent</label>
                <div>
                    <div v-if="selectedValue.equivalent != null && selectedValue.equivalent !== ''"
                        @click="showChooseEquivalent = true"
                        class="bg-teal-300 text-white border-round m-2 flex align-items-center justify-content-center cursor-pointer p-2">
                        {{ global.equivalentDict[selectedValue.equivalent]?.name ?? 'Reference error' }}
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
            <div class="field">
                <label for="userinput-rawvalue">
                    Eingabewert {{ choosenEquivalent ? ' in ' + choosenEquivalent.in : '' }}
                </label>
                <InputNumber class="w-full" v-model="selectedValue.rawValue" id="userinput-rawvalue" :use-grouping="false"
                    :suffix="choosenEquivalent ? ' ' + choosenEquivalent.in : ''" :min-fraction-digits="0"
                    :max-fraction-digits="10" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Der Eingabewert vor dem Umrechnen in CO2-Äquivalente. Wird mit dem Äquivalent verrechnet.
                </InlineMessage>
            </div>
            <!-- helping information -->
            <div class="field" v-if="computedSumCalculation !== ''">
                <label for="userinput-sum">Berechnungsschritte</label>
                <p style="white-space: pre-wrap;">
                    {{ computedSumCalculation }}
                </p>
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Hier werden alle Berechnugnsschritte angezeigt, die zur Berechnung der Menge (Jahr) verwendet werden.
                    Dies können z.B. Umrechnungsfaktoren sein.
                </InlineMessage>
            </div>
            <div class="field">
                <label for="userinput-sum">Menge (berechnet)</label>
                <InputNumber :disabled="true" class="w-full" v-model="computedSumValue" id="userinput-sum"
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
        <Column field="scope" header="Scope"></Column>
        <Column field="name" header="Name"></Column>
        <Column field="rawValue" header="Eingabewert"></Column>
        <Column field="equivalent" header="Äquivalent">
            <template #body="{ data }">
                <div v-if="data.equivalent != null && data.equivalent !== ''">
                    {{ global.equivalentDict[data.equivalent]?.name ?? 'Reference error' }}
                </div>
                <div v-else>
                </div>
            </template>
        </Column>
        <Column field="sumValue" header="Menge (Jahr)">
            <template #body="{ data }">
                {{ data.sumValue }} [to]
            </template>
        </Column>
        <Column field="comment" header="Kommentar"></Column>
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
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import InlineMessage from 'primevue/inlinemessage';
import ChooseComponent from './../components/ChooseComponent.vue';
import { Equivalent, InputEntry } from './../services/types';
import dataprovider from "./../services/dataprovider";
import { Ref, ref, computed, watch, ComputedRef } from 'vue';
import { useRoute } from 'vue-router';
import { useGlobalStore } from './../stores/global';
import { error } from './../services/toast';
import { useConfirm } from 'primevue/useconfirm';
import { getSumForInput, getCalculationSteps } from "./../services/reporting";
import { useRouter } from 'vue-router';
const router = useRouter();

// toolbar
const scope1Active = ref(true);
const scope2Active = ref(true);
const scope3Active = ref(true);

const windowWidth = ref(window.innerWidth);

// get "scope" from route
const route = useRoute();
const setScopeFilter = () => {
    const param = route.params.scope; // "scope1", "scope2", "scope3", "all"
    // is param is not an Array and is one of the valid strings then return only the number
    // else return 1
    const scope = !Array.isArray(param) && ['scope1', 'scope2', 'scope3', 'all'].indexOf(param) > -1 ? param.replace('scope', '') : 'all';
    if (scope === 'all') {
        scope1Active.value = true;
        scope2Active.value = true;
        scope3Active.value = true;
    } else {
        scope1Active.value = scope === '1';
        scope2Active.value = scope === '2';
        scope3Active.value = scope === '3';
    }
}
// on fist loading
setScopeFilter();
// on change
watch(route, () => {
    setScopeFilter();
});

// choose equivalent
const showChooseEquivalent = ref(false);
const choosenEquivalent: ComputedRef<null | Equivalent> = computed(() => {
    try {
        return global.equivalentDict[selectedValue.value.equivalent ?? ""];
    } catch (e) {
        return null;
    }
});

// edit/new
const global = useGlobalStore();
global.refreshEquivalents();

// ensure that a report is selected
if (!global.selectedReport) {
    error('Bitte legen Sie einen zunächst einen Bericht an.');
    router.push({ name: 'reportConfig' })
}

const showDialog = ref(false);
const emptyInput: InputEntry = {
    id: 'new',
    name: '',
    comment: '',
    report: global.selectedReport?.id ?? '',
    scope: 1,
    sumValue: 0,
    rawValue: null as any,
    equivalent: null,
    category: null,
}
const clone = (input: InputEntry) => {
    return JSON.parse(JSON.stringify(input));
}
const selectedValue: Ref<InputEntry> = ref(emptyInput);
const originalValue: Ref<InputEntry> = ref(emptyInput);

const computedSumValue = computed(() => {
    return getSumForInput(selectedValue.value, global.equivalentDict);
});
const computedSumCalculation: ComputedRef<string> = computed(() => {
    if (selectedValue.value.equivalent != null && selectedValue.value.equivalent !== '') {
        return getCalculationSteps(selectedValue.value, global.equivalentDict).join('\n');
    } else {
        return '';
    }
});
const save = async () => {
    try {
        if (selectedValue.value.id === 'new') {
            const toCreate = clone(selectedValue.value);
            delete toCreate.id;
            const created = await dataprovider.createUserInput(toCreate);
            data.value.push(created);
            showDialog.value = false;
            selectedValue.value = clone(emptyInput);
        } else {
            const updated = await dataprovider.updateUserInput(selectedValue.value);
            const index = data.value.findIndex((item) => item.id === updated.id);
            data.value[index] = updated;
            showDialog.value = false;
        }
    } catch (e) {
        error(e + "");
    }
}

const confirm = useConfirm();
const deleteEntry = async (entry: InputEntry, event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Soll der Wert wirklich gelöscht werden?',
        icon: 'fa-solid fa-question',
        accept: async () => {
            try {
                await dataprovider.deleteUserInput(entry.id);
                const index = data.value.findIndex((item) => item.id === entry.id);
                data.value.splice(index, 1);
            } catch (e) {
                error(e + "");
            }
        },
    });
}

// get data
const data: Ref<InputEntry[]> = ref([]);
const getData = async () => {
    const scope: number[] = [];
    if (scope1Active.value) {
        scope.push(1);
    };
    if (scope2Active.value) {
        scope.push(2);
    };
    if (scope3Active.value) {
        scope.push(3);
    };
    data.value = await dataprovider.readUserInputs({
        scope,
    });
}

// initial get data
getData();

// export
const download = async () => {
    // export data as CSV and download
    let csv = 'ID;Name;Kommentar;Projekt;Scope;Menge;Eingabewert;Äquivalent;Gültigkeit\r\n';
    csv += data.value.map((item) => {
        return [
            item.id,
            item.name,
            item.comment,
            item.report,
            item.scope,
            item.sumValue,
            item.rawValue,
            item.equivalent,
            "item.year",// HACK!!!
        ].join(';');
    }).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Eingaben_Export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
}
</script>

<style>
.cst-no-hover>*>*>.p-datatable-tbody>tr:focus {
    outline: none !important;
}
</style>