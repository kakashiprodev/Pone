<template>
  <div class="progress-bar-container">
    <div class="progress-bar" :style="progressStyle">
      <slot></slot>
    </div>
    <div v-if="targetValue" class="target-marker" :style="targetStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Props
const props = defineProps({
  color: String,
  value: Number,
  targetValue: Number,
});

// Berechnete Eigenschaft für den Stil des Fortschrittsbalkens
const progressStyle = computed(() => ({
  width: `${props.value}%`,
  backgroundColor: props.color,
}));

// Berechnete Eigenschaft für den Stil des Ziel-Indikators
const targetStyle = computed(() => ({
  left: `${props.targetValue ?? -1}%`,
}));
</script>

<style>
.progress-bar-container {
  position: relative;
  width: 100%;
  height: 20px;
  background-color: #eee;
  border-radius: 10px;
}

.progress-bar {
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 10px;
  color: white;
  padding-left: 2px;
}

.target-marker {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background-color: black; /* Farbe des Ziel-Indikators */
  border-radius: 2px;
}
</style>
