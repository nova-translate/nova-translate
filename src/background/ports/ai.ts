import { Storage } from "@plasmohq/storage";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { streamText } from "ai";
import { StorageKeys } from "@/config/storage";
import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";
import { MessageTypes } from "@/config/message";

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

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { uniqueId, text: sourceText } = req.body;
  const modelId = await storage.get(StorageKeys.MODEL_ID);
  const targetLanguage = await storage.get(StorageKeys.TARGET_LANGUAGE);

  const result = streamText({
    model: openAIProvider(modelId),
    prompt: `你是一个翻译专家，你的目标是把任何语言翻译成[${targetLanguage}]，要求是翻译得自然、流畅和地道，同时保持最大程度的字面准确性，保留专业术语的原始形态，不要对翻译进行解释。请翻译下面这句话：${sourceText}`,
    onFinish({ text, finishReason, usage, response }) {
      res.send({
        messageType: MessageTypes.TRANSLATE_TEXT_FINISH,
        data: { uniqueId, finishReason }
      });
    },
    onError({ error }) {
      res.send({
        messageType: MessageTypes.TRANSLATE_TEXT_ERROR,
        data: { uniqueId, error }
      });
    }
  });

  for await (const textPart of result.textStream) {
    res.send({
      messageType: MessageTypes.TRANSLATE_TEXT_PART,
      data: { uniqueId, text: textPart }
    });
  }
};

export default handler;
