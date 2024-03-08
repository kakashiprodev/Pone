<template>
  <h4 v-if="label">
    {{ label }}
  </h4>
  <DataTable class="cst-no-hover" :value="innerData">
    <Column field="name" :header="header[0]"></Column>
    <Column field="status" :header="header[1]" v-if="showStatusColumn">
      <template #body="{ data }">
        <div
          style="height: 20px; width: 20px; border-radius: 10px"
          :style="
            data.status
              ? 'background-color: grey'
              : `background-color: ${Config.colors.data2}`
          "
        ></div>
      </template>
    </Column>
    <Column field="value" :header="header[2]">
      <template #body="{ data }">
        <!-- <ProgressBar :value="data.percentage" v-if="!data.targetValue">
          {{ round(toTons(data.value, globalStore.displayInTons)) }}
        </ProgressBar> -->
        <ProgressBarWithTarget
          :value="data.percentage"
          :target-value="data.targetValue ?? undefined"
          :color="data.color ?? Config.colors.data2"
        >
          {{ round(toTons(data.value, globalStore.displayInTons)) }}
        </ProgressBarWithTarget>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { PropType, ref, onMounted, watch } from 'vue';
import { round, toTons } from '../../../../services/pipes/index';
import { useGlobalStore } from '../../../../stores/global';
import ProgressBarWithTarget from './ProgressBarWithTarget.vue';
import Config from '../../../../config';

const globalStore = useGlobalStore();

interface Data {
  name: string;
  status: boolean;
  value: number;
  color?: string;
  targetValue?: number;
}

interface InnerData {
  name: string;
  status: boolean;
  value: number;
  percentage: number;
}
const sum = ref(0);
const innerData = ref<InnerData[]>([]);
const props = defineProps({
  data: {
    type: Object as PropType<Data[]>,
    required: true,
  },
  showStatusColumn: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  header: {
    type: Object as PropType<string[]>,
    required: true,
  },
  useMaximumAsReference: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  label: {
    type: String,
    required: false,
  },
});

const renderData = () => {
  if (props.useMaximumAsReference) {
    sum.value = props.data.reduce((acc, cur) => Math.max(acc, cur.value), 0);
  } else {
    sum.value = props.data.reduce((acc, cur) => acc + cur.value, 0);
  }
  // now recalculating the percentage for each item
  innerData.value = props.data.map((item) => {
    return {
      ...item,
      percentage: (item.value / sum.value) * 100,
    };
  });
};

onMounted(() => {
  renderData();
});

watch(
  () => props.data,
  () => {
    renderData();
  },
);
</script>
