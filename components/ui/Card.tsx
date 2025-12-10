import React from "react";
import { Text, View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "outlined" | "elevated";
}

export default function Card({
  children,
  variant = "default",
  className = "",
  ...props
}: CardProps) {
  const variants = {
    default: "bg-surface border border-surface-light",
    outlined: "bg-transparent border border-muted",
    elevated: "bg-surface",
  };

  const elevatedStyle =
    variant === "elevated"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }
      : {};

  return (
    <View
      className={`rounded-2xl p-4 ${variants[variant]} ${className}`}
      style={elevatedStyle}
      {...props}
    >
      {children}
    </View>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
}

export function CardTitle({ children }: CardTitleProps) {
  return (
    <Text className="text-text-primary text-lg font-bold mb-2">{children}</Text>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
}

export function CardDescription({ children }: CardDescriptionProps) {
  return <Text className="text-text-secondary text-sm">{children}</Text>;
}

