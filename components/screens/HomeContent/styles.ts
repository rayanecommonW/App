import { StyleSheet } from "react-native";
import { DRAWER_WIDTH } from "./constants";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#14060f",
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#f6d9e1",
  },
  arenaLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    letterSpacing: 2,
    marginBottom: 8,
  },
  imageGlowContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  glowLayer: {
    position: "absolute",
    borderRadius: 999,
  },
  glowLayer1: {
    width: 60,
    height: 60,
    backgroundColor: "#c084fc",
    shadowColor: "#a855f7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    opacity: 0.7,
  },
  glowLayer2: {
    width: 80,
    height: 80,
    backgroundColor: "#a855f7",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 20,
    opacity: 0.4,
  },
  glowLayer3: {
    width: 100,
    height: 100,
    backgroundColor: "#8b5cf6",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 35,
    elevation: 25,
    opacity: 0.2,
  },
  arenaImage: {
    width: 120,
    height: 100,
    zIndex: 10,
  },
  arenaTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
});


