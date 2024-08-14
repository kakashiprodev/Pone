<template>
  <div class="mb-4 grid grid-cols-12">
    <label :for="label" class="col-span-12 mb-2 md:col-span-3 md:mb-0">
      {{ label }}
    </label>
    <div class="col-span-12 md:col-span-9 flex grow">
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
