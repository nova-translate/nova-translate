import { Storage } from "@plasmohq/storage";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { generateObject, generateText, streamObject, streamText } from "ai";
import { StorageKeys } from "@/config/storage";
import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";
import { MessageTypes } from "@/config/message";
import { SYSTEM_PROMPT } from "@/config/prompts";
import { TextTypes } from "@/config/common";
import { z } from "zod";

const storage = new Storage();

let openAIProvider: OpenAIProvider;
const initOpenAIProvider = async () => {
  const apiKey = await storage.get(StorageKeys.API_KEY);
  const baseURL = await storage.get(StorageKeys.API_URL);
  openAIProvider = createOpenAI({ baseURL, apiKey });
};
initOpenAIProvider();

storage.watch({
  [StorageKeys.API_URL]: (c) => {
    initOpenAIProvider();
  },
  [StorageKeys.API_KEY]: (c) => {
    initOpenAIProvider();
  }
});

const InputTextTypeSchema = z.object({
  textType: z.enum([TextTypes.LONG_TEXT, TextTypes.SINGLE_WORD]),
  languageTag: z.string()
});

const SingleWordInfoSchema = z.object({
  pronunciation: z.string(),
  partOfSpeech: z.string(),
  translation: z.array(z.string()),
  examples: z.array(z.object({ id: z.string(), source: z.string(), target: z.string() }))
});

export type SingleWordInfoType = z.infer<typeof SingleWordInfoSchema>;

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { uniqueId, text: sourceText, context } = req.body as { uniqueId: string; text: string; context: string };
  const modelId = await storage.get(StorageKeys.MODEL_ID);
  const targetLanguage = await storage.get(StorageKeys.TARGET_LANGUAGE);

  const { object } = await generateObject({
    model: openAIProvider(modelId),
    system: SYSTEM_PROMPT,
    schema: InputTextTypeSchema,
    prompt: `
    # Goals
    1. Detect the language of the input text;
    2. Determine if it is a single word or long text;

    # Specific Requirements
    1. Based on the context;
    2. Provide language tag, such as "en", "zh-CN", "ja", etc.;
    3. Provide text type, such as "${TextTypes.SINGLE_WORD}" or "${TextTypes.LONG_TEXT}";

    ## Context
    The context is: [${context}];

    ## Input
    The input text is: [${sourceText}];
    `
  });

  const { textType } = object;

  if (textType === TextTypes.LONG_TEXT) {
    const result = streamText({
      model: openAIProvider(modelId),
      system: SYSTEM_PROMPT,
      prompt: `Your goal is to translate any language into [${targetLanguage}].
      Here are the specific requirements:
      1. Translate naturally, fluently, and idiomatically while maintaining the highest degree of literal accuracy;
      2. Retain the original form of professional terms;
      3. Do not explain the translation result;
      4. Use spaces reasonably to make the result more readable, for example, by separating Chinese and English with spaces;
      5. If the provided language and the target language are the same, return it as is;
      Please translate the following sentence: ${sourceText}`,
      onFinish({ finishReason }) {
        res.send({
          messageType: MessageTypes.TRANSLATE_TEXT_FINISH,
          data: { uniqueId, textType, finishReason }
        });
      },
      onError({ error }) {
        res.send({
          messageType: MessageTypes.TRANSLATE_TEXT_ERROR,
          data: { uniqueId, textType, error }
        });
      }
    });

    for await (const textPart of result.textStream) {
      res.send({
        messageType: MessageTypes.TRANSLATE_TEXT_PART,
        data: { uniqueId, textType, text: textPart }
      });
    }

    return;
  }

  if (textType === TextTypes.SINGLE_WORD) {
    const result = streamObject({
      model: openAIProvider(modelId),
      system: SYSTEM_PROMPT,
      schema: SingleWordInfoSchema,
      prompt: `Your goal is to translate words from any language into [${targetLanguage}].
      Here are the specific requirements:
      1. Provide word translation;
      2. If the source language has pronunciation (such as phonetic symbols, pinyin, etc.), please provide it;
      3. Provide part of speech (using the source language);
      4. Provide 3 sentence examples;
      5. If the provided language and the target language are the same, return it as is;
      6. The result should be consistent with the context, the context is: [${context}];
      Please translate the following word: [${sourceText}]`,
      onFinish({ object }) {
        if (object === undefined) return;

        res.send({
          messageType: MessageTypes.TRANSLATE_TEXT_FINISH,
          data: { uniqueId, textType }
        });
      },
      onError({ error }) {
        console.error(error);
        res.send({
          messageType: MessageTypes.TRANSLATE_TEXT_ERROR,
          data: { uniqueId, textType, error }
        });
      }
    });

    for await (const partialObject of result.partialObjectStream) {
      res.send({
        messageType: MessageTypes.TRANSLATE_TEXT_PART,
        data: { uniqueId, textType, wordData: partialObject }
      });
    }
  }
};

export default handler;
