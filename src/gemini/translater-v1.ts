// node --version # Should be >= 18
// npm install @google/generative-ai

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const MODEL_NAME = "gemini-pro";
const API_KEY = "YOUR_API_KEY";

export async function run() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
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

  const parts = [
    { text: "You are a professional translater. Translate sentences into literal and free translations respectively. Shakespeare put his hometown on the map." },
    { text: "target sentence: To carry coal to Newcastle" },
    { text: "literal translation from English to Chinese: 把煤炭运到纽卡斯尔" },
    { text: "free translation from English to Chinese: 多此一举" },
    { text: "target sentence: Shakespeare put his hometown on the map." },
    { text: "literal translation from English to Chinese: 莎士比亚把他的家乡放在了地图上" },
    { text: "free translation from English to Chinese: 莎土比亚使他的家乡声名远扬" },
    { text: "target sentence: Is it a good place to raise a family?" },
    { text: "literal translation from English to Chinese: 那里是不是一个好地方去供养家庭？" },
    { text: "free translation from English to Chinese: 那里是不是一个安家落户的好地方？" },
    { text: "target sentence: so fond of something that one cannot take one's hands off it." },
    { text: "literal translation from English to Chinese: 对某事非常喜爱以至于舍不得放手" },
    { text: "free translation from English to Chinese: 爱不释手" },
    { text: "target sentence: the love for somebody or something extends to everything related with it" },
    { text: "literal translation from English to Chinese: 对某人或某物的爱延伸到与之相关的一切" },
    { text: "free translation from English to Chinese: 爱屋及乌" },
    { text: "target sentence: remain in one's proper sphere; abide by law and behave oneself" },
    { text: "literal translation from English to Chinese: 留在自己的适当范围内；遵守法律并表现良好" },
    { text: "free translation from English to Chinese: 安分守己" },
    { text: "target sentence: Such a vicious lie injures people by sordid means." },
    { text: "literal translation from English to Chinese: " }
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings
  });

  const response = result.response;
  console.log(response.text());
}
