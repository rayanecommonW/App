import { StyleSheet } from "react-native";
import {
  ACTIVE_TAB_BLOB_COLOR,
  ACTIVE_TAB_BLOB_INSET_Y,
  ACTIVE_TAB_BLOB_RADIUS,
  TAB_BUTTON_PADDING_HORIZONTAL,
  TAB_BUTTON_PADDING_VERTICAL,
} from "./ui";

export const styles = StyleSheet.create({
  container: {
    zIndex: 50,
    elevation: 50,
  },
  sheet: {
    marginHorizontal: 12,
    shadowColor: "#14060f",
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: -10 },
    elevation: 18,
  },
  sheetBackground: {
    // BottomSheet supplies positioning; we only style material.
    backgroundColor: "transparent",
  },
  handle: {
    paddingTop: 10,
    paddingBottom: 6,
  },
  indicator: {
    width: 42,
    height: 5,
    borderRadius: 6,
    backgroundColor: "rgba(160, 110, 128, 0.35)",
  },
  content: {
    flex: 1,
  },
  navRow: {
    paddingHorizontal: 12,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
  },
  navBar: {
    padding: 10,
    width: "100%",
    alignSelf: "stretch",
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    // Keep tabs spread across the full width (prevents any left-clumping).
    justifyContent: "space-between",
    flex: 1,
    width: "100%",
    position: "relative",
  },
  tabSlot: {
    flex: 1,
    minWidth: 0,
  },
  activeBlob: {
    position: "absolute",
    top: ACTIVE_TAB_BLOB_INSET_Y,
    bottom: ACTIVE_TAB_BLOB_INSET_Y,
    borderRadius: ACTIVE_TAB_BLOB_RADIUS,
    backgroundColor: ACTIVE_TAB_BLOB_COLOR,
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    // Ensure equal widths regardless of label length (helps blob alignment).
    flexBasis: 0,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: TAB_BUTTON_PADDING_VERTICAL,
    paddingHorizontal: TAB_BUTTON_PADDING_HORIZONTAL,
    position: "relative",
    backgroundColor: "transparent",
    zIndex: 1,
  },
  tabButtonFocused: {
    // No background/border; focused state is handled by color + indicator
  },
  tabPressed: {
    // Keep it blended with the glass (no dimming). Subtle press scale only.
    transform: [{ scale: 0.985 }],
  },
  tabContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    width: 24,
    textAlign: "center",
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#7a5966",
    letterSpacing: 0.2,
    textAlign: "center",
    width: "100%",
    includeFontPadding: false,
  },
  tabLabelActive: {
    color: "#14060f",
    fontWeight: "700",
  },
  panel: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6f4d58",
  },
});


