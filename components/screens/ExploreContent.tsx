import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function ExploreContent() {
  return (
    <View style={styles.container}>
      {/* Subtle gradient accent at top */}
      <View style={styles.topAccent} />
      
      <View className="pt-14 pb-5 px-6">
        <SectionHeader
          title="Explore"
          description="Discover new challenges and personas"
        />
      </View>

      <View className="px-6 gap-4">
        <Card variant="elevated">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-8 h-8 rounded-xl bg-amber-100 items-center justify-center">
              <Ionicons name="trophy" size={16} color="#f59e0b" />
            </View>
            <Text className="text-text-primary font-semibold">Daily Challenge</Text>
          </View>
          <Text className="text-text-secondary leading-5">
            Win 2 matches in a row to earn a special badge and bonus Grass points.
          </Text>
          <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
            <View className="flex-row items-center gap-1">
              <Text className="text-amber-600 font-bold">0</Text>
              <Text className="text-text-secondary">/</Text>
              <Text className="text-text-secondary">2</Text>
            </View>
            <View className="flex-1 h-2 bg-surface-light rounded-full overflow-hidden">
              <View className="w-0 h-full bg-amber-400 rounded-full" />
            </View>
          </View>
        </Card>

        <Card variant="outlined">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-8 h-8 rounded-xl bg-purple-100 items-center justify-center">
              <Ionicons name="sparkles" size={16} color="#8b5cf6" />
            </View>
            <Text className="text-text-primary font-semibold">Featured Personas</Text>
          </View>
          <Text className="text-text-secondary leading-5">
            New AI conversation styles rotate daily. Try them all to improve your detection skills.
          </Text>
          <View className="flex-row gap-2 mt-3 pt-3 border-t border-border-subtle">
            <View className="px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-100">
              <Text className="text-purple-600 text-xs font-semibold">Witty</Text>
            </View>
            <View className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
              <Text className="text-blue-600 text-xs font-semibold">Chill</Text>
            </View>
            <View className="px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-100">
              <Text className="text-pink-600 text-xs font-semibold">Flirty</Text>
            </View>
          </View>
        </Card>

        <Card>
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-8 h-8 rounded-xl bg-cyan-100 items-center justify-center">
              <Ionicons name="compass" size={16} color="#06b6d4" />
            </View>
            <Text className="text-text-primary font-semibold">Quick Tips</Text>
          </View>
          <Text className="text-text-secondary leading-5">
            Swipe up on the bottom sheet to see the global leaderboard and compare your Grass score.
          </Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 160,
    backgroundColor: '#f8faff', // Cool blue-white (Explore)
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#eef4ff',
    opacity: 0.7,
  },
});
