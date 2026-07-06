import api from "../../../api/axios";

export const getMantenimientos = async (params = {}) => {
  const response = await api.get("mantenimientos/", { params });
  return response.data;
};

export const createMantenimiento = async (data) => {
  const response = await api.post("mantenimientos/", data);
  return response.data;
};

export const updateMantenimiento = async (id, data) => {
  const response = await api.patch(`mantenimientos/${id}/`, data);
  return response.data;
};

export const deleteMantenimiento = async (id) => {
  const response = await api.delete(`mantenimientos/${id}/`);
  return response.data;
};

export const getVehiculos = async () => {
  const response = await api.get("vehiculos/");
  return response.data;
};

export const getTiposMantenimiento = async () => {
  const response = await api.get("tipos-mantenimiento/");
  return response.data;
};

export const getEstadosMantenimiento = async () => {
  const response = await api.get("estados-mantenimiento/");
  return response.data;
};