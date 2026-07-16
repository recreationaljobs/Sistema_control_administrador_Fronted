import { useEffect } from "react";
import { onMessage } from "firebase/messaging";

import {
  obtenerFirebaseMessaging,
} from "../config/firebase";


const NotificacionesPrimerPlano = () => {
  useEffect(() => {
    let cancelarEscucha = null;
    let componenteActivo = true;

    const iniciarEscucha = async () => {
      try {
        if (
          typeof window === "undefined" ||
          typeof navigator === "undefined" ||
          !("Notification" in window) ||
          !("serviceWorker" in navigator)
        ) {
          return;
        }

        if (
          Notification.permission !==
          "granted"
        ) {
          return;
        }

        const tokenGuardado =
          localStorage.getItem(
            "taxi_notification_token"
          );

        if (!tokenGuardado) {
          return;
        }

        const messaging =
          await obtenerFirebaseMessaging();

        if (
          !componenteActivo ||
          !messaging
        ) {
          return;
        }

        cancelarEscucha = onMessage(
          messaging,
          async (payload) => {
            try {
              const data =
                payload?.data || {};

              const notification =
                payload?.notification || {};

              const titulo =
                notification.title ||
                data.title ||
                "Sistema de Administración de Taxis";

              const mensaje =
                notification.body ||
                data.body ||
                "Tienes una nueva notificación.";

              const registro =
                await navigator
                  .serviceWorker
                  .ready;

              await registro.showNotification(
                titulo,
                {
                  body: mensaje,

                  icon: "/favicon.ico",
                  badge: "/favicon.ico",

                  tag:
                    data.tag ||
                    `notificacion-${Date.now()}`,

                  renotify: true,

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
                "No se pudo mostrar la "
                  + "notificación en primer plano:",
                error
              );
            }
          }
        );
      } catch (error) {
        console.error(
          "No se pudo iniciar la escucha "
            + "de notificaciones:",
          error
        );
      }
    };

    iniciarEscucha();

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

  return null;
};

export default NotificacionesPrimerPlano;