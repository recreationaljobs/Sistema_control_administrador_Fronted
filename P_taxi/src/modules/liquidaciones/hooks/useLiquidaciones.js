import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  abrirRecibo,
  createLiquidacion,
  getConductores,
  getLiquidaciones,
} from "../services/liquidacionesService";

const normalizarLista = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
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

  console.error("Error de liquidación:", data || err);

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

export const useLiquidaciones = () => {
  const auth = useAuth();
  const rol = obtenerCodigoRol(auth);

  const [liquidaciones, setLiquidaciones] = useState([]);
  const [conductores, setConductores] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const esSuperAdmin = rol === "superadmin" || rol === "super_admin";
  const esAdminSucursal = rol === "admin_sucursal";

  const cargarLiquidaciones = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLiquidaciones();
      setLiquidaciones(normalizarLista(data));
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudieron cargar las liquidaciones.")
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);

      const data = await getConductores();
      setConductores(normalizarLista(data));
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudieron cargar los conductores.")
      );
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const abrirModal = () => {
    setError("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
  };

  const guardarLiquidacion = async (payload) => {
    try {
      setSaving(true);
      setError("");

      await createLiquidacion(payload);
      await cargarLiquidaciones();
      cerrarModal();

      return true;
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo confirmar el pago."));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const verRecibo = async (liquidacion) => {
    try {
      setError("");
      await abrirRecibo(liquidacion.id);
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo abrir el recibo."));
    }
  };

  const totalLiquidaciones = liquidaciones.length;

  const montoTotalPagado = liquidaciones.reduce((total, liq) => {
    return total + Number(liq.total_pago || 0);
  }, 0);

  useEffect(() => {
    cargarLiquidaciones();
    cargarCatalogos();
  }, []);

  return {
    liquidaciones,
    conductores,

    loading,
    loadingCatalogos,
    saving,

    error,
    setError,

    modalOpen,

    totalLiquidaciones,
    montoTotalPagado,

    rol,
    esSuperAdmin,
    esAdminSucursal,

    cargarLiquidaciones,
    cargarCatalogos,

    abrirModal,
    cerrarModal,

    guardarLiquidacion,
    verRecibo,
  };
};
