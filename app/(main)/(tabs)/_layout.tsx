import BottomSheetTabs from "@/components/navigation/BottomSheetTabs";
import { useDrawerStore } from "@/lib/drawerStore";
import { Tabs, router, useSegments } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

type TabName = "index" | "explore" | "matches" | "shop";
const TAB_ORDER: TabName[] = ["index", "explore", "matches", "shop"];

function getActiveTabName(segments: string[]): TabName {
  const tabsIdx = segments.findIndex((s) => s === "(tabs)");
  if (tabsIdx === -1) return "index";
  const maybe = segments[tabsIdx + 1];
  if (!maybe || maybe.startsWith("(")) return "index";
  return TAB_ORDER.includes(maybe as TabName) ? (maybe as TabName) : "index";
}

export default function TabsLayout() {
  const segments = useSegments();
  const activeTab = useMemo(() => getActiveTabName(segments), [segments]);
  const { isOpen: drawerOpen } = useDrawerStore();

  const navigateTab = (tab: TabName) => {
    router.replace(tab === "index" ? "/(main)/(tabs)" : `/(main)/(tabs)/${tab}`);
  };

  // Swipe gesture for navigating between tabs (not for drawer - that's handled in index.tsx)
  const swipeGesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(!drawerOpen && activeTab !== "index") // Disable on home tab (drawer handles it) and when drawer is open
      .activeOffsetX([-24, 24])
      .failOffsetY([-18, 18])
      .onEnd((e) => {
        const threshold = 64;
        if (Math.abs(e.translationX) < threshold) return;

        const idx = TAB_ORDER.indexOf(activeTab);
        if (idx === -1) return;

        // Swipe right on first non-home tab -> go to home (where drawer is)
        if (e.translationX > 0 && idx === 1) {
          runOnJS(navigateTab)("index");
          return;
        }

        const nextIdx =
          e.translationX > 0 ? Math.max(0, idx - 1) : Math.min(TAB_ORDER.length - 1, idx + 1);
        const nextTab = TAB_ORDER[nextIdx];
        if (nextTab && nextTab !== activeTab) {
          runOnJS(navigateTab)(nextTab);
        }
      });
  }, [activeTab, drawerOpen]);

  return (
    <View className="flex-1">
      <GestureDetector gesture={swipeGesture}>
        <View className="flex-1">
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: "none" },
            }}
          >
            <Tabs.Screen name="index" options={{ title: "Home" }} />
            <Tabs.Screen name="explore" options={{ title: "Explore" }} />
            <Tabs.Screen name="matches" options={{ title: "Matches" }} />
            <Tabs.Screen name="shop" options={{ title: "Shop" }} />
          </Tabs>
        </View>
      </GestureDetector>

      <BottomSheetTabs activeTab={activeTab} onNavigate={navigateTab} />
    </View>
  );
}


