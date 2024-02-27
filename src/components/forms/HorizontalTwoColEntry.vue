<template>
  <div class="field grid">
    <label :for="label" class="col-12 mb-2 md:col-3 md:mb-0">
      {{ label }}
    </label>
    <div class="col-12 md:col-9 flex flex-grow-1">
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
