import { OpenAI } from 'openai';
import { ChatCompletionMessage } from 'openai/resources/index.mjs';

const TEXT_MODEL = 'gpt-4-turbo';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY ?? '',
  dangerouslyAllowBrowser: true,
});

/**
 * Generate a summary for the given text using the OpenAI API.
 */
export async function generateSummary(text: string) {
  const response = await openai.chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a professional writer and you have been asked to write a short and relevant summary of the following text.
        You will do the summary in the given user language!`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
  });
  return response.choices[0].message.content;
}

/**
 * Custom ChatCompletion function to generate a response for the given prompt in JSON format.
 */
export async function jsonChatCompletion(messages: ChatCompletionMessage[]) {
  const completion = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-4-turbo',
    response_format: { type: 'json_object' },
  });

  const response = completion.choices[0].message.content;
  const parsedResponse = JSON.parse(response ?? '');

  return parsedResponse;
}

/**
 * Custom ChatCompletion function to generate a response for the given prompt.
 */
export async function textChatCompletion(messages: ChatCompletionMessage[]) {
  const completion = await openai.chat.completions.create({
    messages: messages,
    model: TEXT_MODEL,
  });

  return completion.choices[0].message.content ?? '';
}

/**
 * Use OpenAI for STT
 */
export const speechToText = async (audio: Blob) => {
  // convert blob to a file that can be uploaded to openai
  const file = new File([audio], 'audio.mp3', { type: 'audio/mp3' });
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
  });
  return transcription.text;
};

/**
 * Use OpenAI for TTS
 */
export const textToSpeech = async (text: string) => {
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text,
  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  // generate URL for the audio file
  const blob = new Blob([buffer], { type: 'audio/mp3' });
  const url = URL.createObjectURL(blob);
  return url;
};

/**
 * Use OpenAI for Image Generation
 */
export const generateImage = async (prompt: string) => {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
  });
  const image_url = response.data[0].url;
  if (!image_url) {
    throw new Error('Failed to generate image');
  }
  // download the image and save it to the images folder
  // the url will be a web url, so we need to download it
  const imageBuffer = await (await fetch(image_url)).arrayBuffer();
  return imageBuffer;
};
