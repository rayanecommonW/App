import { memo, type ReactNode } from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TabPagerScreenProps {
  index: number;
  children: ReactNode;
}

/**
 * Wrapper component for each tab screen in the pager.
 * Positions the screen at the correct horizontal offset based on its index.
 */
function TabPagerScreen({ index, children }: TabPagerScreenProps) {
  return (
    <View
      style={[
        styles.screen,
        {
          left: index * SCREEN_WIDTH,
          width: SCREEN_WIDTH,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: "absolute",
    top: 0,
    bottom: 0,
  },
});

export default memo(TabPagerScreen);
export { SCREEN_WIDTH };

