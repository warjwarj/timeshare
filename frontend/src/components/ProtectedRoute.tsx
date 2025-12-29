import { Navigate } from "react-router-dom";
import type { ReactNode } from 'react'

import { ourUseSelector } from '../store/hooks';
import { selectToken } from "../store/slices/authSlice";

type ProtectedRouteProps = {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = ourUseSelector(selectToken)
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
export { ProtectedRoute };