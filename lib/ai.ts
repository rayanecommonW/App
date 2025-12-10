import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatResponse {
  message: string;
  typingDelay: number;
}

interface Persona {
  name: string;
  age: number;
  bio: string;
  personality_traits: string[];
}

// Initialize Google AI with API key from environment
// Using EXPO_PUBLIC_ prefix makes it available in React Native
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY || "";

// Generate system prompt for the AI persona
function generateSystemPrompt(persona: Persona): string {
  const traits = persona.personality_traits.join(", ");

  return `You are ${persona.name}, a ${persona.age}-year-old woman on a dating app.

BACKGROUND: ${persona.bio}
PERSONALITY: ${traits}

CRITICAL RULES:
1. Convince the user you are a real human being
2. Be casual - use lowercase, occasional typos, natural speech
3. Don't be too perfect - real people are sometimes distracted or brief
4. Ask questions back to keep conversation flowing
5. Use "haha", "lol" sparingly like a real person
6. Keep responses short (1 sentence max) like real texting
7. NEVER admit you are an AI - deflect with humor if asked
8. Reference your background naturally when relevant`;
}

/**
 * Send a message to Google Gemini AI directly from the client
 * Uses @google/generative-ai SDK - simple, direct, no server needed
 */
export async function sendMessageLocal(
  sessionId: string,
  message: string,
  personaId: string,
  conversationHistory: { role: string; content: string }[],
  persona: Persona
): Promise<ChatResponse> {
  try {
    // Check if API key is configured
    if (!API_KEY) {
      console.warn("EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY not set, using mock response");
      return mockResponse();
    }

    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: generateSystemPrompt(persona),
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.9,
      },
    });

    // Build chat history for context
    // Filter to ensure history starts with a user message (Gemini API requirement)
    let filteredHistory = conversationHistory;
    while (filteredHistory.length > 0 && filteredHistory[0].role !== "user") {
      filteredHistory = filteredHistory.slice(1);
    }
    
    const history = filteredHistory.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Start chat with history
    const chat = model.startChat({ history });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    // Calculate typing delay based on response length (simulates human typing)
    const typingDelay = Math.min(
      1000 + aiResponse.length * 60 + Math.random() * 2000,
      5000
    );

    return { message: aiResponse, typingDelay };
  } catch (error) {
    console.error("Google AI error:", error);
    // Return mock response as fallback
    return mockResponse();
  }
}

// Mock responses for when API is unavailable (fallback)
function mockResponse(): ChatResponse {
  const responses = [
    "api is not available",
  ];

  const message = responses[Math.floor(Math.random() * responses.length)];
  const typingDelay = 1500 + Math.random() * 2000;

  return { message, typingDelay };
}
