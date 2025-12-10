import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { AIPersona, ChatMessage, Profile } from "./database.types";

// Auth Store
interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  justRegistered: boolean;
  registeredUsername: string | null;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setJustRegistered: (justRegistered: boolean, username?: string) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  justRegistered: false,
  registeredUsername: null,
  setSession: (session) =>
    set({ session, user: session?.user ?? null, isLoading: false }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setJustRegistered: (justRegistered, username) =>
    set({ justRegistered, registeredUsername: username || null }),
  reset: () =>
    set({ session: null, user: null, profile: null, isLoading: false, justRegistered: false, registeredUsername: null }),
}));

// Chat Store
interface ChatState {
  sessionId: string | null;
  persona: AIPersona | null;
  messages: ChatMessage[];
  isTyping: boolean;
  timeRemaining: number;
  messageCount: number;
  isSessionEnded: boolean;
  showDecisionModal: boolean;
  
  // Actions
  startSession: (sessionId: string, persona: AIPersona) => void;
  addMessage: (message: ChatMessage) => void;
  setTyping: (typing: boolean) => void;
  setTimeRemaining: (time: number | ((prev: number) => number)) => void;
  incrementMessageCount: () => void;
  endSession: () => void;
  setShowDecisionModal: (show: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessionId: null,
  persona: null,
  messages: [],
  isTyping: false,
  timeRemaining: 300, // 5 minutes
  messageCount: 0,
  isSessionEnded: false,
  showDecisionModal: false,

  startSession: (sessionId, persona) =>
    set({
      sessionId,
      persona,
      messages: [],
      isTyping: false,
      timeRemaining: 300,
      messageCount: 0,
      isSessionEnded: false,
      showDecisionModal: false,
    }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setTyping: (isTyping) => set({ isTyping }),

  setTimeRemaining: (timeOrUpdater) => {
    const newTime = typeof timeOrUpdater === "function" 
      ? timeOrUpdater(get().timeRemaining) 
      : timeOrUpdater;
    set({ timeRemaining: newTime });
    // Auto-end session when time runs out
    if (newTime <= 0 && !get().isSessionEnded) {
      set({ isSessionEnded: true, showDecisionModal: true });
    }
  },

  incrementMessageCount: () =>
    set((state) => {
      const newCount = state.messageCount + 1;
      // End session at 20 messages (10 exchanges)
      if (newCount >= 20 && !state.isSessionEnded) {
        return {
          messageCount: newCount,
          isSessionEnded: true,
          showDecisionModal: true,
        };
      }
      return { messageCount: newCount };
    }),

  endSession: () => set({ isSessionEnded: true, showDecisionModal: true }),

  setShowDecisionModal: (showDecisionModal) => set({ showDecisionModal }),

  reset: () =>
    set({
      sessionId: null,
      persona: null,
      messages: [],
      isTyping: false,
      timeRemaining: 300,
      messageCount: 0,
      isSessionEnded: false,
      showDecisionModal: false,
    }),
}));

