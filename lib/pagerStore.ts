import { create } from "zustand";

export type TabName = "index" | "explore" | "matches" | "shop";
export const TAB_ORDER: TabName[] = ["index", "explore", "matches", "shop"];

interface PagerState {
  currentIndex: number;
  isGestureActive: boolean;
  setIndex: (index: number) => void;
  setGestureActive: (active: boolean) => void;
}

export const usePagerStore = create<PagerState>((set) => ({
  currentIndex: 0,
  isGestureActive: false,
  setIndex: (currentIndex) => set({ currentIndex }),
  setGestureActive: (isGestureActive) => set({ isGestureActive }),
}));

// Helper to convert tab name to index
export function getTabIndex(tabName: TabName): number {
  return TAB_ORDER.indexOf(tabName);
}

// Helper to convert index to tab name
export function getTabName(index: number): TabName {
  return TAB_ORDER[index] ?? "index";
}

