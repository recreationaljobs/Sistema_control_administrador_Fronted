import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import {
  createSucursal,
  deleteSucursal,
  getSucursales,
  updateSucursal,
} from "../services/sucursalesService";

const normalizarLista = (data) => {
  if (Array.isArray(data)) {
    return data.filter(Boolean);
  }

  if (Array.isArray(data?.results)) {
    return data.results.filter(Boolean);
  }

  if (Array.isArray(data?.data)) {
    return data.data.filter(Boolean);
  }

  if (Array.isArray(data?.data?.results)) {
    return data.data.results.filter(Boolean);
  }

  return [];
};

const obtenerMensajeError = (
  error,
  mensajeDefault
) => {
  const data = error?.response?.data;

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (
    Array.isArray(data?.non_field_errors) &&
    data.non_field_errors.length
  ) {
    return data.non_field_errors[0];
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

  return error?.message || mensajeDefault;
};

const mostrarExito = (titulo, texto) => {
  Swal.close();

  void Swal.fire({
    title: titulo,
    text: texto,
    icon: "success",

    showConfirmButton: false,
    showCancelButton: false,

    timer: 1800,
    timerProgressBar: true,

    allowOutsideClick: true,
    allowEscapeKey: true,
  });
};

const mostrarError = (titulo, mensaje) => {
  Swal.close();

  void Swal.fire({
    title: titulo,
    text: mensaje,
    icon: "error",

    confirmButtonText: "Entendido",
    confirmButtonColor: "#dc2626",

    allowOutsideClick: true,
    allowEscapeKey: true,
  });
};

export const useSucursales = () => {
  const [sucursales, setSucursales] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    sucursalEditando,
    setSucursalEditando,
  ] = useState(null);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  const cargarSucursales = async ({
    mostrarCarga = true,
  } = {}) => {
    try {
      if (mostrarCarga) {
        setLoading(true);
      }

      setError("");

      const data = await getSucursales();
      const lista = normalizarLista(data);

      setSucursales(lista);

      return lista;
    } catch (requestError) {
      const mensaje = obtenerMensajeError(
        requestError,
        "No se pudieron cargar las sucursales."
      );

      setError(mensaje);

      return false;
    } finally {
      if (mostrarCarga) {
        setLoading(false);
      }
    }
  };

  const abrirModalCrear = () => {
    setSucursalEditando(null);
    setError("");
    setModalOpen(true);
  };

  const abrirModalEditar = (sucursal) => {
    if (!sucursal?.id) {
      return;
    }

    setSucursalEditando(sucursal);
    setError("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setSucursalEditando(null);
  };

  const guardarSucursal = async (form) => {
    const esEdicion = Boolean(
      sucursalEditando?.id
    );

    const nombre = String(
      form?.nombre || ""
    ).trim();

    const confirmacion = await Swal.fire({
      title: esEdicion
        ? "¿Actualizar sucursal?"
        : "¿Registrar sucursal?",

      text: esEdicion
        ? `Se guardarán los cambios de ${
            nombre || "esta sucursal"
          }.`
        : `Se registrará ${
            nombre || "la nueva sucursal"
          }.`,

      icon: "question",

      showCancelButton: true,

      confirmButtonText: esEdicion
        ? "Actualizar"
        : "Registrar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#eab308",
      cancelButtonColor: "#64748b",

      reverseButtons: true,

      allowOutsideClick: false,
      allowEscapeKey: true,
    });

    if (!confirmacion.isConfirmed) {
      return false;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        nombre,

        propietario: String(
          form?.propietario || ""
        ).trim(),

        telefono: String(
          form?.telefono || ""
        ).trim(),

        direccion: String(
          form?.direccion || ""
        ).trim(),

        activa: form?.activa !== false,
      };

      if (esEdicion) {
        await updateSucursal(
          sucursalEditando.id,
          payload
        );
      } else {
        await createSucursal(payload);
      }

      await cargarSucursales({
        mostrarCarga: false,
      });

      cerrarModal();

      mostrarExito(
        esEdicion
          ? "Sucursal actualizada"
          : "Sucursal registrada",
        esEdicion
          ? "Los cambios se guardaron correctamente."
          : "La sucursal se registró correctamente."
      );

      return true;
    } catch (requestError) {
      const mensaje = obtenerMensajeError(
        requestError,
        esEdicion
          ? "No se pudo actualizar la sucursal."
          : "No se pudo registrar la sucursal."
      );

      setError(mensaje);

      mostrarError(
        esEdicion
          ? "No se pudo actualizar"
          : "No se pudo registrar",
        mensaje
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstadoSucursal = async (
    sucursal
  ) => {
    if (!sucursal?.id) {
      return false;
    }

    const activar = !sucursal.activa;

    const confirmacion = await Swal.fire({
      title: activar
        ? "¿Activar sucursal?"
        : "¿Desactivar sucursal?",

      text: activar
        ? `${sucursal.nombre} volverá a estar disponible.`
        : `${sucursal.nombre} quedará inactiva.`,

      icon: "question",

      showCancelButton: true,

      confirmButtonText: activar
        ? "Activar"
        : "Desactivar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: activar
        ? "#16a34a"
        : "#ea580c",

      cancelButtonColor: "#64748b",

      reverseButtons: true,

      allowOutsideClick: false,
      allowEscapeKey: true,
    });

    if (!confirmacion.isConfirmed) {
      return false;
    }

    try {
      setSaving(true);
      setError("");

      await updateSucursal(sucursal.id, {
        activa: activar,
      });

      await cargarSucursales({
        mostrarCarga: false,
      });

      mostrarExito(
        activar
          ? "Sucursal activada"
          : "Sucursal desactivada",
        activar
          ? "La sucursal está disponible nuevamente."
          : "La sucursal fue desactivada correctamente."
      );

      return true;
    } catch (requestError) {
      const mensaje = obtenerMensajeError(
        requestError,
        "No se pudo cambiar el estado de la sucursal."
      );

      setError(mensaje);

      mostrarError(
        "No se pudo cambiar el estado",
        mensaje
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  const eliminarSucursal = async (
    sucursal
  ) => {
    if (!sucursal?.id) {
      return false;
    }

    const confirmacion = await Swal.fire({
      title: "¿Eliminar sucursal?",

      text: `${
        sucursal.nombre || "La sucursal"
      } será eliminada permanentemente.`,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",

      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",

      reverseButtons: true,

      allowOutsideClick: false,
      allowEscapeKey: true,
    });

    if (!confirmacion.isConfirmed) {
      return false;
    }

    try {
      setSaving(true);
      setError("");

      await deleteSucursal(sucursal.id);

      await cargarSucursales({
        mostrarCarga: false,
      });

      mostrarExito(
        "Sucursal eliminada",
        "La sucursal fue eliminada correctamente."
      );

      return true;
    } catch (requestError) {
      const mensaje = obtenerMensajeError(
        requestError,
        "No se pudo eliminar la sucursal. Puede tener registros asociados."
      );

      setError(mensaje);

      mostrarError(
        "No se pudo eliminar",
        mensaje
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  const sucursalesFiltradas = useMemo(() => {
    const lista = Array.isArray(sucursales)
      ? sucursales.filter(Boolean)
      : [];

    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return lista;
    }

    return lista.filter((sucursal) => {
      const texto = [
        sucursal?.nombre,
        sucursal?.propietario,
        sucursal?.telefono,
        sucursal?.direccion,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(value);
    });
  }, [sucursales, search]);

  const totalSucursales =
    sucursales.length;

  const sucursalesActivas =
    sucursales.filter(
      (item) => item?.activa === true
    ).length;

  const sucursalesInactivas =
    sucursales.filter(
      (item) => item?.activa !== true
    ).length;

  useEffect(() => {
    void cargarSucursales();
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