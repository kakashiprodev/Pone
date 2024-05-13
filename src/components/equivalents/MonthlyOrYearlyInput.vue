<template>
  <div class="grid mt-1">
    <div class="field flex align-content-center">
      <label for="monthly-inputs"> Monatliche Eingaben nötig? </label>
      <Checkbox
        id="monthly-inputs"
        v-model="innerModelValue.monthlyValues"
        :binary="true"
        class="ml-3"
      />
    </div>
  </div>
  <div v-if="innerModelValue.monthlyValues">
    <div class="grid mt-1">
      <div
        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
      >
        {{ 'Jan' }}
      </div>
      <div
        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
      >
        {{ 'Feb' }}
      </div>
      <div
        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
      >
        {{ 'Mar' }}
      </div>
      <div
        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
      >
        {{ 'Apr' }}
      </div>
    </div>
    <div class="grid mt-1">
      <div class="col-3 small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueJan"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
        />
      </div>
      <div class="col-3 small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueFeb"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
        />
      </div>
      <div class="col-3 small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueMar"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
        />
      </div>
      <div class="col-3 small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueApr"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
        />
      </div>
    </div>
    <div class="grid mt-1">
      <div
        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
      >
        {{ 'Mai' }}
      </div>
      <div
        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
      >
        {{ 'Jun' }}
      </div>
      <div
        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
      >
        {{ 'Jul' }}
      </div>
      <div
        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
      >
        {{ 'Aug' }}
      </div>
    </div>
    <div class="grid mt-1">
      <div class="col-3 small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueMay"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
        />
      </div>
      <div class="col-3 small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueJun"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
        />
      </div>
      <div class="col-3 small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueJul"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
        />
      </div>
      <div class="col-3 small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueAug"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
        />
      </div>
    </div>
    <div class="grid mt-1">
      <div
        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
      >
        {{ 'Sep' }}
      </div>
      <div
        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
      >
        {{ 'Okt' }}
      </div>
      <div
        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
      >
        {{ 'Nov' }}
      </div>
      <div
        class="col-3 align-items-center justify-content-center bg-teal-100 font-bold text-gray-900 border-round text-center"
      >
        {{ 'Dez' }}
      </div>
    </div>
    <div class="grid mt-1">
      <div class="col-3 small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueSep"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
        />
      </div>
      <div class="col-3 small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueOct"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
        />
      </div>
      <div class="col-3 small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueNov"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
        />
      </div>
      <div class="col-3 small-width-ctm">
        <InputNumber
          :use-grouping="false"
          v-model="innerModelValue.rawValueDec"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
          class="w-full"
        />
      </div>
    </div>
  </div>
  <div v-else>
    <div class="field">
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
