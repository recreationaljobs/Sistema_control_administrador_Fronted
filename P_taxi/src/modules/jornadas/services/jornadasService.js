import api from "../../../api/axios";

export const getJornadas = async (params = {}) => {
  const response = await api.get("jornadas/", { params });
  return response.data;
};

export const createJornada = async (data) => {
  const response = await api.post("jornadas/", data);
  return response.data;
};

export const updateJornada = async (id, data) => {
  const response = await api.patch(`jornadas/${id}/`, data);
  return response.data;
};

export const cerrarJornada = async (id, data) => {
  const response = await api.patch(`jornadas/${id}/cerrar/`, data);
  return response.data;
};

export const registrarIngresoJornada = async (id, data) => {
  const response = await api.patch(`jornadas/${id}/registrar-ingreso/`, data);
  return response.data;
};

export const deleteJornada = async (id) => {
  const response = await api.delete(`jornadas/${id}/`);
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

export const getAsignaciones = async () => {
  const response = await api.get("asignaciones/");
  return response.data;
};