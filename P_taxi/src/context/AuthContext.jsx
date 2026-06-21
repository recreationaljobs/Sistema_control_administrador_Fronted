
// src/context/AuthContext.jsx

import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

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

  const [sucursal, setSucursal] = useState(
    getStoredSucursal()
  );

  const [sucursalNombre, setSucursalNombre] =
    useState(getStoredSucursalNombre());

  const isAuthenticated = Boolean(token);

  const login = (data) => {
    saveSession(data);

    const newToken = getToken();
    const newUser = getStoredUser();
    const newRol = getStoredRol();
    const newSucursal = getStoredSucursal();
    const newSucursalNombre =
      getStoredSucursalNombre();

    setToken(newToken);
    setUser(newUser);
    setRol(newRol);
    setSucursal(newSucursal);
    setSucursalNombre(newSucursalNombre);

    const nombreUsuario =
      newUser?.first_name ||
      newUser?.username ||
      "Usuario";

    let nombreRol = newRol || "";

    if (newRol === "superadmin") {
      nombreRol = "Superadministrador";
    }

    if (newRol === "admin_sucursal") {
      nombreRol = "Administrador de sucursal";
    }

    if (newRol === "taxista") {
      nombreRol = "Taxista";
    }

    Swal.fire({
      title: `¡Bienvenido, ${nombreUsuario}!`,

      text: nombreRol
        ? `Has iniciado sesión como ${nombreRol}.`
        : "Has iniciado sesión correctamente.",

      icon: "success",

      showConfirmButton: false,
      showCancelButton: false,

      timer: 2200,
      timerProgressBar: true,

      allowOutsideClick: false,
      allowEscapeKey: false,
    });
  };

  const logoutUser = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",

      text:
        "Se cerrará tu sesión actual y volverás al inicio de sesión.",

      icon: "warning",

      showCancelButton: true,

      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",

      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      logout();
    }
  };

  useEffect(() => {
    setToken(getToken());
    setUser(getStoredUser());
    setRol(getStoredRol());
    setSucursal(getStoredSucursal());
    setSucursalNombre(
      getStoredSucursalNombre()
    );
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      rol,
      sucursal,
      sucursalNombre,
      isAuthenticated,

      isSuperAdmin:
        rol === "superadmin",

      isAdminSucursal:
        rol === "admin_sucursal",

      isTaxista:
        rol === "taxista",

      login,

      logout: logoutUser,
    }),
    [
      token,
      user,
      rol,
      sucursal,
      sucursalNombre,
      isAuthenticated,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

