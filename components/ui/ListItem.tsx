import React from "react";
import { Pressable, Text, View } from "react-native";

interface ListItemProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export default function ListItem({
  title,
  subtitle,
  right,
  onPress,
  className = "",
}: ListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={`bg-surface border border-border-subtle rounded-2xl px-4 py-3 flex-row items-center justify-between ${
        onPress ? "active:opacity-90" : ""
      } ${className}`}
    >
      <View className="flex-1 pr-3">
        <Text className="text-text-primary font-semibold">{title}</Text>
        {subtitle ? (
          <Text className="text-text-secondary text-sm mt-0.5">{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </Pressable>
  );
}


