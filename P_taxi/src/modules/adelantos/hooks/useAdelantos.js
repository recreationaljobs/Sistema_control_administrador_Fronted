import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  createAdelanto,
  deleteAdelanto,
  getAdelantos,
  getEstadosAdelanto,
  getJornadas,
  updateAdelanto,
} from "../services/adelantosService";

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

  console.error("Error de adelanto:", data || err);

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

export const useAdelantos = () => {
  const auth = useAuth();
  const rol = obtenerCodigoRol(auth);

  const [adelantos, setAdelantos] = useState([]);
  const [jornadas, setJornadas] = useState([]);
  const [estadosAdelanto, setEstadosAdelanto] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [adelantoEditando, setAdelantoEditando] = useState(null);

  const [search, setSearch] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [error, setError] = useState("");

  const hoy = obtenerFechaLocal();

  const esSuperAdmin = rol === "superadmin" || rol === "super_admin";
  const esAdminSucursal = rol === "admin_sucursal";
  const esTaxista = rol === "taxista";

  const cargarAdelantos = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdelantos();
      setAdelantos(normalizarLista(data));
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudieron cargar los adelantos.")
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      setError("");

      const [jornadasData, estadosData] = await Promise.all([
        getJornadas(),
        getEstadosAdelanto(),
      ]);

      setJornadas(normalizarLista(jornadasData));
      setEstadosAdelanto(normalizarLista(estadosData));
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudieron cargar los catálogos de adelantos."
        )
      );
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const abrirModalCrear = () => {
    setError("");
    setAdelantoEditando(null);
    setModalOpen(true);
  };

  const abrirModalEditar = (adelanto) => {
    setError("");
    setAdelantoEditando(adelanto);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setAdelantoEditando(null);
  };

  const guardarAdelanto = async (form) => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        monto: form.monto ? Number(form.monto) : 0,
        observacion: form.observacion || "",
      };

      if (form.jornada) {
        payload.jornada = Number(form.jornada);
      }

      if (form.estado) {
        payload.estado = Number(form.estado);
      } else {
        payload.estado = null;
      }

      if (!payload.jornada) {
        setError("Debes seleccionar la jornada.");
        return;
      }

      if (payload.monto <= 0) {
        setError("El monto del adelanto debe ser mayor que cero.");
        return;
      }

      if (adelantoEditando) {
        await updateAdelanto(adelantoEditando.id, payload);
      } else {
        await createAdelanto(payload);
      }

      await cargarAdelantos();
      await cargarCatalogos();
      cerrarModal();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo guardar el adelanto."));
    } finally {
      setSaving(false);
    }
  };

  const eliminarAdelanto = async (adelanto) => {
    if (esTaxista) {
      setError("No tienes permiso para eliminar adelantos.");
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar este adelanto de C$ ${Number(
        adelanto.monto || 0
      ).toFixed(2)}?`
    );

    if (!confirmar) return;

    try {
      setSaving(true);
      setError("");

      await deleteAdelanto(adelanto.id);
      await cargarAdelantos();
      await cargarCatalogos();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo eliminar el adelanto."));
    } finally {
      setSaving(false);
    }
  };

  const aplicarFiltros = async () => {
    await cargarAdelantos();
  };

  const limpiarFiltros = async () => {
    setFechaInicio("");
    setFechaFin("");

    await cargarAdelantos();
  };

  const adelantosFiltrados = useMemo(() => {
    const value = search.trim().toLowerCase();

    return adelantos.filter((adelanto) => {
      if (fechaInicio && (adelanto.fecha || "") < fechaInicio) {
        return false;
      }

      if (fechaFin && (adelanto.fecha || "") > fechaFin) {
        return false;
      }

      if (!value) return true;

      const conductor = adelanto.conductor_nombre?.toLowerCase() || "";
      const estado = adelanto.estado_nombre?.toLowerCase() || "";
      const sucursal = adelanto.sucursal_nombre?.toLowerCase() || "";
      const observacion = adelanto.observacion?.toLowerCase() || "";
      const fecha = adelanto.fecha?.toLowerCase() || "";

      return (
        conductor.includes(value) ||
        estado.includes(value) ||
        sucursal.includes(value) ||
        observacion.includes(value) ||
        fecha.includes(value)
      );
    });
  }, [adelantos, search, fechaInicio, fechaFin]);

  const jornadasDisponibles = useMemo(() => {
    return jornadas.filter((jornada) => Boolean(jornada.id));
  }, [jornadas]);

  const totalAdelantos = adelantos.length;

  const montoTotal = adelantos.reduce((total, adelanto) => {
    return total + Number(adelanto.monto || 0);
  }, 0);

  const adelantosHoy = adelantos.filter((adelanto) => adelanto.fecha === hoy);

  const montoHoy = adelantosHoy.reduce((total, adelanto) => {
    return total + Number(adelanto.monto || 0);
  }, 0);

  useEffect(() => {
    cargarAdelantos();
    cargarCatalogos();
  }, []);

  return {
    adelantos,
    adelantosFiltrados,

    jornadas,
    jornadasDisponibles,
    estadosAdelanto,

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
    adelantoEditando,

    totalAdelantos,
    montoTotal,
    adelantosHoy,
    montoHoy,

    rol,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,

    cargarAdelantos,
    cargarCatalogos,

    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,

    guardarAdelanto,
    eliminarAdelanto,

    aplicarFiltros,
    limpiarFiltros,
  };
};
