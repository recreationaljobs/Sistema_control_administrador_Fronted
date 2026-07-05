import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../../hooks/useAuth";
import {
  createUsuario,
  darBajaUsuario,
  deleteUsuario,
  getConductoresDisponibles,
  getRoles,
  getSucursales,
  getUsuarios,
  reactivarUsuario,
  updateUsuario,
} from "../services/usuariosService";

const normalizarLista = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

export const useUsuarios = () => {
  const { rol } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [conductoresDisponibles, setConductoresDisponibles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const esSuperAdmin = rol === "superadmin";
  const esAdminSucursal = rol === "admin_sucursal";

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsuarios();
      setUsuarios(normalizarLista(data));
    } catch (err) {
      const message =
        err.response?.data?.detail || "No se pudieron cargar los usuarios.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      setError("");

      const rolesData = await getRoles();
      const rolesList = normalizarLista(rolesData);

      const codigosValidos = [
        "superadmin",
        "usuario_sistema",
        "admin_sucursal",
        "taxista",
      ];

      let rolesPermitidos = rolesList.filter((item) =>
        codigosValidos.includes(item.codigo)
      );

      if (esAdminSucursal) {
        rolesPermitidos = rolesPermitidos.filter(
          (item) => item.codigo === "taxista"
        );
      }

      setRoles(rolesPermitidos);

      if (esSuperAdmin) {
        const sucursalesData = await getSucursales();
        setSucursales(normalizarLista(sucursalesData));
      } else {
        setSucursales([]);
      }
    } catch (err) {
      const message =
        err.response?.data?.detail || "No se pudieron cargar los catálogos.";

      setError(message);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const cargarConductoresDisponibles = async ({
    sucursalId = "",
    searchText = "",
  } = {}) => {
    try {
      setError("");

      const data = await getConductoresDisponibles({
        sucursal: sucursalId,
        search: searchText,
      });

      setConductoresDisponibles(normalizarLista(data));
    } catch (err) {
      setConductoresDisponibles([]);

      const message =
        err.response?.data?.detail ||
        "No se pudieron cargar los conductores disponibles.";

      setError(message);
    }
  };

  const abrirModalCrear = () => {
    setUsuarioEditando(null);
    setConductoresDisponibles([]);
    setModalOpen(true);
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setConductoresDisponibles([]);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setUsuarioEditando(null);
    setConductoresDisponibles([]);
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

  const guardarUsuario = async (form) => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        username: form.username,
        first_name: form.first_name || "",
        last_name: form.last_name || "",
        email: form.email || "",
        telefono: form.telefono || "",
        rol: form.rol || null,
        is_active: form.is_active,
        conductor_id: form.conductor_id || null,
      };

      if (esSuperAdmin && form.sucursal) {
        payload.sucursal = form.sucursal;
      }

      if (form.password?.trim()) {
        payload.password = form.password;
      }

      if (usuarioEditando) {
        await updateUsuario(usuarioEditando.id, payload);
      } else {
        await createUsuario(payload);
      }

      await cargarUsuarios();
      cerrarModal();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo guardar el usuario."));
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstadoUsuario = async (usuario) => {
    try {
      setSaving(true);
      setError("");

      await updateUsuario(usuario.id, {
        is_active: !usuario.is_active,
      });

      await cargarUsuarios();
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudo cambiar el estado del usuario.")
      );
    } finally {
      setSaving(false);
    }
  };

  const darBaja = async (usuario) => {
    const result = await Swal.fire({
      title: "¿Dar de baja al usuario?",
      text: `${usuario.username} no podrá iniciar sesión hasta que lo reactives.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, dar de baja",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await darBajaUsuario(usuario.id);
      await cargarUsuarios();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo dar de baja al usuario."));
    } finally {
      setSaving(false);
    }
  };

  const reactivar = async (usuario) => {
    const result = await Swal.fire({
      title: "¿Reactivar al usuario?",
      text: `${usuario.username} podrá volver a iniciar sesión.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, reactivar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await reactivarUsuario(usuario.id);
      await cargarUsuarios();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo reactivar al usuario."));
    } finally {
      setSaving(false);
    }
  };

  const eliminarUsuario = async (usuario) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar el usuario "${usuario.username}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteUsuario(usuario.id);
      await cargarUsuarios();
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudo eliminar el usuario. Puede que tenga registros asociados."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const usuariosFiltrados = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return usuarios;
    }

    return usuarios.filter((usuario) => {
      const username = usuario.username?.toLowerCase() || "";
      const firstName = usuario.first_name?.toLowerCase() || "";
      const lastName = usuario.last_name?.toLowerCase() || "";
      const email = usuario.email?.toLowerCase() || "";
      const rolNombre = usuario.rol_nombre?.toLowerCase() || "";
      const sucursalNombre = usuario.sucursal_nombre?.toLowerCase() || "";
      const conductorNombre = usuario.conductor_nombre?.toLowerCase() || "";

      return (
        username.includes(value) ||
        firstName.includes(value) ||
        lastName.includes(value) ||
        email.includes(value) ||
        rolNombre.includes(value) ||
        sucursalNombre.includes(value) ||
        conductorNombre.includes(value)
      );
    });
  }, [usuarios, search]);

  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((item) => item.is_active).length;
  const administradores = usuarios.filter(
    (item) => item.rol_codigo === "admin_sucursal"
  ).length;
  const taxistas = usuarios.filter(
    (item) => item.rol_codigo === "taxista"
  ).length;

  useEffect(() => {
    cargarUsuarios();
    cargarCatalogos();
  }, []);

  return {
    usuarios,
    usuariosFiltrados,
    roles,
    sucursales,
    conductoresDisponibles,
    loading,
    loadingCatalogos,
    saving,
    error,
    search,
    setSearch,
    modalOpen,
    usuarioEditando,
    totalUsuarios,
    usuariosActivos,
    administradores,
    taxistas,
    esSuperAdmin,
    esAdminSucursal,
    cargarConductoresDisponibles,
    cargarUsuarios,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarUsuario,
    cambiarEstadoUsuario,
    darBaja,
    reactivar,
    eliminarUsuario,
  };
};