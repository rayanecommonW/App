import { GlassView, type GlassEffect } from "@/components/ui/GlassView";
import React from "react";
import { StyleSheet, type ColorValue, type ViewStyle } from "react-native";

interface LiquidGlassBackgroundProps {
  effect?: GlassEffect;
  tintColor?: ColorValue;
  style?: ViewStyle;
  children?: React.ReactNode;
  borderRadius?: number;
}

/**
 * Liquid-glass background.
 * Uses native Liquid Glass on supported iOS devices; uses a cross-platform glass fallback elsewhere (Android).
 */
export default function LiquidGlassBackground({
  effect = "clear",
  tintColor = "rgba(255, 236, 244, 0.18)",
  style,
  children,
  borderRadius = 32,
}: LiquidGlassBackgroundProps) {
  return (
    <GlassView
      effect={effect}
      tintColor={tintColor}
      borderRadius={borderRadius}
      style={[styles.container, style]}
    >
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
});

