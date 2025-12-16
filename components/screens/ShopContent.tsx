import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

export default function ShopContent() {
  return (
    <View style={styles.container}>
      {/* Gold/cream gradient */}
      <LinearGradient
        colors={['#fff8e8', '#fffbf2', '#ffffff']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      <View className="pt-14 pb-5 px-6">
        <SectionHeader
          title="Shop"
          description="Upgrade your experience"
        />
      </View>

      <View className="px-6 gap-4">
        <Card variant="elevated" style={styles.premiumCard}>
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-8 h-8 rounded-xl bg-amber-100 items-center justify-center">
              <Ionicons name="diamond" size={16} color="#f59e0b" />
            </View>
            <View className="px-2 py-0.5 rounded-md bg-amber-100">
              <Text className="text-amber-700 text-xs font-bold">PREMIUM</Text>
            </View>
          </View>
          <Text className="text-text-primary text-xl font-bold mt-1">TRUTH Tier</Text>
          <Text className="text-text-secondary mt-2 leading-5">
            100% real human matches only. Skip the AI guessing game entirely and connect with real people.
          </Text>
          <View className="gap-2 mt-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-text-secondary text-sm">Real humans only</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-text-secondary text-sm">Priority matching</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-text-secondary text-sm">Exclusive badges</Text>
            </View>
          </View>
          <Button
            onPress={() => {}}
            title="Upgrade to TRUTH"
            variant="primary"
            size="md"
            className="mt-4"
          />
        </Card>

        <Card variant="outlined">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-8 h-8 rounded-xl bg-gray-100 items-center justify-center">
              <Ionicons name="person" size={16} color="#6b7280" />
            </View>
            <Text className="text-text-primary font-semibold">Free Tier</Text>
            <View className="px-2 py-0.5 rounded-md bg-emerald-100 ml-auto">
              <Text className="text-emerald-700 text-xs font-bold">CURRENT</Text>
            </View>
          </View>
          <Text className="text-text-secondary leading-5">
            Standard queue with mixed AI and human matches. Test your detection skills!
          </Text>
          <View className="gap-2 mt-3 pt-3 border-t border-border-subtle">
            <View className="flex-row items-center gap-2">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-text-secondary text-sm">Unlimited matches</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-text-secondary text-sm">Grass leaderboard</Text>
            </View>
          </View>
        </Card>

        <Card>
          <View className="flex-row items-center gap-2">
            <Ionicons name="gift" size={18} color="#8b5cf6" />
            <Text className="text-text-primary font-semibold">Coming Soon</Text>
          </View>
          <Text className="text-text-secondary mt-2 leading-5">
            Cosmetic items, profile customization, and special event passes.
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
  },
  premiumCard: {
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
});
