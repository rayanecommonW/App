import ListItem from "@/components/ui/ListItem";
import SheetSection from "@/components/ui/SheetSection";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useMemo, useRef, type ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IoniconName = ComponentProps<typeof Ionicons>["name"];
type TabName = "index" | "explore" | "matches" | "shop";

const TABS: {
  name: TabName;
  label: string;
  icon: IoniconName;
}[] = [
  { name: "index", label: "Home", icon: "home-outline" },
  { name: "explore", label: "Explore", icon: "compass-outline" },
  { name: "matches", label: "Matches", icon: "people-outline" },
  { name: "shop", label: "Shop", icon: "bag-outline" },
];

function Badge({ text }: { text: string }) {
  return (
    <View className="px-2.5 py-1 rounded-lg bg-surface-light border border-border-subtle">
      <Text className="text-text-secondary text-xs font-semibold">{text}</Text>
    </View>
  );
}

function Panel({ tab }: { tab: TabName }) {
  if (tab === "index") {
    return (
      <SheetSection title="Notifications">
        <ListItem
          title="Queue tip"
          subtitle="Tap Find match to start a ranked duel."
          right={<Badge text="NEW" />}
        />
        <ListItem
          title="Daily streak"
          subtitle="Play 1 match today to keep your streak."
          right={<Badge text="1/1" />}
        />
        <ListItem title="Patch notes" subtitle="Bottom-sheet tabs are live." />
      </SheetSection>
    );
  }

  if (tab === "explore") {
    return (
      <SheetSection title="Leaderboard">
        <ListItem title="#1  NeonFox" subtitle="ELO 2110" right={<Badge text="GM" />} />
        <ListItem title="#2  Quartz" subtitle="ELO 1984" right={<Badge text="M" />} />
        <ListItem title="#3  RedPanda" subtitle="ELO 1766" right={<Badge text="D" />} />
      </SheetSection>
    );
  }

  if (tab === "matches") {
    return (
      <SheetSection title="History">
        <ListItem title="AI Agent" subtitle="Correct guess • +25 ELO" right={<Badge text="+25" />} />
        <ListItem title="AI Agent" subtitle="Wrong guess • -20 ELO" right={<Badge text="-20" />} />
        <ListItem title="AI Agent" subtitle="Correct guess • +25 ELO" right={<Badge text="+25" />} />
      </SheetSection>
    );
  }

  return (
    <SheetSection title="Plans">
      <ListItem
        title="TRUTH tier"
        subtitle="Match with real humans only (demo)"
        right={<Badge text="TOP" />}
      />
      <ListItem title="Pro" subtitle="More matches + perks (demo)" />
      <ListItem title="Free" subtitle="Standard queue" right={<Badge text="CURRENT" />} />
    </SheetSection>
  );
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

  // Collapsed = nav row only (~100px), expanded = 55% of screen
  const collapsedHeight = 100 + insets.bottom;
  const snapPoints = useMemo(() => [collapsedHeight, "55%"], [collapsedHeight]);

  // Nav row fades OUT as we expand (index 0 -> 1)
  const navRowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 0.5], [1, 0], "clamp");
    const translateY = interpolate(animatedIndex.value, [0, 1], [0, 20], "clamp");
    return {
      opacity,
      transform: [{ translateY }],
      pointerEvents: opacity < 0.3 ? "none" : "auto",
    };
  });

  // Panel content fades IN as we expand
  const panelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0.3, 0.7], [0, 1], "clamp");
    return {
      opacity,
      pointerEvents: opacity < 0.3 ? "none" : "auto",
    };
  });

  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, { zIndex: 50, elevation: 50 }]}
    >
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        animatedIndex={animatedIndex}
        enablePanDownToClose={false}
        enableOverDrag={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        style={styles.sheet}
        backgroundStyle={styles.sheetBackground}
        handleStyle={styles.handle}
        handleIndicatorStyle={styles.handleIndicator}
      >
        {/* Nav row (header of the sheet) - fades out when expanded */}
        <Animated.View
          style={[styles.navRowWrap, { paddingBottom: 12 + insets.bottom }, navRowStyle]}
        >
          <View className="flex-row gap-2">
            {TABS.map((tab) => {
              const isFocused = tab.name === activeTab;
              return (
                <Pressable
                  key={tab.name}
                  onPress={() => {
                    onNavigate(tab.name);
                    bottomSheetRef.current?.snapToIndex(0);
                  }}
                  className={`flex-1 px-2 py-3 rounded-2xl border items-center justify-center ${
                    isFocused
                      ? "bg-surface-strong border-border-subtle"
                      : "bg-surface border-border-subtle"
                  } active:opacity-90`}
                >
                  <Ionicons
                    name={tab.icon}
                    size={20}
                    color={isFocused ? "#14060f" : "#a17b88"}
                  />
                  <Text
                    className={`text-[12px] font-semibold mt-1 ${
                      isFocused ? "text-text-primary" : "text-muted"
                    }`}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Panel content - fades in when expanded */}
        <Animated.View style={[{ flex: 1 }, panelStyle]}>
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 24 + insets.bottom,
            }}
          >
            <Panel tab={activeTab} />
          </BottomSheetScrollView>
        </Animated.View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {},
  sheetBackground: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#f6d9e1",
    shadowColor: "#14060f",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -6 },
    elevation: 10,
  },
  handle: {
    paddingTop: 10,
    paddingBottom: 6,
  },
  handleIndicator: {
    width: 44,
    height: 5,
    borderRadius: 6,
    backgroundColor: "#f6d9e1",
  },
  navRowWrap: {
    paddingHorizontal: 12,
    position: "absolute",
    left: 0,
    right: 0,
    top: 20, // below handle
    zIndex: 10,
  },
});
