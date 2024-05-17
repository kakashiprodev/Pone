<template>
  <h2>Klimaziele</h2>
  <h5 class="mt-5">Klimaziele für den gewählten Bericht definieren.</h5>
  <InlineMessage
    v-if="global.showTooltips"
    severity="info"
    class="w-full mt-2 mb-4"
  >
    Die Definition ist optional. Es kann die schrittweise Reduktion der
    Treibhausgasemissionen in Schritten eingegeben werden.
  </InlineMessage>

  <!-- head row -->
  <div class="mt-2 mb-5 w-full">
    Jahr / CO<sub>2</sub>-Ausstoß in %.<br />
    100% bedeutet volle Klimeneutralität.<br />
    0% = Keine Einsparung. Verbrauch ist gleich dem des angegebenen Basisjahr
    des Berichts.
  </div>

  <div
    class="mb-4 grid grid-cols-12"
    v-for="target in global.targetOnSiteForProject"
    :key="target.id"
  >
    <label :for="target.id" class="col-span-2 mb-2">Jahr / Prozent</label>
    <div class="col-span-10">
      <InputNumber
        :useGrouping="false"
        :min="1960"
        :max="2100"
        :id="target.id"
        class="mr-2"
        v-model="target.year"
      />
      <InputNumber
        :useGrouping="false"
        :min="0"
        :max="100"
        :id="target.id"
        v-model="target.percentage"
        suffix=" %"
      />
      <!-- icon as delete button -->
      <Button
        icon="fa-solid fa-save"
        @click="global.updateTarget(target)"
        class="ml-1"
      />
      <Button
        icon="fa-solid fa-trash"
        @click="global.dropTarget(target)"
        class="ml-1"
      />
    </div>
  </div>
  <Button
    icon="fa-solid fa-plus"
    @click="
      global.addTarget({
        id: 'new',
        year: 2050,
        percentage: 0,
        report: global.selectedReport?.id ?? '',
      })
    "
    label="Neue Abstufung hinzufügen"
  />
</template>

<script setup lang="ts">
import { useGlobalStore } from '../../stores/global';

const global = useGlobalStore();
</script>
