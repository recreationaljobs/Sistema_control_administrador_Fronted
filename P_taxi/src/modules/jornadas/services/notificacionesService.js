import {
  getToken,
  onMessage,
} from "firebase/messaging";

import api from "../../../api/axios";

import {
  obtenerFirebaseMessaging,
} from "../../../config/firebase";


const obtenerVapidKey = () => {
  const vapidKey =
    import.meta.env
      .VITE_FIREBASE_VAPID_KEY
      ?.trim();

  if (!vapidKey) {
    throw new Error(
      "No se configuró VITE_FIREBASE_VAPID_KEY."
    );
  }

  if (
    vapidKey === "CLAVE_PUBLICA_VAPID" ||
    vapidKey.includes("VALOR_DE_FIREBASE")
  ) {
    throw new Error(
      "La clave VAPID todavía contiene un valor de ejemplo."
    );
  }

  return vapidKey;
};


const registrarServiceWorker = async () => {
  if (
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    throw new Error(
      "Este navegador no admite Service Workers."
    );
  }

  const registroInicial =
    await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      {
        scope: "/",
      }
    );

  const registroActivo =
    await navigator.serviceWorker.ready;

  if (!registroActivo.active) {
    throw new Error(
      "El Service Worker de Firebase no está activo."
    );
  }

  return (
    registroActivo ||
    registroInicial
  );
};


export const registrarDispositivoNotificacion =
  async () => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      throw new Error(
        "Este navegador no admite notificaciones."
      );
    }

    const permiso =
      await Notification.requestPermission();

    if (permiso !== "granted") {
      throw new Error(
        "Debes permitir las notificaciones desde el navegador."
      );
    }

    const vapidKey =
      obtenerVapidKey();

    const serviceWorkerRegistration =
      await registrarServiceWorker();

    const messaging =
      await obtenerFirebaseMessaging();

    if (!messaging) {
      throw new Error(
        "Firebase Messaging no es compatible con este navegador."
      );
    }

    const token = await getToken(
      messaging,
      {
        vapidKey,
        serviceWorkerRegistration,
      }
    );

    if (!token) {
      throw new Error(
        "Firebase no devolvió un token para este dispositivo."
      );
    }

    const respuesta = await api.post(
      "notificaciones/dispositivos/registrar/",
      {
        token,
      }
    );

    localStorage.setItem(
      "taxi_notification_token",
      token
    );

    localStorage.setItem(
      "taxi_notifications_enabled",
      "true"
    );

    return {
      token,
      data: respuesta.data,
    };
  };


export const escucharNotificaciones =
  async (callback) => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return null;
    }

    if (
      Notification.permission !== "granted"
    ) {
      return null;
    }

    const messaging =
      await obtenerFirebaseMessaging();

    if (!messaging) {
      return null;
    }

    return onMessage(
      messaging,
      async (payload) => {
        if (
          typeof callback === "function"
        ) {
          await callback(payload);
        }
      }
    );
  };


export const reproducirSonidoNotificacion =
  async () => {
    if (typeof window === "undefined") {
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    let audioContext = null;

    try {
      audioContext =
        new AudioContextClass();

      if (
        audioContext.state === "suspended"
      ) {
        await audioContext.resume();
      }

      const oscillator =
        audioContext.createOscillator();

      const gain =
        audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;

      gain.gain.setValueAtTime(
        0.08,
        audioContext.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.35
      );

      oscillator.connect(gain);

      gain.connect(
        audioContext.destination
      );

      oscillator.start();

      oscillator.stop(
        audioContext.currentTime + 0.35
      );

      oscillator.addEventListener(
        "ended",
        async () => {
          if (
            audioContext &&
            audioContext.state !== "closed"
          ) {
            await audioContext.close();
          }
        }
      );
    } catch (error) {
      console.error(
        "No se pudo reproducir el sonido de notificación:",
        error
      );

      if (
        audioContext &&
        audioContext.state !== "closed"
      ) {
        await audioContext.close();
      }
    }
  };


export const obtenerTokenNotificacionGuardado =
  () => {
    return localStorage.getItem(
      "taxi_notification_token"
    );
  };


export const notificacionesEstanActivadas =
  () => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return false;
    }

    const token =
      obtenerTokenNotificacionGuardado();

    return Boolean(
      Notification.permission === "granted" &&
      token
    );
  };


export const limpiarNotificacionesLocales =
  () => {
    localStorage.removeItem(
      "taxi_notification_token"
    );

    localStorage.removeItem(
      "taxi_notifications_enabled"
    );
  };