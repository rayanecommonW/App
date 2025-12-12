import { shadowStyle } from "@/lib/shadow";
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
        colors={["#fff2f6", "#ffffff"]}
        className="absolute inset-0"
      />
      <View className="absolute -right-20 -top-14 w-52 h-52 rounded-full bg-primary/12" />
      <View className="absolute -left-16 bottom-10 w-48 h-48 rounded-full bg-primary-soft/30" />

      {/* Header */}
      <View className="pt-16 pb-6 px-6 flex-row justify-between items-center">
        <View>
          <Text className="text-text-primary text-3xl font-black tracking-tight">
            Profile
          </Text>
          <Text className="text-text-secondary mt-1">You, simplified.</Text>
        </View>
        <Pressable
          onPress={signOut}
          className="active:scale-95"
        >
          <LinearGradient
            colors={["#ffffff", "#fff5f7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-4 py-2 rounded-xl border border-border-subtle"
          >
            <Text className="text-danger font-semibold text-sm">Sign Out</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <View className="px-6 space-y-4 pb-10">
        {/* Profile Card */}
        <View
          className="bg-surface rounded-3xl p-5 border border-border-subtle"
          style={shadowStyle({
            color: "#ef233c",
            opacity: 0.06,
            radius: 12,
            offsetY: 10,
            elevation: 4,
          })}
        >
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mr-4 border border-primary/20">
              <Ionicons
                name={profile?.gender === "female" ? "woman" : "man"}
                size={32}
                color="#ef233c"
              />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-xl font-bold">
                {profile?.username || user?.email?.split("@")[0] || "Player"}
              </Text>
              <Text className="text-text-secondary mt-1">{user?.email}</Text>
            </View>
            <View
              className="px-3 py-2 rounded-2xl"
              style={{ backgroundColor: `${rank.color}20` }}
            >
              <Text style={{ color: rank.color }} className="font-bold text-xs">
                {rank.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="bg-surface rounded-3xl p-5 border border-border-subtle space-y-3">
          <View className="flex-row justify-between">
            <Text className="text-text-secondary text-sm">ELO</Text>
            <Text className="text-text-primary font-bold text-xl">
              {profile?.elo_rating || 1000}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-text-secondary text-sm">Win rate</Text>
            <Text className="text-primary font-bold text-xl">
              {stats.winRate}%
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-text-secondary text-sm">Games played</Text>
            <Text className="text-text-primary font-bold text-xl">
              {stats.totalGames}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-text-secondary text-sm">Correct calls</Text>
            <Text className="text-primary font-bold text-xl">
              {stats.correctGuesses}
            </Text>
          </View>
        </View>

        {/* Subscription Section */}
        <View className="bg-surface-light rounded-3xl p-5 border border-border-subtle/80">
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
            <Pressable className="active:scale-95">
              <LinearGradient
                colors={["#ffffff", "#fff5f7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl p-5 border border-border-subtle/60"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-text-primary font-bold text-lg">
                      Upgrade to TRUTH
                    </Text>
                    <Text className="text-text-secondary text-sm mt-1">
                      Skip the AI. Match with real people only.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#a17b88" />
                </View>
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

