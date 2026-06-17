import api from "../../../api/axios";

export const getAdelantos = async (params = {}) => {
  const response = await api.get("adelantos/", { params });
  return response.data;
};

export const createAdelanto = async (data) => {
  const response = await api.post("adelantos/", data);
  return response.data;
};

export const updateAdelanto = async (id, data) => {
  const response = await api.patch(`adelantos/${id}/`, data);
  return response.data;
};

export const deleteAdelanto = async (id) => {
  const response = await api.delete(`adelantos/${id}/`);
  return response.data;
};

export const getJornadas = async () => {
  const response = await api.get("jornadas/");
  return response.data;
};

export const getEstadosAdelanto = async () => {
  const response = await api.get("estados-adelanto/");
  return response.data;
};
