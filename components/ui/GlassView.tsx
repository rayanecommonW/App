import {
    LiquidGlassContainerView,
    LiquidGlassView,
    isLiquidGlassSupported,
} from "@callstack/liquid-glass";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, type ColorValue, type ViewProps } from "react-native";

export type GlassEffect = "clear" | "regular" | "none";

export type GlassViewProps = ViewProps & {
  /**
   * Liquid glass material type.
   * - iOS (supported): forwarded to native LiquidGlassView
   * - Android (fallback): used to tweak fallback opacity
   */
  effect?: GlassEffect;
  /**
   * Tint wash over the glass.
   * - iOS (supported): forwarded to native LiquidGlassView
   * - Android (fallback): applied as a subtle overlay
   */
  tintColor?: ColorValue;
  /**
   * iOS-only native interaction shimmer. No-op on Android fallback.
   */
  interactive?: boolean;
  /**
   * Convenience border radius (applied along with `style`).
   */
  borderRadius?: number;
};

export function GlassView({
  effect = "regular",
  tintColor = "rgba(255,255,255,0.25)",
  interactive = false,
  borderRadius = 24,
  style,
  children,
  ...rest
}: GlassViewProps) {
  if (isLiquidGlassSupported) {
    return (
      <LiquidGlassView
        effect={effect}
        tintColor={tintColor}
        interactive={interactive}
        style={[styles.base, { borderRadius }, style]}
        {...rest}
      >
        {children}
      </LiquidGlassView>
    );
  }

  // Android / unsupported fallback (still "glass", without native refraction)
  const fallbackOpacity = effect === "none" ? 0 : effect === "clear" ? 0.18 : 0.28;
  const blurIntensity = effect === "none" ? 0 : effect === "clear" ? 55 : 80;
  const tint =
    typeof tintColor === "string" ? tintColor : typeof tintColor === "number" ? undefined : undefined;

  return (
    <View
      style={[
        styles.base,
        {
          borderRadius,
          backgroundColor: `rgba(255,255,255,${fallbackOpacity})`,
        },
        style,
      ]}
      {...rest}
    >
      {effect !== "none" ? (
        <BlurView
          pointerEvents="none"
          intensity={blurIntensity}
          // Blur is experimental on Android; enable it explicitly.
          experimentalBlurMethod="dimezisBlurView"
          blurReductionFactor={2}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(255,255,255,0.62)",
          "rgba(255,255,255,0.22)",
          "rgba(255,255,255,0.10)",
          "rgba(255,255,255,0.02)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.25, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.edge,
          {
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
          },
        ]}
      />

      {tint ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius,
              backgroundColor: tint,
              opacity: 0.25,
            },
          ]}
        />
      ) : null}

      {children}
    </View>
  );
}

export type GlassContainerViewProps = ViewProps & {
  /**
   * iOS-only: distance at which sibling glass elements begin to merge.
   */
  spacing?: number;
};

export function GlassContainerView({ spacing, style, children, ...rest }: GlassContainerViewProps) {
  if (isLiquidGlassSupported) {
    return (
      <LiquidGlassContainerView spacing={spacing ?? 0} style={style} {...rest}>
        {children}
      </LiquidGlassContainerView>
    );
  }

  // Avoid passing `spacing` to a plain View on Android.
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  edge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.65)",
  },
});


