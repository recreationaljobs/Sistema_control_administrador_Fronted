import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  createAsignacion,
  deleteAsignacion,
  getAsignaciones,
  getConductoresDisponibles,
  getVehiculosDisponibles,
  updateAsignacion,
} from "../services/asignacionesService";

const normalizarLista = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

export const useAsignaciones = () => {
  const { rol } = useAuth();

  const [asignaciones, setAsignaciones] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [asignacionEditando, setAsignacionEditando] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const esSuperAdmin = rol === "superadmin";
  const esAdminSucursal = rol === "admin_sucursal";
  const esTaxista = rol === "taxista";

  const cargarAsignaciones = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAsignaciones();
      setAsignaciones(normalizarLista(data));
    } catch (err) {
      const message =
        err.response?.data?.detail || "No se pudieron cargar las asignaciones.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Solo conductores/vehículos libres. Al editar (asignacionId) se incluye
  // además el conductor/vehículo que ya tiene esa asignación.
  const cargarCatalogos = async (asignacionId = null) => {
    try {
      setLoadingCatalogos(true);
      setError("");

      const conductoresData = await getConductoresDisponibles(asignacionId);
      const vehiculosData = await getVehiculosDisponibles(asignacionId);

      setConductores(normalizarLista(conductoresData));
      setVehiculos(normalizarLista(vehiculosData));
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "No se pudieron cargar conductores y vehículos.";
      setError(message);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const abrirModalCrear = () => {
    setAsignacionEditando(null);
    cargarCatalogos();
    setModalOpen(true);
  };

  const abrirModalEditar = (asignacion) => {
    setAsignacionEditando(asignacion);
    cargarCatalogos(asignacion.id);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setAsignacionEditando(null);
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

  const guardarAsignacion = async (form) => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        conductor: form.conductor ? Number(form.conductor) : null,
        vehiculo: form.vehiculo ? Number(form.vehiculo) : null,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin || null,
        activa: form.activa,
      };

      if (asignacionEditando) {
        await updateAsignacion(asignacionEditando.id, payload);
      } else {
        await createAsignacion(payload);
      }

      await cargarAsignaciones();
      await cargarCatalogos();
      cerrarModal();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo guardar la asignación."));
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstadoAsignacion = async (asignacion) => {
    try {
      setSaving(true);
      setError("");

      await updateAsignacion(asignacion.id, {
        activa: !asignacion.activa,
        fecha_fin: asignacion.activa
          ? new Date().toISOString().split("T")[0]
          : asignacion.fecha_fin,
      });

      await cargarAsignaciones();
      await cargarCatalogos();
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudo cambiar el estado de la asignación.")
      );
    } finally {
      setSaving(false);
    }
  };

  const eliminarAsignacion = async (asignacion) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar la asignación de "${asignacion.conductor_nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteAsignacion(asignacion.id);
      await cargarAsignaciones();
      await cargarCatalogos();
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudo eliminar la asignación. Puede que tenga registros asociados."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const asignacionesFiltradas = useMemo(() => {
  const lista = Array.isArray(asignaciones)
    ? asignaciones.filter(Boolean)
    : [];

  const value = String(search || "")
    .trim()
    .toLowerCase();

  if (!value) {
    return lista;
  }

  return lista.filter((asignacion) => {
    const texto = [
      asignacion?.conductor_nombre,
      asignacion?.vehiculo_placa,
      asignacion?.vehiculo_numero,
      asignacion?.vehiculo_descripcion,
      asignacion?.sucursal_nombre,

      asignacion?.conductor?.nombre,
      asignacion?.conductor?.apellido,

      asignacion?.vehiculo?.numero,
      asignacion?.vehiculo?.placa,
      asignacion?.vehiculo?.marca,
      asignacion?.vehiculo?.modelo,

      asignacion?.sucursal?.nombre,
    ]
      .filter(
        (valor) =>
          valor !== null &&
          valor !== undefined
      )
      .map((valor) => String(valor))
      .join(" ")
      .toLowerCase();

    return texto.includes(value);
  });
}, [asignaciones, search]);

  const listaUsuariosSegura =
  Array.isArray(usuarios)
    ? usuarios.filter(Boolean)
    : [];

const totalUsuarios =
  listaUsuariosSegura.length;

const usuariosActivos =
  listaUsuariosSegura.filter(
    (item) =>
      item?.is_active === true ||
      item?.is_active === 1 ||
      item?.is_active === "1" ||
      String(
        item?.is_active
      ).toLowerCase() === "true"
  ).length;

const administradores =
  listaUsuariosSegura.filter((item) =>
    [
      "admin_sucursal",
      "superadmin",
      "super_admin",
    ].includes(
      normalizarCodigo(
        item?.rol_codigo
      )
    )
  ).length;

const taxistas =
  listaUsuariosSegura.filter(
    (item) =>
      normalizarCodigo(
        item?.rol_codigo
      ) === "taxista"
  ).length;

 useEffect(() => {
  void cargarAsignaciones();

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  return {
    asignaciones,
    asignacionesFiltradas,
    conductores,
    vehiculos,
    loading,
    loadingCatalogos,
    saving,
    error,
    search,
    setSearch,
    modalOpen,
    asignacionEditando,
    totalAsignaciones,
    asignacionesActivas,
    asignacionesInactivas,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,
    cargarAsignaciones,
    cargarCatalogos,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarAsignacion,
    cambiarEstadoAsignacion,
    eliminarAsignacion,
  };
};