import React from "react";
import { Text, View } from "react-native";

interface SheetSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function SheetSection({ title, children, className = "" }: SheetSectionProps) {
  return (
    <View className={`mb-4 ${className}`}>
      <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px] mb-2">
        {title.toUpperCase()}
      </Text>
      <View className="gap-2">{children}</View>
    </View>
  );
}




