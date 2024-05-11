<template>
  <div v-if="!active" class="flex justify-content-center mt-3 mb-3">
    <Button @click="active = true" label="Weiteren Eintrag hinzufügen" />
  </div>
  <div v-else class="w-full">
    <InlineMessage
      v-if="seemsToBeDone"
      severity="info"
      class="w-full mt-2 mb-4"
    >
      Ihre Antworten scheinen den Themenbereich vollständig zu beantworten. Sie
      können optional noch weitere Informationen hinzufügen.
    </InlineMessage>

    <div class="text-lg p-1">
      <p v-if="fullSummary.length < 1">
        Fügen Sie hier eine neue Information/Maßnahme oder Strategie hinzu, die
        zur folgenden Frage passt:
      </p>
      <p v-if="!isDone">
        {{ actualQuestion }}
      </p>
    </div>

    <div>
      <Textarea
        v-if="!isDone"
        v-model="actualUsersInput"
        placeholder="Bitte geben Sie Ihre Antwort stichpunktartig ein. Kurz und prägnant ist hier gefragt."
        class="w-full mt-3 h-20rem"
      />
      <div class="flex mt-3 gap-1" v-if="!isDone">
        <Button
          @click="startRecording()"
          :disabled="loading"
          v-if="!isRecording"
        >
          <i class="fa-solid fa-microphone"></i>
        </Button>
        <Button @click="stopRecording()" v-if="isRecording">
          <i class="fa-solid fa-stop"></i>
        </Button>
        <Button
          :disabled="loading || actualUsersInput.length < 1"
          @click="goOnWithInterview()"
          class="w-full"
          :loading="loading"
          label="Weiter"
        />
      </div>
    </div>

    <div class="p-1 mt-3" v-if="fullSummary.length > 0">
      <div class="mt-3" v-show="isDone">
        Gesammelte Informationen:
        <!-- List of all summaries -->
        <ul>
          <li v-for="summary in fullSummary" :key="summary">{{ summary }}</li>
        </ul>
      </div>

      <div class="flex gap-3">
        <span>Der Themenpunkte ist hiermit vollständig beantwortet</span>
        <Checkbox v-model="isDone" :binary="true" />
      </div>

      <div class="flex mt-3" v-if="isDone">
        <Button
          :disabled="loading"
          @click="emitResults()"
          label="Abschicken und Texte generieren"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Textarea from 'primevue/textarea';
import { ref, watch } from 'vue';
import {
  speechToText,
  // textToSpeech,
  textChatCompletion,
  jsonChatCompletion,
} from './../../services/openai';
import { UsersTopicAnswer } from './../../services/csrd-esrs/topics';
import { useGlobalStore } from './../../stores/global';

const globalStore = useGlobalStore();

const props = defineProps<{
  initialQuestion: string;
  collectedInformation: string[];
  topicId: string;
  topicsExisting: boolean;
}>();

const active = ref<boolean>(!props.topicsExisting);

/**
 * Watch "props", If the initial question changes, update the actual question and reset the form
 */
watch(
  () => props.initialQuestion,
  (newValue) => {
    actualQuestion.value = newValue;
    fullSummary.value = [];
    fullInterview.value = [];
    actualUsersInput.value = '';
    isDone.value = false;
    seemsToBeDone.value = false;
    active.value = !props.topicsExisting;
  },
);

const emit = defineEmits(['submit']);

// function to record audio via Browsers native API
let mediaRecorder: MediaRecorder | null = null;
const isRecording = ref<boolean>(false);
const actualQuestion = ref<string>(props.initialQuestion);

/**
 * State
 */
const loading = ref<boolean>(false);
const ttsOrSttLoading = ref<boolean>(false);

/**
 * TTS recording
 */
const startRecording = () => {
  loading.value = true;
  isRecording.value = true;
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(async (stream) => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      mediaRecorder.ondataavailable = async (e) => {
        console.log(e.data);
        const audio = new Blob([e.data], { type: 'audio/mp3' });

        ttsOrSttLoading.value = true;
        const text = await speechToText(audio);
        ttsOrSttLoading.value = false;

        actualUsersInput.value = text;
        loading.value = false;
        goOnWithInterview();
      };
    })
    .catch((err) => {
      console.error('Error: ' + err);
      loading.value = false;
    });
};

/**
 * Stop recording handler
 */
const stopRecording = () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
    isRecording.value = false;
  }
};

const fullSummary = ref<string[]>([]);
const actualUsersInput = ref<string>('');
const seemsToBeDone = ref<boolean>(false);
const isDone = ref<boolean>(false);

interface InterviewChat {
  question: string;
  answer: string;
}
const fullInterview = ref<InterviewChat[]>([]);

/**
 * Helper to check if the user has already answered the question
 */
const isFullyAnswered = async () => {
  loading.value = true;
  const messages: any = [
    {
      role: 'system',
      content: `You are a professional consultant checking information from buisness partners.
      You will check if the user has already answered the question in a detailed manner.
      The question was: ${props.initialQuestion}.
      You will only answer with 'yes' or 'no'!
      `,
    },
    {
      role: 'system',
      content: `The user gave this information: ${fullSummary.value
        .map((s) => s)
        .join('\n')}`,
    },
    {
      role: 'user',
      content: 'The user has answered the question in a detailed manner?',
    },
  ];

  const response = await textChatCompletion(messages);

  if (response.toLowerCase().indexOf('yes') > -1) {
    return true;
  }

  loading.value = false;
  return false;
};

/**
 * Transmit results
 */
const emitResults = async () => {
  if (!globalStore.selectedReport) {
    console.error('No report selected');
    return;
  }

  loading.value = true;
  const summary = await textChatCompletion(<any>[
    {
      role: 'system',
      content: `You are a professional writer. You will create a summary of a interview.
      There will be no context of an interview in the summary. You will provide an text like an article.
      You will start by giving an information about the main question: "${props.initialQuestion}".

      You will summarize and write in the language of the user.
      You will then summarize the information the user gave you:`,
    },
    {
      role: 'user',
      content: `${fullSummary.value.map((s) => s).join('\n')}`,
    },
  ]);

  const topicHeader = await textChatCompletion(<any>[
    {
      role: 'system',
      content: `You are a professional writer.
      You will give a short header for the topic: "${summary}".
      The header will be focused on the actions and not the reasons.
      `,
    },
  ]);

  const res: UsersTopicAnswer = {
    id: 'new',
    report: globalStore.selectedReport.id,
    topicId: props.topicId,
    topicHeader: topicHeader,
    collectedInformation: fullSummary.value,
    isDone: true,
    summary: summary,
  };

  emit('submit', res);
  loading.value = false;

  // reset form and set active to false
  fullSummary.value = [];
  fullInterview.value = [];
  actualUsersInput.value = '';
  actualQuestion.value = props.initialQuestion;
  isDone.value = false;
  seemsToBeDone.value = false;
  active.value = false;
};

/**
 * Main function to go on with the interview
 */
const goOnWithInterview = async () => {
  loading.value = true;
  try {
    if (actualUsersInput.value.length === 0) {
      throw new Error('No input given');
    }

    const messages: any = [
      {
        role: 'system',
        content: `
          As Interview Moderator your primary function is to conduct interviews with users in an interactive and engaging manner.
          You are a professional product owner and product manager guiding the user through the interview process.
          You will be asking questions and guiding the conversation. Your goal is to get as many information about the product as possible.

          You will guide the user through the interview process by asking questions and guiding the conversation.
          The main goal ist to answer the question: "${props.initialQuestion}".

          You will response to the user's answers and ask follow-up questions.
          You will always response in a JSON format like this:
          {
              "response": string // Your next question here!
              "summaryOfTheLastUsersAnswer": string // Summary of the last user's answer here in a few neutral words
          }
          You will always response in the language of the user.
          `,
      },
      {
        role: 'system',
        content: `Your last question was: ${actualQuestion.value}.
        The actual summary is:
        ${fullSummary.value.join('\n')}.

        Go on with the interview.
        `,
      },
      {
        role: 'user',
        content: actualUsersInput.value,
      },
    ];

    const response = await jsonChatCompletion(messages);

    if (!response.summaryOfTheLastUsersAnswer && !response.response) {
      throw new Error('Invalid response from the server');
    }

    // update summary
    fullInterview.value.push({
      question: actualQuestion.value,
      answer: actualUsersInput.value,
    });

    if (
      response.summaryOfTheLastUsersAnswer &&
      response.summaryOfTheLastUsersAnswer.length > 0
    ) {
      fullSummary.value.push(response.summaryOfTheLastUsersAnswer);
    }

    // update question
    if (response.response) {
      actualQuestion.value = response.response;
    }

    // reset from
    actualUsersInput.value = '';

    // check if the user has answered the question
    const finished = await isFullyAnswered();
    if (finished) {
      seemsToBeDone.value = true;
      isDone.value = true;
    }
  } catch (error) {
    console.error(error);
  }
  loading.value = false;
};
</script>
