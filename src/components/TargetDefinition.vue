<template>
    <h2>Klimaziele</h2>
    <h5 class="mt-5">
        Klimaziele für den gewählten Bericht definieren.
    </h5>
    <InlineMessage v-if="global.showTooltips" severity="info" class="w-full mt-2 mb-4">
        Die Definition ist optional.
        Es kann die schrittweise Reduktion der Treibhausgasemissionen in Schritten eingegeben werden.
    </InlineMessage>

    <!-- Button to add a new entry as target -->
    <div class="field grid" v-for="target in global.targetOnSiteForProject" :key="target.id">
        <label :for="target.id" class="col-2 mb-2">Jahr / Prozent</label>
        <div class="col-10 flex">
            <InputNumber :useGrouping="false" :min="1960" :max="2100" :id="target.id" class="mr-2" v-model="target.year" />
            <InputNumber :useGrouping="false" :min="0" :max="100" :id="target.id" v-model="target.percentage" suffix=" %" />
            <!-- icon as delete button -->
            <Button icon="fa-solid fa-save" @click="global.updateTarget(target)" class="ml-1" />
            <Button icon="fa-solid fa-trash" @click="global.dropTarget(target)" class="ml-1" />
        </div>
    </div>
    <Button icon="fa-solid fa-plus"
        @click="global.addTarget({ id: 'new', year: 2050, percentage: 0, report: global.selectedReport?.id ?? '' })"
        label="Neuen Jahresschritt hinzufügen" />
</template>

<script setup lang="ts">
import { useGlobalStore } from './../stores/global';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import InlineMessage from 'primevue/inlinemessage';

const global = useGlobalStore();
</script>