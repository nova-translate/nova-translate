import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

import { TranslationType } from "~config/common";

const MODEL_NAME = "gemini-pro";
const PromptConfig = {
  [TranslationType.LITERAL]: "word-for-word literal translation from English to Chinese",
  [TranslationType.FREE]: "sense-for-sense free translation from English to Chinese"
};

export async function translateByV1(options: { apiKey: string; sourceText: string; type: TranslationType }) {
  const genAI = new GoogleGenerativeAI(options.apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
    }
  ];

  const parts = [{ text: `${options.sourceText}\n\n${PromptConfig[options.type]}` }];

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings
    });

    const response = result.response;
    console.log(response.text());
    return { text: response.text(), errorMessage: null };
  } catch (error) {
    console.log(error);
    return { text: null, errorMessage: error.message };
  }
}
