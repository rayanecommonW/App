import { shadowStyle } from "@/lib/shadow";
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
      ? shadowStyle({
          color: "#e53955",
          opacity: 0.08,
          radius: 14,
          offsetY: 8,
          elevation: 10,
        })
      : undefined;

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

