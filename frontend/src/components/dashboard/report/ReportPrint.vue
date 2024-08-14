<template>
  <div class="text-center m-auto mt-5">
    <p>{{ $t('report.printHeading') }}</p>
    <Button
      label="Report erstellen"
      icon="fa-solid fa-print"
      @click="goToReport()"
    />
  </div>
</template>

<script setup lang="ts">
const goToReport = () => {
  window.open('/#/report-preview', '_blank');
};
</script>
