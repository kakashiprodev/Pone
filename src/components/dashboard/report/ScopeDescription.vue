<template>
  <Card v-if="scope === 'all'" class="h-full">
    <template #title>CO<sub>2</sub>-Bilanzierung</template>
    <template #content>
      <img src="./../../../assets/scopes.png" alt="Scope" style="width: 100%" />
      <p>
        In einer CO<sub>2</sub>-Bilanz werden, die direkten und indirekten
        verursachten Emissionen erfasst. Für die Erstellung dieser Bilanz werden
        die Anforderungen nach GHG-Protokoll berücksichtigt. Zur Berechnung
        können Emissionen entlang des gesamten Produktzyklus betrachtet werden,
        hierbei muss deutlich zwischen Scope 1, Scope 2 und Scope 3
        unterschieden werden. Nach dem GHG-Protokoll verfügen Treibhausgase über
        unterschiedliche Erwärmungspotenziale. Um diese vergleichen zu können
        wurde der Indikator „Global Warming Potenzial“ (GWP) gebildet. Der GWP
        wird in CO<sub>2</sub>-Äquivalenten (CO2e) zum relativen
        Treibhausgaspotenzial von CO<sub>2</sub> angegeben. In der nachfolgenden
        Abbildung ist die Scope-Betrachtung entlang des Lebenszyklus
        dargestellt.
      </p>
    </template>
  </Card>

  <Card v-if="scope === '1'" class="h-full">
    <template #title>Scope 1</template>
    <template #content>
      <p>
        Umfasst Emissionen aus direkten Quellen des Unternehmens. Diese
        Emissionen resultieren aus internen Aktivitäten wie der Verbrennung
        fossiler Brennstoffe in Anlagen, Fahrzeugen und Heizsystemen.
      </p>
    </template>
  </Card>

  <Card v-if="scope === '2'" class="h-full">
    <template #title>Scope 2</template>
    <template #content>
      <p>
        Umfasst Emissionen aus indirekten Quellen, die durch die Erzeugung von
        gekauftem Strom, Dampf oder Wärme entstehen. Diese Emissionen entstehen
        außerhalb des Unternehmens und werden durch den Energieverbrauch
        verursacht.
      </p>
    </template>
  </Card>

  <Card v-if="scope === '3'" class="h-full">
    <template #title>Scope 3</template>
    <template #content>
      <p>
        Umfasst alle anderen indirekten Emissionen, die durch Aktivitäten des
        Unternehmens entstehen, aber nicht in Scope 1 oder 2 enthalten sind.
        Diese Emissionen entstehen in der Lieferkette des Unternehmens, bei der
        Entsorgung von Produkten und bei der Nutzung von Produkten und Diensten
        des Unternehmens.
      </p>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

defineProps({
  scope: {
    type: String as PropType<string>,
    required: true,
  },
});
</script>
