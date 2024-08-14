<template>
  <div class="mb-4 grid grid-cols-12">
    <label :for="label" class="col-span-12 mb-2 md:col-span-3 md:mb-0">
      <h4>{{ label }}</h4>
    </label>
    <div class="col-span-12 md:col-span-9"></div>
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
