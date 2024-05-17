<template>
  <div class="card mb-1" v-if="scope === '1'">
    <h3>Scope 1: Direkte Emissionen</h3>
    <p>
      Emissionen aus eigenen oder kontrollierten Quellen. Beispiele: Emissionen
      von Verbrennungsprozessen in eigenen Anlagen, Fahrzeugemissionen
    </p>
  </div>
  <div class="card" v-if="scope === '2'">
    <h3>Scope 2: Indirekte Emissionen aus bezogener Energie</h3>
    <p>
      Emissionen aus der Erzeugung gekaufter oder sonstwie bezogener
      Elektrizität, Dampf, Wärme und Kühlung Beispiele: Emissionen durch
      Stromverbrauch, Fernwärme
    </p>
  </div>
  <div class="card" v-if="scope === '3'">
    <h3>Scope 3: Sonstige indirekte Emissionen</h3>
    <p>
      Emissionen, die nicht direkt aus eigenen oder kontrollierten Quellen
      stammen, aber mit der Wertschöpfungskette des Unternehmens verbunden sind
      Beispiele: Emissionen aus der Produktion bezogener Materialien und
      Dienstleistungen, Transport- und Distributionsaktivitäten, Emissionen aus
      der Entsorgung von verkauften Produkten, Geschäftsreisen, Pendlerverkehr
      der Mitarbeiter, Leasingaktivitäten, Investitionen
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
