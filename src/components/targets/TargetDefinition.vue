<template>
  <h2>{{ $t('settings.targetSettings.heading') }}</h2>
  <h5 class="mt-5">{{ $t('settings.targetSettings.subHeading') }}</h5>
  <InlineMessage
    v-if="global.showTooltips"
    severity="info"
    class="w-full mt-2 mb-4"
  >
    {{ $t('settings.targetSettings.inlineMsg1') }}
  </InlineMessage>

  <!-- head row -->
  <InlineMessage severity="info" class="w-full justify-start">
    <span v-html="$t('settings.targetSettings.inlineMsg2')" />
  </InlineMessage>

  <div class="grid justify-items-end">
    <Button
      class="mt-5 mb-3"
      icon="fa-solid fa-plus"
      @click="
        global.addTarget({
          id: 'new',
          year: 2050,
          percentage: 0,
          report: global.selectedReport?.id ?? '',
        })
      "
      :label="$t('settings.targetSettings.newStep')"
    />
  </div>
  <div class="flex flex-col gap-3">
    <Card v-for="target in global.targetOnSiteForProject" :key="target.id">
      <template #content>
        <div class="mt-4 grid grid-cols-10 items-center justify-items-center">
          <label :for="target.id" class="col-span-2">{{
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
          <label :for="target.id" class="col-span-2">{{
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
          <div class="col-span-2 flex gap-1">
            <!-- icon as delete button -->
            <Button
              icon="fa-solid fa-save"
              @click="global.updateTarget(target)"
            />
            <Button
              icon="fa-solid fa-trash"
              @click="global.dropTarget(target)"
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
