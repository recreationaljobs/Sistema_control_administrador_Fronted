import api from "../../../api/axios";

export const getMovimientosAuditoria = async (
  params = {}
) => {
  const response = await api.get(
    "auditoria/",
    {
      params,
    }
  );

  return response.data;
};

export const registrarMovimientoAuditoria = async ({
  evento,
  referencia = "",
}) => {
  try {
    const response = await api.post(
      "auditoria/",
      {
        evento,
        referencia,
      }
    );

    return response.data;
  } catch (error) {
    /*
      La auditoría nunca debe bloquear la acción principal.
      Por ejemplo, si falla el registro, el PDF igual se descarga.
    */
    console.warn(
      "No se pudo registrar el movimiento de auditoría.",
      error
    );

    return null;
  }
};