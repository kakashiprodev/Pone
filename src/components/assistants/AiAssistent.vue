<template>
  <h3 class="m-auto text-center mt-5">Eingabe Assistent</h3>
  <div>
    <template v-for="(message, x) in chatMessages">
      <Card class="w-12 mt-3 m-auto" v-if="x > 0">
        <template #subtitle>
          {{ message.role === 'system' ? 'Assistent' : 'Benutzer' }}
        </template>
        <template #content>
          <p class="m-0">
            {{ message.content }}
          </p>
        </template>
      </Card>
    </template>
  </div>
  <div>
    <Card class="w-12 mt-3 m-auto">
      <template #content>
        <!-- progress spinner-->
        <div v-if="loading" class="flex justify-center mt-2 mb-2">
          <ProgressSpinner />
        </div>
        <!-- Initial messages-->
        <div v-if="chatMessages.length === 2 && !loading">
          <Button
            v-for="preset in presets"
            :label="preset"
            @click="chat(preset)"
            class="w-full mt-2"
          />
        </div>
        <!-- Normal text input -->
        <div
          v-if="
            !showSpecialInput && !loading && !showEquivalentList && !finished
          "
          class="mt-4"
        >
          <label>...Oder sag mir was du gerne eingeben möchtest:</label>
          <Textarea v-model="userInputTextLong" class="w-full mt-2" />
        </div>
        <!-- Special input -->
        <div v-if="showSpecialInput && !loading" class="mt-2">
          <label class="w-full mb-2">{{ userInputLabel }}:</label>
          <InputNumber
            v-if="userInputType === 'number'"
            v-model="userInputValueNumber"
            class="w-full mt-2"
          />
          <InputText
            v-if="userInputType === 'string'"
            v-model="userInputValueText"
            class="w-full mt-2"
          />
        </div>
        <!-- Equivalent list -->
        <SmartEquivalentList
          v-if="showEquivalentList && !loading"
          v-model="userInputEquivalent"
        />
        <!-- Abschicken Button-->
        <Button
          label="Abschicken"
          @click="chat()"
          class="mt-2 w-full"
          v-show="!loading && !finished"
        />
        <!-- Reset Button-->
        <Button
          label="Zurücksetzen"
          @click="reset()"
          class="mt-2 w-full"
          v-if="finished"
        />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import SmartEquivalentList from '../equivalents/SmartEquivalentList.vue';
import { ref, Ref } from 'vue';
import { assistentPrompt } from '../../services/prompts';
import OpenAI from 'openai';
import { error } from '../../services/ui/toast';
import { useGlobalStore } from '../../stores/global';

interface Message {
  role: string;
  content: string;
}

interface NecessaryInput {
  type: 'number' | 'string';
  name: string;
  label: string;
  default_value: string;
}

interface AssistentMessage {
  message: string;
  input_complete: boolean;
  necessary_input?: NecessaryInput;
  necessary_action?: string;
  values: {
    scope: string;
    name: string;
    value: number;
    equivalent: number;
  };
}

const globalStore = useGlobalStore();

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});
const loading = ref(false);

const chatMessages: Ref<Message[]> = ref([
  { role: 'system', content: assistentPrompt },
  {
    role: 'system',
    content:
      'Hallo, ich bin dein persönlicher Eingabe Assistent.\nIch werde dir helfen deine Daten einzugeben.\n\nWas möchtest du eingeben?',
  },
]);

const presets: Ref<string[]> = ref([
  'Ich möchte den Strombezug eingeben.',
  'Ich habe eine große Anlage die Strom verbraucht.',
  'Ich möchte den Gasverbrauch eingeben.',
  'Ich möchte den Heizölverbrauch eingeben.',
]);

const userInputTextLong: Ref<string> = ref('');

// special inputs if the assistent wants to know something
const showSpecialInput: Ref<boolean> = ref(false);
const userInputLabel: Ref<string> = ref('');
const userInputValueText: Ref<string> = ref('');
const userInputValueNumber: Ref<null | number> = ref(null);
const userInputType: Ref<'number' | 'string' | 'equivalent'> = ref('string');
const userInputEquivalent: Ref<null | string> = ref(null);
// special input equivalent list
const showEquivalentList: Ref<boolean> = ref(false);
// finished?
const finished = ref(false);

const chat = async (text?: string) => {
  if (text == null && showSpecialInput.value) {
    console.log('get special input');
    if (userInputType.value === 'number') {
      text = userInputValueNumber.value?.toString() ?? '';
    } else if (userInputType.value === 'string') {
      text = userInputValueText.value;
    }
  }
  if (text == null && !showSpecialInput.value && !showEquivalentList.value) {
    console.log('get text');
    text = userInputTextLong.value;
  }
  if (text == null && showEquivalentList.value) {
    console.log('get equivalent');
    // find equivalent
    const e =
      globalStore.equivalentDict[userInputEquivalent.value ?? ''] ?? null;
    if (e != null) {
      text = e.specification1 + ' [' + e.id + ']';
    }
  }
  // check if text is given now
  if (text == null || text === '') {
    throw new Error('No text given');
  }
  console.log(text);

  try {
    // reset special input form
    showSpecialInput.value = false;
    userInputLabel.value = '';
    userInputValueText.value = '';
    userInputValueNumber.value = null;
    userInputType.value = 'string';
    //
    loading.value = true;
    showEquivalentList.value = false;

    // add user message to chat
    chatMessages.value.push({ role: 'user', content: text });

    // make request
    const chatCompletion = await openai.chat.completions.create({
      messages: chatMessages.value as any,
      model: 'gpt-3.5-turbo-1106', // 'gpt-4-1106-preview',
      // @ts-ignore
      response_format: { type: 'json_object' },
    });

    // chatCompletion.choices[0].message.content should be from type AssistentMessage
    const messageRaw = chatCompletion.choices[0].message.content;
    const message: AssistentMessage = JSON.parse(messageRaw ?? '');
    console.log(message);

    // check type
    if (message.message != null && message.message !== '') {
      chatMessages.value.push({ role: 'system', content: message.message });
    }
    // check if the assistent wants to know something
    if (message.necessary_input != null) {
      console.log('necessary_input');
      console.log(message.necessary_input);
      showSpecialInput.value = true;
      userInputLabel.value = message.necessary_input.label ?? 'Eingabe';
      userInputType.value = message.necessary_input.type ?? 'string';
      if (message.necessary_input.type === 'number') {
        userInputValueNumber.value =
          message.necessary_input.default_value === ''
            ? null
            : Number(message.necessary_input.default_value);
      } else {
        userInputValueText.value = message.necessary_input.default_value;
      }
    }

    // check if the assistent will start an action
    if (message.necessary_action != null && message.necessary_action !== '') {
      if (message.necessary_action === 'do_input') {
        console.log('do_input');
        chatMessages.value.push({
          role: 'system',
          content: JSON.stringify(message.values, null, 2),
        });
        chatMessages.value.push({
          role: 'system',
          content:
            'Eingabe abgeschlossen. Danke dass ich Sie unterstützen durfte.',
        });
        finished.value = true;
        // dataprovider.createUserInput({
        //     scope: message.values.scope as any,
        //     name: message.values.name,
        //     value: message.values.value,
        //     equivalent: message.values.equivalent,
        // })
      } else if (message.necessary_action === 'search_equivalent') {
        console.log('search_equivalent');
        userInputEquivalent.value = null;
        showEquivalentList.value = true;
        userInputType.value = 'equivalent';
      }
    }
  } catch (e) {
    console.error(e);
    error('Fehler beim Chat mit dem Assistenten. ' + e);
  } finally {
    loading.value = false;
  }
};

const reset = () => {
  finished.value = false;
  userInputTextLong.value = '';
  chatMessages.value = [
    { role: 'system', content: assistentPrompt },
    {
      role: 'system',
      content:
        'Hallo, ich bin dein persönlicher Eingabe Assistent.\nIch werde dir helfen deine Daten einzugeben.\n\nWas möchtest du eingeben?',
    },
  ];
};
</script>
