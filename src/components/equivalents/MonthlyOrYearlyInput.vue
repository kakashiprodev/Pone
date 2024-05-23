<template>
  <div class="grid mt-1 mb-4">
    <div class="flex content-center">
      <label for="monthly-inputs"> Monatliche Eingaben nötig? </label>
      <Checkbox
        id="monthly-inputs"
        v-model="innerModelValue.monthly_values"
        :binary="true"
        class="ml-3"
      />
    </div>
  </div>
  <div v-if="innerModelValue.monthly_values">
    <div class="grid grid-cols-4 mt-1">
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ 'Jan' }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ 'Feb' }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ 'Mar' }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ 'Apr' }}
      </div>
    </div>
    <div class="grid grid-cols-4 mt-1">
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.raw_value_jan"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.raw_value_feb"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.raw_value_mar"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.raw_value_apr"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
    </div>
    <div class="grid grid-cols-4 mt-1">
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ 'Mai' }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ 'Jun' }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ 'Jul' }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ 'Aug' }}
      </div>
    </div>
    <div class="grid grid-cols-4 mt-1">
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.raw_value_may"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.raw_value_jun"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.raw_value_jul"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.raw_value_aug"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
    </div>
    <div class="grid grid-cols-4 mt-1">
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ 'Sep' }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ 'Okt' }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ 'Nov' }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ 'Dez' }}
      </div>
    </div>
    <div class="grid grid-cols-4 mt-1">
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.raw_value_sep"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.raw_value_oct"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.raw_value_nov"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.raw_value_dec"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
    </div>
    <div class="mt-4 flex flex-col gap-2">
      <label for="userinput-rawvalue">
        Summe {{ inputUnit !== '' ? ' in ' + inputUnit : '' }}
      </label>
      <InputNumber
        class="w-full"
        :disabled="true"
        v-model="innerModelValue.raw_value"
        id="userinput-rawvalue"
        :use-grouping="false"
        :suffix="inputUnit"
        :min-fraction-digits="0"
        :max-fraction-digits="10"
      />
    </div>
  </div>
  <div v-else>
    <div class="flex flex-col gap-2">
      <label for="userinput-rawvalue">
        Eingabewert {{ inputUnit !== '' ? ' in ' + inputUnit : '' }}
      </label>
      <InputNumber
        class="w-full"
        v-model="innerModelValue.raw_value"
        id="userinput-rawvalue"
        :use-grouping="false"
        :suffix="inputUnit"
        :min-fraction-digits="0"
        :max-fraction-digits="10"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { InputEntry } from '../../services/types';
import { defineProps, PropType, ref, defineEmits, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object as PropType<InputEntry>,
    required: true,
  },
  inputUnit: {
    type: String as PropType<string>,
    required: true,
  },
});
const innerModelValue = ref<InputEntry>(props.modelValue);
const emits = defineEmits(['update:modelValue']);

watch(
  () => innerModelValue.value,
  (newValue: InputEntry) => {
    // update rawValue if monthlyValues is true. Then calculate the sum of all monthly values
    if (newValue.monthly_values) {
      let sum = 0;
      sum += newValue.raw_value_jan ?? 0;
      sum += newValue.raw_value_feb ?? 0;
      sum += newValue.raw_value_mar ?? 0;
      sum += newValue.raw_value_apr ?? 0;
      sum += newValue.raw_value_may ?? 0;
      sum += newValue.raw_value_jun ?? 0;
      sum += newValue.raw_value_jul ?? 0;
      sum += newValue.raw_value_aug ?? 0;
      sum += newValue.raw_value_sep ?? 0;
      sum += newValue.raw_value_oct ?? 0;
      sum += newValue.raw_value_nov ?? 0;
      sum += newValue.raw_value_dec ?? 0;
      newValue.raw_value = sum;
    }
    emits('update:modelValue', newValue);
  },
  { deep: true },
);
</script>
