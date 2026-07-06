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

// Solo conductores/vehículos libres (sin asignación activa). Al editar se pasa
// el id de la asignación para conservar el conductor/vehículo ya asignado.
export const getConductoresDisponibles = async (asignacionId) => {
  const params = asignacionId ? { asignacion: asignacionId } : {};
  const response = await api.get("conductores/disponibles/", { params });
  return response.data;
};

export const getVehiculosDisponibles = async (asignacionId) => {
  const params = asignacionId ? { asignacion: asignacionId } : {};
  const response = await api.get("vehiculos/disponibles/", { params });
  return response.data;
};

