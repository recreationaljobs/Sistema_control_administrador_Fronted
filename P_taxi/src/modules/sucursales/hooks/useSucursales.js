import { useEffect, useMemo, useState } from "react";
import {
  createSucursal,
  deleteSucursal,
  getSucursales,
  updateSucursal,
} from "../services/sucursalesService";

export const useSucursales = () => {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [sucursalEditando, setSucursalEditando] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const cargarSucursales = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSucursales();

      if (Array.isArray(data)) {
        setSucursales(data);
      } else if (Array.isArray(data.results)) {
        setSucursales(data.results);
      } else {
        setSucursales([]);
      }
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "No se pudieron cargar las sucursales.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCrear = () => {
    setSucursalEditando(null);
    setModalOpen(true);
  };

  const abrirModalEditar = (sucursal) => {
    setSucursalEditando(sucursal);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setSucursalEditando(null);
  };

  const guardarSucursal = async (form) => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        nombre: form.nombre,
        propietario: form.propietario || "",
        telefono: form.telefono || "",
        direccion: form.direccion || "",
        activa: form.activa,
      };

      if (sucursalEditando) {
        await updateSucursal(sucursalEditando.id, payload);
      } else {
        await createSucursal(payload);
      }

      await cargarSucursales();
      cerrarModal();
    } catch (err) {
      const data = err.response?.data;

      let message = "No se pudo guardar la sucursal.";

      if (data?.detail) {
        message = data.detail;
      } else if (typeof data === "object" && data !== null) {
        const firstKey = Object.keys(data)[0];
        const firstValue = data[firstKey];

        if (Array.isArray(firstValue)) {
          message = firstValue[0];
        } else if (typeof firstValue === "string") {
          message = firstValue;
        }
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstadoSucursal = async (sucursal) => {
    try {
      setSaving(true);
      setError("");

      await updateSucursal(sucursal.id, {
        activa: !sucursal.activa,
      });

      await cargarSucursales();
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "No se pudo cambiar el estado de la sucursal.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const eliminarSucursal = async (sucursal) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar la sucursal "${sucursal.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteSucursal(sucursal.id);
      await cargarSucursales();
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "No se pudo eliminar la sucursal. Puede que tenga registros asociados.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const sucursalesFiltradas = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return sucursales;
    }

    return sucursales.filter((sucursal) => {
      const nombre = sucursal.nombre?.toLowerCase() || "";
      const propietario = sucursal.propietario?.toLowerCase() || "";
      const telefono = sucursal.telefono?.toLowerCase() || "";
      const direccion = sucursal.direccion?.toLowerCase() || "";

      return (
        nombre.includes(value) ||
        propietario.includes(value) ||
        telefono.includes(value) ||
        direccion.includes(value)
      );
    });
  }, [sucursales, search]);

  const totalSucursales = sucursales.length;
  const sucursalesActivas = sucursales.filter((item) => item.activa).length;
  const sucursalesInactivas = sucursales.filter((item) => !item.activa).length;

  useEffect(() => {
    cargarSucursales();
  }, []);

  return {
    sucursales,
    sucursalesFiltradas,
    loading,
    saving,
    error,
    search,
    setSearch,
    modalOpen,
    sucursalEditando,
    totalSucursales,
    sucursalesActivas,
    sucursalesInactivas,
    cargarSucursales,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarSucursal,
    cambiarEstadoSucursal,
    eliminarSucursal,
  };
};