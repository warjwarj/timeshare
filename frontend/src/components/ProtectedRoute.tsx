import { Navigate } from "react-router-dom";

import { AuthContext } from "../contexts/AuthContext";
import { useContext } from "react";
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token } = useContext(AuthContext);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export { ProtectedRoute };