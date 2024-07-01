<template>
  <template v-if="report">
    <template
      v-if="
        report.company_name !== '' &&
        report.company_street !== '' &&
        report.company_postal !== '' &&
        report.company_city !== ''
      "
    >
      <div class="report-section">
        <h3 class="report-section__heading mb-2">
          {{ report.company_name }}
        </h3>
        <div class="report-section__address mb-4">
          <p>
            {{ report.company_street }},
            {{ report.company_postal }}
            {{ report.company_city }}
          </p>
          <p>{{ report.company_country }}</p>
        </div>
        <p class="report-row">
          <span>{{ $t('report.year') }}</span>
          <span>{{ report.year }}</span>
        </p>

        <p class="report-row">
          <span>{{ $t('report.domain') }}</span>
          <span>{{ report.company_domain }}</span>
        </p>
      </div>

      <div class="report-section">
        <h3>{{ $t('report.contactPerson') }}</h3>
        <p class="report-row">
          <span>{{ $t('report.contactName') }}</span>
          <span
            ><span>{{ report.contact_name }}</span></span
          >
        </p>
        <p class="report-row">
          <span>E-Mail</span>
          <span>{{ report.contact_email }}</span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.contactPhone') }}</span>
          <span>{{ report.contact_telephone }}</span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.contactEmail') }}</span>
          <span>{{ report.contact_email }}</span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.contactDepartment') }}</span>
          <span>{{ report.contact_domain }}</span>
        </p>
      </div>

      <div class="report-section">
        <h3>{{ $t('report.companyNumbers') }}</h3>
        <p class="report-row">
          <span>{{ $t('report.countEmployees') }}</span>
          <span>
            {{ numberToGroupedString(report.count_employees) }}
          </span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.businessTurnover') }}</span>
          <span>{{ numberToGroupedString(report.business_turnover) }} €</span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.refYear') }}</span>
          <span>{{ report.base_year }}</span>
        </p>
      </div>
    </template>
  </template>
  <template v-else>
    <div class="report-no-data">
      <p>{{ $t('report.noCompanyData') }}</p>
    </div>
  </template>
</template>

<script setup lang="ts">
import { numberToGroupedString } from '@/services/helper';
import { useGlobalStore } from '../../../stores/global';
import { computed } from 'vue';

const global = useGlobalStore();

const report = computed(() => global.selectedReport);
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
