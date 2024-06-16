<template>
  <div class="flex flex-col gap-4">
    <div
      v-for="(entry, index) in definition"
      :key="index"
      class="flex flex-col gap-2"
    >
      <label :for="`field-${entry.key}`" class="w-full">
        {{ entry.label }}
      </label>

      <InlineMessage
        severity="info"
        v-if="global.showTooltips"
        class="w-full mb-2"
      >
        {{ entry.tooltip ? entry.tooltip : '' }}
      </InlineMessage>

      <template v-if="entry.type === 'text' || entry.type === 'password'">
        <InputText
          v-model="model[entry.key]"
          :id="`field-${entry.key}`"
          class="w-full"
          :type="entry.type"
          v-tooltip.bottom="{
            value: !validated[entry.key].valid
              ? validated[entry.key].message
              : entry.label,
            showDelay: 1000,
            hideDelay: 300,
          }"
          :invalid="!validated[entry.key].valid"
        />
      </template>

      <template v-if="entry.type === 'number'">
        <InputNumber
          v-model="model[entry.key]"
          :id="`field-${entry.key}`"
          :invalid="!validated[entry.key].valid"
          :suffix="entry.settings?.suffix ?? ''"
          :use-grouping="entry.settings?.thousandSeparator ?? true"
          :min="entry.settings?.min ?? undefined"
          :max="entry.settings?.max ?? undefined"
          pt:root:class="border-red-600"
          v-tooltip.bottom="{
            value: !validated[entry.key].valid
              ? validated[entry.key].message
              : entry.label,
            showDelay: 1000,
            hideDelay: 300,
          }"
        />
      </template>

      <template
        v-if="
          entry.type === 'date' ||
          entry.type === 'time' ||
          entry.type === 'datetime'
        "
      >
        <Calendar
          v-model="model[entry.key]"
          :id="`field-${entry.key}`"
          class="w-full"
          :class="!validated[entry.key].valid ? 'invalid' : ''"
          :showTime="entry.type === 'datetime' || entry.type === 'time'"
          :hourFormat="
            entry.type === 'datetime' || entry.type === 'time'
              ? '24'
              : undefined
          "
          v-tooltip.bottom="{
            value: !validated[entry.key].valid
              ? validated[entry.key].message
              : entry.label,
            showDelay: 1000,
            hideDelay: 300,
          }"
          :invalid="!validated[entry.key].valid"
        />
      </template>

      <template v-if="entry.type === 'textarea'">
        <Editor
          v-model="model[entry.key]"
          :id="`field-${entry.key}`"
          editorStyle="height: 160px; width: 100%;"
          v-tooltip.bottom="{
            value: !validated[entry.key].valid
              ? validated[entry.key].message
              : entry.label,
            showDelay: 1000,
            hideDelay: 300,
          }"
          :invalid="!validated[entry.key].valid"
        />
      </template>

      <template v-if="entry.type === 'select'">
        <Dropdown
          v-model="model[entry.key]"
          :id="`field-${entry.key}`"
          class="w-full"
          :options="entry.options"
          :optionLabel="entry.optionsLabel"
          :optionValue="entry.optionsKey"
          :invalid="!validated[entry.key].valid"
        />
      </template>

      <template v-if="entry.type === 'checkbox'">
        <Checkbox
          v-model="model[entry.key]"
          :id="`field-${entry.key}`"
          :binary="true"
          :invalid="!validated[entry.key].valid"
        />
      </template>

      <template v-if="entry.type === 'radio'">
        <div>
          <div
            v-for="option in entry.options"
            :key="option[entry.optionsKey ?? 'value']"
            class="field-radiobutton"
          >
            <RadioButton
              v-model="model[entry.key]"
              :inputId="`field-${entry.key}-${
                option[entry.optionsKey ?? 'value']
              }`"
              :value="option[entry.optionsKey ?? 'value']"
            />
            <label
              :for="`field-${entry.key}-${option[entry.optionsKey ?? 'label']}`"
              >{{ option[entry.optionsLabel ?? 'label'] }}</label
            >
          </div>
        </div>
      </template>

      <template v-if="entry.type === 'slider'">
        <Slider
          v-model="model[entry.key]"
          :id="`field-${entry.key}`"
          class="w-full mb-3"
          :step="5"
          :invalid="!validated[entry.key].valid"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGlobalStore } from '@/stores/global';
import { GenericFormEntry } from '@/services/types/form';
import * as v from 'valibot';

const global = useGlobalStore();

// interface GenericFormEntry {
//   label: string;
//   key: string;
//   type:
//     | 'text'
//     | 'number'
//     | 'date'
//     | 'time'
//     | 'datetime'
//     | 'textarea'
//     | 'select'
//     | 'checkbox'
//     | 'radio'
//     | 'password'
//     | 'slider';
//   options?: any[];
//   optionsKey?: string;
//   optionsLabel?: string;
//   required?: boolean;
//   tooltip?: string;
// }

const props = defineProps<{
  definition: GenericFormEntry[];
  modelValue: { [key: string]: any };
}>();

/**
 * valibot validation
 */
const check = (
  entry: GenericFormEntry,
  value: any,
): { valid: boolean; message: string } => {
  if (!entry.validation) return { valid: true, message: '' };
  try {
    const singleObject = { [entry.key]: value };
    v.parse(entry.validation, singleObject);
    return { valid: true, message: '' };
  } catch (err) {
    return { valid: false, message: (err + '')?.replace('ValiError: ', '') };
  }
};

/**
 * a state for each key in props.modelValue
 */
const validated = computed(() => {
  const result: { [key: string]: { valid: boolean; message: string } } = {};
  for (const entry of props.definition) {
    result[entry.key] = check(entry, props.modelValue[entry.key]);
  }
  return result;
});

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});
</script>

<style>
.p-editor-container[invalid='true'] {
  border: 1px solid #f87171;
  border-radius: 5px;
}
</style>
