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
    sm: "py-2 px-4",
    md: "py-3 px-6",
    lg: "py-4 px-8",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (variant === "primary") {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        className={`${className} ${disabled ? "opacity-50" : ""}`}
      >
        <LinearGradient
          colors={["#00ff88", "#00cc6a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className={`${sizeStyles[size]} rounded-xl items-center justify-center`}
        >
          {loading ? (
            <ActivityIndicator color="#0a0a0f" />
          ) : (
            <Text
              className={`text-background font-bold ${textSizes[size]}`}
            >
              {title}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === "secondary") {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        className={`${className} ${disabled ? "opacity-50" : ""}`}
      >
        <LinearGradient
          colors={["#ff00aa", "#cc0088"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className={`${sizeStyles[size]} rounded-xl items-center justify-center`}
        >
          {loading ? (
            <ActivityIndicator color="#0a0a0f" />
          ) : (
            <Text
              className={`text-background font-bold ${textSizes[size]}`}
            >
              {title}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === "outline") {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        className={`${sizeStyles[size]} rounded-xl border-2 border-primary items-center justify-center ${className} ${
          disabled ? "opacity-50" : ""
        }`}
      >
        {loading ? (
          <ActivityIndicator color="#00ff88" />
        ) : (
          <Text className={`text-primary font-bold ${textSizes[size]}`}>
            {title}
          </Text>
        )}
      </Pressable>
    );
  }

  if (variant === "danger") {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        className={`${sizeStyles[size]} rounded-xl bg-danger/20 border border-danger items-center justify-center ${className} ${
          disabled ? "opacity-50" : ""
        }`}
      >
        {loading ? (
          <ActivityIndicator color="#ff3366" />
        ) : (
          <Text className={`text-danger font-bold ${textSizes[size]}`}>
            {title}
          </Text>
        )}
      </Pressable>
    );
  }

  return null;
}

