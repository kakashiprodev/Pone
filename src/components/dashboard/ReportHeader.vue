<template>
  <div class="report-header" v-if="report != null">
    <div class="header-top">
      <h1 class="company-name">{{ report.companyName }}</h1>
      <div class="company-details">
        <p>{{ report.companyStreet }}</p>
        <p>{{ report.companyPostal }} {{ report.companyCity }}</p>
        <p>{{ report.companyCountry }}</p>
      </div>
    </div>
    <div class="header-bottom">
      <div class="contact-details">
        <p class="contact-name">{{ report.contactName }}</p>
        <p>{{ report.contactEmail }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGlobalStore } from '../../stores/global';

const global = useGlobalStore();
const report = computed(() => global.selectedReport);
</script>

<style scoped>
.report-header {
  font-family: 'Arial', sans-serif;
  color: #333;
  border-bottom: 2px solid #eee;
  padding: 20px;
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.company-name {
  font-size: 24px;
  margin: 0;
}

.company-details,
.contact-details {
  margin: 0;
  padding: 0;
}

.contact-name {
  font-weight: bold;
}
</style>
