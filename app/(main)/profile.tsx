import { useAuthStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

interface GameStats {
  totalGames: number;
  correctGuesses: number;
  winRate: number;
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { profile, user } = useAuthStore();
  const [stats, setStats] = useState<GameStats>({
    totalGames: 0,
    correctGuesses: 0,
    winRate: 0,
  });

  const fetchStats = useCallback(async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from("chat_sessions")
      .select("was_correct")
      .eq("user_id", profile.id)
      .not("was_correct", "is", null);

    if (!error && data) {
      const total = data.length;
      const correct = data.filter((s) => s.was_correct).length;
      setStats({
        totalGames: total,
        correctGuesses: correct,
        winRate: total > 0 ? Math.round((correct / total) * 100) : 0,
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getRankTier = (elo: number): { name: string; color: string } => {
    if (elo >= 2000) return { name: "GRANDMASTER", color: "#ff00aa" };
    if (elo >= 1600) return { name: "MASTER", color: "#ffaa00" };
    if (elo >= 1400) return { name: "DIAMOND", color: "#00d4ff" };
    if (elo >= 1200) return { name: "GOLD", color: "#ffd700" };
    if (elo >= 1000) return { name: "SILVER", color: "#c0c0c0" };
    return { name: "BRONZE", color: "#cd7f32" };
  };

  const rank = getRankTier(profile?.elo_rating || 1000);

  return (
    <ScrollView className="flex-1 bg-background">
      <LinearGradient
        colors={["#fff3f6", "#ffffff"]}
        className="absolute inset-0"
      />
      {/* Header */}
      <View className="pt-16 pb-6 px-6 flex-row justify-between items-center">
        <Text className="text-text-primary text-2xl font-bold">Profile</Text>
        <Pressable
          onPress={signOut}
          className="bg-surface-light px-4 py-2 rounded-xl border border-border-subtle active:scale-95"
        >
          <Text className="text-danger font-semibold text-sm">Sign Out</Text>
        </Pressable>
      </View>

      {/* Profile Card */}
      <View className="mx-6 bg-surface rounded-3xl overflow-hidden border border-border-subtle shadow-glow">
        {/* Gradient Header */}
        <LinearGradient
          colors={["#ffdce6", "#f7f4fb"]}
          className="h-20"
        />

        {/* Avatar */}
        <View className="items-center -mt-12">
          <View className="w-24 h-24 rounded-full bg-surface-light border-4 border-background items-center justify-center">
            <Ionicons
              name={profile?.gender === "female" ? "woman" : "man"}
              size={40}
              color="#a698b7"
            />
          </View>
        </View>

        {/* Info */}
        <View className="px-6 pb-6 pt-4">
          <Text className="text-text-primary text-xl font-bold text-center">
            {profile?.username || user?.email?.split("@")[0] || "Player"}
          </Text>
          <Text className="text-text-secondary text-center mt-1">
            {user?.email}
          </Text>

          {/* Tier Badge */}
          <View className="items-center mt-4">
            <View
              className="px-6 py-2 rounded-full"
              style={{ backgroundColor: `${rank.color}20` }}
            >
              <Text style={{ color: rank.color }} className="font-bold">
                {rank.name}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="mx-6 mt-6 flex-row space-x-4">
        <View className="flex-1 bg-surface-light/80 rounded-2xl p-4 border border-border-subtle">
          <Text className="text-text-secondary text-xs">ELO RATING</Text>
          <Text className="text-primary text-2xl font-bold mt-1">
            {profile?.elo_rating || 1000}
          </Text>
        </View>
        <View className="flex-1 bg-surface-light/80 rounded-2xl p-4 border border-border-subtle">
          <Text className="text-text-secondary text-xs">WIN RATE</Text>
          <Text className="text-primary-soft text-2xl font-bold mt-1">
            {stats.winRate}%
          </Text>
        </View>
      </View>

      <View className="mx-6 mt-4 flex-row space-x-4">
        <View className="flex-1 bg-surface-light/80 rounded-2xl p-4 border border-border-subtle">
          <Text className="text-text-secondary text-xs">GAMES PLAYED</Text>
          <Text className="text-text-primary text-2xl font-bold mt-1">
            {stats.totalGames}
          </Text>
        </View>
        <View className="flex-1 bg-surface-light/80 rounded-2xl p-4 border border-border-subtle">
          <Text className="text-text-secondary text-xs">CORRECT</Text>
          <Text className="text-primary text-2xl font-bold mt-1">
            {stats.correctGuesses}
          </Text>
        </View>
      </View>

      {/* Subscription Section */}
      <View className="mx-6 mt-6">
        <Text className="text-text-secondary text-sm mb-3 ml-1">
          SUBSCRIPTION
        </Text>
        {profile?.is_premium ? (
          <View className="bg-warning/15 rounded-2xl p-5 border border-warning/30">
            <View className="flex-row items-center">
              <Ionicons name="star" size={24} color="#f6c177" />
              <View className="ml-3">
                <Text className="text-warning font-bold text-lg">
                  TRUTH TIER
                </Text>
                <Text className="text-text-secondary text-sm">
                  100% real matches guaranteed
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <Pressable>
            <LinearGradient
              colors={["#ffdce6", "#f7f4fb"]}
              className="rounded-2xl p-5 border border-border-subtle/60"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-text-primary font-bold text-lg">
                    Upgrade to TRUTH
                  </Text>
                  <Text className="text-text-secondary text-sm mt-1">
                    Skip the AI. Match with real people only.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#7a6a8a" />
              </View>
            </LinearGradient>
          </Pressable>
        )}
      </View>

    </ScrollView>
  );
}

