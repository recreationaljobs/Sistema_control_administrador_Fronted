// src/modules/usuarios/hooks/useUsuarios.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
    return data.filter(Boolean);
  }

  if (Array.isArray(data?.results)) {
    return data.results.filter(Boolean);
  }

  if (Array.isArray(data?.data)) {
    return data.data.filter(Boolean);
  }

  if (Array.isArray(data?.data?.results)) {
    return data.data.results.filter(Boolean);
  }

  return [];
};

const normalizarCodigo = (valor) => {
  return String(valor || "")
    .trim()
    .toLowerCase();
};

const obtenerMensajeError = (
  error,
  mensajeDefault
) => {
  const data = error?.response?.data;

  if (typeof data?.detail === "string") {
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

  return error?.message || mensajeDefault;
};

const mostrarExito = (titulo, texto = "") => {
  void Swal.fire({
    title: titulo,
    text: texto,
    icon: "success",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });
};

export const useUsuarios = () => {
  const { rol } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sucursales, setSucursales] =
    useState([]);

  const [
    conductoresDisponibles,
    setConductoresDisponibles,
  ] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [
    loadingCatalogos,
    setLoadingCatalogos,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    usuarioEditando,
    setUsuarioEditando,
  ] = useState(null);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  const codigoRolActual = normalizarCodigo(
    typeof rol === "object"
      ? rol?.codigo
      : rol
  );

  const esSuperAdmin = [
    "superadmin",
    "super_admin",
  ].includes(codigoRolActual);

  const esAdminSucursal =
    codigoRolActual === "admin_sucursal";

  const cargarUsuarios = useCallback(
    async ({
      mostrarCarga = true,
    } = {}) => {
      try {
        if (mostrarCarga) {
          setLoading(true);
        }

        setError("");

        const data = await getUsuarios();
        const lista = normalizarLista(data);

        setUsuarios(lista);

        return lista;
      } catch (requestError) {
        const mensaje = obtenerMensajeError(
          requestError,
          "No se pudieron cargar los usuarios."
        );

        setError(mensaje);

        return false;
      } finally {
        if (mostrarCarga) {
          setLoading(false);
        }
      }
    },
    []
  );

  const cargarCatalogos = useCallback(
    async () => {
      try {
        setLoadingCatalogos(true);
        setError("");

        const rolesData = await getRoles();
        const rolesList =
          normalizarLista(rolesData);

        const codigosValidos = [
          "superadmin",
          "super_admin",
          "usuario_sistema",
          "admin_sucursal",
          "taxista",
        ];

        let rolesPermitidos =
          rolesList.filter((item) =>
            codigosValidos.includes(
              normalizarCodigo(item?.codigo)
            )
          );

        if (esAdminSucursal) {
          rolesPermitidos =
            rolesPermitidos.filter(
              (item) =>
                normalizarCodigo(
                  item?.codigo
                ) === "taxista"
            );
        }

        setRoles(rolesPermitidos);

        if (esSuperAdmin) {
          const sucursalesData =
            await getSucursales();

          setSucursales(
            normalizarLista(
              sucursalesData
            )
          );
        } else {
          setSucursales([]);
        }

        return true;
      } catch (requestError) {
        const mensaje = obtenerMensajeError(
          requestError,
          "No se pudieron cargar los catálogos."
        );

        setError(mensaje);

        return false;
      } finally {
        setLoadingCatalogos(false);
      }
    },
    [esAdminSucursal, esSuperAdmin]
  );

  /*
   * IMPORTANTE:
   * useCallback evita el ciclo infinito de
   * peticiones dentro de UsuarioForm.
   */
  const cargarConductoresDisponibles =
    useCallback(
      async ({
        sucursalId = "",
        searchText = "",
      } = {}) => {
        try {
          const data =
            await getConductoresDisponibles({
              sucursal: sucursalId || "",
              search: searchText || "",
            });

          const lista =
            normalizarLista(data);

          setConductoresDisponibles(lista);

          return lista;
        } catch (requestError) {
          setConductoresDisponibles([]);

          const mensaje =
            obtenerMensajeError(
              requestError,
              "No se pudieron cargar los conductores disponibles."
            );

          console.error(
            "Error al cargar conductores:",
            requestError
          );

          setError(mensaje);

          return [];
        }
      },
      []
    );

  const abrirModalCrear = useCallback(
    () => {
      setUsuarioEditando(null);
      setConductoresDisponibles([]);
      setError("");
      setModalOpen(true);
    },
    []
  );

  const abrirModalEditar = useCallback(
    (usuario) => {
      if (!usuario) {
        return;
      }

      setUsuarioEditando(usuario);
      setConductoresDisponibles([]);
      setError("");
      setModalOpen(true);
    },
    []
  );

  const cerrarModal = useCallback(() => {
    setModalOpen(false);
    setUsuarioEditando(null);
    setConductoresDisponibles([]);
  }, []);

  const guardarUsuario = useCallback(
    async (form) => {
      try {
        setSaving(true);
        setError("");

        const payload = {
          username:
            form.username?.trim() || "",

          first_name:
            form.first_name?.trim() || "",

          last_name:
            form.last_name?.trim() || "",

          email:
            form.email?.trim() || "",

          telefono:
            form.telefono?.trim() || "",

          rol: form.rol
            ? Number(form.rol)
            : null,

          is_active:
            form.is_active !== false,
        };

        /*
         * Solo se envía sucursal cuando
         * corresponde al superadministrador.
         */
        if (
          Object.prototype.hasOwnProperty.call(
            form,
            "sucursal"
          ) &&
          esSuperAdmin
        ) {
          payload.sucursal = form.sucursal
            ? Number(form.sucursal)
            : null;
        }

        /*
         * Evita eliminar accidentalmente la
         * relación del taxista al editar.
         */
        if (
          Object.prototype.hasOwnProperty.call(
            form,
            "conductor_id"
          )
        ) {
          payload.conductor_id =
            form.conductor_id
              ? Number(form.conductor_id)
              : null;
        }

        if (form.password?.trim()) {
          payload.password =
            form.password.trim();
        }

        if (usuarioEditando?.id) {
          await updateUsuario(
            usuarioEditando.id,
            payload
          );
        } else {
          await createUsuario(payload);
        }

        /*
         * Actualiza la lista sin mostrar el
         * cargador general de la tabla.
         */
        await cargarUsuarios({
          mostrarCarga: false,
        });

        cerrarModal();

        return true;
      } catch (requestError) {
        const mensaje =
          obtenerMensajeError(
            requestError,
            "No se pudo guardar el usuario."
          );

        setError(mensaje);

        /*
         * Se lanza el error para que
         * UsuarioForm muestre el Swal.
         */
        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [
      usuarioEditando,
      esSuperAdmin,
      cargarUsuarios,
      cerrarModal,
    ]
  );

  const cambiarEstadoUsuario =
    useCallback(
      async (usuario) => {
        if (!usuario?.id) {
          return false;
        }

        const activar =
          !usuario.is_active;

        const confirmacion =
          await Swal.fire({
            title: activar
              ? "¿Activar usuario?"
              : "¿Desactivar usuario?",

            text: activar
              ? `${usuario.username} podrá iniciar sesión.`
              : `${usuario.username} dejará de tener acceso.`,

            icon: "question",
            showCancelButton: true,

            confirmButtonText: activar
              ? "Activar"
              : "Desactivar",

            cancelButtonText: "Cancelar",

            confirmButtonColor: activar
              ? "#16a34a"
              : "#ea580c",

            cancelButtonColor: "#64748b",
            reverseButtons: true,
          });

        if (!confirmacion.isConfirmed) {
          return false;
        }

        try {
          setSaving(true);
          setError("");

          await updateUsuario(usuario.id, {
            is_active: activar,
          });

          await cargarUsuarios({
            mostrarCarga: false,
          });

          mostrarExito(
            activar
              ? "Usuario activado"
              : "Usuario desactivado"
          );

          return true;
        } catch (requestError) {
          const mensaje =
            obtenerMensajeError(
              requestError,
              "No se pudo cambiar el estado del usuario."
            );

          setError(mensaje);

          void Swal.fire({
            title: "No se pudo actualizar",
            text: mensaje,
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#dc2626",
          });

          return false;
        } finally {
          setSaving(false);
        }
      },
      [cargarUsuarios]
    );

  const darBaja = useCallback(
    async (usuario) => {
      if (!usuario?.id) {
        return false;
      }

      const result = await Swal.fire({
        title: "¿Dar de baja?",
        text: `${usuario.username} no podrá iniciar sesión.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Dar de baja",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        return false;
      }

      try {
        setSaving(true);
        setError("");

        await darBajaUsuario(usuario.id);

        await cargarUsuarios({
          mostrarCarga: false,
        });

        mostrarExito(
          "Usuario dado de baja"
        );

        return true;
      } catch (requestError) {
        const mensaje =
          obtenerMensajeError(
            requestError,
            "No se pudo dar de baja al usuario."
          );

        setError(mensaje);

        void Swal.fire({
          title: "No se pudo completar",
          text: mensaje,
          icon: "error",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#dc2626",
        });

        return false;
      } finally {
        setSaving(false);
      }
    },
    [cargarUsuarios]
  );

  const reactivar = useCallback(
    async (usuario) => {
      if (!usuario?.id) {
        return false;
      }

      const result = await Swal.fire({
        title: "¿Reactivar usuario?",
        text: `${usuario.username} podrá iniciar sesión nuevamente.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#16a34a",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Reactivar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        return false;
      }

      try {
        setSaving(true);
        setError("");

        await reactivarUsuario(usuario.id);

        await cargarUsuarios({
          mostrarCarga: false,
        });

        mostrarExito(
          "Usuario reactivado"
        );

        return true;
      } catch (requestError) {
        const mensaje =
          obtenerMensajeError(
            requestError,
            "No se pudo reactivar al usuario."
          );

        setError(mensaje);

        void Swal.fire({
          title: "No se pudo completar",
          text: mensaje,
          icon: "error",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#dc2626",
        });

        return false;
      } finally {
        setSaving(false);
      }
    },
    [cargarUsuarios]
  );

  const eliminarUsuario = useCallback(
    async (usuario) => {
      if (!usuario?.id) {
        return false;
      }

      const confirmacion =
        await Swal.fire({
          title: "¿Eliminar usuario?",
          text: `${usuario.username} será eliminado del sistema.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Eliminar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#dc2626",
          cancelButtonColor: "#64748b",
          reverseButtons: true,
        });

      if (!confirmacion.isConfirmed) {
        return false;
      }

      try {
        setSaving(true);
        setError("");

        await deleteUsuario(usuario.id);

        await cargarUsuarios({
          mostrarCarga: false,
        });

        mostrarExito(
          "Usuario eliminado"
        );

        return true;
      } catch (requestError) {
        const mensaje =
          obtenerMensajeError(
            requestError,
            "No se pudo eliminar el usuario. Puede tener registros asociados."
          );

        setError(mensaje);

        void Swal.fire({
          title: "No se pudo eliminar",
          text: mensaje,
          icon: "error",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#dc2626",
        });

        return false;
      } finally {
        setSaving(false);
      }
    },
    [cargarUsuarios]
  );

  const usuariosFiltrados = useMemo(() => {
    const lista = Array.isArray(usuarios)
      ? usuarios.filter(Boolean)
      : [];

    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return lista;
    }

    return lista.filter((usuario) => {
      const texto = [
        usuario?.username,
        usuario?.first_name,
        usuario?.last_name,
        usuario?.email,
        usuario?.telefono,
        usuario?.rol_nombre,
        usuario?.sucursal_nombre,
        usuario?.conductor_nombre,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(value);
    });
  }, [usuarios, search]);

  const totalUsuarios =
    Array.isArray(usuarios)
      ? usuarios.length
      : 0;

  const usuariosActivos =
    usuarios.filter(
      (item) =>
        item?.is_active === true ||
        item?.is_active === 1 ||
        item?.is_active === "1"
    ).length;

  const administradores =
    usuarios.filter((item) =>
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

  const taxistas = usuarios.filter(
    (item) =>
      normalizarCodigo(
        item?.rol_codigo
      ) === "taxista"
  ).length;

  useEffect(() => {
    void Promise.all([
      cargarUsuarios(),
      cargarCatalogos(),
    ]);
  }, [
    cargarUsuarios,
    cargarCatalogos,
  ]);

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