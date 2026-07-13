import {
  Bell,
  BellRing,
  LoaderCircle,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import Swal from "sweetalert2";

import {
  escucharNotificaciones,
  registrarDispositivoNotificacion,
  reproducirSonidoNotificacion,
} from "../services/notificacionesService";

const obtenerEstadoInicial = () => {
  if (
    typeof Notification === "undefined"
  ) {
    return "no-soportado";
  }

  if (
    Notification.permission === "granted"
  ) {
    return "activo";
  }

  if (
    Notification.permission === "denied"
  ) {
    return "bloqueado";
  }

  return "inactivo";
};

const ActivarNotificaciones = () => {
  const [estado, setEstado] = useState(
    obtenerEstadoInicial
  );

  const [activando, setActivando] =
    useState(false);

  useEffect(() => {
    let cancelarEscucha = null;

    const iniciar = async () => {
      try {
        if (
          Notification.permission ===
          "granted"
        ) {
          await registrarDispositivoNotificacion();
          setEstado("activo");
        }

        cancelarEscucha =
          await escucharNotificaciones(
            async (payload) => {
              const data =
                payload.data || {};

              await reproducirSonidoNotificacion();

              const registro =
                await navigator
                  .serviceWorker
                  .ready;

              await registro.showNotification(
                data.title ||
                  "Recordatorio de jornada",
                {
                  body:
                    data.body ||
                    "Tienes un nuevo recordatorio.",

                  icon: "/favicon.ico",
                  badge: "/favicon.ico",

                  tag:
                    data.tag ||
                    "recordatorio-jornada",

                  data: {
                    url:
                      data.url ||
                      "/jornadas",
                  },

                  requireInteraction: true,
                  silent: false,
                }
              );
            }
          );
      } catch (error) {
        console.error(
          "Error al iniciar notificaciones:",
          error
        );
      }
    };

    iniciar();

    return () => {
      if (
        typeof cancelarEscucha ===
        "function"
      ) {
        cancelarEscucha();
      }
    };
  }, []);

  const activar = async () => {
    setActivando(true);

    try {
      await registrarDispositivoNotificacion();

      await reproducirSonidoNotificacion();

      setEstado("activo");

      await Swal.fire({
        title: "Notificaciones activadas",
        text:
          "Recibirás recordatorios para abrir "
          + "y cerrar tu jornada.",

        icon: "success",

        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
      });
    } catch (error) {
      const mensaje =
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudieron activar las notificaciones.";

      if (
        Notification.permission ===
        "denied"
      ) {
        setEstado("bloqueado");
      }

      await Swal.fire({
        title: "No se pudieron activar",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setActivando(false);
    }
  };

  const bloqueado =
    estado === "bloqueado";

  const activo =
    estado === "activo";

  return (
    <button
      type="button"
      onClick={activar}
      disabled={
        activando ||
        activo ||
        bloqueado ||
        estado === "no-soportado"
      }
      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
        activo
          ? "cursor-default border-green-200 bg-green-50 text-green-700"
          : bloqueado
          ? "cursor-not-allowed border-red-200 bg-red-50 text-red-700"
          : "border-[#F5B800] bg-white text-[#B98200] hover:bg-[#FFF8E1]"
      }`}
    >
      {activando ? (
        <LoaderCircle
          size={21}
          className="animate-spin"
        />
      ) : activo ? (
        <BellRing size={21} />
      ) : (
        <Bell size={21} />
      )}

      {activando
        ? "Activando..."
        : activo
        ? "Notificaciones activadas"
        : bloqueado
        ? "Notificaciones bloqueadas"
        : "Activar notificaciones"}
    </button>
  );
};

export default ActivarNotificaciones;