import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import { Text, View } from "react-native";

export default function ExploreScreen() {
  return (
    <View className="flex-1 bg-background pb-40">
      <View className="pt-14 pb-5 px-6">
        <SectionHeader
          title="Explore"
          description="Lightweight discovery (demo). Pull up for the leaderboard."
        />
      </View>

      <View className="px-6 gap-3">
        <Card variant="elevated">
          <Text className="text-text-primary font-semibold">Daily challenge</Text>
          <Text className="text-text-secondary mt-2">
            Win 2 matches in a row to earn a badge. (demo)
          </Text>
        </Card>
        <Card variant="outlined">
          <Text className="text-text-primary font-semibold">Featured personas</Text>
          <Text className="text-text-secondary mt-2">
            New AI styles rotate daily. (demo)
          </Text>
        </Card>
      </View>
    </View>
  );
}


