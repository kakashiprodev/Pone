<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2" v-show="preSelectedScope === 'all'">
      <label for="userinput-scope">{{ $t('inputs.scope') }}</label>
      <Dropdown
        class="w-full"
        id="userinput-scope"
        v-model="_selectedValue.scope"
        :options="[1, 2, 3]"
      />
      <InlineMessage
        v-if="globalStore.showTooltips"
        class="w-full mt-1"
        severity="info"
      >
        {{ $t('inputs.scopeInline') }}
      </InlineMessage>
    </div>
    <div class="flex flex-col gap-2">
      <label for="userinput-equivalent">{{ $t('inputs.equivalent') }}</label>
      <div>
        <div
          v-if="
            _selectedValue.equivalent != null &&
            _selectedValue.equivalent !== ''
          "
          @click="_showChooseEquivalent = true"
          class="bg-teal-900 text-white rounded-sm m-2 flex items-center justify-center cursor-pointer p-2"
        >
          {{
            globalStore.equivalentDict[_selectedValue.equivalent]
              ?.specification1 ?? ''
          }}
        </div>
        <div class="flex justify-center" v-else>
          <Button
            class="w-80"
            :label="$t('inputs.choose')"
            @click="_showChooseEquivalent = true"
          />
        </div>
      </div>
      <InlineMessage
        v-if="globalStore.showTooltips"
        class="w-full mt-1"
        severity="info"
        v-html="
          $t('inputs.equivalentInline', {
            units: globalStore.displayInTons ? ' to' : ' kg',
          })
        "
      >
      </InlineMessage>
    </div>
    <div class="flex flex-col gap-2">
      <label for="userinput-category">{{ $t('inputs.category') }}</label>
      <InputText
        class="w-full"
        v-model="_selectedValue.category"
        id="userinput-category"
      />
      <InlineMessage
        v-if="globalStore.showTooltips"
        class="w-full mt-1"
        severity="info"
      >
        {{ $t('inputs.categoryInline') }}
      </InlineMessage>
    </div>
    <div class="flex flex-col gap-2">
      <label for="userinput-equivalent">
        {{ $t('inputs.facilityOptional') }}
      </label>
      <div>
        <div
          v-if="
            _selectedValue.facility != null && _selectedValue.facility !== ''
          "
          @click="_showChooseFacility = true"
          class="bg-teal-900 text-white rounded-sm m-2 flex items-center justify-center cursor-pointer p-2"
        >
          {{ globalStore.facilitiesDict[_selectedValue.facility]?.name ?? '' }}
        </div>
        <div class="flex justify-center" v-else>
          <Button
            class="w-80"
            label="Auswählen"
            @click="_showChooseFacility = true"
          />
        </div>
      </div>
      <InlineMessage
        v-if="globalStore.showTooltips"
        class="w-full mt-1"
        severity="info"
      >
        $t('inputs.facilityInline')
      </InlineMessage>
    </div>
    <div class="flex flex-col gap-2">
      <label for="userinput-name">{{ $t('inputs.name') }}</label>
      <InputText
        class="w-full"
        v-model="_selectedValue.name"
        id="userinput-name"
      />
      <InlineMessage
        v-if="globalStore.showTooltips"
        class="w-full mt-1"
        severity="info"
        >{{ $t('inputs.nameInline') }}
      </InlineMessage>
    </div>
    <div class="flex flex-col gap-2">
      <label for="userinput-comment">{{ $t('inputs.comment') }}</label>
      <InputText
        class="w-full"
        v-model="_selectedValue.comment"
        id="userinput-comment"
      />
      <InlineMessage
        v-if="globalStore.showTooltips"
        class="w-full mt-1"
        severity="info"
      >
        {{ $t('inputs.commentInline') }}
      </InlineMessage>
    </div>
    <div>
      <MonthlyOrYearlyInput
        v-model:valueInput="_selectedValue"
        :input-unit="choosenEquivalent ? ' ' + choosenEquivalent.in : ''"
      />
      <InlineMessage
        v-if="globalStore.showTooltips"
        class="w-full mt-1"
        severity="info"
        :v-html="$t('inputs.selectedValueInline')"
      ></InlineMessage>
    </div>
    <!-- helping information -->
    <div
      class="flex flex-col gap-2"
      v-if="globalStore.showTooltips && computedSumCalculation !== ''"
    >
      <label for="userinput-sum">{{ $t('inputs.calcSteps') }}</label>
      <p style="white-space: pre-wrap">
        {{ computedSumCalculation }}
      </p>
      <InlineMessage
        v-if="globalStore.showTooltips"
        class="w-full mt-1"
        severity="info"
      >
        {{ $t('inputs.calcStepsInline') }}
      </InlineMessage>
    </div>
    <div class="flex flex-col gap-2">
      <label for="userinput-sum">{{ $t('inputs.amountCalc') }}</label>
      <InputNumber
        :disabled="true"
        class="w-full"
        v-model="scaledSumValue"
        id="userinput-sum"
        :use-grouping="true"
        :min-fraction-digits="0"
        :max-fraction-digits="3"
        :suffix="globalStore.displayInTons ? ' to' : ' kg'"
      />
      <InlineMessage
        v-if="globalStore.showTooltips"
        class="w-full mt-1"
        severity="info"
      >
        {{ $t('inputs.amountCalcInline') }}
      </InlineMessage>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTons } from '@/services/helper';
import MonthlyOrYearlyInput from '../equivalents/MonthlyOrYearlyInput.vue';
import { getCalculationSteps, getSumForInput } from '@/services/reporting';
import { EquivalentEntry, InputEntry } from '@/services/types';
import { useGlobalStore } from '@/stores/global';
import { ComputedRef, computed } from 'vue';

const globalStore = useGlobalStore();

const props = defineProps<{
  selectedValue: InputEntry;
  preSelectedScope: '1' | '2' | '3' | 'all';
  showChooseEquivalent: boolean;
  showChooseFacility: boolean;
}>();
const _selectedValue = computed({
  get: () => props.selectedValue,
  set: (val) => emit('update:selectedValue', val),
});
const _showChooseEquivalent = computed({
  get: () => props.showChooseEquivalent,
  set: (val) => emit('update:showChooseEquivalent', val),
});
const _showChooseFacility = computed({
  get: () => props.showChooseFacility,
  set: (val) => emit('update:showChooseFacility', val),
});

const emit = defineEmits([
  'save',
  'update:selectedValue',
  'update:showChooseEquivalent',
  'update:showChooseFacility',
]);

const computedSumCalculation: ComputedRef<string> = computed(() => {
  if (
    _selectedValue.value.equivalent != null &&
    _selectedValue.value.equivalent !== '' &&
    _selectedValue.value.rawValue != null &&
    _selectedValue.value.rawValue > 0
  ) {
    return getCalculationSteps(
      _selectedValue.value,
      globalStore.equivalentDict,
    ).join('\n');
  } else {
    return '';
  }
});

/**
 * Sum value needs to be calculated
 */
const computedSumValue = computed(() => {
  return getSumForInput(_selectedValue.value, globalStore.equivalentDict);
});
const scaledSumValue = computed(() => {
  return globalStore.displayInTons
    ? toTons(computedSumValue.value)
    : computedSumValue.value;
});

/**
 * The equivalent entry for the selected value as name
 */
const choosenEquivalent: ComputedRef<null | EquivalentEntry> = computed(() => {
  try {
    return globalStore.equivalentDict[_selectedValue.value.equivalent ?? ''];
  } catch (e) {
    return null;
  }
});
</script>
