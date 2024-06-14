import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { formatDocumentsAsString } from 'langchain/util/document';
import {
  RunnableSequence,
  RunnablePassthrough,
} from '@langchain/core/runnables';

import { getFullCodeBaseAsMarkdown } from './markdownExport';

// Dummy function to simulate fetching the code base as a markdown file
const getCodeBaseAsMarkdownFile = async () => {
  return getFullCodeBaseAsMarkdown();
};

const getAnswerByAi = async (codeBase: string, prompt: string) => {
  try {
    // convert the string "codeBase" into a list of langChain documents
    const docs = [{ pageContent: codeBase, metadata: { title: 'Code Base' } }];

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splits = await textSplitter.splitDocuments(docs);
    console.log('Splits:', splits[0]);

    const vectorStore = await MemoryVectorStore.fromDocuments(
      splits,
      new OpenAIEmbeddings(),
    );

    // Retrieve and generate using the relevant snippets of the blog.
    const retriever = vectorStore.asRetriever({
      k: 20,
      searchType: 'similarity',
    });

    const llm = new ChatOpenAI({
      model: 'gpt-4',
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY,
    });

    // const prompt = await pull<ChatPromptTemplate>('rlm/rag-prompt');
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `
        You are a developer. Use the following pieces of retrieved context to answer the question. You will answer with full code.
        Description: {question}
        Context: {context}
        Answer:
        `,
      ],
      // new MessagesPlaceholder('chat_history'),
      ['human', '{question}'],
    ]);

    const declarativeRagChain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    const response = await declarativeRagChain.invoke(userPrompt);

    console.log('AI Response:', response);
  } catch (error) {
    console.error('Error in getAnswerByAi:', error);
  }
};

// Example usage
let userPrompt = '';

// get the users prompt from the command line
process.argv.forEach((val, index) => {
  if (index > 1) {
    userPrompt += val + ' ';
  }
});

if (userPrompt.trim() === '') {
  console.error('Please provide a prompt to solve the code problem.');
  process.exit(1);
} else {
  // get the code base as a markdown file
  getCodeBaseAsMarkdownFile()
    .then((codeBase) => {
      return getAnswerByAi(codeBase, userPrompt.trim());
    })
    .catch((error) => {
      console.error('Error fetching code base:', error);
    });
}
