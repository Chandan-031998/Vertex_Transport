import React from "react";
import { useAuth } from "./AuthProvider";

type PermissionGateProps = {
  anyOf?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export default function PermissionGate({ anyOf = [], fallback = null, children }: PermissionGateProps) {
  const { hasPermission } = useAuth();
  if (anyOf.length && !hasPermission(...anyOf)) return <>{fallback}</>;
  return <>{children}</>;
}
