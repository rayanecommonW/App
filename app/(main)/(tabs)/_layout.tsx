import BottomSheetTabs from "@/components/navigation/BottomSheetTabs";
import TabPager from "@/components/navigation/TabPager";
import ExploreContent from "@/components/screens/ExploreContent";
import HomeContent from "@/components/screens/HomeContent";
import MatchesContent from "@/components/screens/MatchesContent";
import ShopContent from "@/components/screens/ShopContent";
import { getTabIndex, TAB_ORDER, type TabName, usePagerStore } from "@/lib/pagerStore";
import { router, Slot, useSegments } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { View } from "react-native";

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
  const routerIndex = getTabIndex(activeTab);
  const { currentIndex, setIndex } = usePagerStore();
  const isNavigatingRef = useRef(false);

  // Sync store with router on mount and when URL changes externally
  useEffect(() => {
    if (!isNavigatingRef.current) {
      setIndex(routerIndex);
    }
  }, [routerIndex, setIndex]);

  // Handle navigation from pager (swipe gesture)
  const handlePagerNavigate = useCallback((tab: TabName) => {
    isNavigatingRef.current = true;
    setIndex(getTabIndex(tab));
    router.replace(tab === "index" ? "/(main)/(tabs)" : `/(main)/(tabs)/${tab}`);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
  }, [setIndex]);

  // Handle navigation from bottom sheet tabs (tap)
  const handleBottomTabNavigate = useCallback((tab: TabName) => {
    isNavigatingRef.current = true;
    setIndex(getTabIndex(tab));
    router.replace(tab === "index" ? "/(main)/(tabs)" : `/(main)/(tabs)/${tab}`);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
  }, [setIndex]);

  return (
    <View className="flex-1">
      {/* Hidden Slot for Expo Router compatibility - route files return null */}
      <View style={{ display: 'none' }}>
        <Slot />
      </View>

      <TabPager currentIndex={currentIndex} onNavigate={handlePagerNavigate}>
        <HomeContent />
        <ExploreContent />
        <MatchesContent />
        <ShopContent />
      </TabPager>

      <BottomSheetTabs activeTab={activeTab} onNavigate={handleBottomTabNavigate} />
    </View>
  );
}
