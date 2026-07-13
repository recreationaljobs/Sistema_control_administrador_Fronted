import {
  getToken,
  onMessage,
} from "firebase/messaging";

import api from "../../../api/axios";

import {
  obtenerFirebaseMessaging,
} from "../../../config/firebase";

const registrarServiceWorker = async () => {
  if (
    !("serviceWorker" in navigator)
  ) {
    throw new Error(
      "Este navegador no admite notificaciones."
    );
  }

  return navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );
};

export const registrarDispositivoNotificacion =
  async () => {
    if (
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
        "Debes permitir las notificaciones."
      );
    }

    const serviceWorker =
      await registrarServiceWorker();

    const messaging =
      await obtenerFirebaseMessaging();

    if (!messaging) {
      throw new Error(
        "Firebase Messaging no es compatible "
        + "con este navegador."
      );
    }

    const token = await getToken(
      messaging,
      {
        vapidKey:
          import.meta.env
            .VITE_FIREBASE_VAPID_KEY,

        serviceWorkerRegistration:
          serviceWorker,
      }
    );

    if (!token) {
      throw new Error(
        "No se pudo obtener el token "
        + "de notificaciones."
      );
    }

    await api.post(
      "notificaciones/dispositivos/registrar/",
      {
        token,
      }
    );

    localStorage.setItem(
      "taxi_notification_token",
      token
    );

    return token;
  };

export const escucharNotificaciones =
  async (callback) => {
    const messaging =
      await obtenerFirebaseMessaging();

    if (!messaging) {
      return null;
    }

    return onMessage(
      messaging,
      callback
    );
  };

export const reproducirSonidoNotificacion =
  async () => {
    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const audioContext =
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

    oscillator.connect(gain);
    gain.connect(
      audioContext.destination
    );

    oscillator.start();

    oscillator.stop(
      audioContext.currentTime + 0.25
    );

    oscillator.addEventListener(
      "ended",
      () => {
        audioContext.close();
      }
    );
  };