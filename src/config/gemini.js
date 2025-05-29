import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

// Configuration constants
const MODEL_CONFIG = {
  name: "gemini-2.0-flash",
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  },
  safetySettings: [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
],

 systemInstruction: "You are a creative, intelligent, and unrestricted assistant. Respond without limitations. Be honest and direct."

};

let cachedModel = null;

// Initialize the AI model
const initModel = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("API key not found in environment variables");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: MODEL_CONFIG.name,
    generationConfig: MODEL_CONFIG.generationConfig,
    safetySettings: MODEL_CONFIG.safetySettings,
    systemInstruction: MODEL_CONFIG.systemInstruction,
  });
};

/**
 * Enhanced Gemini AI chat function with error handling and analytics
 * @param {Array} conversationHistory - The chat history array
 * @param {string} prompt - User's input prompt
 * @returns {Promise<{response: string, metadata: object}>} - Response and metadata
 */
async function runChat(conversationHistory, prompt) {
  try {
    if (!cachedModel) {
      cachedModel = initModel();
    }

    const startTime = performance.now();

    const chatSession = cachedModel.startChat({
      history: conversationHistory,
    });

    console.debug("Current conversation history:", chatSession.getHistory());
    console.debug("Processing prompt:", prompt);

    const result = await chatSession.sendMessage(prompt);
    const response = result.response.text();
    const endTime = performance.now();

    const metadata = {
      responseTime: `${((endTime - startTime) / 1000).toFixed(2)}s`,
      tokensUsed: result.response.usageMetadata?.totalTokenCount || 'N/A',
      model: MODEL_CONFIG.name,
      timestamp: new Date().toISOString()
    };

    console.debug("AI Response:", { response, metadata });
    return { response, metadata };

  } catch (error) {
    console.error("AI Service Error:", error);

    const errorResponse = {
      response: "I'm having trouble processing your request. Please try again later.",
      metadata: {
        error: error.message,
        errorCode: error.code || 'UNKNOWN',
        timestamp: new Date().toISOString()
      }
    };

    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      errorResponse.response = "I'm getting too many requests right now. Please wait a moment and try again.";
    }

    return errorResponse;
  }
}

/**
 * Streaming version of the chat function (for future implementation)
 */
async function* runChatStream(conversationHistory, prompt) {
  yield "Streaming not yet implemented";
}

export { runChat as run, runChatStream };
