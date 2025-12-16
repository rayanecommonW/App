import Card from "@/components/ui/Card";
import ListItem from "@/components/ui/ListItem";
import SectionHeader from "@/components/ui/SectionHeader";
import { Text, View } from "react-native";

export default function MatchesScreen() {
  return (
    <View className="flex-1 bg-background pb-40">
      <View className="pt-14 pb-5 px-6">
        <SectionHeader
          title="Matches"
          description="Overview (demo). Pull up for match history."
        />
      </View>

      <View className="px-6 gap-3">
        <Card variant="outlined">
          <Text className="text-text-primary font-semibold">Active</Text>
          <Text className="text-text-secondary mt-2">
            No active matches yet. Start one from Home.
          </Text>
        </Card>

        <Card>
          <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px] mb-2">
            QUICK
          </Text>
          <View className="gap-2">
            <ListItem
              title="Last result"
              subtitle="Correct rizz • +25 🍃 Grass (demo)"
            />
            <ListItem title="Streak" subtitle="0 wins (demo)" />
          </View>
        </Card>
      </View>
    </View>
  );
}


