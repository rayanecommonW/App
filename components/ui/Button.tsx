import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
    md: "py-3.5 px-6 rounded-2xl",
    lg: "py-4 px-8 rounded-3xl",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const sharedPressable = `${disabled || loading ? "opacity-60" : "active:scale-[0.98]"}`;
  const shadowGlow = {
    shadowColor: "#e53955",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  };

  const renderLabel = (colorClass: string) =>
    loading ? (
      <ActivityIndicator color={colorClass === "text-background" ? "#ffffff" : "#e53955"} />
    ) : (
      <Text className={`font-semibold ${textSizes[size]} ${colorClass}`}>{title}</Text>
    );

  if (variant === "primary") {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        className={`${sharedPressable} ${className}`}
        style={shadowGlow}
      >
        <LinearGradient
          colors={["#e53955", "#f88ca0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`${sizeStyles[size]} flex-row items-center justify-center`}
        >
          {renderLabel("text-background")}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === "secondary") {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        className={`${sharedPressable} ${className}`}
      >
        <LinearGradient
          colors={["#ffffff", "#f7f4fb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`${sizeStyles[size]} border border-border-subtle flex-row items-center justify-center`}
        >
          {renderLabel("text-text-primary")}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === "outline") {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        className={`${sizeStyles[size]} border-2 border-primary flex-row items-center justify-center bg-transparent ${sharedPressable} ${className}`}
      >
        {renderLabel("text-primary")}
      </Pressable>
    );
  }

  if (variant === "danger") {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        className={`${sharedPressable} ${className}`}
      >
        <LinearGradient
          colors={["#f56767", "#e53955"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`${sizeStyles[size]} flex-row items-center justify-center`}
        >
          {renderLabel("text-background")}
        </LinearGradient>
      </Pressable>
    );
  }

  return null;
}

