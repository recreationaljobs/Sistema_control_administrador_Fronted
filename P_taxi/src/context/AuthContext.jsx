// src/context/AuthContext.jsx

import {
  createContext,
  useCallback,
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
  const [token, setToken] = useState(() => getToken());

  const [user, setUser] = useState(() =>
    getStoredUser()
  );

  const [rol, setRol] = useState(() =>
    getStoredRol()
  );

  const [sucursal, setSucursal] = useState(() =>
    getStoredSucursal()
  );

  const [sucursalNombre, setSucursalNombre] =
    useState(() => getStoredSucursalNombre());

  const isAuthenticated = Boolean(token);

  const login = useCallback((data) => {
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
    } else if (newRol === "admin_sucursal") {
      nombreRol = "Administrador de sucursal";
    } else if (newRol === "taxista") {
      nombreRol = "Taxista";
    } else if (newRol === "usuario_sistema") {
      nombreRol = "Usuario del sistema";
    }

    /*
     * Cierra cualquier alerta anterior que
     * haya quedado abierta.
     */
    Swal.close();

    /*
     * No se utiliza await.
     * La alerta se cierra automáticamente.
     */
    void Swal.fire({
      title: `¡Bienvenido, ${nombreUsuario}!`,

      text: nombreRol
        ? `Has iniciado sesión como ${nombreRol}.`
        : "Has iniciado sesión correctamente.",

      icon: "success",

      toast: true,
      position: "top-end",

      showConfirmButton: false,
      showCancelButton: false,

      timer: 2000,
      timerProgressBar: true,

      allowOutsideClick: true,
      allowEscapeKey: true,
      allowEnterKey: true,

      didOpen: () => {
        Swal.resumeTimer();
      },

      willClose: () => {
        /*
         * Limpia clases y estilos que SweetAlert
         * pueda dejar sobre la página.
         */
        document.body.classList.remove(
          "swal2-shown",
          "swal2-height-auto",
          "swal2-no-backdrop"
        );

        document.documentElement.classList.remove(
          "swal2-shown",
          "swal2-height-auto",
          "swal2-no-backdrop"
        );

        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      },
    });

    return {
      token: newToken,
      user: newUser,
      rol: newRol,
      sucursal: newSucursal,
      sucursalNombre: newSucursalNombre,
    };
  }, []);

  const logoutUser = useCallback(async () => {
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

      reverseButtons: true,

      allowOutsideClick: false,
      allowEscapeKey: true,
    });

    if (!result.isConfirmed) {
      return false;
    }

    Swal.close();

    logout();

    setToken(null);
    setUser(null);
    setRol(null);
    setSucursal(null);
    setSucursalNombre("");

    return true;
  }, []);

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
        rol === "superadmin" ||
        rol === "super_admin",

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
      login,
      logoutUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};