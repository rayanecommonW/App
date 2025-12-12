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

type ProviderName = "mistral" | "mock";

type ConversationMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ProviderRequest = {
  sessionId: string;
  personaId: string;
  message: string;
  conversationHistory: ConversationMessage[];
  persona: Persona;
};

type AIProvider = {
  name: ProviderName;
  send: (request: ProviderRequest) => Promise<ChatResponse>;
};

const AI_PROVIDER: ProviderName =
  (process.env.EXPO_PUBLIC_AI_PROVIDER as ProviderName) || "mistral";

const MISTRAL_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_MISTRAL_API_KEY || "",
  model: process.env.EXPO_PUBLIC_MISTRAL_MODEL || "mistral-small-latest",
  baseUrl: process.env.EXPO_PUBLIC_MISTRAL_BASE_URL || "https://api.mistral.ai",
};

const provider = selectProvider(AI_PROVIDER);

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
 * Send a message using the currently selected AI provider.
 * Provider selection is driven by EXPO_PUBLIC_AI_PROVIDER to keep us
 * ready for future provider swaps.
 */
export async function sendMessageLocal(
  sessionId: string,
  message: string,
  personaId: string,
  conversationHistory: { role: string; content: string }[],
  persona: Persona
): Promise<ChatResponse> {
  const normalizedHistory: ConversationMessage[] = conversationHistory.map(
    (entry) => ({
      role:
        entry.role === "assistant"
          ? "assistant"
          : entry.role === "system"
          ? "system"
          : "user",
      content: entry.content,
    })
  );

  return provider.send({
    sessionId,
    personaId,
    message,
    conversationHistory: normalizedHistory,
    persona,
  });
}

function selectProvider(name: ProviderName): AIProvider {
  if (name === "mock") {
    return createMockProvider();
  }

  if (!MISTRAL_CONFIG.apiKey) {
    console.warn(
      "EXPO_PUBLIC_MISTRAL_API_KEY not set, falling back to mock responses"
    );
    return createMockProvider();
  }

  return createMistralProvider();
}

function createMistralProvider(): AIProvider {
  const baseUrl = MISTRAL_CONFIG.baseUrl.replace(/\/$/, "");

  return {
    name: "mistral",
    async send(request: ProviderRequest): Promise<ChatResponse> {
      const systemPrompt = generateSystemPrompt(request.persona);
      const history = buildHistory(request.conversationHistory, request.message);

      const body = {
        model: MISTRAL_CONFIG.model,
        temperature: 0.7,
        max_tokens: 120,
        messages: [{ role: "system", content: systemPrompt }, ...history],
      };

      try {
        const response = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${MISTRAL_CONFIG.apiKey}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          console.warn(
            `Mistral API returned ${response.status}: ${response.statusText}`
          );
          return mockResponse();
        }

        const data = await response.json();
        const aiMessage = extractMessage(data);
        const typingDelay = calculateTypingDelay(aiMessage);

        return { message: aiMessage, typingDelay };
      } catch (error) {
        console.error("Mistral AI error:", error);
        return mockResponse();
      }
    },
  };
}

function createMockProvider(): AIProvider {
  return {
    name: "mock",
    async send(): Promise<ChatResponse> {
      return mockResponse();
    },
  };
}

function buildHistory(
  conversationHistory: ConversationMessage[],
  latestUserMessage: string
): ConversationMessage[] {
  const formatted: ConversationMessage[] = conversationHistory
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

  const last = formatted[formatted.length - 1];
  const latestAlreadyIncluded =
    last && last.role === "user" && last.content === latestUserMessage;

  if (!latestAlreadyIncluded) {
    formatted.push({ role: "user", content: latestUserMessage });
  }

  return formatted;
}

function extractMessage(data: any): string {
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        return "";
      })
      .join("")
      .trim();
  }

  return "sorry, the bot is taking a break right now";
}

function calculateTypingDelay(text: string): number {
  const length = Math.max(20, text.length);
  return Math.min(1000 + length * 60 + Math.random() * 2000, 5000);
}

// Mock responses for when API is unavailable (fallback)
function mockResponse(): ChatResponse {
  const responses = ["api is not available"];

  const message = responses[Math.floor(Math.random() * responses.length)];
  const typingDelay = 1500 + Math.random() * 2000;

  return { message, typingDelay };
}
