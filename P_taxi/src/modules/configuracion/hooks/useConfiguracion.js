import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  createCatalogo,
  deleteCatalogo,
  getCatalogo,
  getConfiguracionSistema,
  updateCatalogo,
  updateConfiguracionSistema,
} from "../services/configuracionService";

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

  if (data?.detail) return data.detail;
  if (data?.non_field_errors?.length) return data.non_field_errors[0];
  if (typeof data === "string") return data;

  if (typeof data === "object" && data !== null) {
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];

    if (Array.isArray(firstValue)) return `${firstKey}: ${firstValue[0]}`;
    if (typeof firstValue === "string") return `${firstKey}: ${firstValue}`;
  }

  return mensajeDefault;
};

export const catalogosMeta = [
  {
    key: "roles",
    endpoint: "roles",
    titulo: "Roles",
    descripcion: "Roles disponibles para usuarios del sistema.",
    grupo: "roles",
  },
  {
    key: "estadosVehiculo",
    endpoint: "estados-vehiculo",
    titulo: "Estados de vehículo",
    descripcion: "Estados usados para clasificar los vehículos.",
    grupo: "estados",
  },
  {
    key: "estadosJornada",
    endpoint: "estados-jornada",
    titulo: "Estados de jornada",
    descripcion: "Estados usados para jornadas diarias.",
    grupo: "estados",
  },
  {
    key: "estadosGasto",
    endpoint: "estados-gasto",
    titulo: "Estados de gasto",
    descripcion: "Estados usados para gastos operativos.",
    grupo: "estados",
  },
  {
    key: "estadosAdelanto",
    endpoint: "estados-adelanto",
    titulo: "Estados de adelanto",
    descripcion: "Estados usados para adelantos a taxistas.",
    grupo: "estados",
  },
  {
    key: "estadosMantenimiento",
    endpoint: "estados-mantenimiento",
    titulo: "Estados de mantenimiento",
    descripcion: "Estados usados para mantenimientos.",
    grupo: "estados",
  },
  {
    key: "tiposGasto",
    endpoint: "tipos-gasto",
    titulo: "Tipos de gasto",
    descripcion: "Clasificación de gastos del vehículo.",
    grupo: "tipos",
  },
  {
    key: "tiposMantenimiento",
    endpoint: "tipos-mantenimiento",
    titulo: "Tipos de mantenimiento",
    descripcion: "Clasificación de mantenimientos del vehículo.",
    grupo: "tipos",
  },
];

export const useConfiguracion = () => {
  const auth = useAuth();
  const rol = obtenerCodigoRol(auth);

  const esSuperAdmin = rol === "superadmin" || rol === "super_admin";
  const esAdminSucursal = rol === "admin_sucursal";
  const esTaxista = rol === "taxista";

  const [tabActiva, setTabActiva] = useState("general");
  const [configuracion, setConfiguracion] = useState(null);
  const [catalogos, setCatalogos] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [catalogoActivo, setCatalogoActivo] = useState(null);
  const [registroEditando, setRegistroEditando] = useState(null);

  const cargarConfiguracion = async () => {
    const data = await getConfiguracionSistema();
    setConfiguracion(data);
  };

  const cargarCatalogos = async () => {
    const resultados = await Promise.all(
      catalogosMeta.map(async (meta) => {
        const data = await getCatalogo(meta.endpoint);

        return {
          key: meta.key,
          data: normalizarLista(data),
        };
      })
    );

    const nuevoEstado = {};

    resultados.forEach((item) => {
      nuevoEstado[item.key] = item.data;
    });

    setCatalogos(nuevoEstado);
  };

  const cargarTodo = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await Promise.all([cargarConfiguracion(), cargarCatalogos()]);
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudo cargar la configuración del sistema."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const guardarConfiguracionGeneral = async (form) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (esTaxista) {
        setError("No tienes permiso para modificar la configuración.");
        return;
      }

      const payload = {
        moneda: form.moneda || "C$",
        porcentaje_pago_conductor: Number(form.porcentaje_pago_conductor || 0),
        intervalo_cambio_aceite_km: Number(
          form.intervalo_cambio_aceite_km || 0
        ),
        intervalo_mantenimiento_km: Number(
          form.intervalo_mantenimiento_km || 0
        ),
        alerta_previa_km: Number(form.alerta_previa_km || 0),
        km_aviso_mantenimiento: Number(form.km_aviso_mantenimiento || 0),
      };

      if (payload.porcentaje_pago_conductor < 0) {
        setError("El porcentaje no puede ser negativo.");
        return;
      }

      if (payload.porcentaje_pago_conductor > 100) {
        setError("El porcentaje no puede ser mayor que 100.");
        return;
      }

      if (payload.intervalo_cambio_aceite_km <= 0) {
        setError("El intervalo de cambio de aceite debe ser mayor que cero.");
        return;
      }

      if (payload.intervalo_mantenimiento_km <= 0) {
        setError("El intervalo de mantenimiento debe ser mayor que cero.");
        return;
      }

      if (payload.alerta_previa_km < 0) {
        setError("La alerta previa no puede ser negativa.");
        return;
      }

      const data = await updateConfiguracionSistema(payload);
      setConfiguracion(data);
      setSuccess("Configuración general guardada correctamente.");
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudo guardar la configuración.")
      );
    } finally {
      setSaving(false);
    }
  };

  const abrirModalCrear = (meta) => {
    if (!esSuperAdmin) {
      setError("Solo el superadministrador puede administrar catálogos.");
      return;
    }

    setError("");
    setSuccess("");
    setCatalogoActivo(meta);
    setRegistroEditando(null);
    setModalOpen(true);
  };

  const abrirModalEditar = (meta, registro) => {
    if (!esSuperAdmin) {
      setError("Solo el superadministrador puede administrar catálogos.");
      return;
    }

    setError("");
    setSuccess("");
    setCatalogoActivo(meta);
    setRegistroEditando(registro);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setCatalogoActivo(null);
    setRegistroEditando(null);
  };

  const guardarCatalogo = async (form) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!esSuperAdmin) {
        setError("Solo el superadministrador puede administrar catálogos.");
        return;
      }

      if (!catalogoActivo) {
        setError("No se encontró el catálogo seleccionado.");
        return;
      }

      const payload = {
        nombre: form.nombre?.trim() || "",
        codigo: form.codigo?.trim() || "",
      };

      if (!payload.nombre) {
        setError("El nombre es obligatorio.");
        return;
      }

      if (!payload.codigo) {
        setError("El código es obligatorio.");
        return;
      }

      if (registroEditando) {
        await updateCatalogo(
          catalogoActivo.endpoint,
          registroEditando.id,
          payload
        );
      } else {
        await createCatalogo(catalogoActivo.endpoint, payload);
      }

      const data = await getCatalogo(catalogoActivo.endpoint);

      setCatalogos((prev) => ({
        ...prev,
        [catalogoActivo.key]: normalizarLista(data),
      }));

      setSuccess("Catálogo guardado correctamente.");
      cerrarModal();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo guardar el catálogo."));
    } finally {
      setSaving(false);
    }
  };

  const eliminarCatalogo = async (meta, registro) => {
    if (!esSuperAdmin) {
      setError("Solo el superadministrador puede administrar catálogos.");
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar "${registro.nombre}"?`
    );

    if (!confirmar) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await deleteCatalogo(meta.endpoint, registro.id);

      const data = await getCatalogo(meta.endpoint);

      setCatalogos((prev) => ({
        ...prev,
        [meta.key]: normalizarLista(data),
      }));

      setSuccess("Registro eliminado correctamente.");
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudo eliminar. Es posible que este registro ya esté en uso."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const catalogosVisibles = useMemo(() => {
    if (tabActiva === "roles") {
      return catalogosMeta.filter((item) => item.grupo === "roles");
    }

    if (tabActiva === "estados") {
      return catalogosMeta.filter((item) => item.grupo === "estados");
    }

    if (tabActiva === "tipos") {
      return catalogosMeta.filter((item) => item.grupo === "tipos");
    }

    return [];
  }, [tabActiva]);

  const filtrarRegistros = (registros = []) => {
    const value = search.trim().toLowerCase();

    if (!value) return registros;

    return registros.filter((item) => {
      const nombre = item.nombre?.toLowerCase() || "";
      const codigo = item.codigo?.toLowerCase() || "";

      return nombre.includes(value) || codigo.includes(value);
    });
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  return {
    rol,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,

    tabActiva,
    setTabActiva,

    configuracion,
    catalogos,
    catalogosVisibles,

    loading,
    saving,
    error,
    success,
    search,
    setSearch,

    modalOpen,
    catalogoActivo,
    registroEditando,

    cargarTodo,
    guardarConfiguracionGeneral,

    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarCatalogo,
    eliminarCatalogo,

    filtrarRegistros,
  };
};