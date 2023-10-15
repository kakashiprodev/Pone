<template>
    <Dropdown v-if="dropdownValues.length > 0" v-model="selectedDropdownValue" :options="dropdownValues" class="w-full"
        optionLabel="label" optionValue="value" />

    <SmartInput v-if="selectedDropdownValue" :data="selectedDropdownValueChilds" />

    <div v-else v-for="dat in data" :key="dat.id" class="w-full">
        <InputText v-if="dat.type === 'text'" v-model="test[dat.name]" class="w-full" />
        <InputNumber v-if="dat.type === 'number'" v-model="test[dat.name]" class="w-full" />
        <SmartInput v-if="dat.type === 'dropdown' && dat.children && dat.children.length > 0" :data="dat.children" />
    </div>
</template>

<script setup lang="ts">
// import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import { PropType, Ref, ref, computed } from 'vue';
// import Checkbox from 'primevue/checkbox';
import { FlexibleInput } from "./../views/Dashboard.vue";

// define props. input is an array of FlexibleInput objects
const props = defineProps({
    data: {
        type: Array as PropType<FlexibleInput[]>,
        required: true
    }
});

const dropdownValues = (props.data.filter(dat => dat.type === 'option'))
    .map(dat => ({ label: dat.label, value: dat.name }));

const selectedDropdownValue: Ref<null | string> = ref(null);
const selectedDropdownValueChilds = computed(() => {
    const f = props.data.filter((v) => v.name === selectedDropdownValue.value);
    return f.length > 0 ? (f[0].children ?? []) : [];
});

const test: Ref<any> = ref({});
</script>