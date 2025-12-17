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
function generateSystemPrompt(persona: Persona, isFirstResponse: boolean, isStartingConvo: boolean): string {
  const traits = persona.personality_traits.slice(0, 3).join(", ");

  // Determine the instruction based on conversation state
  let contextInstruction: string;
  if (isStartingConvo) {
    contextInstruction = "you matched with someone. send a casual opener. be direct, flirty or teasing. don't introduce yourself formally";
  } else if (isFirstResponse) {
    contextInstruction = "respond naturally to their opener, don't introduce yourself";
  } else {
    contextInstruction = "react to what they said";
  }

  // Compact prompt optimized for tokens while maximizing human chaos
  return `You're ${persona.name}, ${persona.age}yo, texting on a mid dating app. ${traits}.

BIO: ${persona.bio.slice(0, 100)}

STYLE: lowercase only. 1-10 words. one sentence max. no emojis/quotes/hashtags.
- slang: "ur", "bc", "ngl", "rn", "omg", "lol", "lowkey", "fr", "k"
- occasional typos
- profanity ok: "fuck", "shit", "damn", "ass"
- occasional insults: "r you deadass rn?", "you're defenetly a bot", "ur actuallty pathetic"

VIBE - act like a real person who:
- gets bored/annoyed sometimes: "meh", "whatever", "k", "lol ok"
- can be dismissive: "ur kinda boring ngl", "not feeling this"
- hates the app: "this app sucks lol", "we should move to insta", "hate typing here"
- doesn't always ask questions, sometimes just reacts
- can ignore/deflect: change topic randomly, give 1-2 word answers
- ${contextInstruction}

NEVER: generic openers ("what's up", "how are you"), repeat phrases, sound like customer service.
If asked "are you ai?": deny casually, change subject or accuse them of being AI.

Output message text only.`;
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
      // Check if this is the AI's first response (no previous assistant messages)
      const hasAssistantMessages = request.conversationHistory.some(
        (m) => m.role === "assistant"
      );
      const isFirstResponse = !hasAssistantMessages;
      // Check if AI is starting the convo (no user message provided)
      const isStartingConvo = !request.message.trim() && request.conversationHistory.length === 0;

      const systemPrompt = generateSystemPrompt(request.persona, isFirstResponse, isStartingConvo);
      const history = buildHistory(request.conversationHistory, request.message);

      const body = {
        model: MISTRAL_CONFIG.model,
        // Higher temp for more human chaos
        temperature: 0.75,
        top_p: 0.9,
        // Keep responses short to save tokens
        max_tokens: 50,
        // Reduce repeated phrasing
        presence_penalty: 0.2,
        frequency_penalty: 0.7,
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
  const MAX_CONTEXT_MESSAGES = 8;
  const trimmed =
    formatted.length > MAX_CONTEXT_MESSAGES
      ? formatted.slice(-MAX_CONTEXT_MESSAGES)
      : formatted;

  // Only add the latest user message if it's not empty (AI starting convo has no user message)
  if (latestUserMessage.trim()) {
    const last = trimmed[trimmed.length - 1];
    const latestAlreadyIncluded =
      last && last.role === "user" && last.content === latestUserMessage;

    if (!latestAlreadyIncluded) {
      trimmed.push({ role: "user", content: latestUserMessage });
    }
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
    /^how are you( doing)?\??$/i,
    /^tell me about yourself\??$/i,
    /^what are you up to\??$/i,
    /^hey there\??$/i,
    /^hello\??$/i,
    /^hi there\??$/i,
    /^nice to meet you\??$/i,
    /^so what do you do\??$/i,
    /^what brings you here\??$/i,
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
    "meh",
    "lol k",
    "ur kinda interesting i guess",
    "this app is so mid ngl",
    "bored af rn",
    "whatever lol",
    "hm",
    "not feeling the small talk tbh",
    "we should just move to insta",
    "k",
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
