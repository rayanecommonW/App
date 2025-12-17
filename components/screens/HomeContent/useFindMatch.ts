import type { AIPersona, Profile } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { sleep, withTimeout } from "./utils";

export function useFindMatch({
  profile,
  user,
  startSession,
}: {
  profile: Profile | null;
  user: User | null;
  startSession: (sessionId: string, persona: AIPersona) => void;
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");
  const [matchError, setMatchError] = useState<string | null>(null);
  const searchRunIdRef = useRef(0);

  const handleFindMatch = useCallback(async () => {
    if (isSearching) return;
    const runId = ++searchRunIdRef.current;
    const isStale = () => runId !== searchRunIdRef.current;

    setMatchError(null);
    setIsSearching(true);
    setSearchStatus("Entering the queue...");
    console.log("[match] start");

    try {
      const userId = profile?.id ?? user?.id;
      if (!userId) {
        throw new Error("Not signed in. Please sign in again.");
      }

      if (
        !process.env.EXPO_PUBLIC_SUPABASE_URL ||
        process.env.EXPO_PUBLIC_SUPABASE_URL.includes("YOUR_SUPABASE_URL")
      ) {
        throw new Error("Supabase environment variables are missing.");
      }

      await sleep(900);
      if (isStale()) return;
      setSearchStatus("Searching for opponent...");
      await sleep(1200);
      if (isStale()) return;
      setSearchStatus("Match found! Connecting...");
      console.log("[match] fetching persona");

      const { data: personas, error: personaError } = await withTimeout(
        supabase.from("ai_personas").select("*").limit(25),
        12_000,
        "Fetching personas"
      );

      if (personaError || !personas?.length) {
        throw new Error("No personas available");
      }

      const randomPersona = personas[Math.floor(Math.random() * personas.length)] as AIPersona;
      console.log("[match] persona", randomPersona.id);

      console.log("[match] creating session");
      const { data: session, error: sessionError } = await withTimeout(
        supabase
          .from("chat_sessions")
          .insert({
            user_id: userId,
            ai_persona_id: randomPersona.id,
          })
          .select()
          .single(),
        12_000,
        "Creating session"
      );

      if (sessionError) throw sessionError;
      console.log("[match] session created", session.id);

      startSession(session.id, randomPersona);

      await sleep(250);
      if (isStale()) return;

      setIsSearching(false);
      setSearchStatus("");

      router.push(`/(main)/chat/${session.id}`);
    } catch (error) {
      console.error("[match] failed", error);
      const message = error instanceof Error ? error.message : "Unable to start match.";
      setMatchError(message);
      setSearchStatus("Error finding match. Try again.");
      setTimeout(() => {
        setIsSearching(false);
        setSearchStatus("");
      }, 2000);
    }
  }, [isSearching, profile?.id, user?.id, startSession]);

  const cancelSearch = useCallback(() => {
    searchRunIdRef.current += 1;
    setIsSearching(false);
    setSearchStatus("");
  }, []);

  return {
    isSearching,
    searchStatus,
    matchError,
    handleFindMatch,
    cancelSearch,
  };
}


