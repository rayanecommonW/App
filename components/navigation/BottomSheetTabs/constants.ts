import type { AndroidGlassFallbackOptions } from "@/components/ui/GlassView";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

export type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type TabName = "index" | "explore" | "matches" | "shop";

export type TabConfig = {
  name: TabName;
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
};

export const TABS: TabConfig[] = [
  { name: "index", label: "Home", icon: "home-outline", iconActive: "home" },
  { name: "explore", label: "Explore", icon: "compass-outline", iconActive: "compass" },
  { name: "matches", label: "Matches", icon: "people-outline", iconActive: "people" },
  { name: "shop", label: "Shop", icon: "bag-outline", iconActive: "bag" },
];

/**
 * Android-only tuning for the Liquid Glass fallback used by BottomSheetTabs.
 * iOS uses native Liquid Glass when supported.
 *
 * Put all blur/opacity knobs here so Android tweaking is centralized.
 */
export const ANDROID_LIQUID_GLASS_CLEAR = {
  blurIntensity: 20,
  backgroundOpacity: 0.14,
  tintOpacity: 0.18,
  experimentalBlurMethod: "dimezisBlurView",
  blurReductionFactor: 2,
} as const satisfies AndroidGlassFallbackOptions;

export const ANDROID_LIQUID_GLASS_FALLBACK = {
  navBar: ANDROID_LIQUID_GLASS_CLEAR,
  sheetBackground: ANDROID_LIQUID_GLASS_CLEAR,
  badge: ANDROID_LIQUID_GLASS_CLEAR,
} as const satisfies Record<"navBar" | "sheetBackground" | "badge", AndroidGlassFallbackOptions>;

/**
 * Android-only: make the sheet border clearly visible (neutral-40-ish).
 * This overrides the default `GlassView` fallback border for the BottomSheet background only.
 */
export const ANDROID_BOTTOM_SHEET_BORDER = {
  width: 0.5,
  color: "rgba(163, 163, 163, 0.70)",
} as const;


