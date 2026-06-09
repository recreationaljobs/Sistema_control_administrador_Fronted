import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  createJornada,
  deleteJornada,
  getAsignaciones,
  getConductores,
  getJornadas,
  getVehiculos,
  updateJornada,
} from "../services/jornadasService";

const normalizarLista = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const hoy = new Date().toISOString().split("T")[0];

export const useJornadas = () => {
  const { rol } = useAuth();

  const [jornadas, setJornadas] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [jornadaEditando, setJornadaEditando] = useState(null);

  const [search, setSearch] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [error, setError] = useState("");

  const esSuperAdmin = rol === "superadmin";
  const esAdminSucursal = rol === "admin_sucursal";
  const esTaxista = rol === "taxista";

  const cargarJornadas = async (filtros = {}) => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (filtros.fecha_inicio || fechaInicio) {
        params.fecha_inicio = filtros.fecha_inicio || fechaInicio;
      }

      if (filtros.fecha_fin || fechaFin) {
        params.fecha_fin = filtros.fecha_fin || fechaFin;
      }

      const data = await getJornadas(params);
      setJornadas(normalizarLista(data));
    } catch (err) {
      const message =
        err.response?.data?.detail || "No se pudieron cargar las jornadas.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      setError("");

      const [conductoresData, vehiculosData, asignacionesData] =
        await Promise.all([getConductores(), getVehiculos(), getAsignaciones()]);

      setConductores(normalizarLista(conductoresData));
      setVehiculos(normalizarLista(vehiculosData));
      setAsignaciones(normalizarLista(asignacionesData));
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "No se pudieron cargar conductores, vehículos y asignaciones.";
      setError(message);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const abrirModalCrear = () => {
    setJornadaEditando(null);
    setModalOpen(true);
  };

  const abrirModalEditar = (jornada) => {
    setJornadaEditando(jornada);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setJornadaEditando(null);
  };

  const obtenerMensajeError = (err, mensajeDefault) => {
    const data = err.response?.data;

    if (data?.detail) {
      return data.detail;
    }

    if (typeof data === "string") {
      return data;
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

  const guardarJornada = async (form) => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        fecha: form.fecha || hoy,
        conductor: form.conductor ? Number(form.conductor) : null,
        vehiculo: form.vehiculo ? Number(form.vehiculo) : null,
        kilometraje_inicial: form.kilometraje_inicial
          ? Number(form.kilometraje_inicial)
          : 0,
        kilometraje_final: form.kilometraje_final
          ? Number(form.kilometraje_final)
          : 0,
        ingreso_bruto: form.ingreso_bruto ? Number(form.ingreso_bruto) : 0,
        observaciones: form.observaciones || "",
      };

      if (jornadaEditando) {
        await updateJornada(jornadaEditando.id, payload);
      } else {
        await createJornada(payload);
      }

      await cargarJornadas();
      await cargarCatalogos();
      cerrarModal();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo guardar la jornada."));
    } finally {
      setSaving(false);
    }
  };

  const eliminarJornada = async (jornada) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar la jornada de "${jornada.conductor_nombre}" del día ${jornada.fecha}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteJornada(jornada.id);
      await cargarJornadas();
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudo eliminar la jornada. Puede que tenga gastos o adelantos asociados."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const aplicarFiltros = async () => {
    await cargarJornadas({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    });
  };

  const limpiarFiltros = async () => {
    setFechaInicio("");
    setFechaFin("");
    await cargarJornadas({
      fecha_inicio: "",
      fecha_fin: "",
    });
  };

  const jornadasFiltradas = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return jornadas;
    }

    return jornadas.filter((jornada) => {
      const conductor = jornada.conductor_nombre?.toLowerCase() || "";
      const placa = jornada.vehiculo_placa?.toLowerCase() || "";
      const numero = jornada.vehiculo_numero?.toLowerCase() || "";
      const vehiculo = jornada.vehiculo_descripcion?.toLowerCase() || "";
      const sucursal = jornada.sucursal_nombre?.toLowerCase() || "";
      const fecha = jornada.fecha?.toLowerCase() || "";

      return (
        conductor.includes(value) ||
        placa.includes(value) ||
        numero.includes(value) ||
        vehiculo.includes(value) ||
        sucursal.includes(value) ||
        fecha.includes(value)
      );
    });
  }, [jornadas, search]);

  const totalJornadas = jornadas.length;

  const ingresoTotal = jornadas.reduce((total, jornada) => {
    return total + Number(jornada.ingreso_bruto || 0);
  }, 0);

  const pagoConductoresTotal = jornadas.reduce((total, jornada) => {
    return total + Number(jornada.pago_conductor || 0);
  }, 0);

  const gananciaTotal = jornadas.reduce((total, jornada) => {
    return total + Number(jornada.ganancia_dueno || 0);
  }, 0);

  const kilometrosTotal = jornadas.reduce((total, jornada) => {
    return total + Number(jornada.kilometros_recorridos || 0);
  }, 0);

  useEffect(() => {
    cargarJornadas();
    cargarCatalogos();
  }, []);

  return {
    jornadas,
    jornadasFiltradas,
    conductores,
    vehiculos,
    asignaciones,
    loading,
    loadingCatalogos,
    saving,
    error,
    search,
    setSearch,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    modalOpen,
    jornadaEditando,
    totalJornadas,
    ingresoTotal,
    pagoConductoresTotal,
    gananciaTotal,
    kilometrosTotal,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,
    cargarJornadas,
    cargarCatalogos,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarJornada,
    eliminarJornada,
    aplicarFiltros,
    limpiarFiltros,
  };
};