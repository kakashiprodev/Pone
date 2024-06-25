<template>
  <div class="flex flex-col gap-4">
    <!-- step 1 -->
    <div class="flex flex-col gap-2" v-if="actualComfortStep === 0">
      <SmartEquivalentList
        v-model="_selectedValue.equivalent"
        :comfort-mode="true"
        :rowsPerPage="5"
        :visible-columns="['source', 'in', 'out', 'fullName', 'avgValue']"
        :showColumnChooser="false"
        @change="updateNameAndCategory"
        :hide-scope-input="preSelectedScope != 'all'"
        :filter-by="{
          scope:
            preSelectedScope === 'all' ? [1] : [parseInt(preSelectedScope)],
        }"
      />
    </div>

    <!-- step 2 -->
    <div class="flex flex-col gap-4" v-if="actualComfortStep === 1">
      <div class="flex flex-col gap-2">
        <label for="userinput-category">{{ $t('inputs.category') }}</label>
        <InputText
          class="w-full"
          v-model="_selectedValue.category"
          id="userinput-category"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="userinput-name">{{ $t('inputs.name') }}</label>
        <InputText
          class="w-full"
          v-model="_selectedValue.name"
          id="userinput-name"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="userinput-comment">{{ $t('inputs.comment') }}</label>
        <InputText
          class="w-full"
          v-model="_selectedValue.comment"
          id="userinput-comment"
        />
      </div>
    </div>

    <!-- step 3 -->
    <div class="flex flex-col gap-4" v-if="actualComfortStep === 2">
      <p>{{ $t('inputs.assignFacility') }}</p>
      <div class="flex flex-col gap-2">
        <label for="userinput-equivalent">{{ $t('inputs.facility') }}</label>
        <div>
          <div
            v-if="
              _selectedValue.facility != null && _selectedValue.facility !== ''
            "
            @click="_showChooseFacility = true"
            class="bg-teal-900 text-white rounded-sm m-2 flex items-center justify-center cursor-pointer p-2"
          >
            {{
              globalStore.facilitiesDict[_selectedValue.facility]?.name ?? ''
            }}
          </div>
          <Button
            v-else
            :label="$t('inputs.choose')"
            @click="_showChooseFacility = true"
          />
        </div>
      </div>
    </div>

    <!-- step 4 -->
    <div class="flex flex-col gap-4" v-if="actualComfortStep === 3">
      <div>
        <MonthlyOrYearlyInput
          v-model="_selectedValue"
          :input-unit="choosenEquivalent ? ' ' + choosenEquivalent.in : ''"
        />
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
      </div>
    </div>

    <!-- Step Buttons -->
    <div class="flex items-center justify-center">
      <Button
        :label="$t('inputs.stepBack')"
        @click="decStep"
        class="grow mr-1"
        :disabled="actualComfortStep === 0"
      />
      <Button
        v-if="actualComfortStep < 3"
        :label="$t('inputs.stepForward')"
        @click="incStep"
        class="grow ml-1"
        :disabled="actualComfortStep === 0 && _selectedValue.equivalent == null"
      />
      <Button
        v-else
        :label="$t('inputs.create')"
        @click="() => emit('save')"
        class="grow ml-1"
        :disabled="_selectedValue.raw_value == null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTons } from '@/services/helper';
import MonthlyOrYearlyInput from '../equivalents/MonthlyOrYearlyInput.vue';
import { getCalculationSteps, getSumForInput } from '@/services/reporting';
import { EquivalentEntry, InputEntry } from '@/services/types';
import SmartEquivalentList from '../equivalents/SmartEquivalentList.vue';
import { useGlobalStore } from '@/stores/global';
import { ComputedRef, computed, ref } from 'vue';
import { error } from '@/services/ui/toast';

const globalStore = useGlobalStore();

const props = defineProps<{
  selectedValue: InputEntry;
  preSelectedScope: '1' | '2' | '3' | 'all';
  showChooseFacility: boolean;
}>();
const _selectedValue = computed({
  get: () => props.selectedValue,
  set: (val) => emit('update:selectedValue', val),
});
const _showChooseFacility = computed({
  get: () => props.showChooseFacility,
  set: (val) => emit('update:showChooseFacility', val),
});

const actualComfortStep = ref(0);
const incStep = () => {
  actualComfortStep.value++;
};
const decStep = () => {
  actualComfortStep.value--;
};

const emit = defineEmits([
  'save',
  'update:selectedValue',
  'update:showChooseFacility',
]);

const computedSumCalculation: ComputedRef<string> = computed(() => {
  if (
    _selectedValue.value.equivalent != null &&
    _selectedValue.value.equivalent !== '' &&
    _selectedValue.value.raw_value != null &&
    _selectedValue.value.raw_value > 0
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

/**
 * watch selectedValue.equivalent in comfort mode to change the name and comment
 */
const updateNameAndCategory = () => {
  if (
    _selectedValue.value.equivalent != null &&
    _selectedValue.value.equivalent !== ''
  ) {
    const equivalent =
      globalStore.equivalentDict[_selectedValue.value.equivalent];
    if (equivalent == null) {
      error(
        'Äquivalent wurde im Cache nicht gefunden. Bitte laden Sie die Seite neu.',
      );
      return;
    }
    _selectedValue.value.name = equivalent.specification1;
    _selectedValue.value.comment = equivalent.comment ?? '';
    _selectedValue.value.category = equivalent.category;
  }
};
</script>
