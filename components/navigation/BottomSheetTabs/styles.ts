import { StyleSheet } from "react-native";

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
    justifyContent: "space-between",
    flex: 1,
    width: "100%",
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    position: "relative",
    backgroundColor: "transparent",
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
  activeIndicatorWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 6,
    alignItems: "center",
  },
  activeIndicator: {
    width: 18,
    height: 3,
    borderRadius: 3,
    backgroundColor: "rgba(20, 6, 15, 0.18)",
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


