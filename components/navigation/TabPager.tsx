import { useDrawerStore } from "@/lib/drawerStore";
import { getTabName, TAB_ORDER, usePagerStore, type TabName } from "@/lib/pagerStore";
import React, { useCallback, useEffect, type ReactNode } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import TabPagerScreen from "./TabPagerScreen";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOTAL_TABS = TAB_ORDER.length;

// Snap thresholds
const SNAP_THRESHOLD = 0.25; // 25% of screen width
const VELOCITY_THRESHOLD = 500;

// Spring config matching the drawer
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
};

interface TabPagerProps {
  currentIndex: number;
  onNavigate: (tabName: TabName) => void;
  children: ReactNode[];
}

/**
 * Main pager component that handles horizontal swiping between tabs.
 * Renders all tab screens in a horizontal row and handles gesture-based navigation.
 * 
 * On home tab (index 0): only handles LEFT swipes (to Explore)
 * HomeContent handles RIGHT swipes (for drawer)
 */
export default function TabPager({ currentIndex, onNavigate, children }: TabPagerProps) {
  const translateX = useSharedValue(-currentIndex * SCREEN_WIDTH);
  const gestureStartX = useSharedValue(0);
  const targetIndexRef = useSharedValue(currentIndex);
  const { isOpen: drawerOpen } = useDrawerStore();
  const { setGestureActive } = usePagerStore();

  // Keep targetIndexRef in sync with currentIndex
  useEffect(() => {
    targetIndexRef.value = currentIndex;
  }, [currentIndex, targetIndexRef]);

  // Sync translateX when currentIndex changes externally (e.g., from bottom tabs)
  useEffect(() => {
    translateX.value = withSpring(-currentIndex * SCREEN_WIDTH, SPRING_CONFIG);
  }, [currentIndex, translateX]);

  // JS callback for navigation
  const handleNavigate = useCallback((index: number) => {
    onNavigate(getTabName(index));
  }, [onNavigate]);

  // JS callback for gesture state
  const handleGestureActive = useCallback((active: boolean) => {
    setGestureActive(active);
  }, [setGestureActive]);

  // Pan gesture for swiping between tabs
  // On home tab: only activates on LEFT swipes (negative X movement)
  // On other tabs: activates on both directions
  const panGesture = Gesture.Pan()
    .enabled(!drawerOpen)
    // On home tab, only activate on left swipe (-20px). On other tabs, activate on either direction.
    .activeOffsetX(currentIndex === 0 ? -20 : [-20, 20])
    .failOffsetY([-15, 15])
    .onStart(() => {
      gestureStartX.value = translateX.value;
      runOnJS(handleGestureActive)(true);
    })
    .onUpdate((e) => {
      const idx = targetIndexRef.value;

      // On home tab, only allow left swipe (the gesture already filters, but double-check)
      if (idx === 0 && e.translationX > 0) {
        return;
      }

      // Calculate new position with bounds
      const newX = gestureStartX.value + e.translationX;
      const minX = -(TOTAL_TABS - 1) * SCREEN_WIDTH;
      const maxX = 0;
      
      translateX.value = Math.max(minX, Math.min(maxX, newX));
    })
    .onEnd((e) => {
      runOnJS(handleGestureActive)(false);

      const idx = targetIndexRef.value;

      // On home tab with right swipe, do nothing (drawer handles it)
      if (idx === 0 && e.translationX > 0) {
        return;
      }

      const dragDistance = e.translationX;
      const velocity = e.velocityX;
      const threshold = SCREEN_WIDTH * SNAP_THRESHOLD;

      // Determine if we should navigate
      const shouldNavigate =
        Math.abs(dragDistance) > threshold || Math.abs(velocity) > VELOCITY_THRESHOLD;

      if (!shouldNavigate) {
        // Snap back to current index
        translateX.value = withSpring(-idx * SCREEN_WIDTH, SPRING_CONFIG);
        return;
      }

      // Determine direction and target index
      const direction = dragDistance > 0 ? -1 : 1; // Swipe right = previous tab, swipe left = next tab
      const newIndex = Math.max(0, Math.min(TOTAL_TABS - 1, idx + direction));

      if (newIndex !== idx) {
        // Navigate to new index
        targetIndexRef.value = newIndex;
        translateX.value = withSpring(-newIndex * SCREEN_WIDTH, SPRING_CONFIG, (finished) => {
          if (finished) {
            runOnJS(handleNavigate)(newIndex);
          }
        });
      } else {
        // Snap back
        translateX.value = withSpring(-idx * SCREEN_WIDTH, SPRING_CONFIG);
      }
    });

  // Animated style for the pager container
  const pagerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <Animated.View style={[styles.pager, pagerStyle]}>
          {React.Children.map(children, (child, index) => (
            <TabPagerScreen key={TAB_ORDER[index]} index={index}>
              {child}
            </TabPagerScreen>
          ))}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  pager: {
    flex: 1,
    flexDirection: "row",
    width: SCREEN_WIDTH * TOTAL_TABS,
  },
});
