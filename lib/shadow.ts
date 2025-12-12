import { Platform, type ViewStyle } from "react-native";

type ShadowOptions = {
  color: string; // hex like #ef233c
  opacity: number; // 0..1
  radius: number; // px
  offsetX?: number; // px
  offsetY?: number; // px
  elevation?: number; // android
};

function hexToRgba(hex: string, opacity: number): string {
  const normalized = hex.replace("#", "").trim();

  const isShort = normalized.length === 3;
  const isLong = normalized.length === 6;

  if (!isShort && !isLong) {
    return `rgba(0, 0, 0, ${opacity})`;
  }

  const full = isShort
    ? normalized
        .split("")
        .map((c) => c + c)
        .join("")
    : normalized;

  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(0, 0, 0, ${opacity})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Cross-platform shadow helper.
 *
 * - Web: emits `boxShadow` (prevents `shadow*` deprecation warnings)
 * - Native: uses classic `shadow*` + `elevation`
 */
export function shadowStyle(options: ShadowOptions): ViewStyle {
  const {
    color,
    opacity,
    radius,
    offsetX = 0,
    offsetY = 0,
    elevation = 0,
  } = options;

  if (Platform.OS === "web") {
    const rgba = hexToRgba(color, opacity);
    // CSS format: offset-x offset-y blur-radius color
    return { boxShadow: `${offsetX}px ${offsetY}px ${radius}px ${rgba}` } as any;
  }

  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: offsetX, height: offsetY },
    elevation,
  };
}


