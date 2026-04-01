export const ROLE_VALUES = ["USER", "DEVELOPER", "GUEST"] as const;

export type Role = (typeof ROLE_VALUES)[number];

export const isRole = (value: unknown): value is Role => {
  return typeof value === "string" && ROLE_VALUES.includes(value as Role);
};