import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

export type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type TabName = "index" | "explore" | "matches" | "shop";

export type TabConfig = {
  name: TabName;
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
};

export const TABS: TabConfig[] = [
  { name: "index", label: "Home", icon: "home-outline", iconActive: "home" },
  { name: "explore", label: "Explore", icon: "compass-outline", iconActive: "compass" },
  { name: "matches", label: "Matches", icon: "people-outline", iconActive: "people" },
  { name: "shop", label: "Shop", icon: "bag-outline", iconActive: "bag" },
];


