

import {
  Bell,
  BellRing,
  LoaderCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import { useAuth } from "../../../hooks/useAuth";

import {
  registrarDispositivoNotificacion,
  reproducirSonidoNotificacion,
} from "../services/notificacionesService";

const ESTADO = {
  VERIFICANDO: "verificando",
  INACTIVO: "inactivo",
  ACTIVO: "activo",
  BLOQUEADO: "bloqueado",
  NO_SOPORTADO: "no-soportado",
};

const obtenerCodigoRol = (auth) => {
  const codigo = String(
    auth?.rol ||
      auth?.user?.rol_codigo ||
      auth?.user?.rol?.codigo ||
      auth?.user?.rol ||
      ""
  )
    .trim()
    .toLowerCase();

  if (codigo === "super_admin") {
    return "superadmin";
  }

  if (
    codigo === "admin" ||
    codigo === "administrador" ||
    codigo === "administrador de sucursal"
  ) {
    return "admin_sucursal";
  }

  return codigo;
};

const obtenerMensajeError = (error) => {
  const datos = error?.response?.data;

  if (
    typeof datos?.detail === "string"
  ) {
    return datos.detail;
  }

  if (
    typeof datos?.token === "string"
  ) {
    return datos.token;
  }

  if (
    datos &&
    typeof datos === "object"
  ) {
    const primerValor =
      Object.values(datos)[0];

    if (
      Array.isArray(primerValor) &&
      primerValor.length > 0
    ) {
      return String(
        primerValor[0]
      );
    }

    if (
      typeof primerValor === "string"
    ) {
      return primerValor;
    }
  }

  return (
    error?.message ||
    "No se pudieron activar las notificaciones."
  );
};

const ActivarNotificaciones = () => {
  const auth = useAuth();

  const componenteMontado =
    useRef(true);

  const rol = useMemo(
    () => obtenerCodigoRol(auth),
    [auth]
  );

  const [estado, setEstado] =
    useState(
      ESTADO.VERIFICANDO
    );

  const [activando, setActivando] =
    useState(false);

  const descripcionNotificaciones =
    useMemo(() => {
      if (rol === "taxista") {
        return (
          "Recibirás recordatorios para abrir " +
          "y cerrar tu jornada."
        );
      }

      if (
        rol === "admin_sucursal"
      ) {
        return (
          "Recibirás alertas de mantenimiento " +
          "y cambio de aceite de los vehículos " +
          "de tu sucursal."
        );
      }

      if (rol === "superadmin") {
        return (
          "Recibirás alertas de mantenimiento " +
          "y cambio de aceite únicamente de los " +
          "vehículos registrados en el panel " +
          "del superadministrador."
        );
      }

      return (
        "Recibirás las notificaciones " +
        "correspondientes a tu usuario."
      );
    }, [rol]);

  useEffect(() => {
    componenteMontado.current = true;

    try {
      if (
        typeof window ===
          "undefined" ||
        typeof navigator ===
          "undefined" ||
        !(
          "Notification" in
          window
        ) ||
        !(
          "serviceWorker" in
          navigator
        )
      ) {
        setEstado(
          ESTADO.NO_SOPORTADO
        );

        return () => {
          componenteMontado.current =
            false;
        };
      }

      if (
        Notification.permission ===
        "denied"
      ) {
        setEstado(
          ESTADO.BLOQUEADO
        );

        return () => {
          componenteMontado.current =
            false;
        };
      }

      const tokenGuardado =
        localStorage.getItem(
          "taxi_notification_token"
        );

      if (
        Notification.permission ===
          "granted" &&
        tokenGuardado
      ) {
        setEstado(
          ESTADO.ACTIVO
        );
      } else {
        setEstado(
          ESTADO.INACTIVO
        );
      }
    } catch (error) {
      console.error(
        "Error verificando las notificaciones:",
        error
      );

      setEstado(
        ESTADO.INACTIVO
      );
    }

    return () => {
      componenteMontado.current =
        false;
    };
  }, []);

  const activar = async () => {
    if (
      activando ||
      estado === ESTADO.ACTIVO ||
      estado ===
        ESTADO.BLOQUEADO ||
      estado ===
        ESTADO.NO_SOPORTADO
    ) {
      return;
    }

    setActivando(true);

    try {
      const resultado =
        await registrarDispositivoNotificacion();

      if (
        componenteMontado.current
      ) {
        setEstado(
          ESTADO.ACTIVO
        );
      }

      try {
        await reproducirSonidoNotificacion();
      } catch (errorSonido) {
        console.error(
          "No se pudo reproducir el sonido:",
          errorSonido
        );
      }

      const mensajeBackend =
        resultado?.data
          ?.tipo_notificaciones;

      await Swal.fire({
        title:
          "Notificaciones activadas",

        text:
          mensajeBackend ||
          descripcionNotificaciones,

        icon: "success",

        confirmButtonText:
          "Aceptar",

        confirmButtonColor:
          "#eab308",

        allowOutsideClick:
          false,

        allowEscapeKey:
          false,
      });
    } catch (error) {
      console.error(
        "Error activando notificaciones:",
        error
      );

      localStorage.removeItem(
        "taxi_notification_token"
      );

      localStorage.removeItem(
        "taxi_notifications_enabled"
      );

      if (
        componenteMontado.current
      ) {
        if (
          typeof Notification !==
            "undefined" &&
          Notification.permission ===
            "denied"
        ) {
          setEstado(
            ESTADO.BLOQUEADO
          );
        } else {
          setEstado(
            ESTADO.INACTIVO
          );
        }
      }

      const mensaje =
        obtenerMensajeError(
          error
        );

      await Swal.fire({
        title:
          "No se pudieron activar",

        text: mensaje,

        icon: "error",

        confirmButtonText:
          "Aceptar",

        confirmButtonColor:
          "#dc2626",
      });
    } finally {
      if (
        componenteMontado.current
      ) {
        setActivando(false);
      }
    }
  };

  const verificando =
    estado ===
    ESTADO.VERIFICANDO;

  const activo =
    estado ===
    ESTADO.ACTIVO;

  const bloqueado =
    estado ===
    ESTADO.BLOQUEADO;

  const noSoportado =
    estado ===
    ESTADO.NO_SOPORTADO;

  const mostrarDescripcion =
    !verificando &&
    !bloqueado &&
    !noSoportado;

  const botonDeshabilitado =
    activando ||
    verificando ||
    activo ||
    bloqueado ||
    noSoportado;

  return (
    <div
      className="notranslate w-full"
      translate="no"
    >
      <button
        type="button"
        onClick={activar}
        disabled={
          botonDeshabilitado
        }
        aria-busy={
          activando ||
          verificando
        }
        className={`notranslate inline-flex w-full items-center justify-center rounded-2xl border px-4 py-3 text-sm font-black transition ${
          activo
            ? "border-green-200 bg-green-50 text-green-700"
            : bloqueado ||
                noSoportado
              ? "cursor-not-allowed border-red-200 bg-red-50 text-red-700"
              : verificando
                ? "cursor-wait border-slate-200 bg-slate-50 text-slate-500"
                : "border-[#F5B800] bg-white text-[#B98200] hover:bg-[#FFF8E1]"
        }`}
        translate="no"
      >
        <span className="relative mr-2 flex h-[21px] w-[21px] shrink-0 items-center justify-center">
          <LoaderCircle
            size={21}
            aria-hidden={
              !(
                activando ||
                verificando
              )
            }
            className={`absolute animate-spin ${
              activando ||
              verificando
                ? "block"
                : "hidden"
            }`}
          />

          <BellRing
            size={21}
            aria-hidden={!activo}
            className={`absolute ${
              activo
                ? "block"
                : "hidden"
            }`}
          />

          <Bell
            size={21}
            aria-hidden={
              activo ||
              activando ||
              verificando
            }
            className={`absolute ${
              !activo &&
              !activando &&
              !verificando
                ? "block"
                : "hidden"
            }`}
          />
        </span>

        <span
          aria-hidden={!activando}
          className={
            activando
              ? "inline"
              : "hidden"
          }
        >
          Activando...
        </span>

        <span
          aria-hidden={!verificando}
          className={
            verificando &&
            !activando
              ? "inline"
              : "hidden"
          }
        >
          Verificando...
        </span>

        <span
          aria-hidden={!activo}
          className={
            activo
              ? "inline"
              : "hidden"
          }
        >
          Notificaciones activadas
        </span>

        <span
          aria-hidden={!bloqueado}
          className={
            bloqueado
              ? "inline"
              : "hidden"
          }
        >
          Notificaciones bloqueadas
        </span>

        <span
          aria-hidden={!noSoportado}
          className={
            noSoportado
              ? "inline"
              : "hidden"
          }
        >
          Navegador no compatible
        </span>

        <span
          aria-hidden={
            activando ||
            verificando ||
            activo ||
            bloqueado ||
            noSoportado
          }
          className={
            !activando &&
            !verificando &&
            !activo &&
            !bloqueado &&
            !noSoportado
              ? "inline"
              : "hidden"
          }
        >
          Activar notificaciones
        </span>
      </button>

      <p
        aria-hidden={
          !mostrarDescripcion
        }
        className={`mt-2 text-center text-xs font-semibold text-slate-500 ${
          mostrarDescripcion
            ? "block"
            : "hidden"
        }`}
      >
        {
          descripcionNotificaciones
        }
      </p>
    </div>
  );
};

export default ActivarNotificaciones;

