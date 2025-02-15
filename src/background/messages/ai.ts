import { Storage } from "@plasmohq/storage";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { generateText } from "ai";
import { StorageKeys } from "@/config/storage";
import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";

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
    console.log("apiUrl1", c.newValue);
    initOpenAIProvider();
  },
  [StorageKeys.API_KEY]: (c) => {
    console.log("apiKey1", c.newValue);
    initOpenAIProvider();
  }
});

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { text: sourceText } = req.body;
  const modelId = await storage.get(StorageKeys.MODEL_ID);

  const result = await generateText({
    model: openAIProvider(modelId),
    prompt: `下面我让你来充当翻译家，你的目标是把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。请翻译下面这句话：${sourceText}`
  });

  const { text } = result;
  res.send({ text });
};

export default handler;
