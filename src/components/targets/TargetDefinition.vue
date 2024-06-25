<template>
  <!-- head row -->
  <InlineMessage severity="info" class="w-full justify-start">
    <span v-html="$t('settings.targetSettings.inlineMsg2')" />
  </InlineMessage>

  <div class="grid justify-items-end max-w-[800px] m-auto">
    <Button
      class="mt-5 mb-3"
      icon="fa-solid fa-plus"
      @click="
        global.addTarget({
          id: 'new',
          year: 2050,
          percentage: 0,
          report: global.selectedReport?.id ?? '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      "
      :label="$t('settings.targetSettings.newStep')"
    />
  </div>
  <div class="flex flex-col gap-3 max-w-[800px] m-auto">
    <Card v-for="target in global.targetOnSiteForProject" :key="target.id">
      <template #content>
        <div class="mt-4 grid grid-cols-10 items-center justify-items-center">
          <div class="col-span-4 grid grid-cols-1">
            <label :for="target.id">{{
              $t('settings.targetSettings.year')
            }}</label>
            <InputNumber
              class="col-span-2"
              :useGrouping="false"
              :min="1960"
              :max="2100"
              :id="target.id"
              v-model="target.year"
            />
          </div>

          <div class="col-span-4 grid grid-cols-1">
            <label :for="target.id">{{
              $t('settings.targetSettings.savedPercentage')
            }}</label>
            <InputNumber
              class="col-span-2"
              :useGrouping="false"
              :min="0"
              :max="100"
              :id="target.id"
              v-model="target.percentage"
              suffix=" %"
            />
          </div>

          <div class="col-span-2 flex space-x-1">
            <!-- icon as delete button -->
            <Button
              icon="fa-solid fa-save"
              @click="global.updateTarget(target)"
            />
            <Button
              icon="fa-solid fa-trash"
              @click="global.dropTarget(target)"
              severity="warning"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '../../stores/global';

const global = useGlobalStore();
</script>
