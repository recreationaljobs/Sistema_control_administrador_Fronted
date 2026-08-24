import api from "../../../api/axios";

export const getMovimientosAuditoria = async (params = {}) => {
  const response = await api.get("auditoria/", {
    params,
  });

  return response.data;
};