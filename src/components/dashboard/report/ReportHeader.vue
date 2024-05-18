<template>
  <Card v-if="global.selectedReport" class="h-full">
    <template #header>
      <div class="psm-report-header">
        <h3>Unternehmen</h3>
      </div>
    </template>
    <template #content>
      <div class="report-section">
        <h3 class="report-section__heading mb-2">
          {{ global.selectedReport.companyName }}
        </h3>
        <div class="report-section__address mb-4">
          <p>
            {{ global.selectedReport.companyStreet }},
            {{ global.selectedReport.companyPostal }}
            {{ global.selectedReport.companyCity }}
          </p>
          <p>{{ global.selectedReport.companyCountry }}</p>
        </div>
        <p class="report-row">
          <span>Jahr:</span> <span>{{ global.selectedReport.year }}</span>
        </p>

        <p class="report-row">
          <span>Branche:</span>
          <span>{{ global.selectedReport.companyDomain }}</span>
        </p>
      </div>

      <div class="report-section">
        <h3>Ansprechpartner</h3>
        <p class="report-row">
          <span>Name:</span>
          <span
            ><span>{{ global.selectedReport.contactName }}</span></span
          >
        </p>
        <p class="report-row">
          <span>Telefon:</span>
          <span>{{ global.selectedReport.contactTelephone }}</span>
        </p>
        <p class="report-row">
          <span>E-Mail:</span>
          <span>{{ global.selectedReport.contactEmail }}</span>
        </p>
        <p class="report-row">
          <span>Abteilung:</span>
          <span>{{ global.selectedReport.contactDomain }}</span>
        </p>
      </div>

      <div class="report-section">
        <h3>Unternehmenszahlen</h3>
        <p class="report-row">
          <span>Anzahl Mitarbeiter:</span>
          <span>{{ global.selectedReport.countEmployees }}</span>
        </p>
        <p class="report-row">
          <span>Jahresumsatz:</span>
          <span>{{ global.selectedReport.businessTurnover }}</span>
        </p>
        <p class="report-row">
          <span>Referenzjahr:</span>
          <span>{{ global.selectedReport.baseYear }}</span>
        </p>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { useGlobalStore } from '../../../stores/global';

const global = useGlobalStore();
</script>

<style scoped>
.report-display {
  font-family: Arial, sans-serif;
}

.report-title,
.report-section h3 {
  margin-bottom: 0.5rem;
}

.report-description,
.report-content p,
.report-no-data p {
  margin-bottom: 1rem;
}

.report-section {
  margin-bottom: 2rem;
}

.report-section p {
  margin: 0.25rem 0;
}

.report-row {
  @media (min-width: 768px) {
    display: flex;

    & > strong,
    & > span {
      width: 50%;
    }
  }
}

/* Weitere Stildefinitionen hier einfügen */
</style>
