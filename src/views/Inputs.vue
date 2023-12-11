<template>
    <h4>Übersicht aller Eingaben</h4>

    <ScopeInfoBox class="mt-1 mb-1" v-if="preSelectedScope != 'all'" :scope="preSelectedScope" />

    <InlineMessage severity="info" v-if="global.showTooltips" class="w-full mb-2">
        Hier können Sie alle Eingaben für den aktuellen Bericht einsehen und bearbeiten.
        Die Eingaben können außerdem als CSV-Datei exportiert werden.
    </InlineMessage>

    <Toolbar class="mb-2">
        <template #start>
            <template v-if="preSelectedScope === 'all'">
                <label class="ml-2">Zeige Scopes:</label>
                <Checkbox id="scope1Active" v-model="scope1Active" value="1" class="ml-3" :binary="true"
                    @change="getData" />
                <label class="ml-1" for="scope1Active">1</label>
                <Checkbox id="scope2Active" v-model="scope2Active" value="1" class="ml-4" :binary="true"
                    @change="getData" />
                <label class="ml-1" for="scope2Active">2</label>
                <Checkbox id="scope3Active" v-model="scope3Active" value="1" class="ml-4" :binary="true"
                    @change="getData" />
                <label class="ml-1" for="scope3Active">3</label>
            </template>
        </template>
        <template #end>
            <Button icon="fa-solid fa-wand-magic-sparkles"
                @click="selectedValue = clone(emptyInput); showComfortInput = true" class="mr-1" />
            <Button icon="fa-solid fa-plus" @click="selectedValue = clone(emptyInput); showDialog = true" class="mr-1" />
            <Button icon="fa-solid fa-download" @click="download()" />
        </template>
    </Toolbar>

    <!-- choose equivalent modal for non-comfort input -->
    <Dialog id="choose-equivalent" v-model:visible="showChooseEquivalent" modal header="Äquivalent auswählen"
        :class="{ 'w-8': windowWidth > 990, 'w-full': windowWidth < 990, 'h-screen': windowWidth < 990 }">
        <SmartEquivalentList v-model="selectedValue.equivalent" :filter-by="{
            scope: selectedValue.scope ? [selectedValue.scope] : [1, 2, 3],
        }" :hide-scope-input="preSelectedScope != 'all'" />
        <div class="mt-4">
            <Button label="Ok" @click="showChooseEquivalent = false; updateNameAndCategory();" />
            <Button class="ml-1" label="Auswahl leeren"
                @click="selectedValue.equivalent = null; showChooseEquivalent = false;" />
            <Button class="ml-1" label="Abbrechen" @click="selectedValue = originalValue; showChooseEquivalent = false;" />
        </div>
    </Dialog>

    <!-- comfort input -->
    <Dialog modal header="Konforteingabe" id="create-input-comfort" v-model:visible="showComfortInput"
        :class="{ 'w-9': true }" maximizable>

        <!-- step 1 -->
        <div class="card" v-if="actualComfortStep === 0">
            <SmartEquivalentList v-model="selectedValue.equivalent" :comfort-mode="true" :rowsPerPage="5"
                :visible-columns="['source', 'in', 'fullName',]" :showColumnChooser="false" @change="updateNameAndCategory"
                :hide-scope-input="preSelectedScope != 'all'"
                :filter-by="{ scope: preSelectedScope === 'all' ? [1] : [parseInt(preSelectedScope)] }" />
        </div>

        <!-- step 2 -->
        <div class="card" v-if="actualComfortStep === 1">
            <div class="field">
                <label for="userinput-category">Kategorie</label>
                <InputText class="w-full" v-model="selectedValue.category" id="userinput-category" />
            </div>
            <div class="field">
                <label for="userinput-name">Name</label>
                <InputText class="w-full" v-model="selectedValue.name" id="userinput-name" />
            </div>
            <div class="field">
                <label for="userinput-comment">Kommentar</label>
                <InputText class="w-full" v-model="selectedValue.comment" id="userinput-comment" />
            </div>
        </div>

        <!-- step 3 -->
        <div class="card" v-if="actualComfortStep === 2">
            <div class="field">
                <label for="userinput-rawvalue">
                    Eingabewert {{ choosenEquivalent ? ' in ' + choosenEquivalent.in : '' }}
                </label>
                <InputNumber class="w-full" v-model="selectedValue.rawValue" id="userinput-rawvalue" :use-grouping="false"
                    :suffix="choosenEquivalent ? ' ' + choosenEquivalent.in : ''" :min-fraction-digits="0"
                    :max-fraction-digits="10" />
            </div>
            <!-- helping information -->
            <div class="field" v-if="computedSumCalculation !== ''">
                <label for="userinput-sum">Berechnungsschritte</label>
                <p style="white-space: pre-wrap;">
                    {{ computedSumCalculation }}
                </p>
            </div>
            <div class="field">
                <label for="userinput-sum">Menge (berechnet)</label>
                <InputNumber :disabled="true" class="w-full" v-model="computedSumValue" id="userinput-sum"
                    :use-grouping="true" :min-fraction-digits="0" :max-fraction-digits="10" :suffix="' kg'" />
            </div>
        </div>

        <!-- Step Buttons -->
        <div class="flex align-items-center justify-content-center">
            <Button :label="'Zurück'" @click="decStep" class="flex-grow-1 mr-1" :disabled="actualComfortStep === 0" />
            <Button v-if="actualComfortStep < 2" :label="'Weiter'" @click="incStep" class="flex-grow-1 ml-1"
                :disabled="(actualComfortStep === 0 && selectedValue.equivalent == null)" />
            <Button v-else :label="'Anlegen'" @click="save" class="flex-grow-1 ml-1"
                :disabled="selectedValue.rawValue == null" />
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
                <label for="userinput-equivalent">Äquivalent</label>
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
            <div class="field">
                <label for="userinput-category">Kategorie</label>
                <InputText class="w-full" v-model="selectedValue.category" id="userinput-category" />
                <InlineMessage v-if="global.showTooltips" class="w-full mt-1" severity="info">
                    Die Angabe einer Kategorie dient der späteren Auswertung und besseren Sortierbarkeit.
                    Es können beliebige Kategorien angelegt werden.
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
        <Column field="scope" header="Scope" sortable></Column>
        <Column field="category" header="Kategorie" sortable></Column>
        <Column field="name" header="Name" sortable></Column>
        <Column field="rawValue" header="Eingabewert" sortable></Column>
        <Column field="equivalent" header="Äquivalent" sortable>
            <template #body="{ data }">
                <div v-if="data.equivalent != null && data.equivalent !== ''">
                    {{ global.equivalentDict[data.equivalent]?.specification1 ?? 'Reference error' }}
                </div>
                <div v-else>
                </div>
            </template>
        </Column>
        <Column field="sumValue" header="Menge (Jahr)" sortable>
            <template #body="{ data }">
                {{ round(data.sumValue, 2) }} [kg]
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
import SmartEquivalentList from './../components/SmartEquivalentList.vue';
import ScopeInfoBox from './../components/ScopeInfoBox.vue';
import { EquivalentEntry, InputEntry } from './../services/types';
import dataprovider from "./../services/dataprovider";
import { Ref, ref, computed, watch, ComputedRef } from 'vue';
import { useRoute } from 'vue-router';
import { useGlobalStore } from './../stores/global';
import { error } from './../services/toast';
import { useConfirm } from 'primevue/useconfirm';
import { getSumForInput, getCalculationSteps } from "./../services/reporting";
import { useRouter } from 'vue-router';
import { parse, string, object, number, minLength, maxLength, minValue, maxValue, nullable } from "valibot";
import { round } from "./../pipes";

const router = useRouter();

// input validation
const inputEntrySchema = object({
    id: string('Die ID scheint korrupt zu sein.'),
    name: string([minLength(1, 'Name zu kurz'), maxLength(255, 'Name zu lang')]),
    scope: number([minValue(1, 'Scope muss zwischen 1 und 3 liegen'), maxValue(3, 'Scope muss zwischen 1 und 3 liegen')]),
    comment: string([maxLength(255, 'Kommentar zu lang')]),
    rawValue: number('Ein Wert muss angegeben werden.'),
    equivalent: nullable(string([maxLength(255, 'Referenz auf equivalents zu lang')])),
    report: string([minLength(1, 'Referenz auf Report ist inkorrekt'), maxLength(255, 'Referenz auf Report ist inkorrekt')]),
    category: nullable(string([maxLength(255, 'Kategorie zu lang')]))
});

// toolbar
const scope1Active = ref(true);
const scope2Active = ref(true);
const scope3Active = ref(true);

const windowWidth = ref(window.innerWidth);

// comfort input
const showComfortInput = ref(false);
const actualComfortStep = ref(0);
const incStep = () => {
    actualComfortStep.value++;
}
const decStep = () => {
    actualComfortStep.value--;
}

watch(() => showComfortInput.value, () => {
    if (!showComfortInput.value) {
        // reset all on close
        console.log('reset comfort input');
        actualComfortStep.value = 0;
    }
})

// get "scope" from route
const route = useRoute();
const preSelectedScope = ref('all');
const setScopeFilter = () => {
    console.log(route.params);
    const param = route.params.scope; // "1", "2", "3", "all"
    // is param is not an Array and is one of the valid strings then return only the number
    // else return 1
    preSelectedScope.value = !Array.isArray(param) && ['1', '2', '3', 'all'].indexOf(param) > -1 ? param : 'all';
    if (preSelectedScope.value === 'all') {
        scope1Active.value = true;
        scope2Active.value = true;
        scope3Active.value = true;
    } else {
        scope1Active.value = preSelectedScope.value === '1';
        scope2Active.value = preSelectedScope.value === '2';
        scope3Active.value = preSelectedScope.value === '3';
    }
}

const data: Ref<InputEntry[]> = ref([]);

// on fist loading
setScopeFilter();
// on change
watch(route, () => {
    console.log('route changed');
    setScopeFilter();
    data.value = [];
    getData();
});

// choose equivalent
const showChooseEquivalent = ref(false);
const choosenEquivalent: ComputedRef<null | EquivalentEntry> = computed(() => {
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
if (!global.selectedReport && global.isLoggedIn) {
    error('Bitte legen Sie einen zunächst einen Bericht an.');
    router.push({ name: 'reportConfig' })
} else if (!global.isLoggedIn) {
    console.log('not logged in. skip report check');
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
    facility: null,
}
const clone = (input: InputEntry) => {
    const c = JSON.parse(JSON.stringify(input));
    if (preSelectedScope.value === '1') c.scope = 1;
    else if (preSelectedScope.value === '2') c.scope = 2;
    else if (preSelectedScope.value === '3') c.scope = 3;
    return c;
}
const selectedValue: Ref<InputEntry> = ref(emptyInput);
const originalValue: Ref<InputEntry> = ref(emptyInput);

// watch selectedValue.equivalent in comfort mode to change the name and comment
const updateNameAndCategory = () => {
    if (selectedValue.value.equivalent != null && selectedValue.value.equivalent !== '') {
        const equivalent = global.equivalentDict[selectedValue.value.equivalent];
        selectedValue.value.name = equivalent.specification1;
        selectedValue.value.comment = equivalent.comment ?? "";
        selectedValue.value.category = equivalent.category;
    }
}

const computedSumValue = computed(() => {
    return getSumForInput(selectedValue.value, global.equivalentDict);
});
const computedSumCalculation: ComputedRef<string> = computed(() => {
    if (selectedValue.value.equivalent != null && selectedValue.value.equivalent !== '' && selectedValue.value.rawValue != null && selectedValue.value.rawValue > 0) {
        return getCalculationSteps(selectedValue.value, global.equivalentDict).join('\n');
    } else {
        return '';
    }
});
const save = async () => {
    try {
        // validate
        parse(inputEntrySchema, selectedValue.value);

        if (selectedValue.value.id === 'new') {
            const toCreate = clone(selectedValue.value);
            delete toCreate.id;
            const created = await dataprovider.createUserInput(toCreate);
            data.value.push(created);

            showDialog.value = false;
            showComfortInput.value = false;

            selectedValue.value = clone(emptyInput);
        } else {
            const updated = await dataprovider.updateUserInput(selectedValue.value);
            const index = data.value.findIndex((item) => item.id === updated.id);
            data.value[index] = updated;

            showDialog.value = false;
            showComfortInput.value = false;
        }
    } catch (e) {
        error((e + "").replace("ValiError: ", ""));
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