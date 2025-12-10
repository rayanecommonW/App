import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";
import { Database } from "./database.types";

// Storage adapter that works on both web and native
const createStorageAdapter = () => {
  if (Platform.OS === "web") {
    // Use localStorage for web
    return {
      getItem: (key: string) => {
        if (typeof window !== "undefined") {
          return Promise.resolve(localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== "undefined") {
          localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  }

  // Use SecureStore for native (iOS/Android)
  return {
    getItem: (key: string) => {
      return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
      SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
      SecureStore.deleteItemAsync(key);
    },
  };
};

// Replace these with your Supabase project credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});
