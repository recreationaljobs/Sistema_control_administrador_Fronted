import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  createGasto,
  deleteGasto,
  getEstadosGasto,
  getGastos,
  getJornadas,
  getTiposGasto,
  getVehiculos,
  updateGasto,
} from "../services/gastosService";

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

  console.error("Error de gasto:", data || err);

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

export const useGastos = () => {
  const auth = useAuth();
  const rol = obtenerCodigoRol(auth);

  const [gastos, setGastos] = useState([]);
  const [jornadas, setJornadas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tiposGasto, setTiposGasto] = useState([]);
  const [estadosGasto, setEstadosGasto] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [gastoEditando, setGastoEditando] = useState(null);

  const [search, setSearch] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [error, setError] = useState("");

  const hoy = obtenerFechaLocal();

  const esSuperAdmin = rol === "superadmin" || rol === "super_admin";
  const esAdminSucursal = rol === "admin_sucursal";
  const esTaxista = rol === "taxista";

  const cargarGastos = async (filtros = {}) => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      const inicio = filtros.fecha_inicio ?? fechaInicio;
      const fin = filtros.fecha_fin ?? fechaFin;

      if (inicio) {
        params.fecha_inicio = inicio;
      }

      if (fin) {
        params.fecha_fin = fin;
      }

      const data = await getGastos(params);
      setGastos(normalizarLista(data));
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudieron cargar los gastos."));
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      setError("");

      const [jornadasData, vehiculosData, tiposData, estadosData] =
        await Promise.all([
          getJornadas(),
          getVehiculos(),
          getTiposGasto(),
          getEstadosGasto(),
        ]);

      setJornadas(normalizarLista(jornadasData));
      setVehiculos(normalizarLista(vehiculosData));
      setTiposGasto(normalizarLista(tiposData));
      setEstadosGasto(normalizarLista(estadosData));
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudieron cargar los catálogos de gastos."
        )
      );
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const abrirModalCrear = () => {
    setError("");
    setGastoEditando(null);
    setModalOpen(true);
  };

  const abrirModalEditar = (gasto) => {
    setError("");
    setGastoEditando(gasto);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setGastoEditando(null);
  };

  const guardarGasto = async (form) => {
    try {
      setSaving(true);
      setError("");

    const payload = {
      jornada: form.jornada? Number(form.jornada): null,
      vehiculo: form.vehiculo ? Number(form.vehiculo) : null,
      tipo_gasto: form.tipo_gasto ? Number(form.tipo_gasto) : null,
      estado: form.estado ? Number(form.estado) : null,
      descripcion: form.descripcion || "",
      monto: form.monto ? Number(form.monto) : 0,
      fecha: form.fecha || hoy,
    };

      if (form.jornada) {
        payload.jornada = Number(form.jornada);
      }

      if (form.vehiculo) {
        payload.vehiculo = Number(form.vehiculo);
      }

      if (form.tipo_gasto) {
        payload.tipo_gasto = Number(form.tipo_gasto);
      }

      if (form.estado) {
        payload.estado = Number(form.estado);
      }

      if (!esTaxista && form.conductor) {
        payload.conductor = Number(form.conductor);
      }

      if (!payload.vehiculo) {
      setError("Debes seleccionar el vehículo.");
      return;
    }

      if (!payload.tipo_gasto) {
        setError("Debes seleccionar el tipo de gasto.");
        return;
      }

      if (!payload.estado) {
        setError("Debes seleccionar el estado del gasto.");
        return;
      }

      if (payload.monto <= 0) {
        setError("El monto del gasto debe ser mayor que cero.");
        return;
      }

      if (gastoEditando) {
        await updateGasto(gastoEditando.id, payload);
      } else {
        await createGasto(payload);
      }

      await cargarGastos();
      await cargarCatalogos();
      cerrarModal();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo guardar el gasto."));
    } finally {
      setSaving(false);
    }
  };

  const eliminarGasto = async (gasto) => {
    if (esTaxista) {
      setError("No tienes permiso para eliminar gastos.");
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar este gasto de C$ ${Number(
        gasto.monto || 0
      ).toFixed(2)}?`
    );

    if (!confirmar) return;

    try {
      setSaving(true);
      setError("");

      await deleteGasto(gasto.id);
      await cargarGastos();
      await cargarCatalogos();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo eliminar el gasto."));
    } finally {
      setSaving(false);
    }
  };

  const aplicarFiltros = async () => {
    await cargarGastos({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    });
  };

  const limpiarFiltros = async () => {
    setFechaInicio("");
    setFechaFin("");

    await cargarGastos({
      fecha_inicio: "",
      fecha_fin: "",
    });
  };

  const gastosFiltrados = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return gastos;

    return gastos.filter((gasto) => {
      const tipo = gasto.tipo_gasto_nombre?.toLowerCase() || "";
      const estado = gasto.estado_nombre?.toLowerCase() || "";
      const vehiculo = gasto.vehiculo_descripcion?.toLowerCase() || "";
      const placa = gasto.vehiculo_placa?.toLowerCase() || "";
      const conductor = gasto.conductor_nombre?.toLowerCase() || "";
      const descripcion = gasto.descripcion?.toLowerCase() || "";
      const sucursal = gasto.sucursal_nombre?.toLowerCase() || "";
      const fecha = gasto.fecha?.toLowerCase() || "";

      return (
        tipo.includes(value) ||
        estado.includes(value) ||
        vehiculo.includes(value) ||
        placa.includes(value) ||
        conductor.includes(value) ||
        descripcion.includes(value) ||
        sucursal.includes(value) ||
        fecha.includes(value)
      );
    });
  }, [gastos, search]);

  const jornadasDisponibles = useMemo(() => {
    return jornadas.filter((jornada) => {
      if (esTaxista) {
        return Boolean(jornada.id);
      }

      return Boolean(jornada.id);
    });
  }, [jornadas, esTaxista]);

  const vehiculosDisponibles = useMemo(() => {
    return vehiculos.filter((vehiculo) => Boolean(vehiculo.id));
  }, [vehiculos]);

  const totalGastos = gastos.length;

  const montoTotal = gastos.reduce((total, gasto) => {
    return total + Number(gasto.monto || 0);
  }, 0);

  const gastosConJornada = gastos.filter((gasto) => gasto.jornada).length;

  const gastosSinJornada = gastos.filter((gasto) => !gasto.jornada).length;

  const gastosHoy = gastos.filter((gasto) => gasto.fecha === hoy);

  const montoHoy = gastosHoy.reduce((total, gasto) => {
    return total + Number(gasto.monto || 0);
  }, 0);

  useEffect(() => {
    cargarGastos();
    cargarCatalogos();
  }, []);

  return {
    gastos,
    gastosFiltrados,

    jornadas,
    jornadasDisponibles,
    vehiculos,
    vehiculosDisponibles,
    tiposGasto,
    estadosGasto,

    loading,
    loadingCatalogos,
    saving,

    error,
    setError,

    search,
    setSearch,

    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,

    modalOpen,
    gastoEditando,

    totalGastos,
    montoTotal,
    gastosConJornada,
    gastosSinJornada,
    gastosHoy,
    montoHoy,

    rol,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,

    cargarGastos,
    cargarCatalogos,

    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,

    guardarGasto,
    eliminarGasto,

    aplicarFiltros,
    limpiarFiltros,
  };
};