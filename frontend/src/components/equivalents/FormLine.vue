<template>
  <div class="grid grid-cols-12 mt-1">
    <label
      :for="label"
      class="col-span-full mb-2 md:col-span-2 md:mb-0 flex items-center"
    >
      {{ label }}
    </label>
    <div class="col-span-full md:col-span-10">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true,
  },
});
</script>
