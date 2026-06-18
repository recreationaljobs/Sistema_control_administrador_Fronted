import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  createAdelanto,
  deleteAdelanto,
  getAdelantos,
  getConductores,
  getEstadosAdelanto,
  getRecibo,
  getSucursales,
  updateAdelanto,
} from "../services/adelantosService";

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

const esRolSuperAdmin = (rol) => {
  return rol === "superadmin" || rol === "super_admin";
};

const esRolAdminSucursal = (rol) => {
  return rol === "admin_sucursal";
};

const esRolTaxista = (rol) => {
  return rol === "taxista";
};

const puedeGestionar = (rol) => {
  return esRolSuperAdmin(rol) || esRolAdminSucursal(rol);
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

  const esSuperAdmin = esRolSuperAdmin(rol);
  const esAdminSucursal = esRolAdminSucursal(rol);
  const esTaxista = esRolTaxista(rol);
  const esAdminOSuperAdmin = puedeGestionar(rol);

  const [adelantos, setAdelantos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [estadosAdelanto, setEstadosAdelanto] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [adelantoEditando, setAdelantoEditando] = useState(null);
  const [tipoInicial, setTipoInicial] = useState("ADELANTO");

  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [filtroConductor, setFiltroConductor] = useState("");
  const [error, setError] = useState("");

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

      const [conductoresData, estadosData] = await Promise.all([
        getConductores(),
        getEstadosAdelanto(),
      ]);

      setConductores(normalizarLista(conductoresData));
      setEstadosAdelanto(normalizarLista(estadosData));

      if (esAdminOSuperAdmin) {
        try {
          const sucursalesData = await getSucursales();
          setSucursales(normalizarLista(sucursalesData));
        } catch (err) {
          console.warn(
            "No se pudieron cargar sucursales. El módulo continuará sin sucursales.",
            err?.response?.data || err
          );
          setSucursales([]);
        }
      } else {
        setSucursales([]);
      }
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

  const abrirModalCrear = (tipo = "ADELANTO") => {
    if (!esAdminOSuperAdmin) {
      setError("No tienes permiso para registrar adelantos o abonos.");
      return;
    }

    setError("");
    setAdelantoEditando(null);
    setTipoInicial(tipo);
    setModalOpen(true);
  };

  const abrirModalEditar = (adelanto) => {
    if (!esAdminOSuperAdmin) {
      setError("No tienes permiso para modificar registros.");
      return;
    }

    setError("");
    setAdelantoEditando(adelanto);
    setTipoInicial(adelanto?.tipo || "ADELANTO");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setAdelantoEditando(null);
  };

  const guardarAdelanto = async (form) => {
  if (!esAdminOSuperAdmin) {
    setError("No tienes permiso para guardar adelantos o abonos.");
    return;
  }

  try {
    setSaving(true);
    setError("");

    const payload = {
      tipo: form.tipo || "ADELANTO",
      monto: form.monto ? Number(form.monto) : 0,
      observacion: form.observacion || "",
    };

    if (form.conductor) {
      payload.conductor = Number(form.conductor);
    }

    if (form.estado) {
      payload.estado = Number(form.estado);
    } else {
      payload.estado = null;
    }

    if (!payload.conductor) {
      setError("Debes seleccionar el conductor.");
      return;
    }

    if (payload.monto <= 0) {
      setError("El monto debe ser mayor que cero.");
      return;
    }

    if (adelantoEditando) {
      await updateAdelanto(adelantoEditando.id, payload);
    } else {
      await createAdelanto(payload);
    }

    await cargarAdelantos();
    cerrarModal();
  } catch (err) {
    setError(obtenerMensajeError(err, "No se pudo guardar el registro."));
  } finally {
    setSaving(false);
  }
};

  const eliminarAdelanto = async (adelanto) => {
    if (!esAdminOSuperAdmin) {
      setError("No tienes permiso para eliminar registros.");
      return;
    }

    const etiqueta = adelanto.tipo === "ABONO" ? "abono" : "adelanto";

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar este ${etiqueta} de C$ ${Number(
        adelanto.monto || 0
      ).toFixed(2)}?`
    );

    if (!confirmar) return;

    try {
      setSaving(true);
      setError("");

      await deleteAdelanto(adelanto.id);
      await cargarAdelantos();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo eliminar el registro."));
    } finally {
      setSaving(false);
    }
  };

  const verRecibo = async (adelanto) => {
    try {
      setError("");

      const data = await getRecibo(adelanto.id);

      return data;
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo abrir el recibo."));
      return null;
    }
  };

  const adelantosFiltrados = useMemo(() => {
    return adelantos.filter((adelanto) => {
      if (filtroTipo !== "TODOS" && adelanto.tipo !== filtroTipo) {
        return false;
      }

      if (
        filtroConductor &&
        String(adelanto.conductor) !== String(filtroConductor)
      ) {
        return false;
      }

      return true;
    });
  }, [adelantos, filtroTipo, filtroConductor]);

  const totalAdelantos = adelantos.filter((a) => a.tipo === "ADELANTO").length;
  const totalAbonos = adelantos.filter((a) => a.tipo === "ABONO").length;

  const montoAdelantos = adelantos
    .filter((a) => a.tipo === "ADELANTO")
    .reduce((total, a) => total + Number(a.monto || 0), 0);

  const montoAbonos = adelantos
    .filter((a) => a.tipo === "ABONO")
    .reduce((total, a) => total + Number(a.monto || 0), 0);

  const saldo = montoAdelantos - montoAbonos;

  useEffect(() => {
    cargarAdelantos();
    cargarCatalogos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rol]);

  return {
    adelantos,
    adelantosFiltrados,

    conductores,
    sucursales,
    estadosAdelanto,

    loading,
    loadingCatalogos,
    saving,

    error,
    setError,

    filtroTipo,
    setFiltroTipo,
    filtroConductor,
    setFiltroConductor,

    modalOpen,
    adelantoEditando,
    tipoInicial,

    totalAdelantos,
    totalAbonos,
    montoAdelantos,
    montoAbonos,
    saldo,

    rol,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,
    esAdminOSuperAdmin,

    cargarAdelantos,
    cargarCatalogos,

    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,

    guardarAdelanto,
    eliminarAdelanto,
    verRecibo,
  };
};