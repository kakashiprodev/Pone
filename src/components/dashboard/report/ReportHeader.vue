<template>
  <Card v-if="global.selectedReport" class="h-full">
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
          <span>Jahr:</span> <strong>{{ global.selectedReport.year }}</strong>
        </p>

        <p class="report-row">
          <span>Branche:</span>
          <strong>{{ global.selectedReport.companyDomain }}</strong>
        </p>
      </div>

      <div class="report-section">
        <h3>Ansprechpartner</h3>
        <p class="report-row">
          <span>Name:</span>
          <span
            ><strong>{{ global.selectedReport.contactName }}</strong></span
          >
        </p>
        <p class="report-row">
          <span>Telefon:</span>
          <strong>{{ global.selectedReport.contactTelephone }}</strong>
        </p>
        <p class="report-row">
          <span>E-Mail:</span>
          <strong>{{ global.selectedReport.contactEmail }}</strong>
        </p>
        <p class="report-row">
          <span>Abteilung:</span>
          <strong>{{ global.selectedReport.contactDomain }}</strong>
        </p>
      </div>

      <div class="report-section">
        <h3>Unternehmenszahlen</h3>
        <p class="report-row">
          <span>Anzahl Mitarbeiter:</span>
          <strong>{{ global.selectedReport.countEmployees }}</strong>
        </p>
        <p class="report-row">
          <span>Jahresumsatz:</span>
          <strong>{{ global.selectedReport.businessTurnover }}</strong>
        </p>
        <p class="report-row">
          <span>Referenzjahr:</span>
          <strong>{{ global.selectedReport.baseYear }}</strong>
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
