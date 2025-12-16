import Card from "@/components/ui/Card";
import ListItem from "@/components/ui/ListItem";
import SectionHeader from "@/components/ui/SectionHeader";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function MatchesContent() {
  return (
    <View style={styles.container}>
      {/* Subtle gradient accent at top */}
      <View style={styles.topAccent} />
      
      <View className="pt-14 pb-5 px-6">
        <SectionHeader
          title="Matches"
          description="Your match history and stats"
        />
      </View>

      <View className="px-6 gap-4">
        <Card variant="elevated">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-8 h-8 rounded-xl bg-emerald-100 items-center justify-center">
              <Ionicons name="flame" size={16} color="#10b981" />
            </View>
            <Text className="text-text-primary font-semibold">Active Streak</Text>
          </View>
          <View className="flex-row items-end justify-between mt-1">
            <View>
              <Text className="text-text-primary text-3xl font-bold">0</Text>
              <Text className="text-text-secondary text-sm">consecutive wins</Text>
            </View>
            <View className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <Text className="text-emerald-600 text-xs font-semibold">KEEP GOING!</Text>
            </View>
          </View>
        </Card>

        <Card variant="outlined">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-8 h-8 rounded-xl bg-blue-100 items-center justify-center">
              <Ionicons name="stats-chart" size={16} color="#3b82f6" />
            </View>
            <Text className="text-text-primary font-semibold">Quick Stats</Text>
          </View>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-text-secondary">Total Matches</Text>
              <Text className="text-text-primary font-semibold">0</Text>
            </View>
            <View className="h-px bg-border-subtle" />
            <View className="flex-row items-center justify-between">
              <Text className="text-text-secondary">Win Rate</Text>
              <Text className="text-text-primary font-semibold">—%</Text>
            </View>
            <View className="h-px bg-border-subtle" />
            <View className="flex-row items-center justify-between">
              <Text className="text-text-secondary">Best Streak</Text>
              <Text className="text-text-primary font-semibold">0</Text>
            </View>
          </View>
        </Card>

        <Card>
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-8 h-8 rounded-xl bg-orange-100 items-center justify-center">
              <Ionicons name="time" size={16} color="#f97316" />
            </View>
            <Text className="text-text-primary font-semibold">Recent Activity</Text>
          </View>
          <View className="gap-1">
            <ListItem
              title="No matches yet"
              subtitle="Start a match from the Home tab"
            />
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 160,
    backgroundColor: '#f6fef9', // Light mint-green (Matches)
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#ecfdf5',
    opacity: 0.7,
  },
});
