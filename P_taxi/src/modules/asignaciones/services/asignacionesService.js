import api from "../../../api/axios";

export const getAsignaciones = async () => {
  const response = await api.get("asignaciones/");
  return response.data;
};

export const createAsignacion = async (data) => {
  const response = await api.post("asignaciones/", data);
  return response.data;
};

export const updateAsignacion = async (id, data) => {
  const response = await api.patch(`asignaciones/${id}/`, data);
  return response.data;
};

export const deleteAsignacion = async (id) => {
  const response = await api.delete(`asignaciones/${id}/`);
  return response.data;
};

export const getConductores = async () => {
  const response = await api.get("conductores/");
  return response.data;
};

export const getVehiculos = async () => {
  const response = await api.get("vehiculos/");
  return response.data;
};

