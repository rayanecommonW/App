import BottomSheet, {
  BottomSheetView,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Panel, SheetBackground, TabButton } from "./components";
import { TABS, type TabName } from "./constants";
import { styles } from "./styles";

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

  const collapsedHeight = 104 + insets.bottom;
  const snapPoints = useMemo(() => [collapsedHeight, "58%"], [collapsedHeight]);

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
          <Animated.View style={[styles.navRow, { paddingBottom: 14 + insets.bottom }, navRowStyle]}>
            <View style={styles.navBar}>
              <View style={styles.tabsRow}>
                {TABS.map((tab) => {
                  const isFocused = tab.name === activeTab;
                  return (
                    <TabButton
                      key={tab.name}
                      tab={tab}
                      isFocused={isFocused}
                      onPress={() => {
                        onNavigate(tab.name);
                        bottomSheetRef.current?.snapToIndex(0);
                      }}
                      onLongPress={() => bottomSheetRef.current?.snapToIndex(1)}
                    />
                  );
                })}
              </View>
            </View>
          </Animated.View>

          {/* Panel - visible when expanded */}
          <Animated.View style={[styles.panel, { paddingBottom: 28 + insets.bottom }, panelStyle]}>
            <Panel tab={activeTab} />
          </Animated.View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}


