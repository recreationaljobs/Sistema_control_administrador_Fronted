// src/routes/RoleRoute.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RoleRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, rol } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;