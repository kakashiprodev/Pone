<template>
  <div class="grid mt-1 mb-4">
    <div class="flex content-center">
      <label for="monthly-inputs">
        {{ $t('inputs.monthlyInputNecessary') }}?
      </label>
      <Checkbox
        id="monthly-inputs"
        v-model="innerModelValue.monthlyValues"
        :binary="true"
        class="ml-3"
      />
    </div>
  </div>
  <div v-if="innerModelValue.monthlyValues">
    <div class="grid grid-cols-4 mt-1">
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ $t('equivalents.month.1') }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ $t('equivalents.month.2') }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ $t('equivalents.month.3') }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ $t('equivalents.month.4') }}
      </div>
    </div>
    <div class="grid grid-cols-4 mt-1">
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueJan"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueFeb"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueMar"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueApr"
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
        {{ $t('equivalents.month.5') }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ $t('equivalents.month.6') }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ $t('equivalents.month.7') }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ $t('equivalents.month.8') }}
      </div>
    </div>
    <div class="grid grid-cols-4 mt-1">
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueMay"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueJun"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueJul"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueAug"
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
        {{ $t('equivalents.month.9') }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ $t('equivalents.month.10') }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ $t('equivalents.month.11') }}
      </div>
      <div
        class="items-center justify-center bg-teal-100 font-bold text-gray-900 rounded-sm text-center"
      >
        {{ $t('equivalents.month.12') }}
      </div>
    </div>
    <div class="grid grid-cols-4 mt-1">
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueSep"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueOct"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueNov"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
          :suffix="inputUnit"
        />
      </div>
      <div class="small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueDec"
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
        v-model="innerModelValue.rawValue"
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
        v-model="innerModelValue.rawValue"
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
    if (newValue.monthlyValues) {
      let sum = 0;
      sum += newValue.rawValueJan ?? 0;
      sum += newValue.rawValueFeb ?? 0;
      sum += newValue.rawValueMar ?? 0;
      sum += newValue.rawValueApr ?? 0;
      sum += newValue.rawValueMay ?? 0;
      sum += newValue.rawValueJun ?? 0;
      sum += newValue.rawValueJul ?? 0;
      sum += newValue.rawValueAug ?? 0;
      sum += newValue.rawValueSep ?? 0;
      sum += newValue.rawValueOct ?? 0;
      sum += newValue.rawValueNov ?? 0;
      sum += newValue.rawValueDec ?? 0;
      newValue.rawValue = sum;
    }
    emits('update:modelValue', newValue);
  },
  { deep: true },
);
</script>
