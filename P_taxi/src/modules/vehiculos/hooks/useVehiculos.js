import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  createVehiculo,
  deleteVehiculo,
  getVehiculos,
  updateVehiculo,
} from "../services/vehiculosService";

const normalizarLista = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

export const useVehiculos = () => {
  const { rol } = useAuth();

  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const esSuperAdmin = rol === "superadmin";
  const esAdminSucursal = rol === "admin_sucursal";
  const esTaxista = rol === "taxista";

  const cargarVehiculos = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getVehiculos();
      setVehiculos(normalizarLista(data));
    } catch (err) {
      const message =
        err.response?.data?.detail || "No se pudieron cargar los vehículos.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCrear = () => {
    setVehiculoEditando(null);
    setModalOpen(true);
  };

  const abrirModalEditar = (vehiculo) => {
    setVehiculoEditando(vehiculo);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setVehiculoEditando(null);
  };

  const obtenerMensajeError = (err, mensajeDefault) => {
    const data = err.response?.data;

    if (data?.detail) {
      return data.detail;
    }

    if (typeof data === "object" && data !== null) {
      const firstKey = Object.keys(data)[0];
      const firstValue = data[firstKey];

      if (Array.isArray(firstValue)) {
        return `${firstKey}: ${firstValue[0]}`;
      }

      if (typeof firstValue === "string") {
        return `${firstKey}: ${firstValue}`;
      }
    }

    return mensajeDefault;
  };

  const guardarVehiculo = async (form) => {
    try {
      setSaving(true);
      setError("");

     const payload = {
      numero: form.numero,
      placa: form.placa,
      marca: form.marca,
      modelo: form.modelo,
      anio: form.anio ? Number(form.anio) : null,
      color: form.color || "",
      numero_motor: form.numero_motor || "",
      numero_chasis: form.numero_chasis || "",
      kilometraje_actual: form.kilometraje_actual
        ? Number(form.kilometraje_actual)
        : 0,
    };

      if (vehiculoEditando) {
        await updateVehiculo(vehiculoEditando.id, payload);
      } else {
        await createVehiculo(payload);
      }

      await cargarVehiculos();
      cerrarModal();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo guardar el vehículo."));
    } finally {
      setSaving(false);
    }
  };

  const eliminarVehiculo = async (vehiculo) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar el vehículo "${vehiculo.numero} - ${vehiculo.placa}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteVehiculo(vehiculo.id);
      await cargarVehiculos();
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudo eliminar el vehículo. Puede que tenga asignaciones o registros asociados."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const vehiculosFiltrados = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return vehiculos;
    }

    return vehiculos.filter((vehiculo) => {
      const numero = vehiculo.numero?.toLowerCase() || "";
      const placa = vehiculo.placa?.toLowerCase() || "";
      const marca = vehiculo.marca?.toLowerCase() || "";
      const modelo = vehiculo.modelo?.toLowerCase() || "";
      const color = vehiculo.color?.toLowerCase() || "";
      const sucursal = vehiculo.sucursal_nombre?.toLowerCase() || "";
      const estado = vehiculo.estado_nombre?.toLowerCase() || "";

      return (
        numero.includes(value) ||
        placa.includes(value) ||
        marca.includes(value) ||
        modelo.includes(value) ||
        color.includes(value) ||
        sucursal.includes(value) ||
        estado.includes(value)
      );
    });
  }, [vehiculos, search]);

  const totalVehiculos = vehiculos.length;

  const vehiculosAlertaAceite = vehiculos.filter(
    (item) => item.alerta_cambio_aceite || item.necesita_cambio_aceite
  ).length;

  const vehiculosAlertaMantenimiento = vehiculos.filter(
    (item) => item.alerta_mantenimiento || item.necesita_mantenimiento
  ).length;

  const kilometrajeTotal = vehiculos.reduce((total, item) => {
    return total + Number(item.kilometraje_actual || 0);
  }, 0);

  useEffect(() => {
    cargarVehiculos();
  }, []);

  return {
    vehiculos,
    vehiculosFiltrados,
    loading,
    saving,
    error,
    search,
    setSearch,
    modalOpen,
    vehiculoEditando,
    totalVehiculos,
    vehiculosAlertaAceite,
    vehiculosAlertaMantenimiento,
    kilometrajeTotal,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,
    cargarVehiculos,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarVehiculo,
    eliminarVehiculo,
  };
};