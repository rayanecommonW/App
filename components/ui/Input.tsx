import React from "react";
import { Text, TextInput, type TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
}

export default function Input({ label, hint, error, className = "", ...props }: InputProps) {
  return (
    <View className="gap-2">
      {label ? (
        <Text className="text-text-secondary text-sm font-semibold ml-0.5">
          {label}
        </Text>
      ) : null}
      <TextInput
        className={`bg-surface border border-border-subtle rounded-2xl px-4 py-4 text-text-primary text-base ${className}`}
        placeholderTextColor="#a17b88"
        {...props}
      />
      {error ? (
        <Text className="text-danger text-sm ml-0.5">{error}</Text>
      ) : hint ? (
        <Text className="text-muted text-sm ml-0.5">{hint}</Text>
      ) : null}
    </View>
  );
}




