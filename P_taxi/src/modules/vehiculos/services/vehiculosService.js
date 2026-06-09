import api from "../../../api/axios";

export const getVehiculos = async () => {
  const response = await api.get("vehiculos/");
  return response.data;
};

export const createVehiculo = async (data) => {
  const response = await api.post("vehiculos/", data);
  return response.data;
};

export const updateVehiculo = async (id, data) => {
  const response = await api.patch(`vehiculos/${id}/`, data);
  return response.data;
};

export const deleteVehiculo = async (id) => {
  const response = await api.delete(`vehiculos/${id}/`);
  return response.data;
};