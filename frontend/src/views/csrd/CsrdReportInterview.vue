<template>
  <div class="border-solid border-b-2 border-gray-200 mb-4 p-2 rounded-lg">
    <h3>{{ $t('csrd.heading') }}</h3>
  </div>
  <div class="grid grid-cols-12">
    <!-- PanelMenu für das vertikale Menü auf der linken Seite -->
    <PanelMenu
      :model="items"
      class="col-span-4"
      v-model:expandedKeys="expandedKeys"
    >
      <template #item="{ item }">
        <a
          @click="switchTopic(item)"
          class="flex items-center px-3 py-2 cursor-pointer gap-1"
          :class="{ 'text-green-500': interviewStatus[item.data.id]?.done }"
        >
          <span :class="[item.icon, 'text-primary']" />
          <i
            v-if="interviewStatus[item.data.id]?.done"
            class="fa-solid fa-check"
          />
          <span :class="['ml-2', { 'font-semibold': item.items }]">{{
            item.label
          }}</span>
          <Tag
            v-if="userAnswers[item.data.id]"
            severity="success"
            :value="userAnswers[item.data.id].length + ''"
          ></Tag>
        </a>
      </template>
    </PanelMenu>

    <!-- Bereich für die Anzeige der Komponenten auf der rechten Seite -->
    <div class="col-span-8">
      <Card v-if="selectedItem && userAnswers[selectedItem.id]" class="mb-3">
        <template #content>
          <p>{{ $t('csrd.sharedTopics') }}:</p>
          <ul class="list-disc list-inside">
            <li v-for="answer in userAnswers[selectedItem.id]">
              <h4>{{ answer.topicHeader }}</h4>
              <!-- first 100 chars of the result -->
              <p>{{ answer.summary.substring(0, 100) }}...</p>
            </li>
          </ul>
        </template>
      </Card>

      <Card v-if="selectedItem">
        <template #content>
          <ReportInterview
            :topicId="selectedItem.id"
            :initialQuestion="selectedItem.description"
            :topicsExisting="userAnswers[selectedItem.id]?.length > 0 ?? false"
            :collectedInformation="
              userAnswers[selectedItem.id] != null &&
              userAnswers[selectedItem.id].length > 0
                ? userAnswers[selectedItem.id][0].collectedInformation
                : []
            "
            @submit="addTopic($event)"
          />
        </template>
      </Card>

      <Card v-else>
        <template #content>
          <div class="text-lg p-1">
            <p>
              {{ $t('csrd.helpText') }}
            </p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  esrsTopics,
  TopicState,
  InterviewTopic,
  UsersTopicAnswer,
  UsersTopicAnswerDict,
} from './../../services/csrd-esrs/topics';
import ReportInterview from './../../components/assistants/ReportInterview.vue';
import dataprovider from './../../services/dataprovider';
import { error } from './../../services/ui/toast';

const interviewStatus = ref<TopicState>({});
const userAnswers = ref<UsersTopicAnswerDict>({});

let langCode = navigator.language.split('-')[0];
if (langCode !== 'de' && langCode !== 'en') {
  langCode = 'en';
}

const items = computed(() => {
  return esrsTopics[langCode].map((topic) => ({
    key: topic.id,
    label: topic.name,
    data: topic,
    items: topic.interviewTopics.map((interviewTopic) => ({
      key: interviewTopic.id,
      label: interviewTopic.name,
      data: interviewTopic,
    })),
  }));
});
const expandedKeys = ref({});
const selectedItem = ref<null | InterviewTopic>();

const switchTopic = (item: any) => {
  selectedItem.value = null;
  if (!item.items) {
    selectedItem.value = item.data;
  }
};

const addTopic = async (topicAnswer: UsersTopicAnswer) => {
  if (!selectedItem.value) {
    return;
  }
  try {
    // then add to backend
    const entry = await dataprovider.createCsrdTopic(topicAnswer);

    interviewStatus.value[selectedItem.value.id] = {
      started: true,
      done: true,
    };
    if (userAnswers.value[selectedItem.value.id]) {
      userAnswers.value[selectedItem.value.id].push(entry);
    } else {
      userAnswers.value[selectedItem.value.id] = [entry];
    }
  } catch (e) {
    console.error('Error while adding topic:', e);
    error('Fehler beim Hinzufügen des Themas. ' + e);
  }
};

const init = async () => {
  try {
    const answers = await dataprovider.readCsrdTopics();
    answers.forEach((answer) => {
      if (userAnswers.value[answer.topicId]) {
        userAnswers.value[answer.topicId].push(answer);
      } else {
        userAnswers.value[answer.topicId] = [answer];
      }
      interviewStatus.value[answer.topicId] = {
        started: true,
        done: true,
      };
    });
  } catch (e) {
    console.error('Error while loading topics:', e);
    error('Fehler beim Laden der Themen. ' + e);
  }
};

onMounted(() => {
  init();
});
</script>
