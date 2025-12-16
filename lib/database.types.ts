export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_personas: {
        Row: {
          age: number
          avatar_url: string | null
          bio: string
          id: string
          name: string
          personality_traits: string[]
          voice_style: string | null
        }
        Insert: {
          age: number
          avatar_url?: string | null
          bio: string
          id?: string
          name: string
          personality_traits?: string[]
          voice_style?: string | null
        }
        Update: {
          age?: number
          avatar_url?: string | null
          bio?: string
          id?: string
          name?: string
          personality_traits?: string[]
          voice_style?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: "user" | "assistant"
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: "user" | "assistant"
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: "user" | "assistant"
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          ai_persona_id: string
          elo_change: number | null
          ended_at: string | null
          id: string
          message_count: number | null
          player_rating: number | null
          started_at: string | null
          user_guess: "real" | "ai" | null
          user_id: string
          was_correct: boolean | null
        }
        Insert: {
          ai_persona_id: string
          elo_change?: number | null
          ended_at?: string | null
          id?: string
          message_count?: number | null
          player_rating?: number | null
          started_at?: string | null
          user_guess?: "real" | "ai" | null
          user_id: string
          was_correct?: boolean | null
        }
        Update: {
          ai_persona_id?: string
          elo_change?: number | null
          ended_at?: string | null
          id?: string
          message_count?: number | null
          player_rating?: number | null
          started_at?: string | null
          user_guess?: "real" | "ai" | null
          user_id?: string
          was_correct?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_ai_persona_id_fkey"
            columns: ["ai_persona_id"]
            isOneToOne: false
            referencedRelation: "ai_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          elo_rating: number
          gender: "male" | "female"
          id: string
          is_premium: boolean
          username: string | null
        }
        Insert: {
          created_at?: string | null
          elo_rating?: number
          gender: "male" | "female"
          id: string
          is_premium?: boolean
          username?: string | null
        }
        Update: {
          created_at?: string | null
          elo_rating?: number
          gender?: "male" | "female"
          id?: string
          is_premium?: boolean
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

// Helper types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type AIPersona = Database["public"]["Tables"]["ai_personas"]["Row"]
export type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"]
export type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"]
