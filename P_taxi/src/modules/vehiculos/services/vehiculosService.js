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
  const response = await api.patch(
    `vehiculos/${id}/`,
    data
  );

  return response.data;
};

export const deleteVehiculo = async (id) => {
  const response = await api.delete(
    `vehiculos/${id}/`
  );

  return response.data;
};

export const getDocumentosVehiculo = async ({
  vehiculoId,
  tipoDocumento = "",
} = {}) => {
  if (!vehiculoId) {
    throw new Error(
      "Debes indicar el vehículo para consultar sus documentos."
    );
  }

  const params = {
    vehiculo: vehiculoId,
  };

  if (tipoDocumento) {
    params.tipo_documento = tipoDocumento;
  }

  const response = await api.get(
    "documentos-vehiculo/",
    {
      params,
    }
  );

  return response.data;
};

export const createDocumentoVehiculo = async (
  data
) => {
  const response = await api.post(
    "documentos-vehiculo/",
    data
  );

  return response.data;
};

export const updateDocumentoVehiculo = async (
  id,
  data
) => {
  if (!id) {
    throw new Error(
      "No se encontró el documento que deseas actualizar."
    );
  }

  const response = await api.patch(
    `documentos-vehiculo/${id}/`,
    data
  );

  return response.data;
};

export const deleteDocumentoVehiculo = async (
  id
) => {
  if (!id) {
    throw new Error(
      "No se encontró el documento que deseas eliminar."
    );
  }

  const response = await api.delete(
    `documentos-vehiculo/${id}/`
  );

  return response.data;
};