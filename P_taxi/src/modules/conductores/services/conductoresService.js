import api from "../../../api/axios";

export const getConductores = async () => {
  const response = await api.get("conductores/");
  return response.data;
};

export const getConductorById = async (id) => {
  const response = await api.get(`conductores/${id}/`);
  return response.data;
};

export const createConductor = async (data) => {
  const response = await api.post("conductores/", data);
  return response.data;
};

export const updateConductor = async (id, data) => {
  const response = await api.patch(`conductores/${id}/`, data);
  return response.data;
};

export const deleteConductor = async (id) => {
  await api.delete(`conductores/${id}/`);
};
