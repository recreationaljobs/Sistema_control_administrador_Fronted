import api from "../../../api/axios";

export const getLiquidaciones = async (params = {}) => {
  const response = await api.get("liquidaciones/", { params });
  return response.data;
};

export const getConductores = async () => {
  const response = await api.get("conductores/");
  return response.data;
};

export const previewLiquidacion = async ({ conductor }) => {
  const response = await api.get("liquidaciones/preview/", {
    params: {
      conductor_id: conductor,
    },
  });

  return response.data;
};

export const getPreview = previewLiquidacion;

export const createLiquidacion = async (data) => {
  const response = await api.post("liquidaciones/", data);
  return response.data;
};

export const getReciboLiquidacion = async (id) => {
  const response = await api.get(`liquidaciones/${id}/recibo/`);
  return response.data;
};