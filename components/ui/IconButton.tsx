import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { ComponentProps } from "react";
import { Pressable } from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

interface IconButtonProps {
  onPress: () => void;
  icon: IoniconName;
  label?: string;
  variant?: "filled" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export default function IconButton({
  onPress,
  icon,
  label,
  variant = "outline",
  size = "md",
  disabled = false,
  className = "",
}: IconButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const sizeStyles = {
    sm: "w-10 h-10",
    md: "w-11 h-11",
    lg: "w-12 h-12",
  }[size];

  const container = {
    filled: "bg-surface-light border border-border-subtle",
    outline: "bg-surface border border-border-subtle",
    ghost: "bg-transparent border border-transparent",
  }[variant];

  const iconColor = variant === "filled" ? "#14060f" : "#14060f";

  return (
    <Pressable
      accessibilityLabel={label}
      onPress={handlePress}
      disabled={disabled}
      className={`${sizeStyles} rounded-2xl items-center justify-center ${
        disabled ? "opacity-60" : "active:opacity-85"
      } ${container} ${className}`}
    >
      <Ionicons name={icon} size={20} color={iconColor} />
    </Pressable>
  );
}




