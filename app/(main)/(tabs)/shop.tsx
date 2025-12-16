import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import { Text, View } from "react-native";

export default function ShopScreen() {
  return (
    <View className="flex-1 bg-background pb-40">
      <View className="pt-14 pb-5 px-6">
        <SectionHeader
          title="Shop"
          description="Plans and perks (demo). Pull up for details."
        />
      </View>

      <View className="px-6 gap-3">
        <Card variant="elevated">
          <Text className="text-text-primary text-lg font-bold">TRUTH tier</Text>
          <Text className="text-text-secondary mt-2">
            100% real matches (demo). Skip the AI.
          </Text>
          <Button
            onPress={() => {}}
            title="Choose TRUTH"
            variant="primary"
            size="md"
            className="mt-4"
          />
        </Card>

        <Card variant="outlined">
          <Text className="text-text-primary font-semibold">Free</Text>
          <Text className="text-text-secondary mt-2">
            Standard queue. Mixed matches.
          </Text>
        </Card>
      </View>
    </View>
  );
}


