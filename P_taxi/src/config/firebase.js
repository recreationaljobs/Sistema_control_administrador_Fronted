import {
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";

import {
  getMessaging,
  isSupported,
} from "firebase/messaging";


const obtenerConfiguracionFirebase = () => {
  const firebaseConfig = {
    apiKey:
      import.meta.env
        .VITE_FIREBASE_API_KEY
        ?.trim(),

    authDomain:
      import.meta.env
        .VITE_FIREBASE_AUTH_DOMAIN
        ?.trim(),

    projectId:
      import.meta.env
        .VITE_FIREBASE_PROJECT_ID
        ?.trim(),

    storageBucket:
      import.meta.env
        .VITE_FIREBASE_STORAGE_BUCKET
        ?.trim(),

    messagingSenderId:
      import.meta.env
        .VITE_FIREBASE_MESSAGING_SENDER_ID
        ?.trim(),

    appId:
      import.meta.env
        .VITE_FIREBASE_APP_ID
        ?.trim(),
  };

  const camposObligatorios = [
    "apiKey",
    "authDomain",
    "projectId",
    "messagingSenderId",
    "appId",
  ];

  const camposFaltantes =
    camposObligatorios.filter(
      (campo) =>
        !firebaseConfig[campo] ||
        firebaseConfig[campo]
          .includes("VALOR_DE_FIREBASE")
    );

  if (camposFaltantes.length > 0) {
    throw new Error(
      `Faltan configuraciones de Firebase: ${
        camposFaltantes.join(", ")
      }.`
    );
  }

  return firebaseConfig;
};


const obtenerFirebaseApp = () => {
  if (getApps().length > 0) {
    return getApp();
  }

  const firebaseConfig =
    obtenerConfiguracionFirebase();

  return initializeApp(firebaseConfig);
};


export const obtenerFirebaseMessaging =
  async () => {
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined"
    ) {
      return null;
    }

    let soportado = false;

    try {
      soportado = await isSupported();
    } catch (error) {
      console.error(
        "No se pudo verificar Firebase Messaging:",
        error
      );

      return null;
    }

    if (!soportado) {
      return null;
    }

    try {
      const firebaseApp =
        obtenerFirebaseApp();

      return getMessaging(firebaseApp);
    } catch (error) {
      console.error(
        "No se pudo inicializar Firebase:",
        error
      );

      throw error;
    }
  };