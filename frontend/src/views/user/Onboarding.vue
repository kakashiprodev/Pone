<template>
  <div class="p-5">
    <Stepper>
      <StepperPanel :header="$t('onboarding.step_company')">
        <template #content="{ nextCallback }">
          <div class="p-32">
            <p class="p-5 text-center text-xl">
              {{ $t('onboarding.welcome') }}
            </p>

            <GenericForm
              v-if="global.selectedProject"
              :definition="[
                {
                  key: 'name',
                  label: 'Legen Sie hier den Namen Ihres Unternehmens fest',
                  type: 'text',
                },
              ]"
              v-model="global.selectedProject"
            />
          </div>
          <div class="flex pt-4 justify-end">
            <Button
              :label="$t('inputs.stepForward')"
              :disabled="global.selectedProject?.name === ''"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="
                async (e) => {
                  await saveCompany();
                  nextCallback(e);
                }
              "
            />
          </div>
        </template>
      </StepperPanel>

      <StepperPanel :header="$t('onboarding.step_report')">
        <template #content="{ prevCallback, nextCallback }">
          <div class="p-5">
            <ReportSettings
              v-if="reportForm"
              :showSaveButton="false"
              v-model="reportForm"
              @formIsValid="reportFormIsValid = $event"
              @save="
                (e) => {
                  saveReport();
                  nextCallback(e);
                }
              "
            />
          </div>
          <div class="flex pt-4 justify-between">
            <Button
              :label="$t('inputs.stepBack')"
              severity="secondary"
              icon="pi pi-arrow-left"
              @click="prevCallback"
            />
            <Button
              :disabled="!reportFormIsValid"
              :label="$t('inputs.stepForward')"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="
                (e) => {
                  nextCallback(e);
                }
              "
            />
          </div>
        </template>
      </StepperPanel>

      <StepperPanel :header="$t('onboarding.step_targets')">
        <template #content="{ prevCallback }">
          <div class="p-5">
            <p>
              {{ $t('onboarding.targets') }}
            </p>
            <TargetDefinition />
          </div>
          <div class="flex pt-4 justify-between">
            <Button
              :label="$t('inputs.stepBack')"
              severity="secondary"
              icon="pi pi-arrow-left"
              @click="prevCallback"
            />
            <Button
              :label="$t('inputs.stepForward')"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="
                () => {
                  router.push({ name: 'inputs' });
                }
              "
            />
          </div>
        </template>
      </StepperPanel>

      <StepperPanel :header="$t('onboarding.step_done')">
        <template #content="{ prevCallback }">
          <div class="p-5">
            <p>
              {{ $t('onboarding.done') }}
            </p>
          </div>
          <div class="flex pt-4 justify-between">
            <Button
              :label="$t('inputs.stepBack')"
              severity="secondary"
              icon="pi pi-arrow-left"
              @click="prevCallback"
            />
            <Button
              :label="$t('inputs.stepForward')"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="
                () => {
                  router.push({ name: 'inputs' });
                }
              "
            />
          </div>
        </template>
      </StepperPanel>
    </Stepper>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/stores/global';
import GenericForm from '@/components/forms/GenericForm.vue';
import { useRouter } from 'vue-router';
import ReportSettings from '@/components/reports/ReportSettings.vue';
import { ReportEntry } from '@/services/types';
import { Ref, ref } from 'vue';
import TargetDefinition from '@/components/targets/TargetDefinition.vue';

const router = useRouter();
const global = useGlobalStore();

const reportForm: Ref<null | ReportEntry> = ref(global.selectedReport);
const reportFormIsValid = ref(false);

const saveCompany = async () => {
  if (!global.selectedProject) return;
  if (reportForm.value) {
    reportForm.value.companyName = global.selectedProject?.name || '';
  }
  await global.updateProject(global.selectedProject);
};

const saveReport = async () => {
  if (!reportForm.value) return;
  await global.updateReport(reportForm.value);
};
</script>
