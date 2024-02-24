<template>
  <div class="field grid">
    <div class="col flex justify-content-center">
      <ToggleButton
        v-model="selection['1']"
        on-label="Scope 1"
        off-label="Scope 1"
        onIcon="fa-solid fa-check"
        @change="update(1)"
      />
    </div>
    <div class="col flex justify-content-center">
      <ToggleButton
        v-model="selection['2']"
        on-label="Scope 2"
        off-label="Scope 2"
        onIcon="fa-solid fa-check"
        @change="update(2)"
      />
    </div>
    <div class="col flex justify-content-center">
      <ToggleButton
        v-model="selection['3']"
        on-label="Scope 3"
        off-label="Scope 3"
        onIcon="fa-solid fa-check"
        @change="update(3)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, Ref } from 'vue';


const selection: Ref<{
  [key: string]: boolean;
}> = ref({
  '1': false,
  '2': false,
  '3': false,
});

// v-model
const props = defineProps({
  // model value can be null/undefined
  modelValue: {
    type: Array as PropType<number[] | null | undefined>,
    required: true,
  },
  singleSelection: {
    type: Boolean,
    default: true,
  },
});
const emits = defineEmits(['update:modelValue']);

if (props.modelValue != null) {
  if (props.singleSelection) {
    selection.value[props.modelValue[0].toString()] = true;
  } else {
    for (const i of props.modelValue) {
      const key = i.toString();
      if (key in selection.value) selection.value[key] = true;
    }
  }
}

// manual update
const update = (scope: 1 | 2 | 3) => {
  if (props.singleSelection) {
    // clear all but scope
    for (const key in selection.value) {
      if (key !== scope.toString()) selection.value[key] = false;
    }
  }
  // else this will be done by v-model automatically
  emits(
    'update:modelValue',
    Object.keys(selection.value)
      .filter((key) => selection.value[key])
      .map((key) => parseInt(key)),
  );
};
</script>
