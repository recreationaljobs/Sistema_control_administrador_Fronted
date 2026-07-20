// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./app/App";
import { AuthProvider } from "./context/AuthContext";

import "./index.css";

document.documentElement.lang =
  "es-NI";

document.documentElement.setAttribute(
  "translate",
  "no"
);

document.documentElement.classList.add(
  "notranslate"
);

document.body.setAttribute(
  "translate",
  "no"
);

document.body.classList.add(
  "notranslate"
);

const rootElement =
  document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "No se encontró el elemento #root."
  );
}

rootElement.setAttribute(
  "translate",
  "no"
);

rootElement.classList.add(
  "notranslate"
);

ReactDOM.createRoot(
  rootElement
).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);