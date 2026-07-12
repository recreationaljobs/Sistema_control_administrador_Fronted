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

const normalizarTelefonoWhatsApp = (
  telefono
) => {
  let numero = String(
    telefono || ""
  ).replace(/\D/g, "");

  if (numero.startsWith("00")) {
    numero = numero.slice(2);
  }

  if (numero.length === 8) {
    numero = `505${numero}`;
  }

  return numero;
};

const obtenerNombreUsuario = (
  usuario
) => {
  const nombreCompleto = [
    usuario?.first_name,
    usuario?.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    nombreCompleto ||
    usuario?.conductor_nombre ||
    usuario?.username ||
    "usuario"
  );
};

const obtenerLinkSistema = () => {
  const linkConfigurado =
    import.meta.env.VITE_APP_LOGIN_URL;

  if (linkConfigurado?.trim()) {
    return linkConfigurado.trim();
  }

  return `${window.location.origin}/login`;
};

const construirMensajeWhatsApp = (
  usuario,
  password
) => {
  const nombre =
    obtenerNombreUsuario(usuario);

  const rol =
    usuario?.rol_nombre ||
    usuario?.rol?.nombre ||
    "Sin rol";

  const sucursal =
    usuario?.sucursal_nombre ||
    usuario?.sucursal?.nombre ||
    "Sin sucursal";

  return [
    `Hola, ${nombre}.`,
    "",
    "Tu cuenta ha sido registrada exitosamente en el Sistema de Administración de Taxis.",
    "",
    "Puedes acceder mediante el siguiente enlace:",
    obtenerLinkSistema(),
    "",
    "Credenciales de acceso:",
    `Usuario: ${usuario?.username || ""}`,
    `Contraseña: ${password}`,
    `Rol: ${rol}`,
    `Sucursal: ${sucursal}`,
    "",
    "Por seguridad, no compartas tus credenciales con otras personas.",
  ].join("\n");
};

export const useUsuarios = () => {
  const { rol } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [conductoresDisponibles, setConductoresDisponibles] = useState([]);
  const [
    passwordsUsuariosCreados,
    setPasswordsUsuariosCreados,
  ] = useState({});

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
  


  const abrirWhatsApp = async (
  usuario,
  password
) => {
  const telefono =
    normalizarTelefonoWhatsApp(
      usuario?.telefono
    );

  if (!telefono) {
    await Swal.fire({
      title: "Número no registrado",
      text: "El usuario no tiene un número de teléfono registrado.",
      icon: "warning",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#16a34a",
    });

    return;
  }

  if (telefono.length < 10) {
    await Swal.fire({
      title: "Número no válido",
      text: "Revisa el teléfono del usuario. Debe incluir el código del país.",
      icon: "warning",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#16a34a",
    });

    return;
  }

  const mensaje =
    construirMensajeWhatsApp(
      usuario,
      password
    );

  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(
    mensaje
  )}`;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
};
  const guardarUsuario = async (form) => {
  try {
    setSaving(true);
    setError("");

    const payload = {
      username: form.username,
      first_name:
        form.first_name || "",
      last_name:
        form.last_name || "",
      email: form.email || "",
      telefono:
        form.telefono || "",
      rol: form.rol || null,
      is_active:
        form.is_active,
      conductor_id:
        form.conductor_id || null,
    };

    if (
      esSuperAdmin &&
      form.sucursal
    ) {
      payload.sucursal =
        form.sucursal;
    }

    if (form.password?.trim()) {
      payload.password =
        form.password.trim();
    }

    if (usuarioEditando) {
      await updateUsuario(
        usuarioEditando.id,
        payload
      );

      await cargarUsuarios();
      cerrarModal();

      return true;
    }

    const usuarioCreado =
      await createUsuario(payload);

    const passwordCreado =
      form.password.trim();

    const rolSeleccionado =
      roles.find(
        (item) =>
          String(item.id) ===
          String(form.rol)
      );

    const sucursalSeleccionada =
      sucursales.find(
        (item) =>
          String(item.id) ===
          String(form.sucursal)
      );

    const usuarioParaWhatsApp = {
      ...form,
      ...usuarioCreado,

      rol_nombre:
        usuarioCreado?.rol_nombre ||
        rolSeleccionado?.nombre ||
        "",

      sucursal_nombre:
        usuarioCreado
          ?.sucursal_nombre ||
        sucursalSeleccionada
          ?.nombre ||
        "",
    };

    if (usuarioCreado?.id) {
      setPasswordsUsuariosCreados(
        (anteriores) => ({
          ...anteriores,

          [usuarioCreado.id]:
            passwordCreado,
        })
      );
    }

    await cargarUsuarios();
    cerrarModal();

    const resultado =
      await Swal.fire({
        title: "Usuario registrado",
        text: "La cuenta fue creada correctamente. Puedes enviar los datos de acceso por WhatsApp.",
        icon: "success",
        showCancelButton: true,
        confirmButtonText:
          "Enviar por WhatsApp",
        cancelButtonText: "Cerrar",
        confirmButtonColor:
          "#16a34a",
        cancelButtonColor:
          "#64748b",
        reverseButtons: true,
      });

    if (resultado.isConfirmed) {
      await abrirWhatsApp(
        usuarioParaWhatsApp,
        passwordCreado
      );
    }

    /*
     * Evita que UsuarioForm muestre un segundo
     * mensaje de usuario registrado.
     */
    return false;
  } catch (err) {
    const mensaje =
      obtenerMensajeError(
        err,
        "No se pudo guardar el usuario."
      );

    setError(mensaje);

    return false;
  } finally {
    setSaving(false);
  }
};


const enviarDatosWhatsApp = async (usuario) => {
  if (!usuario?.id) {
    await Swal.fire({
      title: "Usuario no válido",
      text: "No se pudo identificar al usuario seleccionado.",
      icon: "error",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#dc2626",
    });

    return;
  }

  const telefono = normalizarTelefonoWhatsApp(
    usuario.telefono
  );

  if (!telefono) {
    await Swal.fire({
      title: "Número no registrado",
      text: "El usuario no tiene un número de teléfono registrado.",
      icon: "warning",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#16a34a",
    });

    return;
  }

  if (telefono.length < 10) {
    await Swal.fire({
      title: "Número no válido",
      text: "Revisa el número telefónico del usuario. Debe incluir el código del país.",
      icon: "warning",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#16a34a",
    });

    return;
  }

  let password =
    passwordsUsuariosCreados[usuario.id];

  /*
   * Si la contraseña todavía está disponible
   * en memoria, se envía sin modificarla.
   */
  if (password) {
    const mensaje = construirMensajeWhatsApp(
      usuario,
      password
    );

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    return;
  }

  /*
   * Django no puede recuperar la contraseña
   * actual. Se informa que se generará una nueva.
   */
  const confirmacion = await Swal.fire({
    title: "Enviar credenciales",
    html: `
      <p>
        La contraseña actual no puede recuperarse.
      </p>

      <p style="margin-top: 10px;">
        Se generará una nueva contraseña para
        <strong>${usuario.username}</strong>,
        se guardará en su cuenta y se enviará por WhatsApp.
      </p>

      <p style="margin-top: 10px;">
        La contraseña anterior dejará de funcionar.
      </p>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Generar y enviar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#64748b",
    reverseButtons: true,
  });

  if (!confirmacion.isConfirmed) {
    return;
  }

  /*
   * Se abre la pestaña inmediatamente para evitar
   * que el navegador bloquee WhatsApp después del await.
   */
  const ventanaWhatsApp = window.open(
    "about:blank",
    "_blank"
  );

  if (!ventanaWhatsApp) {
    await Swal.fire({
      title: "Ventana bloqueada",
      text: "El navegador bloqueó la apertura de WhatsApp. Permite las ventanas emergentes para este sitio e inténtalo nuevamente.",
      icon: "warning",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#16a34a",
    });

    return;
  }

  password = generarPassword();

  try {
    setSaving(true);
    setError("");

    const usuarioActualizado =
      await updateUsuario(usuario.id, {
        password,
      });

    /*
     * Conserva la contraseña para permitir
     * reenviarla mientras la página siga abierta.
     */
    setPasswordsUsuariosCreados(
      (anteriores) => ({
        ...anteriores,
        [usuario.id]: password,
      })
    );

    const usuarioCompleto = {
      ...usuario,
      ...usuarioActualizado,
    };

    const mensaje = construirMensajeWhatsApp(
      usuarioCompleto,
      password
    );

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(
      mensaje
    )}`;

    /*
     * Redirige la pestaña que se abrió antes
     * hacia WhatsApp.
     */
    ventanaWhatsApp.location.href = url;

    await cargarUsuarios();
  } catch (err) {
    ventanaWhatsApp.close();

    const mensajeError = obtenerMensajeError(
      err,
      "No se pudo generar y guardar la nueva contraseña."
    );

    setError(mensajeError);

    await Swal.fire({
      title: "No se pudo enviar",
      text: mensajeError,
      icon: "error",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#dc2626",
    });
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
    enviarDatosWhatsApp,
    cambiarEstadoUsuario,
    darBaja,
    reactivar,
    eliminarUsuario,
  };
};