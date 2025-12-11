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
    default: "bg-surface border border-border-subtle",
    outlined: "bg-transparent border border-border-subtle",
    elevated: "bg-surface-light border border-border-subtle",
  };

  const elevatedStyle =
    variant === "elevated"
      ? {
          shadowColor: "#e53955",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.12,
          shadowRadius: 18,
          elevation: 10,
        }
      : {};

  return (
    <View
      className={`rounded-3xl p-4 ${variants[variant]} ${className}`}
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

