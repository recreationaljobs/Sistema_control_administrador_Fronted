import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  createLiquidacion,
  getConductores,
  getLiquidaciones,
  getReciboLiquidacion,
  previewLiquidacion,
} from "../services/liquidacionesService";

const normalizarLista = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const obtenerCodigoRol = (auth) => {
  const rolDirecto = auth?.rol;
  const user = auth?.user;

  if (typeof rolDirecto === "string") return rolDirecto;
  if (typeof user?.rol_codigo === "string") return user.rol_codigo;
  if (typeof user?.rol?.codigo === "string") return user.rol.codigo;
  if (typeof user?.rol === "string") return user.rol;

  return "";
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

  const esSuperAdmin = rol === "superadmin" || rol === "super_admin";
  const esAdminSucursal = rol === "admin_sucursal";
  const esTaxista = rol === "taxista";
  const esAdminOSuperAdmin = esSuperAdmin || esAdminSucursal;

  const [liquidaciones, setLiquidaciones] = useState([]);
  const [conductores, setConductores] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  const [recibo, setRecibo] = useState(null);
  const [modalReciboOpen, setModalReciboOpen] = useState(false);

  const [error, setError] = useState("");

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
      setError("");

      const conductoresData = await getConductores();
      setConductores(normalizarLista(conductoresData));
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudieron cargar los conductores.")
      );
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const abrirModalCrear = () => {
    if (!esAdminOSuperAdmin) {
      setError("No tienes permiso para registrar liquidaciones.");
      return;
    }

    setError("");
    setPreview(null);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setPreview(null);
  };

  const calcularPreview = async (form) => {
    try {
      setLoadingPreview(true);
      setError("");

      const data = await previewLiquidacion({
        conductor: form.conductor,
      });

      setPreview(data);
      return data;
    } catch (err) {
      setPreview(null);
      setError(
        obtenerMensajeError(err, "No se pudo calcular la liquidación.")
      );
      return null;
    } finally {
      setLoadingPreview(false);
    }
  };

  const guardarLiquidacion = async (form) => {
    if (!esAdminOSuperAdmin) {
      setError("No tienes permiso para registrar liquidaciones.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        conductor: Number(form.conductor),
        abono_aplicado: Number(form.abono_aplicado || 0),
        ajuste_manual: Number(form.ajuste_manual || 0),
        notas: form.notas || "",
      };

      await createLiquidacion(payload);

      await cargarLiquidaciones();
      cerrarModal();
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudo registrar la liquidación.")
      );
    } finally {
      setSaving(false);
    }
  };

  const verRecibo = async (liquidacion) => {
  try {
    setError("");

    if (!liquidacion?.id) {
      setError("No se encontró el ID de la liquidación.");
      return;
    }

    const data = await getReciboLiquidacion(liquidacion.id);
    setRecibo(data);
    setModalReciboOpen(true);
  } catch (err) {
    setError(
      obtenerMensajeError(err, "No se pudo cargar el recibo de liquidación.")
    );
  }
};

  const cerrarRecibo = () => {
    setModalReciboOpen(false);
    setRecibo(null);
  };

  const imprimirRecibo = () => {
    window.print();
  };

  const totalLiquidaciones = liquidaciones.length;

  const montoTotalPagado = useMemo(() => {
    return liquidaciones.reduce((total, item) => {
      return total + Number(item.total_pago || 0);
    }, 0);
  }, [liquidaciones]);

  useEffect(() => {
    cargarLiquidaciones();
    cargarCatalogos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rol]);

  return {
    liquidaciones,
    conductores,

    loading,
    loadingCatalogos,
    loadingPreview,
    saving,

    error,
    setError,

    modalOpen,
    abrirModalCrear,
    cerrarModal,

    preview,
    calcularPreview,
    guardarLiquidacion,

    recibo,
    modalReciboOpen,
    verRecibo,
    cerrarRecibo,
    imprimirRecibo,

    rol,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,
    esAdminOSuperAdmin,

    totalLiquidaciones,
    montoTotalPagado,

    cargarLiquidaciones,
    cargarCatalogos,
  };
};