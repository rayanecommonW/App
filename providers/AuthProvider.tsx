import { Profile } from "@/lib/database.types";
import { useAuthStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  justRegistered: boolean;
  registeredUsername: string | null;
  signUp: (
    username: string,
    password: string,
    gender: "male" | "female",
    email?: string
  ) => Promise<{ error: Error | null }>;
  signIn: (
    usernameOrEmail: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  clearJustRegistered: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    session,
    isLoading,
    justRegistered,
    registeredUsername,
    setSession,
    setProfile,
    setLoading,
    setJustRegistered,
    reset,
  } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (data) setProfile(data as Profile);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          if (data) setProfile(data as Profile);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (
    username: string,
    password: string,
    gender: "male" | "female",
    email?: string
  ) => {
    setLoading(true);

    const authEmail = email || `${username.toLowerCase()}@turing.local`;

    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        data: { gender, username },
      },
    });

    if (!error && data.user) {
      await supabase.from("profiles").update({ username }).eq("id", data.user.id);

      // Sign out immediately - user must login manually after registration
      await supabase.auth.signOut();

      // Set flag to show success modal (user is now signed out)
      setJustRegistered(true, username);
    }

    setLoading(false);
    return { error: error as Error | null };
  };

  const clearJustRegistered = () => {
    setJustRegistered(false);
  };

  const signIn = async (usernameOrEmail: string, password: string) => {
    setLoading(true);

    const isEmail = usernameOrEmail.includes("@");
    let email = usernameOrEmail;

    if (!isEmail) {
      email = `${usernameOrEmail.toLowerCase()}@turing.local`;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Don't let network issues block logout UX (especially on web).
    void supabase.auth
      .signOut()
      .then(({ error }) => {
        if (error) console.warn("Supabase signOut error:", error);
      })
      .catch((error) => console.warn("Supabase signOut threw:", error));

    reset();
    router.replace("/(auth)/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!session,
        isLoading,
        justRegistered,
        registeredUsername,
        signUp,
        signIn,
        signOut,
        clearJustRegistered,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
