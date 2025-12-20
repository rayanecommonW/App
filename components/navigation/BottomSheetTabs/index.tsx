import BottomSheet, {
  BottomSheetView,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Panel, SheetBackground, TabButton } from "./components";
import {
  TABS,
  type TabName,
} from "./constants";
import { styles } from "./styles";
import {
  ACTIVE_TAB_BLOB_INSET_X,
  BLOB_CONTRACT_DURATION_MS,
  BLOB_EXPAND_DURATION_MS,
  BOTTOM_SHEET_TABS_COLLAPSED_HEIGHT,
  BOTTOM_SHEET_TABS_NAV_ROW_PADDING_BOTTOM,
  BOTTOM_SHEET_TABS_PANEL_PADDING_BOTTOM,
  BOTTOM_SHEET_TABS_SNAP_POINT_EXPANDED,
} from "./ui";

const TAB_COUNT = TABS.length;

function getActiveIndex(tab: TabName) {
  const idx = TABS.findIndex((t) => t.name === tab);
  return idx === -1 ? 0 : idx;
}

function getBlobEdges(index: number, tabsRowWidth: number) {
  const tabWidth = tabsRowWidth / TAB_COUNT;
  const left = index * tabWidth + ACTIVE_TAB_BLOB_INSET_X;
  const right = (index + 1) * tabWidth - ACTIVE_TAB_BLOB_INSET_X;
  return { left, right };
}

export default function BottomSheetTabs({
  activeTab,
  onNavigate,
}: {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
}) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const animatedIndex = useSharedValue(0);

  const tabsRowWidthRef = useRef(0);
  const activeIndexRef = useRef(getActiveIndex(activeTab));
  const didMeasureTabsRowRef = useRef(false);

  const blobLeft = useSharedValue(0);
  const blobRight = useSharedValue(0);

  // A bit taller so the blob feels less “pill” and the tabs breathe more vertically.
  const collapsedHeight = BOTTOM_SHEET_TABS_COLLAPSED_HEIGHT + insets.bottom;
  const snapPoints = useMemo(
    () => [collapsedHeight, BOTTOM_SHEET_TABS_SNAP_POINT_EXPANDED],
    [collapsedHeight]
  );

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 20,
    stiffness: 210,
    mass: 0.75,
    overshootClamping: false,
  });

  const navRowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 0.42], [1, 0], "clamp");
    const translateY = interpolate(animatedIndex.value, [0, 1], [0, 26], "clamp");
    return { opacity, transform: [{ translateY }] };
  });

  const panelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0.22, 0.62], [0, 1], "clamp");
    const translateY = interpolate(animatedIndex.value, [0.22, 1], [18, 0], "clamp");
    return { opacity, transform: [{ translateY }] };
  });

  useEffect(() => {
    const nextIndex = getActiveIndex(activeTab);
    const prevIndex = activeIndexRef.current;
    if (nextIndex === prevIndex) return;
    activeIndexRef.current = nextIndex;

    const w = tabsRowWidthRef.current;
    if (w <= 0) return;

    const easing = Easing.out(Easing.cubic);
    const { left: nextLeft, right: nextRight } = getBlobEdges(nextIndex, w);

    // “Englobe” animation:
    // - moving right: extend right edge first (covers target), then move left edge to release previous
    // - moving left: extend left edge first, then move right edge
    if (nextIndex > prevIndex) {
      blobRight.value = withTiming(nextRight, { duration: BLOB_EXPAND_DURATION_MS, easing });
      blobLeft.value = withDelay(
        BLOB_EXPAND_DURATION_MS,
        withTiming(nextLeft, { duration: BLOB_CONTRACT_DURATION_MS, easing })
      );
    } else {
      blobLeft.value = withTiming(nextLeft, { duration: BLOB_EXPAND_DURATION_MS, easing });
      blobRight.value = withDelay(
        BLOB_EXPAND_DURATION_MS,
        withTiming(nextRight, { duration: BLOB_CONTRACT_DURATION_MS, easing })
      );
    }
  }, [activeTab, blobLeft, blobRight]);

  const activeBlobStyle = useAnimatedStyle(() => {
    const width = blobRight.value - blobLeft.value;
    if (width <= 0) return { opacity: 0 };

    return {
      opacity: 1,
      left: blobLeft.value,
      width,
    };
  });

  const handleTabsRowLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    tabsRowWidthRef.current = w;

    // Snap blob to the correct tab when we first measure (and on layout changes).
    const idx = getActiveIndex(activeTab);
    const { left, right } = getBlobEdges(idx, w);
    blobLeft.value = left;
    blobRight.value = right;

    if (!didMeasureTabsRowRef.current) {
      didMeasureTabsRowRef.current = true;
      activeIndexRef.current = idx;
    }
  };

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.container]}>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        animatedIndex={animatedIndex}
        animationConfigs={animationConfigs}
        enablePanDownToClose={false}
        enableOverDrag
        overDragResistanceFactor={3.2}
        enableContentPanningGesture
        enableHandlePanningGesture
        style={styles.sheet}
        backgroundComponent={SheetBackground}
        handleStyle={styles.handle}
        handleIndicatorStyle={styles.indicator}
      >
        <BottomSheetView style={styles.content}>
          {/* Nav row - visible when collapsed */}
          <Animated.View
            style={[
              styles.navRow,
              { paddingBottom: BOTTOM_SHEET_TABS_NAV_ROW_PADDING_BOTTOM + insets.bottom },
              navRowStyle,
            ]}
          >
            <View style={styles.navBar}>
              <View style={styles.tabsRow} onLayout={handleTabsRowLayout}>
                <Animated.View pointerEvents="none" style={[styles.activeBlob, activeBlobStyle]} />
                {TABS.map((tab) => {
                  const isFocused = tab.name === activeTab;
                  return (
                    <View key={tab.name} style={styles.tabSlot}>
                      <TabButton
                        tab={tab}
                        isFocused={isFocused}
                        onPress={() => {
                          onNavigate(tab.name);
                          bottomSheetRef.current?.snapToIndex(0);
                        }}
                        onLongPress={() => bottomSheetRef.current?.snapToIndex(1)}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>

          {/* Panel - visible when expanded */}
          <Animated.View
            style={[
              styles.panel,
              { paddingBottom: BOTTOM_SHEET_TABS_PANEL_PADDING_BOTTOM + insets.bottom },
              panelStyle,
            ]}
          >
            <Panel tab={activeTab} />
          </Animated.View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}


