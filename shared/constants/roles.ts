export const Roles = {
  ADMIN: "ADMIN",
  DISPATCHER: "DISPATCHER",
  ACCOUNTS: "ACCOUNTS",
  FLEET_MANAGER: "FLEET_MANAGER",
  DRIVER: "DRIVER",
  CUSTOMER: "CUSTOMER",
  VENDOR: "VENDOR",
  BROKER: "BROKER",
} as const;

export type Role = typeof Roles[keyof typeof Roles];
