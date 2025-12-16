import React from "react";
import { Text, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  description?: string;
  right?: React.ReactNode;
}

export default function SectionHeader({ title, description, right }: SectionHeaderProps) {
  return (
    <View className="flex-row items-start justify-between mb-3">
      <View className="flex-1 pr-3">
        <Text className="text-text-primary text-xl font-bold">{title}</Text>
        {description ? (
          <Text className="text-text-secondary mt-1">{description}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}



