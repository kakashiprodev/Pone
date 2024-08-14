<template>
  <h2>{{ $t('settings.reportSettings.heading') }}</h2>
  <p>
    {{ $t('settings.reportSettings.subHeading') }}
  </p>
  <Toolbar class="w-full">
    <template #start>
      <div class="flex gap-2 items-center" v-show="reportForm?.id !== 'new'">
        <span>{{ $t('settings.reportSettings.currentReport') }}</span>
        <Chip class="text-lg">
          {{ global.selectedReport?.year }}
        </Chip>
      </div>
    </template>
    <template #end>
      <div class="grow flex gap-1">
        <ConfirmDialog />

        <Button
          icon="fa-solid fa-plus"
          @click="reportForm = global.getNewReport()"
          :label="$t('settings.reportSettings.add')"
          v-show="reportForm?.id !== 'new'"
        />
        <Button
          v-if="
            global.targetOnSiteForProject.length < 1 && reportForm?.id !== 'new'
          "
          icon="fa-solid fa-copy"
          @click="copyTargetsFromYearBefore()"
          :v-tooltip="$t('settings.reportSettings.copyFromLastYear')"
        />
        <Button
          v-if="reportForm"
          :disabled="!reportFormIsValid"
          @click="saveReport()"
          :label="
            reportForm.id === 'new'
              ? $t('settings.reportSettings.add')
              : $t('global.save')
          "
        />
        <Button
          v-if="global.selectedReport"
          icon="fa-solid fa-trash"
          @click="confirmDelete(global.selectedReport, $event)"
          :label="$t('global.delete')"
          v-show="reportForm?.id !== 'new'"
        />
        <Button
          v-if="reportForm?.id === 'new'"
          label="Abbrechen"
          @click="reportForm = global.selectedReport"
          severity="warning"
        />
      </div>
    </template>
  </Toolbar>

  <!-- Empty -->
  <div v-if="global.reports.length === 0" class="card">
    <p>
      {{ $t('settings.reportSettings.noReports') }}
    </p>
    <Button
      icon="fa-solid fa-plus"
      @click="reportForm = global.getNewReport()"
      :label="$t('settings.reportSettings.addReport')"
    />
  </div>

  <!-- Config -->
  <ReportSettings
    v-if="reportForm"
    :showSaveButton="false"
    v-model="reportForm"
    @save="saveReport"
    @form-is-valid="reportFormIsValid = $event"
  />
</template>

<script setup lang="ts">
import { ref, watch, Ref } from 'vue';
import { useGlobalStore } from '../../stores/global';
import { useConfirm } from 'primevue/useconfirm';
import { ReportEntry } from '../../services/types';
import { error, info } from '../../services/ui/toast';
import { useI18n } from 'vue-i18n';
import ReportSettings from '@/components/reports/ReportSettings.vue';

const { t } = useI18n();
const global = useGlobalStore();
const confirm = useConfirm();

const reportForm: Ref<null | ReportEntry> = ref(global.selectedReport);
const reportFormIsValid = ref(false);
// watch for changes in the selected report to update the form
watch(
  () => global.selectedReport,
  () => {
    reportForm.value = global.selectedReport;
  },
);

/**
 * Confirm the deletion of a report
 */
const confirmDelete = async (report: ReportEntry, event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: t('settings.reportSettings.confirmDelete'),
    icon: 'fa-solid fa-question',
    accept: async () => {
      try {
        await global.dropReport(report);
        // get the next report with the highest year
        await global.ensureLatestReport();
        if (global.selectedReport) {
          reportForm.value = global.selectedReport;
        }
        info(t('settings.reportSettings.successDelete'));
      } catch (e) {
        error(e + '');
      }
    },
  });
};

/**
 * Copy all targets from the year before to the current report
 */
const copyTargetsFromYearBefore = async () => {
  if (reportForm.value != null) {
    const yearBefore = reportForm.value.year - 1;
    const reportBefore = global.reports.find((r) => r.year === yearBefore);
    if (reportBefore) {
      const res = await global.copyTargets(
        reportBefore.id,
        reportForm.value.id,
      );
      info(
        `${res.copied} Ziele aus dem Jahr ${
          reportForm.value.year - 1
        } wurden ins Berichtsjahr ${reportForm.value.year} kopiert.`,
      );
    }
  }
};

/**
 * Save the report to the database
 */
const saveReport = async () => {
  if (!reportForm.value) {
    return;
  }
  try {
    if (reportForm.value.id === 'new') {
      reportForm.value = await global.addReport(reportForm.value);
      // if the report was added then copy all report targets to the new report. This will be the year before
      await copyTargetsFromYearBefore();
      await global.changeReport();
    } else {
      reportForm.value = await global.updateReport(reportForm.value);
    }
    info('Bericht gespeichert');
  } catch (e) {
    error((e + '').replace('ValiError: ', ''));
  }
};

const init = async () => {
  while (global.isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (global.selectedReport) {
    reportForm.value = global.selectedReport;
  }
};
init();
</script>
