import { shadowStyle } from "@/lib/shadow";
import * as Haptics from "expo-haptics";
import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  onPress,
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
}: ButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const sizeStyles = {
    sm: "py-2.5 px-4 rounded-2xl",
    md: "py-3 px-5 rounded-2xl",
    lg: "py-4 px-6 rounded-2xl",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const sharedPressable = disabled || loading ? "opacity-60" : "active:opacity-90";

  const variantContainer = {
    primary: "bg-primary border-primary",
    secondary: "bg-surface border-border-subtle",
    outline: "bg-transparent border-primary",
    danger: "bg-danger border-danger",
  }[variant];

  const variantText = {
    primary: "text-background",
    secondary: "text-text-primary",
    outline: "text-primary",
    danger: "text-background",
  }[variant];

  const variantShadow =
    variant === "primary"
      ? shadowStyle({
          color: "#ef233c",
          opacity: 0.16,
          radius: 14,
          offsetY: 10,
          elevation: 6,
        })
      : undefined;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={`${sizeStyles[size]} border items-center justify-center flex-row ${variantContainer} ${sharedPressable} ${className}`}
      style={variantShadow}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? "#ef233c" : "#ffffff"} />
      ) : (
        <Text className={`font-semibold ${textSizes[size]} ${variantText}`}>{title}</Text>
      )}
    </Pressable>
  );
}

