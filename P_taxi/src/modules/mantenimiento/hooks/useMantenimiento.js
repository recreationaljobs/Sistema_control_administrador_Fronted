import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  createMantenimiento,
  deleteMantenimiento,
  getEstadosMantenimiento,
  getMantenimientos,
  getTiposMantenimiento,
  getVehiculos,
  updateMantenimiento,
} from "../services/mantenimientoService";


const normalizarLista = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const obtenerFechaLocal = () => {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const obtenerCodigoRol = (auth) => {
  return (
    auth?.rol ||
    auth?.user?.rol ||
    auth?.user?.rol_codigo ||
    auth?.user?.rol?.codigo ||
    ""
  );
};

const obtenerMensajeError = (err, mensajeDefault) => {
  const data = err?.response?.data;

  if (data?.detail) return data.detail;

  if (data?.non_field_errors?.length) {
    return data.non_field_errors[0];
  }

  if (typeof data === "string") return data;

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

export const useMantenimiento = () => {
  const auth = useAuth();
  const rol = obtenerCodigoRol(auth);

  const [mantenimientos, setMantenimientos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tiposMantenimiento, setTiposMantenimiento] = useState([]);
  const [estadosMantenimiento, setEstadosMantenimiento] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [mantenimientoEditando, setMantenimientoEditando] = useState(null);

  const [search, setSearch] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [error, setError] = useState("");

  const hoy = obtenerFechaLocal();

  const esSuperAdmin = rol === "superadmin" || rol === "super_admin";
  const esAdminSucursal = rol === "admin_sucursal";
  const esTaxista = rol === "taxista";

  const cargarMantenimientos = async (filtros = {}) => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      const fecha = filtros.fecha ?? fechaSeleccionada;

      if (fecha) params.fecha = fecha;

      const data = await getMantenimientos(params);
      setMantenimientos(normalizarLista(data));
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudieron cargar los mantenimientos.")
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      setError("");

      const [vehiculosData, tiposData, estadosData] = await Promise.all([
        getVehiculos(),
        getTiposMantenimiento(),
        getEstadosMantenimiento(),
      ]);

      setVehiculos(normalizarLista(vehiculosData));
      setTiposMantenimiento(normalizarLista(tiposData));
      setEstadosMantenimiento(normalizarLista(estadosData));
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudieron cargar vehículos y catálogos de mantenimiento."
        )
      );
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const abrirModalCrear = () => {
    if (esTaxista) {
      setError("No tienes permiso para registrar mantenimiento.");
      return;
    }

    setError("");
    setMantenimientoEditando(null);
    setModalOpen(true);
  };

  const abrirModalEditar = (mantenimiento) => {
    if (esTaxista) {
      setError("No tienes permiso para editar mantenimiento.");
      return;
    }

    setError("");
    setMantenimientoEditando(mantenimiento);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setMantenimientoEditando(null);
  };

  const guardarMantenimiento = async (form) => {
    try {
      setSaving(true);
      setError("");

      if (esTaxista) {
        setError("No tienes permiso para registrar mantenimiento.");
        return;
      }

      const payload = {
        vehiculo: form.vehiculo ? Number(form.vehiculo) : null,
        tipo_mantenimiento: form.tipo_mantenimiento
          ? Number(form.tipo_mantenimiento)
          : null,
        estado: form.estado ? Number(form.estado) : null,
        descripcion: form.descripcion || "",
        costo: form.costo ? Number(form.costo) : 0,
        fecha: form.fecha || hoy,
        kilometraje: form.kilometraje ? Number(form.kilometraje) : 0,
        proximo_km_sugerido: form.proximo_km_sugerido
          ? Number(form.proximo_km_sugerido)
          : null,
      };

      if (!payload.vehiculo) {
        setError("Debes seleccionar el vehículo.");
        return;
      }

      if (!payload.tipo_mantenimiento) {
        setError("Debes seleccionar el tipo de mantenimiento.");
        return;
      }

      if (!payload.estado) {
        setError("Debes seleccionar el estado del mantenimiento.");
        return;
      }

      if (!payload.fecha) {
        setError("La fecha es obligatoria.");
        return;
      }

      if (payload.kilometraje <= 0) {
        setError("El kilometraje debe ser mayor que cero.");
        return;
      }

      if (payload.costo < 0) {
        setError("El costo no puede ser negativo.");
        return;
      }

      const estabaEditando =
        Boolean(mantenimientoEditando);

      if (estabaEditando) {
        await updateMantenimiento(
          mantenimientoEditando.id,
          payload
        );
      } else {
        await createMantenimiento(payload);
      }

      await cargarMantenimientos();
      await cargarCatalogos();

      cerrarModal();

      toastExito({
        titulo: estabaEditando
          ? "Mantenimiento actualizado correctamente"
          : "Mantenimiento registrado correctamente",
      });
      cerrarModal();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo guardar el mantenimiento."));
    } finally {
      setSaving(false);
    }
  };

 const eliminarMantenimiento = async (mantenimiento) => {
  if (esTaxista) {
    await mostrarError({
      titulo: "Acceso denegado",
      mensaje:
        "No tienes permiso para eliminar mantenimientos.",
    });

    return;
  }

  const confirmado = await confirmarEliminacion({
    titulo: "¿Eliminar mantenimiento?",
    mensaje: `Se eliminará el mantenimiento del vehículo ${
      mantenimiento.vehiculo_placa || "seleccionado"
    }, con un costo de C$ ${Number(
      mantenimiento.costo || 0
    ).toLocaleString("es-NI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}.`,

    textoConfirmar: "Sí, eliminar",
    textoCancelar: "Conservar",
  });

  if (!confirmado) {
    return;
  }

  try {
    setSaving(true);
    setError("");

    await deleteMantenimiento(
      mantenimiento.id
    );

    await cargarMantenimientos();
    await cargarCatalogos();

    toastExito({
      titulo:
        "Mantenimiento eliminado correctamente",
    });
  } catch (err) {
    const mensaje = obtenerMensajeError(
      err,
      "No se pudo eliminar el mantenimiento."
    );

    setError(mensaje);

    await mostrarError({
      titulo:
        "No se pudo eliminar el mantenimiento",
      mensaje,
    });
  } finally {
    setSaving(false);
  }
};

  const elegirFecha = async () => {
    const fecha = window.prompt(
      "Escribe la fecha que deseas consultar en formato YYYY-MM-DD",
      fechaSeleccionada || hoy
    );

    if (!fecha) return;

    setFechaSeleccionada(fecha);
    await cargarMantenimientos({ fecha });
  };

  const limpiarFecha = async () => {
    setFechaSeleccionada("");
    await cargarMantenimientos({ fecha: "" });
  };

  const mantenimientosFiltrados = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return mantenimientos;

    return mantenimientos.filter((item) => {
      const tipo = item.tipo_mantenimiento_nombre?.toLowerCase() || "";
      const estado = item.estado_nombre?.toLowerCase() || "";
      const vehiculo = item.vehiculo_descripcion?.toLowerCase() || "";
      const placa = item.vehiculo_placa?.toLowerCase() || "";
      const descripcion = item.descripcion?.toLowerCase() || "";
      const sucursal = item.sucursal_nombre?.toLowerCase() || "";
      const fecha = item.fecha?.toLowerCase() || "";

      return (
        tipo.includes(value) ||
        estado.includes(value) ||
        vehiculo.includes(value) ||
        placa.includes(value) ||
        descripcion.includes(value) ||
        sucursal.includes(value) ||
        fecha.includes(value)
      );
    });
  }, [mantenimientos, search]);

  const vehiculosDisponibles = useMemo(() => {
    return vehiculos.filter((vehiculo) => Boolean(vehiculo.id));
  }, [vehiculos]);

  const totalMantenimientos = mantenimientos.length;

  const costoTotal = mantenimientos.reduce((total, item) => {
    return total + Number(item.costo || 0);
  }, 0);

  const mantenimientosHoy = mantenimientos.filter((item) => item.fecha === hoy);

  const costoHoy = mantenimientosHoy.reduce((total, item) => {
    return total + Number(item.costo || 0);
  }, 0);

  const pendientes = mantenimientos.filter((item) => {
    const codigo = item.estado_codigo || "";
    const nombre = item.estado_nombre || "";

    return (
      codigo.toLowerCase().includes("pendiente") ||
      nombre.toLowerCase().includes("pendiente")
    );
  }).length;

  useEffect(() => {
    cargarMantenimientos();
    cargarCatalogos();
  }, []);

  return {
    mantenimientos,
    mantenimientosFiltrados,

    vehiculos,
    vehiculosDisponibles,
    tiposMantenimiento,
    estadosMantenimiento,

    loading,
    loadingCatalogos,
    saving,

    error,
    setError,

    search,
    setSearch,

    fechaSeleccionada,
    setFechaSeleccionada,

    modalOpen,
    mantenimientoEditando,

    totalMantenimientos,
    costoTotal,
    mantenimientosHoy,
    costoHoy,
    pendientes,

    rol,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,

    cargarMantenimientos,
    cargarCatalogos,

    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,

    guardarMantenimiento,
    eliminarMantenimiento,

    elegirFecha,
    limpiarFecha,
  };
};