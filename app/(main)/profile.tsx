import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import IconButton from "@/components/ui/IconButton";
import ListItem from "@/components/ui/ListItem";
import SectionHeader from "@/components/ui/SectionHeader";
import { useAuthStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

interface GameStats {
  totalGames: number;
  correctGuesses: number;
  winRate: number;
}

export default function ProfileScreen() {
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
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="pt-14 pb-5 px-6 flex-row items-center justify-between">
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
        <Text className="text-text-primary text-lg font-semibold">Profile</Text>
        <View className="w-11 h-11" />
      </View>

      <View className="px-6">
        <SectionHeader title="You" description="Account and stats." />
      </View>

      <View className="px-6 gap-3">
        <Card variant="elevated">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="w-14 h-14 rounded-2xl bg-surface-light border border-border-subtle items-center justify-center mr-4">
                <Ionicons
                  name={profile?.gender === "female" ? "woman-outline" : "man-outline"}
                  size={28}
                  color="#ef233c"
                />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-xl font-bold">
                  {profile?.username || user?.email?.split("@")[0] || "Player"}
                </Text>
                <Text className="text-text-secondary mt-1">{user?.email}</Text>
              </View>
            </View>
            <View
              className="px-3 py-2 rounded-xl border border-border-subtle bg-surface"
              style={{ backgroundColor: `${rank.color}1A` }}
            >
              <Text style={{ color: rank.color }} className="font-bold text-xs">
                {rank.name}
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px] mb-2">
            STATS
          </Text>
          <View className="gap-2">
            <ListItem title="🍃 Grass" subtitle={`${profile?.elo_rating || 1000}`} />
            <ListItem title="Win rate" subtitle={`${stats.winRate}%`} />
            <ListItem title="Games played" subtitle={`${stats.totalGames}`} />
            <ListItem title="Correct calls" subtitle={`${stats.correctGuesses}`} />
          </View>
        </Card>

        <Card variant="outlined">
          <Text className="text-text-primary font-semibold">
            {profile?.is_premium ? "TRUTH tier" : "Free plan"}
          </Text>
          <Text className="text-text-secondary mt-2">
            {profile?.is_premium
              ? "Real-only enabled."
              : "Mixed queue enabled. Upgrade for real-only matches (demo)."}
          </Text>
          <Button
            onPress={() => router.push("/(main)/(tabs)/shop")}
            title={profile?.is_premium ? "View perks" : "View plans"}
            variant="secondary"
            size="md"
            className="mt-4"
          />
        </Card>

        <Card variant="outlined">
          <Text className="text-text-primary font-semibold">Settings</Text>
          <Text className="text-text-secondary mt-2">
            Manage your account, privacy, and sign out.
          </Text>
          <Button
            onPress={() => router.push("/(main)/settings")}
            title="Open settings"
            variant="outline"
            size="md"
            className="mt-4"
          />
        </Card>
      </View>
    </ScrollView>
  );
}

