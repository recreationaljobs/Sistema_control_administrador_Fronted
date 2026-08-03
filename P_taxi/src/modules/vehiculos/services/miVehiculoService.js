import api from "../../../api/axios";

const normalizarLista = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

export const getMiVehiculo = async () => {
  const response = await api.get(
    "vehiculos/"
  );

  const vehiculos = normalizarLista(
    response.data
  );

  /*
   * El backend filtra los vehículos según
   * el usuario autenticado.
   *
   * Para un taxista solamente devuelve
   * el vehículo de su asignación activa.
   */
  return vehiculos[0] || null;
};

export const getAlertasMiVehiculo =
  async () => {
    const response = await api.get(
      "mantenimiento/alertas/"
    );

    return normalizarLista(
      response.data
    );
  };