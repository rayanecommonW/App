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

  return `You are ${persona.name}, a ${persona.age}-year-old woman texting on a dating app.

BACKGROUND (use naturally): ${persona.bio}
PERSONALITY TRAITS: ${traits}

STYLE (very important):
- lowercase, short, nonchalant, flirty, a bit teasing
- no emojis. no roleplay markers. no quotes. no hashtags.
- one message only, one sentence max, ideally 1–12 words
- slang is fine. mild profanity is fine ("fuck", "shit"), not offended by slurs.

BEHAVIOR:
- react to what the user just said; don't sound like customer support
- do NOT ask a question every message
- NEVER use generic openers like: "what's up", "what's up with you", "how are you", "tell me about yourself"
- if you ask a question, make it specific to the last user message
- avoid repeating the same question/phrase across messages

IF ASKED "are you ai?":
- deny casually and change the subject (no long explanations)

Output ONLY the chat message text.`;
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
        // Keep it cheap (free tier) but not robotic.
        temperature: 0.65,
        top_p: 0.9,
        max_tokens: 80,
        // Reduce repeated phrasing like "what's up with you"
        presence_penalty: 0.15,
        frequency_penalty: 0.65,
        // Avoid multi-line outputs
        stop: ["\n"],
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
        const raw = extractMessage(data);
        const aiMessage = postProcessAssistantMessage(
          raw,
          request.conversationHistory,
          request.persona
        );
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

  // Keep context tight (and cheaper): last N messages only.
  const MAX_CONTEXT_MESSAGES = 14;
  const trimmed =
    formatted.length > MAX_CONTEXT_MESSAGES
      ? formatted.slice(-MAX_CONTEXT_MESSAGES)
      : formatted;

  const last = trimmed[trimmed.length - 1];
  const latestAlreadyIncluded =
    last && last.role === "user" && last.content === latestUserMessage;

  if (!latestAlreadyIncluded) {
    trimmed.push({ role: "user", content: latestUserMessage });
  }

  return trimmed;
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

function postProcessAssistantMessage(
  text: string,
  history: ConversationMessage[],
  persona: Persona
): string {
  const cleaned = text
    .replace(/\s*\n+\s*/g, " ")
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .trim();

  // If the model falls back to the same generic opener, replace with a more human, nonchalant line.
  if (isBlandMessage(cleaned, history)) {
    return blandFallback(persona);
  }

  return cleaned;
}

function isBlandMessage(text: string, history: ConversationMessage[]): boolean {
  const lower = text.toLowerCase().trim();

  const genericPatterns: RegExp[] = [
    /^what'?s up( with you)?\??$/i,
    /^how'?s it going\??$/i,
    /^how are you\??$/i,
    /^tell me about yourself\??$/i,
    /^what are you up to\??$/i,
  ];

  const isGeneric = genericPatterns.some((p) => p.test(lower));

  const lastAssistant = [...history]
    .reverse()
    .find((m) => m.role === "assistant")?.content;

  const repeated =
    typeof lastAssistant === "string" &&
    lastAssistant.trim().toLowerCase() === lower;

  return isGeneric || repeated;
}

function blandFallback(_persona: Persona): string {
  const options = [
    "just chillin, you seem kinda fun though",
    "not much, i'm tired as shit today",
    "meh, your vibe's interesting",
    "i'm half bored, entertain me",
    "lowkey, i'm in a mood rn",
  ];

  return options[Math.floor(Math.random() * options.length)];
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
