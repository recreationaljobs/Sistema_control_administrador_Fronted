import api from "../../../api/axios";

export const getAdelantos = async (
  params = {}
) => {
  const response = await api.get(
    "adelantos/",
    {
      params,
    }
  );

  return response.data;
};

export const getResumenAdelantosPorConductor =
  async (params = {}) => {
    const response = await api.get(
      "adelantos/resumen-conductores/",
      {
        params,
      }
    );

    return response.data;
  };

export const createAdelanto = async (
  data
) => {
  const response = await api.post(
    "adelantos/",
    data
  );

  return response.data;
};

export const updateAdelanto = async (
  id,
  data
) => {
  const response = await api.patch(
    `adelantos/${id}/`,
    data
  );

  return response.data;
};

export const deleteAdelanto = async (
  id
) => {
  const response = await api.delete(
    `adelantos/${id}/`
  );

  return response.data;
};

export const getConductores =
  async () => {
    const response = await api.get(
      "conductores/"
    );

    return response.data;
  };

export const getSucursales =
  async () => {
    const response = await api.get(
      "sucursales/"
    );

    return response.data;
  };

export const getEstadosAdelanto =
  async () => {
    const response = await api.get(
      "estados-adelanto/"
    );

    return response.data;
  };

export const getRecibo = async (
  id
) => {
  const response = await api.get(
    `adelantos/${id}/recibo/`,
    {
      responseType: "blob",
    }
  );

  const url = URL.createObjectURL(
    response.data
  );

  const ventana = window.open(
    url,
    "_blank"
  );

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60000);

  return ventana;
};