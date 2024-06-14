<template>
  <Card v-if="global.selectedReport" class="h-full">
    <template #header>
      <div class="psm-report-header">
        <h3>{{ $t('report.company') }}</h3>
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
          <span>{{ $t('report.year') }}:</span>
          <span>{{ global.selectedReport.year }}</span>
        </p>

        <p class="report-row">
          <span>{{ $t('report.domain') }}:</span>
          <span>{{ global.selectedReport.company_domain }}</span>
        </p>
      </div>

      <div class="report-section">
        <h3>{{ $t('report.contactPerson') }}</h3>
        <p class="report-row">
          <span>{{ $t('report.contactName') }}:</span>
          <span
            ><span>{{ global.selectedReport.contact_name }}</span></span
          >
        </p>
        <p class="report-row">
          <span>E-Mail:</span>
          <span>{{ global.selectedReport.contact_email }}</span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.contactPhone') }}:</span>
          <span>{{ global.selectedReport.contact_telephone }}</span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.contactEmail') }}:</span>
          <span>{{ global.selectedReport.contact_email }}</span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.contactDepartment') }}:</span>
          <span>{{ global.selectedReport.contact_domain }}</span>
        </p>
      </div>

      <div class="report-section">
        <h3>{{ $t('report.companyNumbers') }}</h3>
        <p class="report-row">
          <<<<<<< HEAD
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
          =======
          <span>{{ $t('report.countEmployees') }}:</span>
          <span>{{ global.selectedReport.countEmployees }}</span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.businessTurnover') }}:</span>
          <span>{{ global.selectedReport.businessTurnover }}</span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.refYear') }}:</span>
          <span>{{ global.selectedReport.baseYear }}</span>
          >>>>>>> feature/add-i18n
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
