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
  <InlineMessage severity="info" class="w-full">
    Die Eingaben beziehen sich auf das Referenzjahr des Berichts. 100% bedeutet
    volle Klimeneutralität.<br />
    0% = Keine Einsparung. Verbrauch ist gleich dem des angegebenen Basisjahr
    des Berichts.
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      "
      label="Neue Abstufung hinzufügen"
    />
  </div>
  <div class="flex flex-col gap-3">
    <Card v-for="target in global.targetOnSiteForProject" :key="target.id">
      <template #content>
        <div class="mt-4 grid grid-cols-10 items-center justify-items-center">
          <label :for="target.id" class="col-span-2"> Jahr </label>
          <InputNumber
            class="col-span-2"
            :useGrouping="false"
            :min="1960"
            :max="2100"
            :id="target.id"
            v-model="target.year"
          />
          <label :for="target.id" class="col-span-2">Einsparung in % </label>
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
