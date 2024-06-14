<template>
  <div class="card mb-1" v-if="scope === '1'">
    <h3>{{ $t('equivalents.infoBox.heading1') }}</h3>
    <p>
      {{ $t('equivalents.infoBox.text1') }}
    </p>
  </div>
  <div class="card" v-if="scope === '2'">
    <h3>{{ $t('equivalents.infoBox.heading2') }}</h3>
    <p>
      {{ $t('equivalents.infoBox.text2') }}
    </p>
  </div>
  <div class="card" v-if="scope === '3'">
    <h3>{{ $t('equivalents.infoBox.heading3') }}</h3>
    <p>
      {{ $t('equivalents.infoBox.text3') }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  scope: {
    type: String,
    required: true,
  },
});
</script>
