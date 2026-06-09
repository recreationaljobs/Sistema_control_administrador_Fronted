import api from "../../../api/axios";

export const getUsuarios = async () => {
  const response = await api.get("usuarios/");
  return response.data;
};

export const createUsuario = async (data) => {
  const response = await api.post("usuarios/", data);
  return response.data;
};

export const updateUsuario = async (id, data) => {
  const response = await api.patch(`usuarios/${id}/`, data);
  return response.data;
};

export const deleteUsuario = async (id) => {
  const response = await api.delete(`usuarios/${id}/`);
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get("roles/");
  return response.data;
};

export const getSucursales = async () => {
  const response = await api.get("sucursales/");
  return response.data;
};

export const getConductoresDisponibles = async ({
  sucursal = "",
  search = "",
} = {}) => {
  const params = new URLSearchParams();

  if (sucursal) {
    params.append("sucursal", sucursal);
  }

  if (search) {
    params.append("search", search);
  }

  const query = params.toString();

  const url = query
    ? `conductores/disponibles-usuario/?${query}`
    : "conductores/disponibles-usuario/";

  const response = await api.get(url);
  return response.data;
};