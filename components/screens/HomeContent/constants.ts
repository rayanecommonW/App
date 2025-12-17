export const DRAWER_WIDTH = 320;
export const OPEN_THRESHOLD = 0.35;
export const VELOCITY_THRESHOLD = 500;

export const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
} as const;

export type LookingFor = "Everyone" | "Women" | "Men";
export const LOOKING_FOR_OPTIONS: LookingFor[] = ["Everyone", "Women", "Men"];

export type AgeRange = "18-25" | "26-35" | "36+";
export const AGE_RANGE_OPTIONS: AgeRange[] = ["18-25", "26-35", "36+"];

export type Distance = "5km" | "15km" | "50km";
export const DISTANCE_OPTIONS: Distance[] = ["5km", "15km", "50km"];


