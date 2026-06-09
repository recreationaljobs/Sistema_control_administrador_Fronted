// src/modules/auth/services/authService.js

import api from "../../../api/axios";

const TOKEN_KEY = "taxi_token";
const USER_KEY = "taxi_user";
const ROL_KEY = "taxi_rol";
const SUCURSAL_KEY = "taxi_sucursal";
const SUCURSAL_NOMBRE_KEY = "taxi_sucursal_nombre";

export const loginRequest = async ({ username, password }) => {
  const response = await api.post("login/", {
    username,
    password,
  });

  return response.data;
};

export const saveSession = (data) => {
  const token = data?.token;
  const user = data?.user;

  let rol =
    data?.rol ||
    user?.rol_codigo ||
    user?.rol?.codigo ||
    user?.rol ||
    "";

  if (rol === "admin") {
    rol = "admin_sucursal";
  }

  if (rol === "Administrador") {
    rol = "admin_sucursal";
  }

  if (rol === "Administrador de Sucursal") {
    rol = "admin_sucursal";
  }

  const sucursal = data?.sucursal || user?.sucursal || "";
  const sucursalNombre = data?.sucursal_nombre || user?.sucursal_nombre || "";

  if (!token) {
    throw new Error("El backend no devolvió un token válido.");
  }

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
  localStorage.setItem(ROL_KEY, rol || "");
  localStorage.setItem(SUCURSAL_KEY, sucursal ? String(sucursal) : "");
  localStorage.setItem(SUCURSAL_NOMBRE_KEY, sucursalNombre || "");
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROL_KEY);
  localStorage.removeItem(SUCURSAL_KEY);
  localStorage.removeItem(SUCURSAL_NOMBRE_KEY);

  window.location.href = "/login";
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = () => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const getStoredRol = () => {
  return localStorage.getItem(ROL_KEY);
};

export const getStoredSucursal = () => {
  return localStorage.getItem(SUCURSAL_KEY);
};

export const getStoredSucursalNombre = () => {
  return localStorage.getItem(SUCURSAL_NOMBRE_KEY);
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};

export const isSuperAdmin = () => {
  return getStoredRol() === "superadmin";
};

export const isAdminSucursal = () => {
  return getStoredRol() === "admin_sucursal";
};

export const isTaxista = () => {
  return getStoredRol() === "taxista";
};