<template>
  <div class="dark-mode-toggle flex align-items-center justify-content-end">
    <i v-if="colorMode === 'dark'" class="fa-solid fa-moon" />
    <i v-if="colorMode === 'light'" class="fa-solid fa-sun" />

    <InputSwitch
      v-tooltip="'Toggle Theme'"
      v-model="$global.theme"
      class="ml-3"
      :true-value="'dark'"
      :false-value="'light'"
    />
  </div>
</template>

<script lang="ts" setup>
import { useGlobalStore } from '../../stores/global';
import InputSwitch from 'primevue/inputswitch';
import { computed } from 'vue';

const $global = useGlobalStore();
const colorMode = computed(() => $global.theme);
</script>
