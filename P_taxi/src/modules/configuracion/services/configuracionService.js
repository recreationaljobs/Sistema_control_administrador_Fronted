import api from "../../../api/axios";

export const getConfiguracionSistema = async () => {
  const response = await api.get("configuracion-sistema/");
  return response.data;
};

export const updateConfiguracionSistema = async (data) => {
  const response = await api.patch("configuracion-sistema/", data);
  return response.data;
};

export const getCatalogo = async (endpoint) => {
  const response = await api.get(`${endpoint}/`);
  return response.data;
};

export const createCatalogo = async (endpoint, data) => {
  const response = await api.post(`${endpoint}/`, data);
  return response.data;
};

export const updateCatalogo = async (endpoint, id, data) => {
  const response = await api.patch(`${endpoint}/${id}/`, data);
  return response.data;
};

export const deleteCatalogo = async (endpoint, id) => {
  const response = await api.delete(`${endpoint}/${id}/`);
  return response.data;
};