import api from "../../../api/axios";

export const getDashboardResumen = async (params = {}) => {
  const response = await api.get("dashboard/resumen/", { params });
  return response.data;
};

export const getDashboardFinanciero = async (params = {}) => {
  const response = await api.get("dashboard/financiero/", { params });
  return response.data;
};

export const getJornadas = async (params = {}) => {
  const response = await api.get("jornadas/", { params });
  return response.data;
};

export const getVehiculos = async () => {
  const response = await api.get("vehiculos/");
  return response.data;
};