import { shadowStyle } from "@/lib/shadow";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          height: 82,
          paddingBottom: 18,
          paddingTop: 12,
          ...shadowStyle({
            color: "#ef233c",
            opacity: 0.08,
            radius: 12,
            elevation: 0,
          }),
        },
        tabBarActiveTintColor: "#ef233c",
        tabBarInactiveTintColor: "#c7a9b2",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Play",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null, // Hide from tab bar
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}

