import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

type ProtectedRouteProps = {
  children: React.ReactNode;
  anyOf?: string[];
};

export default function ProtectedRoute({ children, anyOf = [] }: ProtectedRouteProps) {
  const { token, loading, hasPermission } = useAuth();
  if (loading) return <div className="p-6 text-slate-600">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  if (anyOf.length && !hasPermission(...anyOf)) return <Navigate to="/forbidden" replace />;
  return <>{children}</>;
}
