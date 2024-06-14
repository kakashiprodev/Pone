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
          {{ global.selectedReport.company_name }}
        </h3>
        <div class="report-section__address mb-4">
          <p>
            {{ global.selectedReport.company_street }},
            {{ global.selectedReport.company_postal }}
            {{ global.selectedReport.company_city }}
          </p>
          <p>{{ global.selectedReport.company_country }}</p>
        </div>
        <p class="report-row">
          <span>Jahr:</span> <span>{{ global.selectedReport.year }}</span>
        </p>

        <p class="report-row">
          <span>Branche:</span>
          <span>{{ global.selectedReport.company_domain }}</span>
        </p>
      </div>

      <div class="report-section">
        <h3>Ansprechpartner</h3>
        <p class="report-row">
          <span>Name:</span>
          <span
            ><span>{{ global.selectedReport.contact_name }}</span></span
          >
        </p>
        <p class="report-row">
          <span>Telefon:</span>
          <span>{{ global.selectedReport.contact_telephone }}</span>
        </p>
        <p class="report-row">
          <span>E-Mail:</span>
          <span>{{ global.selectedReport.contact_email }}</span>
        </p>
        <p class="report-row">
          <span>Abteilung:</span>
          <span>{{ global.selectedReport.contact_domain }}</span>
        </p>
      </div>

      <div class="report-section">
        <h3>Unternehmenszahlen</h3>
        <p class="report-row">
          <span>Anzahl Mitarbeiter:</span>
          <span>{{ global.selectedReport.count_employees }}</span>
        </p>
        <p class="report-row">
          <span>Jahresumsatz:</span>
          <span>{{ global.selectedReport.business_turnover }}</span>
        </p>
        <p class="report-row">
          <span>Referenzjahr:</span>
          <span>{{ global.selectedReport.base_year }}</span>
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
