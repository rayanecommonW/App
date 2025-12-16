import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import IconButton from "@/components/ui/IconButton";
import ListItem from "@/components/ui/ListItem";
import SectionHeader from "@/components/ui/SectionHeader";
import { useAuthStore } from "@/lib/store";
import { useAuth } from "@/providers/AuthProvider";
import { router } from "expo-router";
import { Text, View } from "react-native";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { profile, user } = useAuthStore();

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 pb-5 px-6 flex-row items-center justify-between">
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
        <Text className="text-text-primary text-lg font-semibold">Settings</Text>
        <View className="w-11 h-11" />
      </View>

      <View className="px-6">
        <SectionHeader
          title="Account"
          description="Basics and preferences."
        />
      </View>

      <View className="px-6 gap-3">
        <Card variant="elevated">
          <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px] mb-2">
            PROFILE
          </Text>
          <View className="gap-2">
            <ListItem
              title="Username"
              subtitle={profile?.username || user?.email?.split("@")[0] || "Player"}
            />
            <ListItem title="Email" subtitle={user?.email || "—"} />
          </View>
        </Card>

        <Card>
          <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px] mb-2">
            PREFERENCES
          </Text>
          <View className="gap-2">
            <ListItem title="Notifications" subtitle="Coming soon (demo)" />
            <ListItem title="Privacy" subtitle="Coming soon (demo)" />
          </View>
        </Card>

        <Card variant="outlined">
          <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px] mb-2">
            SESSION
          </Text>
          <Button
            onPress={signOut}
            title="Sign out"
            variant="danger"
            size="lg"
          />
        </Card>
      </View>
    </View>
  );
}


