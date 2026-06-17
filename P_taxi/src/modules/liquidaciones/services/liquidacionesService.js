import api from "../../../api/axios";

export const getLiquidaciones = async () => {
  const response = await api.get("liquidaciones/");
  return response.data;
};

export const getPreview = async (conductorId, fechaInicio, fechaFin) => {
  const response = await api.get("liquidaciones/preview/", {
    params: {
      conductor_id: conductorId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    },
  });
  return response.data;
};

export const createLiquidacion = async (data) => {
  const response = await api.post("liquidaciones/", data);
  return response.data;
};

export const getConductores = async () => {
  const response = await api.get("conductores/");
  return response.data;
};

// Abre el recibo imprimible en una pestaña nueva.
// Se descarga con axios (no window.open directo) para que viaje el token de
// autenticación; un window.open a la ruta relativa abriría en el origen del
// frontend (:5173) y sin el header Authorization daría 401.
export const abrirRecibo = async (id) => {
  const response = await api.get(`liquidaciones/${id}/recibo/`, {
    responseType: "blob",
  });

  const url = URL.createObjectURL(response.data);
  const ventana = window.open(url, "_blank");

  setTimeout(() => URL.revokeObjectURL(url), 60000);

  return ventana;
};
