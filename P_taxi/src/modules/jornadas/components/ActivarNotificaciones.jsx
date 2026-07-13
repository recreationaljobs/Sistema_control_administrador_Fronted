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


const ActivarNotificaciones = () => {
  const [estado, setEstado] = useState(
    ESTADO.VERIFICANDO
  );

  const [activando, setActivando] =
    useState(false);


  useEffect(() => {
    try {
      if (
        typeof window === "undefined" ||
        typeof navigator === "undefined" ||
        !("Notification" in window) ||
        !("serviceWorker" in navigator)
      ) {
        setEstado(
          ESTADO.NO_SOPORTADO
        );

        return;
      }

      if (
        Notification.permission ===
        "denied"
      ) {
        setEstado(
          ESTADO.BLOQUEADO
        );

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
        setEstado(
          ESTADO.ACTIVO
        );

        return;
      }

      setEstado(
        ESTADO.INACTIVO
      );
    } catch (error) {
      console.error(
        "Error verificando las notificaciones:",
        error
      );

      setEstado(
        ESTADO.INACTIVO
      );
    }
  }, []);


  const activar = async () => {
    if (activando) {
      return;
    }

    setActivando(true);

    try {
      await registrarDispositivoNotificacion();

      setEstado(
        ESTADO.ACTIVO
      );

      try {
        await reproducirSonidoNotificacion();
      } catch (error) {
        console.error(
          "No se pudo reproducir el sonido:",
          error
        );
      }

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
        setEstado(
          ESTADO.BLOQUEADO
        );
      } else {
        setEstado(
          ESTADO.INACTIVO
        );
      }

      const datos =
        error?.response?.data;

      const mensaje =
        datos?.detail ||
        datos?.token ||
        error?.message ||
        "No se pudieron activar las notificaciones.";

      await Swal.fire({
        title:
          "No se pudieron activar",

        text: mensaje,

        icon: "error",

        confirmButtonText:
          "Aceptar",
      });
    } finally {
      setActivando(false);
    }
  };


  const verificando =
    estado === ESTADO.VERIFICANDO;

  const activo =
    estado === ESTADO.ACTIVO;

  const bloqueado =
    estado === ESTADO.BLOQUEADO;

  const noSoportado =
    estado === ESTADO.NO_SOPORTADO;


  return (
    <button
      type="button"
      onClick={activar}
      disabled={
        activando ||
        verificando ||
        bloqueado ||
        noSoportado
      }
      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
        activo
          ? "border-green-200 bg-green-50 text-green-700"
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