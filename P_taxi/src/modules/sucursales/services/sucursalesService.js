import api from "../../../api/axios";

export const getSucursales = async () => {
  const response = await api.get("sucursales/");
  return response.data;
};

export const createSucursal = async (data) => {
  const response = await api.post("sucursales/", data);
  return response.data;
};

export const updateSucursal = async (id, data) => {
  const response = await api.patch(`sucursales/${id}/`, data);
  return response.data;
};

export const deleteSucursal = async (id) => {
  const response = await api.delete(`sucursales/${id}/`);
  return response.data;
};