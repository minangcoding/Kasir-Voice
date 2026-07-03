const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyCY1XKzDsmF2UgKd_G8fJTFS-L8bjBNoQA";
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log(`Success with ${modelName}`);
    return true;
  } catch (error) {
    console.error(`Error with ${modelName}:`, error.message);
    return false;
  }
}

async function run() {
  const modelsToTest = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-3.0-flash",
    "gemini-1.0-pro"
  ];

  for (const m of modelsToTest) {
    const ok = await testModel(m);
    if (ok) break;
  }
}

run();
