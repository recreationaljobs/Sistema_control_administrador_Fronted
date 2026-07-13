importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCOcKU1jajJiowV3vTSugPWSKe3UgaIc7A",
  authDomain: "sistema-taxi-tortuguero.firebaseapp.com",
  projectId: "sistema-taxi-tortuguero",
  storageBucket: "sistema-taxi-tortuguero.firebasestorage.app",
  messagingSenderId: "268540931261",
  appId: "1:268540931261:web:9e62216931de11cd3d1bd4",
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage(
  async (payload) => {
    const data = payload.data || {};

    const title =
      data.title ||
      "Sistema de Administración de Taxis";

    const options = {
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
    };

    await self.registration.showNotification(
      title,
      options
    );
  }
);

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const url =
      event.notification.data?.url ||
      "/jornadas";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then(async (ventanas) => {
          for (const ventana of ventanas) {
            if ("focus" in ventana) {
              await ventana.focus();

              if ("navigate" in ventana) {
                await ventana.navigate(url);
              }

              return;
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
);