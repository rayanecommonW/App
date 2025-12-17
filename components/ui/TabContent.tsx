import { LinearGradient, type LinearGradientProps } from "expo-linear-gradient";
import { type ReactNode } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";

// Bottom navigation collapsed height + extra padding for safety
const BOTTOM_NAV_PADDING = 160;

type GradientPreset = "pink" | "coral" | "cream" | "rose";

type GradientConfig = Pick<LinearGradientProps, "colors" | "locations">;

const GRADIENT_PRESETS = {
  pink: {
    colors: ["#ffe4e9", "#fff8f9", "#ffffff"],
    locations: [0, 0.4, 1],
  },
  coral: {
    colors: ["#ffeaed", "#fff4f5", "#ffffff"],
    locations: [0, 0.35, 1],
  },
  cream: {
    colors: ["#fff8e8", "#fffbf2", "#ffffff"],
    locations: [0, 0.4, 1],
  },
  rose: {
    colors: ["#ffffff", "#fff5f6", "#ffd4db"],
    locations: [0, 0.6, 1],
  },
} as const satisfies Record<GradientPreset, GradientConfig>;

interface TabContentProps {
  children: ReactNode;
  /** Whether content should scroll. Defaults to true */
  scrollable?: boolean;
  /** Gradient preset or custom colors. Pass false to disable gradient */
  gradient?: GradientPreset | GradientConfig | false;
  /** Additional style for the content container */
  contentStyle?: ViewStyle;
  /** Override the bottom padding (for screens that need custom spacing) */
  bottomPadding?: number;
}

/**
 * Wrapper component for tab screen content.
 * Handles scrolling and bottom navigation padding automatically.
 */
export default function TabContent({
  children,
  scrollable = true,
  gradient = false,
  contentStyle,
  bottomPadding = BOTTOM_NAV_PADDING,
}: TabContentProps) {
  // Resolve gradient config
  const gradientConfig = gradient === false
    ? null
    : typeof gradient === "string"
      ? GRADIENT_PRESETS[gradient]
      : gradient;

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: bottomPadding },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.staticContent, { paddingBottom: bottomPadding }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={styles.container}>
      {gradientConfig && (
        <LinearGradient
          colors={gradientConfig.colors}
          locations={gradientConfig.locations ?? undefined}
          style={StyleSheet.absoluteFill}
        />
      )}
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  staticContent: {
    flex: 1,
  },
});

