<template>
  <template v-if="report">
    <template
      v-if="
        report.companyName !== '' &&
        report.companyStreet !== '' &&
        report.companyPostal !== '' &&
        report.companyCity !== ''
      "
    >
      <div class="report-section">
        <h3 class="report-section__heading mb-2">
          {{ report.companyName }}
        </h3>
        <div class="report-section__address mb-4">
          <p>
            {{ report.companyStreet }},
            {{ report.companyPostal }}
            {{ report.companyCity }}
          </p>
          <p>{{ report.companyCountry }}</p>
        </div>
        <p class="report-row">
          <span>{{ $t('report.year') }}</span>
          <span>{{ report.year }}</span>
        </p>

        <p class="report-row">
          <span>{{ $t('report.domain') }}</span>
          <span>{{ report.companyDomain }}</span>
        </p>
      </div>

      <div class="report-section">
        <h3>{{ $t('report.contactPerson') }}</h3>
        <p class="report-row">
          <span>{{ $t('report.contactName') }}</span>
          <span
            ><span>{{ report.contactName }}</span></span
          >
        </p>
        <p class="report-row">
          <span>E-Mail</span>
          <span>{{ report.contactEmail }}</span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.contactPhone') }}</span>
          <span>{{ report.contactTelephone }}</span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.contactEmail') }}</span>
          <span>{{ report.contactEmail }}</span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.contactDepartment') }}</span>
          <span>{{ report.contactDomain }}</span>
        </p>
      </div>

      <div class="report-section">
        <h3>{{ $t('report.companyNumbers') }}</h3>
        <p class="report-row">
          <span>{{ $t('report.countEmployees') }}</span>
          <span>
            {{ numberToGroupedString(report.countEmployees) }}
          </span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.businessTurnover') }}</span>
          <span>{{ numberToGroupedString(report.businessTurnover) }} €</span>
        </p>
        <p class="report-row">
          <span>{{ $t('report.refYear') }}</span>
          <span>{{ report.baseYear }}</span>
        </p>
      </div>
    </template>
    <div v-else>
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
