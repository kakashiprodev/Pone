<template>
  <template v-if="innerModelValue">
    <div class="grid mt-1 mb-4">
      <div class="flex content-center">
        <label for="monthly-inputs">
          {{ $t('inputs.monthlyInputNecessary') }}?
        </label>
        <Checkbox
          id="monthly-inputs"
          v-model="innerModelValue[k.monthlyValues[labelIndex]]"
          :binary="true"
          class="ml-3"
        />
      </div>
    </div>
    <div v-if="innerModelValue[k.monthlyValues[labelIndex]]">
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
            :invalid="!innerModelValue[k.jan[labelIndex]]"
            :use-grouping="false"
            v-model="innerModelValue[k.jan[labelIndex]]"
            :min-fraction-digits="0"
            :max-fraction-digits="10"
            class="w-full"
            :suffix="inputUnit"
          />
        </div>
        <div class="small-width-ctm">
          <InputNumber
            :invalid="!innerModelValue[k.feb[labelIndex]]"
            :use-grouping="false"
            v-model="innerModelValue[k.feb[labelIndex]]"
            :min-fraction-digits="0"
            :max-fraction-digits="10"
            class="w-full"
            :suffix="inputUnit"
          />
        </div>
        <div class="small-width-ctm">
          <InputNumber
            :invalid="!innerModelValue[k.mar[labelIndex]]"
            :use-grouping="false"
            v-model="innerModelValue[k.mar[labelIndex]]"
            :min-fraction-digits="0"
            :max-fraction-digits="10"
            class="w-full"
            :suffix="inputUnit"
          />
        </div>
        <div class="small-width-ctm">
          <InputNumber
            :invalid="!innerModelValue[k.apr[labelIndex]]"
            :use-grouping="false"
            v-model="innerModelValue[k.apr[labelIndex]]"
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
            :invalid="!innerModelValue[k.may[labelIndex]]"
            :use-grouping="false"
            v-model="innerModelValue[k.may[labelIndex]]"
            :min-fraction-digits="0"
            :max-fraction-digits="10"
            class="w-full"
            :suffix="inputUnit"
          />
        </div>
        <div class="small-width-ctm">
          <InputNumber
            :invalid="!innerModelValue[k.jun[labelIndex]]"
            :use-grouping="false"
            v-model="innerModelValue[k.jun[labelIndex]]"
            :min-fraction-digits="0"
            :max-fraction-digits="10"
            class="w-full"
            :suffix="inputUnit"
          />
        </div>
        <div class="small-width-ctm">
          <InputNumber
            :invalid="!innerModelValue[k.jul[labelIndex]]"
            :use-grouping="false"
            v-model="innerModelValue[k.jul[labelIndex]]"
            :min-fraction-digits="0"
            :max-fraction-digits="10"
            class="w-full"
            :suffix="inputUnit"
          />
        </div>
        <div class="small-width-ctm">
          <InputNumber
            :invalid="!innerModelValue[k.aug[labelIndex]]"
            :use-grouping="false"
            v-model="innerModelValue[k.aug[labelIndex]]"
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
            :invalid="!innerModelValue[k.sep[labelIndex]]"
            :use-grouping="false"
            v-model="innerModelValue[k.sep[labelIndex]]"
            :min-fraction-digits="0"
            :max-fraction-digits="10"
            class="w-full"
            :suffix="inputUnit"
          />
        </div>
        <div class="small-width-ctm">
          <InputNumber
            :invalid="!innerModelValue[k.oct[labelIndex]]"
            :use-grouping="false"
            v-model="innerModelValue[k.oct[labelIndex]]"
            :min-fraction-digits="0"
            :max-fraction-digits="10"
            class="w-full"
            :suffix="inputUnit"
          />
        </div>
        <div class="small-width-ctm">
          <InputNumber
            :invalid="!innerModelValue[k.nov[labelIndex]]"
            :use-grouping="false"
            v-model="innerModelValue[k.nov[labelIndex]]"
            :min-fraction-digits="0"
            :max-fraction-digits="10"
            class="w-full"
            :suffix="inputUnit"
          />
        </div>
        <div class="small-width-ctm">
          <InputNumber
            :invalid="!innerModelValue[k.dec[labelIndex]]"
            :use-grouping="false"
            v-model="innerModelValue[k.dec[labelIndex]]"
            :min-fraction-digits="0"
            :max-fraction-digits="10"
            class="w-full"
            :suffix="inputUnit"
          />
        </div>
      </div>
      <div class="mt-4 flex flex-col gap-2">
        <label for="userinput-rawvalue">
          {{ valueInput ? 'Summe' : 'Mittelwert' }}
          {{ inputUnit !== '' ? ' in ' + inputUnit : '' }}
        </label>
        <InputNumber
          class="w-full"
          :disabled="true"
          v-model="innerModelValue[k.avgValue[labelIndex]]"
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
          :invalid="!innerModelValue[k.avgValue[labelIndex]]"
          class="w-full"
          v-model="innerModelValue[k.avgValue[labelIndex]]"
          id="userinput-rawvalue"
          :use-grouping="false"
          :suffix="inputUnit"
          :min-fraction-digits="0"
          :max-fraction-digits="10"
        />
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { EquivalentEntry, InputEntry } from '../../services/types';
import { defineProps, PropType, defineEmits, ref, Ref, watch } from 'vue';

const props = defineProps({
  inputUnit: {
    type: String as PropType<string>,
    required: true,
  },
  valueInput: {
    type: Object as PropType<InputEntry>,
    required: false,
  },
  valueEquivalent: {
    type: Object as PropType<EquivalentEntry>,
    required: false,
  },
});
const emits = defineEmits(['update:valueInput', 'update:valueEquivalent']);

interface InputEntryWithIndex extends InputEntry {
  [key: string]: any;
}
interface EquivalentEntryWithIndex extends EquivalentEntry {
  [key: string]: any;
}

/**
 * an inner model depending on which input is set
 */
const innerModelValue: Ref<
  undefined | EquivalentEntryWithIndex | InputEntryWithIndex
> = ref(props.valueInput ?? props.valueEquivalent);

watch(
  () => innerModelValue,
  (v) => {
    const newValue = v.value;
    if (!newValue) return;
    if (props.valueEquivalent) {
      // also calculate the average of all monthly values if necessary
      if (newValue.monthlyValues) {
        let sum = 0;
        sum += newValue.jan ?? 0;
        sum += newValue.feb ?? 0;
        sum += newValue.mar ?? 0;
        sum += newValue.apr ?? 0;
        sum += newValue.may ?? 0;
        sum += newValue.jun ?? 0;
        sum += newValue.jul ?? 0;
        sum += newValue.aug ?? 0;
        sum += newValue.sep ?? 0;
        sum += newValue.oct ?? 0;
        sum += newValue.nov ?? 0;
        sum += newValue.dec ?? 0;
        newValue.avgValue = sum / 12;
      }
      emits('update:valueEquivalent', newValue);
    } else {
      // also calculate the sum of all monthly values if necessary
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
      emits('update:valueInput', newValue);
    }
  },
  { deep: true },
);

/**
 * 1 = InputEntry
 * 0 = EquivalentEntry
 */
const k: {
  [key: string]: [string, string];
} = {
  jan: ['jan', 'rawValueJan'],
  feb: ['feb', 'rawValueFeb'],
  mar: ['mar', 'rawValueMar'],
  apr: ['apr', 'rawValueApr'],
  may: ['may', 'rawValueMay'],
  jun: ['jun', 'rawValueJun'],
  jul: ['jul', 'rawValueJul'],
  aug: ['aug', 'rawValueAug'],
  sep: ['sep', 'rawValueSep'],
  oct: ['oct', 'rawValueOct'],
  nov: ['nov', 'rawValueNov'],
  dec: ['dec', 'rawValueDec'],
  monthlyValues: ['monthlyValues', 'monthlyValues'],
  avgValue: ['avgValue', 'rawValue'],
};

let labelIndex: 0 | 1 = 1;
if (props.valueEquivalent) {
  labelIndex = 0;
}
</script>
