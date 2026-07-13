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


const ActivarNotificaciones = () => {
  const [estado, setEstado] = useState(
    "verificando"
  );

  const [activando, setActivando] =
    useState(false);


  useEffect(() => {
    let cancelarEscucha = null;
    let componenteActivo = true;

    const configurarEscucha = async () => {
      try {
        if (
          typeof window === "undefined" ||
          typeof navigator === "undefined" ||
          !("Notification" in window) ||
          !("serviceWorker" in navigator)
        ) {
          if (componenteActivo) {
            setEstado("no-soportado");
          }

          return;
        }

        if (
          Notification.permission ===
          "denied"
        ) {
          if (componenteActivo) {
            setEstado("bloqueado");
          }

          return;
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
          if (componenteActivo) {
            setEstado("activo");
          }

          try {
            cancelarEscucha =
              await escucharNotificaciones(
                async (payload) => {
                  try {
                    const data =
                      payload?.data || {};

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
                  } catch (error) {
                    console.error(
                      "Error mostrando la notificación:",
                      error
                    );
                  }
                }
              );
          } catch (error) {
            console.error(
              "Error iniciando la escucha de Firebase:",
              error
            );
          }

          return;
        }

        if (componenteActivo) {
          setEstado("inactivo");
        }
      } catch (error) {
        console.error(
          "Error verificando notificaciones:",
          error
        );

        if (componenteActivo) {
          setEstado("inactivo");
        }
      }
    };

    configurarEscucha();

    return () => {
      componenteActivo = false;

      if (
        typeof cancelarEscucha ===
        "function"
      ) {
        cancelarEscucha();
      }
    };
  }, []);


  const activar = async () => {
    if (activando) {
      return;
    }

    setActivando(true);

    try {
      await registrarDispositivoNotificacion();

      try {
        await reproducirSonidoNotificacion();
      } catch (error) {
        console.error(
          "No se pudo reproducir el sonido:",
          error
        );
      }

      setEstado("activo");

      await Swal.fire({
        title: "Notificaciones activadas",

        text:
          "Recibirás recordatorios para abrir "
          + "y cerrar tu jornada.",

        icon: "success",

        showConfirmButton: false,
        showCancelButton: false,

        timer: 2200,
        timerProgressBar: true,

        allowOutsideClick: false,
        allowEscapeKey: false,
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
        typeof Notification !==
          "undefined" &&
        Notification.permission ===
          "denied"
      ) {
        setEstado("bloqueado");
      } else {
        setEstado("inactivo");
      }

      const datos =
        error?.response?.data;

      const mensaje =
        datos?.detail ||
        datos?.token ||
        error?.message ||
        "No se pudieron activar las notificaciones.";

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


  const verificando =
    estado === "verificando";

  const activo =
    estado === "activo";

  const bloqueado =
    estado === "bloqueado";

  const noSoportado =
    estado === "no-soportado";


  return (
    <button
      type="button"
      onClick={activar}
      disabled={
        activando ||
        verificando ||
        activo ||
        bloqueado ||
        noSoportado
      }
      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
        activo
          ? "cursor-default border-green-200 bg-green-50 text-green-700"
          : bloqueado || noSoportado
          ? "cursor-not-allowed border-red-200 bg-red-50 text-red-700"
          : verificando
          ? "cursor-wait border-slate-200 bg-slate-50 text-slate-500"
          : "border-[#F5B800] bg-white text-[#B98200] hover:bg-[#FFF8E1]"
      }`}
    >
      {activando || verificando ? (
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
        : verificando
        ? "Verificando..."
        : activo
        ? "Notificaciones activadas"
        : bloqueado
        ? "Notificaciones bloqueadas"
        : noSoportado
        ? "Navegador no compatible"
        : "Activar notificaciones"}
    </button>
  );
};

export default ActivarNotificaciones;