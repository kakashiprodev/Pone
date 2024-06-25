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
  <TargetDefinition />
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/stores/global';
import TargetDefinition from '@/components/targets/TargetDefinition.vue';

const global = useGlobalStore();
</script>
