import api from "../../../api/axios";

export const getReporteFinanciero = async (
  params = {}
) => {
  const response = await api.get(
    "reportes/financiero/",
    {
      params,
    }
  );

  return response.data;
};

export const getVehiculosReporte = async () => {
  const response = await api.get(
    "vehiculos/"
  );

  return response.data;
};

export const descargarReporteFinancieroExcel =
  async (params = {}) => {
    const response = await api.get(
      "reportes/financiero/excel/",
      {
        params,
        responseType: "blob",
      }
    );

    return response.data;
  };