// src/context/AuthContext.jsx

import { createContext, useEffect, useMemo, useState } from "react";
import {
  getStoredRol,
  getStoredSucursal,
  getStoredSucursalNombre,
  getStoredUser,
  getToken,
  logout,
  saveSession,
} from "../modules/auth/services/authService";



export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getStoredUser());
  const [rol, setRol] = useState(getStoredRol());
  const [sucursal, setSucursal] = useState(getStoredSucursal());
  const [sucursalNombre, setSucursalNombre] = useState(getStoredSucursalNombre());

  const isAuthenticated = Boolean(token);

  const login = (data) => {
    saveSession(data);

    const newToken = getToken();
    const newUser = getStoredUser();
    const newRol = getStoredRol();
    const newSucursal = getStoredSucursal();
    const newSucursalNombre = getStoredSucursalNombre();

    setToken(newToken);
    setUser(newUser);
    setRol(newRol);
    setSucursal(newSucursal);
    setSucursalNombre(newSucursalNombre);
  };

  const logoutUser = () => {
    logout();
  };

  useEffect(() => {
    setToken(getToken());
    setUser(getStoredUser());
    setRol(getStoredRol());
    setSucursal(getStoredSucursal());
    setSucursalNombre(getStoredSucursalNombre());
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      rol,
      sucursal,
      sucursalNombre,
      isAuthenticated,
      isSuperAdmin: rol === "superadmin",
      isAdminSucursal: rol === "admin_sucursal",
      isTaxista: rol === "taxista",
      login,
      logout: logoutUser,
    }),
    [token, user, rol, sucursal, sucursalNombre, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};