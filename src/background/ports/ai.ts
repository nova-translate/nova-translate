import { Storage } from "@plasmohq/storage";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { streamObject, streamText } from "ai";
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

const SingleWordInfoSchema = z.object({
  translation: z.string(),
  partOfSpeech: z.string(),
  examples: z.array(z.object({ id: z.string(), source: z.string(), target: z.string() }))
});

export type SingleWordInfoType = z.infer<typeof SingleWordInfoSchema>;

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { uniqueId, textType, text: sourceText } = req.body as { uniqueId: string; textType: TextTypes; text: string };
  const modelId = await storage.get(StorageKeys.MODEL_ID);
  const targetLanguage = await storage.get(StorageKeys.TARGET_LANGUAGE);

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
      prompt: `Your goal is to translate words from any language into [${targetLanguage}].
      Here are the specific requirements:
      1. Provide word translation;
      2. Provide part of speech (using the target language);
      3. Provide multiple sentence examples;
      Please translate the following word: ${sourceText}`,
      schema: SingleWordInfoSchema,
      onFinish({ object }) {
        if (object === undefined) return;

        res.send({
          messageType: MessageTypes.TRANSLATE_TEXT_FINISH,
          data: { uniqueId, textType }
        });
      },
      onError({ error }) {
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
