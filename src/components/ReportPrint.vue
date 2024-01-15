<template>
  <div class="text-center m-auto mt-5">
    <p>Hier können Sie Ihren Report als druckbare Version erstellen.</p>
    <Button
      label="Report erstellen"
      icon="fa-solid fa-print"
      class="p-button-rounded p-button-success p-button-lg"
      @click="goToReport()"
    />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';

const goToReport = () => {
  window.open('/#/report-preview', '_blank');
};
</script>
