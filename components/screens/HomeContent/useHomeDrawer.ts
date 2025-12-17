import { useDrawerStore } from "@/lib/drawerStore";
import { useCallback, useMemo } from "react";
import { Gesture } from "react-native-gesture-handler";
import {
    clamp,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import {
    DRAWER_WIDTH,
    OPEN_THRESHOLD,
    SPRING_CONFIG,
    VELOCITY_THRESHOLD,
} from "./constants";

export function useHomeDrawer() {
  const drawerProgress = useSharedValue(0);
  const gestureStartProgress = useSharedValue(0);
  const { setOpen: setDrawerOpen } = useDrawerStore();

  const openDrawer = useCallback(() => {
    "worklet";
    drawerProgress.value = withSpring(1, SPRING_CONFIG);
    runOnJS(setDrawerOpen)(true);
  }, [drawerProgress, setDrawerOpen]);

  const closeDrawer = useCallback(() => {
    "worklet";
    drawerProgress.value = withSpring(0, SPRING_CONFIG, (finished) => {
      if (finished) {
        runOnJS(setDrawerOpen)(false);
      }
    });
  }, [drawerProgress, setDrawerOpen]);

  // JS-side controls (button presses)
  const openDrawerJS = useCallback(() => {
    setDrawerOpen(true);
    drawerProgress.value = withSpring(1, SPRING_CONFIG);
  }, [drawerProgress, setDrawerOpen]);

  const closeDrawerJS = useCallback(() => {
    drawerProgress.value = withSpring(0, SPRING_CONFIG, (finished) => {
      if (finished) {
        runOnJS(setDrawerOpen)(false);
      }
    });
  }, [drawerProgress, setDrawerOpen]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          drawerProgress.value,
          [0, 1],
          [-DRAWER_WIDTH, 0]
        ),
      },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(drawerProgress.value, [0, 1], [0, 0.5]),
    pointerEvents: drawerProgress.value > 0.01 ? "auto" : "none",
  }));

  // Content moves right when drawer opens
  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(drawerProgress.value, [0, 1], [0, DRAWER_WIDTH * 0.15]),
      },
    ],
  }));

  // Drawer gesture - ONLY handles right swipes (opening) and closing when drawer is open.
  // Left swipes are handled by TabPager for smooth pager animation.
  const drawerGesture = useMemo(() => {
    return Gesture.Pan()
      // Only activate on rightward movement (>20px) - let left swipes go to TabPager.
      // When drawer is open (gestureStartProgress > 0), we need to handle both directions.
      .activeOffsetX(20)
      .failOffsetY([-15, 15])
      .onStart(() => {
        gestureStartProgress.value = drawerProgress.value;
      })
      .onUpdate((e) => {
        const dragProgress = e.translationX / DRAWER_WIDTH;
        const newProgress = clamp(gestureStartProgress.value + dragProgress, 0, 1);
        drawerProgress.value = newProgress;
      })
      .onEnd((e) => {
        const currentProgress = drawerProgress.value;
        const velocity = e.velocityX;

        let shouldOpen: boolean;

        if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
          shouldOpen = velocity > 0;
        } else {
          shouldOpen = currentProgress > OPEN_THRESHOLD;
        }

        if (shouldOpen) {
          openDrawer();
        } else {
          closeDrawer();
        }
      });
  }, [drawerProgress, gestureStartProgress, openDrawer, closeDrawer]);

  // Separate gesture for when drawer is already open (needs to handle both directions)
  const drawerOpenGesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetX([-20, 20])
      .failOffsetY([-15, 15])
      .onStart(() => {
        gestureStartProgress.value = drawerProgress.value;
      })
      .onUpdate((e) => {
        if (gestureStartProgress.value > 0.01) {
          const dragProgress = e.translationX / DRAWER_WIDTH;
          const newProgress = clamp(gestureStartProgress.value + dragProgress, 0, 1);
          drawerProgress.value = newProgress;
        }
      })
      .onEnd((e) => {
        if (gestureStartProgress.value < 0.01) return;

        const currentProgress = drawerProgress.value;
        const velocity = e.velocityX;

        let shouldOpen: boolean;

        if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
          shouldOpen = velocity > 0;
        } else {
          shouldOpen = currentProgress > OPEN_THRESHOLD;
        }

        if (shouldOpen) {
          openDrawer();
        } else {
          closeDrawer();
        }
      });
  }, [drawerProgress, gestureStartProgress, openDrawer, closeDrawer]);

  // Gesture for overlay - allows dragging to close the drawer progressively
  const overlayGesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetX([-20, 20])
      .failOffsetY([-15, 15])
      .onStart(() => {
        gestureStartProgress.value = drawerProgress.value;
      })
      .onUpdate((e) => {
        // Only allow closing (leftward drag) when drawer is open
        if (gestureStartProgress.value > 0.01) {
          const dragProgress = e.translationX / DRAWER_WIDTH;
          const newProgress = clamp(gestureStartProgress.value + dragProgress, 0, 1);
          drawerProgress.value = newProgress;
        }
      })
      .onEnd((e) => {
        if (gestureStartProgress.value < 0.01) return;

        const currentProgress = drawerProgress.value;
        const velocity = e.velocityX;

        let shouldOpen: boolean;

        if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
          shouldOpen = velocity > 0;
        } else {
          shouldOpen = currentProgress > OPEN_THRESHOLD;
        }

        if (shouldOpen) {
          openDrawer();
        } else {
          closeDrawer();
        }
      });
  }, [drawerProgress, gestureStartProgress, openDrawer, closeDrawer]);

  return {
    drawerStyle,
    overlayStyle,
    contentStyle,
    drawerGesture,
    drawerOpenGesture,
    overlayGesture,
    openDrawerJS,
    closeDrawerJS,
  };
}


