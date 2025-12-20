import type { AndroidGlassFallbackOptions } from "@/components/ui/GlassView";

/**
 * BottomSheetTabs UI knobs.
 *
 * Put every tunable UI constant here so you can tweak layout + feel without
 * hunting through multiple files.
 */

// Sheet sizing
export const BOTTOM_SHEET_TABS_COLLAPSED_HEIGHT = 112;
export const BOTTOM_SHEET_TABS_SNAP_POINT_EXPANDED = "58%" as const;

// Insets/padding (applied with safe-area bottom inset)
export const BOTTOM_SHEET_TABS_NAV_ROW_PADDING_BOTTOM = 14;
export const BOTTOM_SHEET_TABS_PANEL_PADDING_BOTTOM = 28;

// Sheet material rounding
export const BOTTOM_SHEET_TABS_SHEET_RADIUS = 24;

// Tab button paddings
export const TAB_BUTTON_PADDING_VERTICAL = 14;
export const TAB_BUTTON_PADDING_HORIZONTAL = 6;

// Active tab “blob” highlight (opaque inset rounded-rect) behind the selected tab.
export const ACTIVE_TAB_BLOB_COLOR = "#E5E5E5" as const; // neutral-200
// Lower value = wider blob + smaller perceived “gaps” between tabs.
export const ACTIVE_TAB_BLOB_INSET_X = 6;
export const ACTIVE_TAB_BLOB_INSET_Y = -6;
// Rounder corners but not a full “pill” capsule.
export const ACTIVE_TAB_BLOB_RADIUS = 54;

// Blob motion feel
export const BLOB_EXPAND_DURATION_MS = 160;
export const BLOB_CONTRACT_DURATION_MS = 190;

/**
 * Android-only tuning for the Liquid Glass fallback used by BottomSheetTabs.
 * iOS uses native Liquid Glass when supported.
 *
 * Put all blur/opacity knobs here so Android tweaking is centralized.
 */
const ANDROID_LIQUID_GLASS_CLEAR = {
  blurIntensity: 20,
  backgroundOpacity: 0.14,
  tintOpacity: 0.18,
  experimentalBlurMethod: "dimezisBlurView",
  blurReductionFactor: 2,
} as const satisfies AndroidGlassFallbackOptions;

export const ANDROID_LIQUID_GLASS_FALLBACK = {
  sheetBackground: ANDROID_LIQUID_GLASS_CLEAR,
  badge: ANDROID_LIQUID_GLASS_CLEAR,
} as const satisfies Record<"sheetBackground" | "badge", AndroidGlassFallbackOptions>;

export const ANDROID_BOTTOM_SHEET_BORDER = {
  width: 0.5,
  color: "rgba(163, 163, 163, 0.70)",
} as const;


