import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api/",

  headers: {
    "Content-Type": "application/json",
  },
});

const limpiarSesion = () => {
  localStorage.removeItem("taxi_token");
  localStorage.removeItem("taxi_user");
  localStorage.removeItem("taxi_rol");
  localStorage.removeItem("taxi_sucursal");
  localStorage.removeItem(
    "taxi_sucursal_nombre"
  );
};

const obtenerAuthorization = (headers) => {
  if (!headers) {
    return "";
  }

  if (typeof headers.get === "function") {
    return (
      headers.get("Authorization") ||
      headers.get("authorization") ||
      ""
    );
  }

  return (
    headers.Authorization ||
    headers.authorization ||
    ""
  );
};

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("taxi_token");

    config.headers =
      config.headers || {};

    if (token) {
      config.headers.Authorization =
        `Token ${token}`;
    } else {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status =
      error?.response?.status;

    if (status !== 401) {
      return Promise.reject(error);
    }

    const urlPeticion = String(
      error?.config?.url || ""
    );

    const esPeticionLogin =
      urlPeticion.includes("login/");

    /*
     * Un error 401 del propio inicio de sesión
     * significa credenciales incorrectas.
     * No debe cerrar otra sesión ni redirigir.
     */
    if (esPeticionLogin) {
      return Promise.reject(error);
    }

    const tokenActual =
      localStorage.getItem("taxi_token");

    const authorizationPeticion =
      obtenerAuthorization(
        error?.config?.headers
      );

    const authorizationActual =
      tokenActual
        ? `Token ${tokenActual}`
        : "";

    /*
     * Solo cerramos la sesión cuando el 401
     * pertenece exactamente al token actual.
     *
     * Una solicitud atrasada con un token
     * anterior no podrá eliminar una sesión
     * que acaba de iniciarse.
     */
    const perteneceSesionActual =
      Boolean(tokenActual) &&
      authorizationPeticion ===
        authorizationActual;

    if (!perteneceSesionActual) {
      return Promise.reject(error);
    }

    /*
     * Evita que varias respuestas 401
     * intenten cerrar la sesión al mismo tiempo.
     */
    const cierreEnProceso =
      sessionStorage.getItem(
        "taxi_cierre_sesion_en_proceso"
      );

    if (!cierreEnProceso) {
      sessionStorage.setItem(
        "taxi_cierre_sesion_en_proceso",
        "1"
      );

      limpiarSesion();

      if (
        window.location.pathname !==
        "/login"
      ) {
        window.location.replace(
          "/login?sesion=expirada"
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;