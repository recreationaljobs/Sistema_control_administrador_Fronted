import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  createConductor,
  deleteConductor,
  getConductores,
  getSucursales,
  updateConductor,
} from "../services/conductoresService";

const normalizarLista = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

export const useConductores = () => {
  const { rol, sucursal } = useAuth();

  const [conductores, setConductores] = useState([]);
  const [sucursales, setSucursales] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [conductorEditando, setConductorEditando] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const esSuperAdmin = rol === "superadmin";
  const esAdminSucursal = rol === "admin_sucursal";

  const cargarConductores = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getConductores();
      setConductores(normalizarLista(data));
    } catch (err) {
      const message =
        err.response?.data?.detail || "No se pudieron cargar los conductores.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const cargarSucursales = async () => {
    if (!esSuperAdmin) {
      setSucursales([]);
      return;
    }

    try {
      setLoadingSucursales(true);

      const data = await getSucursales();
      setSucursales(normalizarLista(data));
    } catch (err) {
      const message =
        err.response?.data?.detail || "No se pudieron cargar las sucursales.";
      setError(message);
    } finally {
      setLoadingSucursales(false);
    }
  };

  const abrirModalCrear = () => {
    setConductorEditando(null);
    setModalOpen(true);
  };

  const abrirModalEditar = (conductor) => {
    setConductorEditando(conductor);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setConductorEditando(null);
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

  const guardarConductor = async (form) => {
    try {
      setSaving(true);
      setError("");

      const sucursalFinal = esSuperAdmin ? form.sucursal : sucursal;

      const payload = {
      
        usuario: null,
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono || "",
        cedula: form.cedula,
        direccion: form.direccion || "",
        licencia: form.licencia,
        vencimiento_licencia: form.vencimiento_licencia || null,
        
        activo: form.activo,
      };

      if (conductorEditando) {
        await updateConductor(conductorEditando.id, payload);
      } else {
        await createConductor(payload);
      }

      await cargarConductores();
      cerrarModal();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo guardar el conductor."));
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstadoConductor = async (conductor) => {
    try {
      setSaving(true);
      setError("");

      await updateConductor(conductor.id, {
        activo: !conductor.activo,
      });

      await cargarConductores();
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudo cambiar el estado del conductor.")
      );
    } finally {
      setSaving(false);
    }
  };

  const eliminarConductor = async (conductor) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar al conductor "${conductor.nombre} ${conductor.apellido}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteConductor(conductor.id);
      await cargarConductores();
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudo eliminar el conductor. Puede que tenga registros asociados."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const conductoresFiltrados = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return conductores;
    }

    return conductores.filter((conductor) => {
      const nombre = conductor.nombre?.toLowerCase() || "";
      const apellido = conductor.apellido?.toLowerCase() || "";
      const nombreCompleto = conductor.nombre_completo?.toLowerCase() || "";
      const cedula = conductor.cedula?.toLowerCase() || "";
      const telefono = conductor.telefono?.toLowerCase() || "";
      const licencia = conductor.licencia?.toLowerCase() || "";
      const sucursalNombre = conductor.sucursal_nombre?.toLowerCase() || "";

      return (
        nombre.includes(value) ||
        apellido.includes(value) ||
        nombreCompleto.includes(value) ||
        cedula.includes(value) ||
        telefono.includes(value) ||
        licencia.includes(value) ||
        sucursalNombre.includes(value)
      );
    });
  }, [conductores, search]);

  const totalConductores = conductores.length;
  const conductoresActivos = conductores.filter((item) => item.activo).length;
  const conductoresInactivos = conductores.filter((item) => !item.activo).length;
  const conductoresConUsuario = conductores.filter((item) => item.usuario).length;
 

  useEffect(() => {
    cargarConductores();
    cargarSucursales();
  }, []);

  return {
  conductores,
  conductoresFiltrados,
  loading,
  saving,
  error,
  search,
  setSearch,
  modalOpen,
  conductorEditando,
  totalConductores,
  conductoresActivos,
  conductoresInactivos,
  conductoresConUsuario,
  esSuperAdmin,
  esAdminSucursal,
  cargarConductores,
  abrirModalCrear,
  abrirModalEditar,
  cerrarModal,
  guardarConductor,
  cambiarEstadoConductor,
  eliminarConductor,
};
};