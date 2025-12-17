import { useAuthStore, useChatStore } from "@/lib/store";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import {
    DrawerOverlay,
    HomeHeader,
    HomeStatsCards,
    MatchSection,
    OnlineStatusCard,
    PreferencesDrawer,
} from "./components";
import type { AgeRange, Distance, LookingFor } from "./constants";
import { styles } from "./styles";
import { useFindMatch } from "./useFindMatch";
import { useHomeDrawer } from "./useHomeDrawer";

export default function HomeContent() {
  const { profile, user } = useAuthStore();
  const { startSession } = useChatStore();

  const {
    drawerStyle,
    overlayStyle,
    contentStyle,
    drawerGesture,
    drawerOpenGesture,
    overlayGesture,
    openDrawerJS,
    closeDrawerJS,
  } = useHomeDrawer();

  const { isSearching, searchStatus, matchError, handleFindMatch, cancelSearch } =
    useFindMatch({
      profile,
      user,
      startSession,
    });

  // Preferences (demo)
  const [lookingFor, setLookingFor] = useState<LookingFor>("Everyone");
  const [ageRange, setAgeRange] = useState<AgeRange>("26-35");
  const [distance, setDistance] = useState<Distance>("15km");

  const onlineCount = Math.floor(Math.random() * 500) + 100;

  const eloRating = profile?.elo_rating ?? 1000;
  const tierLabel = profile?.is_premium ? "TRUTH" : "RANKED";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#ffe4e9", "#fff8f9", "#ffffff"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <GestureDetector gesture={drawerGesture}>
        <Animated.View className="flex-1 pb-40" style={contentStyle}>
          <HomeHeader onOpenDrawer={openDrawerJS} />

          <HomeStatsCards eloRating={eloRating} tierLabel={tierLabel} />

          <View className="flex-1 justify-center px-6">
            <MatchSection
              isSearching={isSearching}
              searchStatus={searchStatus}
              matchError={matchError}
              onCancelSearch={cancelSearch}
              onFindMatch={handleFindMatch}
            />
          </View>

          <View className="px-6">
            <OnlineStatusCard onlineCount={onlineCount} />
          </View>
        </Animated.View>
      </GestureDetector>

      <DrawerOverlay gesture={overlayGesture} overlayStyle={overlayStyle} onPress={closeDrawerJS} />

      <PreferencesDrawer
        gesture={drawerOpenGesture}
        drawerStyle={drawerStyle}
        onClose={closeDrawerJS}
        lookingFor={lookingFor}
        setLookingFor={setLookingFor}
        ageRange={ageRange}
        setAgeRange={setAgeRange}
        distance={distance}
        setDistance={setDistance}
      />
    </View>
  );
}


