import api from "../../../api/axios";

export const getGastos = async (params = {}) => {
  const response = await api.get("gastos/", { params });
  return response.data;
};

export const createGasto = async (data) => {
  const response = await api.post("gastos/", data);
  return response.data;
};

export const updateGasto = async (id, data) => {
  const response = await api.patch(`gastos/${id}/`, data);
  return response.data;
};

export const deleteGasto = async (id) => {
  const response = await api.delete(`gastos/${id}/`);
  return response.data;
};

export const getJornadas = async () => {
  const response = await api.get("jornadas/");
  return response.data;
};

export const getVehiculos = async () => {
  const response = await api.get("vehiculos/");
  return response.data;
};

export const getTiposGasto = async () => {
  const response = await api.get("tipos-gasto/");
  return response.data;
};

export const getEstadosGasto = async () => {
  const response = await api.get("estados-gasto/");
  return response.data;
};