<template>
  <Card v-if="global.selectedReport">
    <template #content>
      <div class="report-section">
        <p><strong>Jahr:</strong> {{ global.selectedReport.year }}</p>
        <p>
          <strong>Firmenname:</strong> {{ global.selectedReport.companyName }}
        </p>
        <p>
          <strong>Straße:</strong> {{ global.selectedReport.companyStreet }}
        </p>
        <p><strong>PLZ:</strong> {{ global.selectedReport.companyPostal }}</p>
        <p><strong>Stadt:</strong> {{ global.selectedReport.companyCity }}</p>
        <p><strong>Land:</strong> {{ global.selectedReport.companyCountry }}</p>
        <p>
          <strong>Branche:</strong> {{ global.selectedReport.companyDomain }}
        </p>
      </div>

      <div class="report-section">
        <h3>Ansprechpartner</h3>
        <p><strong>Name:</strong> {{ global.selectedReport.contactName }}</p>
        <p>
          <strong>Telefon:</strong> {{ global.selectedReport.contactTelephone }}
        </p>
        <p><strong>E-Mail:</strong> {{ global.selectedReport.contactEmail }}</p>
        <p>
          <strong>Abteilung:</strong> {{ global.selectedReport.contactDomain }}
        </p>
      </div>

      <div class="report-section">
        <h3>Unternehmenszahlen</h3>
        <p>
          <strong>Anzahl Mitarbeiter:</strong>
          {{ global.selectedReport.countEmployees }}
        </p>
        <p>
          <strong>Jahresumsatz:</strong>
          {{ global.selectedReport.businessTurnover }}
        </p>
        <p>
          <strong>Referenzjahr:</strong> {{ global.selectedReport.baseYear }}
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

/* Weitere Stildefinitionen hier einfügen */
</style>
