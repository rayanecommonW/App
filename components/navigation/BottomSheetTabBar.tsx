import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useMemo, useRef, type ComponentProps, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const TAB_ICONS: Record<string, IoniconName> = {
  index: "home-outline",
  explore: "compass-outline",
  matches: "people-outline",
  shop: "bag-outline",
};

function SheetSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px] mb-2">
        {title.toUpperCase()}
      </Text>
      <View className="gap-2">{children}</View>
    </View>
  );
}

function Row({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View className="bg-surface border border-border-subtle rounded-2xl px-4 py-3 flex-row items-center justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-text-primary font-semibold">{title}</Text>
        {subtitle ? (
          <Text className="text-text-secondary text-sm mt-0.5">{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <View className="px-2.5 py-1 rounded-lg bg-surface-light border border-border-subtle">
      <Text className="text-text-secondary text-xs font-semibold">{text}</Text>
    </View>
  );
}

function Panel({ routeName }: { routeName: string }) {
  if (routeName === "index") {
    return (
      <SheetSection title="Notifications">
        <Row
          title="Queue tip"
          subtitle="Tap Find Match to start a ranked duel."
          right={<Badge text="NEW" />}
        />
        <Row
          title="Daily streak"
          subtitle="Play 1 match today to keep your streak."
          right={<Badge text="1/1" />}
        />
        <Row title="Patch notes" subtitle="A cleaner, faster UI is landing." />
      </SheetSection>
    );
  }

  if (routeName === "explore") {
    return (
      <SheetSection title="Leaderboard">
        <Row title="#1  NeonFox" subtitle="ELO 2110" right={<Badge text="GM" />} />
        <Row title="#2  Quartz" subtitle="ELO 1984" right={<Badge text="M" />} />
        <Row title="#3  RedPanda" subtitle="ELO 1766" right={<Badge text="D" />} />
      </SheetSection>
    );
  }

  if (routeName === "matches") {
    return (
      <SheetSection title="History">
        <Row title="AI Agent" subtitle="Correct guess • +25 ELO" right={<Badge text="+25" />} />
        <Row title="AI Agent" subtitle="Wrong guess • -20 ELO" right={<Badge text="-20" />} />
        <Row title="AI Agent" subtitle="Correct guess • +25 ELO" right={<Badge text="+25" />} />
      </SheetSection>
    );
  }

  return (
    <SheetSection title="Plans">
      <Row
        title="TRUTH tier"
        subtitle="Match with real humans only (demo)"
        right={<Badge text="TOP" />}
      />
      <Row title="Pro" subtitle="More matches + perks (demo)" />
      <Row title="Free" subtitle="Standard queue" right={<Badge text="CURRENT" />} />
    </SheetSection>
  );
}

export default function BottomSheetTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const collapsedHeight = 92 + insets.bottom;
  const snapPoints = useMemo(() => [collapsedHeight, "52%"], [collapsedHeight]);

  const activeRoute = state.routes[state.index];
  const activeRouteName = activeRoute?.name ?? "index";

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        enableOverDrag={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        style={styles.sheet}
        backgroundStyle={styles.sheetBackground}
        handleStyle={styles.handle}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.navRowWrap}>
          <View className="flex-row gap-2">
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label = options.title ?? route.name;
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }

                bottomSheetRef.current?.snapToIndex(0);
              };

              const onLongPress = () => {
                navigation.emit({ type: "tabLongPress", target: route.key });
                bottomSheetRef.current?.snapToIndex(1);
              };

              const iconName = TAB_ICONS[route.name] ?? "apps-outline";

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  className={`flex-1 px-2 py-3 rounded-2xl border items-center justify-center ${
                    isFocused
                      ? "bg-surface-strong border-border-subtle"
                      : "bg-surface border-border-subtle"
                  }`}
                >
                  <Ionicons
                    name={iconName}
                    size={20}
                    color={isFocused ? "#14060f" : "#a17b88"}
                  />
                  <Text
                    className={`text-[12px] font-semibold mt-1 ${
                      isFocused ? "text-text-primary" : "text-muted"
                    }`}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </BottomSheetView>

        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.panelContent,
            { paddingBottom: insets.bottom + 16 },
          ]}
        >
          <Panel routeName={activeRouteName} />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    marginHorizontal: 12,
  },
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
    paddingBottom: 10,
  },
  panelContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
});


