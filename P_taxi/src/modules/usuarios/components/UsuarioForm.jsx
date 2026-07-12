// src/modules/usuarios/components/UsuarioForm.jsx

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const initialForm = {
  username: "",
  password: "",
  first_name: "",
  last_name: "",
  email: "",
  telefono: "",
  rol: "",
  sucursal: "",
  conductor_id: "",
  is_active: true,
};

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

const obtenerId = (valor) => {
  if (!valor) {
    return "";
  }

  if (typeof valor === "object") {
    return valor.id
      ? String(valor.id)
      : "";
  }

  return String(valor);
};

const obtenerNombreConductor = (
  conductor
) => {
  if (!conductor) {
    return "Conductor";
  }

  return (
    conductor.nombre_completo ||
    conductor.conductor_nombre ||
    `${conductor.nombre || ""} ${
      conductor.apellido || ""
    }`.trim() ||
    "Conductor"
  );
};

const obtenerConductorInicial = (
  usuario
) => {
  if (!usuario) {
    return null;
  }

  const conductorId = obtenerId(
    usuario.conductor_id ||
      usuario.conductor
  );

  if (!conductorId) {
    return null;
  }

  return {
    id: conductorId,

    nombre_completo:
      usuario.conductor_nombre ||
      usuario.nombre_conductor ||
      usuario.conductor?.nombre_completo ||
      "",

    cedula:
      usuario.conductor_cedula ||
      usuario.conductor?.cedula ||
      "",

    sucursal_nombre:
      usuario.conductor_sucursal_nombre ||
      usuario.sucursal_nombre ||
      usuario.conductor?.sucursal_nombre ||
      "",
  };
};

const obtenerMensajeError = (error) => {
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

  return (
    error?.message ||
    "No se pudo guardar el usuario."
  );
};

const UsuarioForm = ({
  usuarioEditando = null,
  roles = [],
  sucursales = [],
  conductoresDisponibles = [],
  cargarConductoresDisponibles = () => [],
  onSave,
  onCancel,
  saving = false,
  loadingCatalogos = false,
  esSuperAdmin = false,
  esAdminSucursal = false,
}) => {
  const [form, setForm] =
    useState(initialForm);

  const [formError, setFormError] =
    useState("");

  const [
    searchConductor,
    setSearchConductor,
  ] = useState("");

  const [
    mostrarConductores,
    setMostrarConductores,
  ] = useState(false);

  const [
    conductorSeleccionado,
    setConductorSeleccionado,
  ] = useState(null);

  const [
    buscandoConductores,
    setBuscandoConductores,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const esEdicion =
    Boolean(usuarioEditando);

  const codigoRolOriginal =
    normalizarCodigo(
      usuarioEditando?.rol_codigo ||
        usuarioEditando?.rol?.codigo
    );

  const usuarioEraTaxista =
    codigoRolOriginal === "taxista";

  useEffect(() => {
    if (usuarioEditando) {
      const conductorInicial =
        obtenerConductorInicial(
          usuarioEditando
        );

      setForm({
        username:
          usuarioEditando.username || "",

        password: "",

        first_name:
          usuarioEditando.first_name || "",

        last_name:
          usuarioEditando.last_name || "",

        email:
          usuarioEditando.email || "",

        telefono:
          usuarioEditando.telefono || "",

        rol: obtenerId(
          usuarioEditando.rol
        ),

        sucursal: obtenerId(
          usuarioEditando.sucursal
        ),

        conductor_id:
          conductorInicial?.id || "",

        is_active:
          usuarioEditando.is_active !==
          false,
      });

      setConductorSeleccionado(
        conductorInicial
      );
    } else {
      setForm(initialForm);
      setConductorSeleccionado(null);
    }

    setSearchConductor("");
    setMostrarConductores(false);
    setBuscandoConductores(false);
    setFormError("");
    setShowPassword(false);
  }, [usuarioEditando]);

  const listaRoles = useMemo(
    () => normalizarLista(roles),
    [roles]
  );

  const listaSucursales = useMemo(
    () => normalizarLista(sucursales),
    [sucursales]
  );

  const listaConductores = useMemo(
    () =>
      normalizarLista(
        conductoresDisponibles
      ),
    [conductoresDisponibles]
  );

  const rolSeleccionado = useMemo(() => {
    return (
      listaRoles.find(
        (item) =>
          String(item.id) ===
          String(form.rol)
      ) || null
    );
  }, [listaRoles, form.rol]);

  const codigoRol = normalizarCodigo(
    rolSeleccionado?.codigo
  );

  const necesitaSucursal =
    codigoRol === "admin_sucursal";

  const esRolTaxista =
    codigoRol === "taxista";

  const esUsuarioSinSucursal = [
    "superadmin",
    "super_admin",
    "usuario_sistema",
  ].includes(codigoRol);

  const conductoresFiltrados =
    useMemo(() => {
      const busqueda = searchConductor
        .trim()
        .toLowerCase();

      if (!busqueda) {
        return listaConductores.slice(
          0,
          10
        );
      }

      return listaConductores
        .filter((conductor) => {
          const texto = [
            conductor.nombre_completo,
            conductor.nombre,
            conductor.apellido,
            conductor.cedula,
            conductor.sucursal_nombre,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return texto.includes(
            busqueda
          );
        })
        .slice(0, 10);
    }, [
      listaConductores,
      searchConductor,
    ]);

  /*
   * Este efecto ya no genera un ciclo porque
   * la función del hook usa useCallback.
   */
  useEffect(() => {
    if (
      !esRolTaxista ||
      conductorSeleccionado
    ) {
      setBuscandoConductores(false);
      return undefined;
    }

    let componenteActivo = true;

    const timer = window.setTimeout(
      async () => {
        try {
          setBuscandoConductores(true);

          await cargarConductoresDisponibles(
            {
              sucursalId: "",
              searchText:
                searchConductor.trim(),
            }
          );
        } catch (error) {
          console.error(
            "Error al buscar conductores:",
            error
          );
        } finally {
          if (componenteActivo) {
            setBuscandoConductores(
              false
            );
          }
        }
      },
      searchConductor.trim() ? 350 : 0
    );

    return () => {
      componenteActivo = false;
      window.clearTimeout(timer);
    };
  }, [
    esRolTaxista,
    conductorSeleccionado,
    searchConductor,
    cargarConductoresDisponibles,
  ]);

  const limpiarError = () => {
    if (formError) {
      setFormError("");
    }
  };

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    if (name === "rol") {
      setForm((anterior) => ({
        ...anterior,
        rol: value,
        sucursal: "",
        conductor_id: "",
      }));

      setConductorSeleccionado(null);
      setSearchConductor("");
      setMostrarConductores(false);
      limpiarError();

      return;
    }

    setForm((anterior) => ({
      ...anterior,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    limpiarError();
  };

  const handleBusquedaConductor = (
    event
  ) => {
    setSearchConductor(
      event.target.value
    );

    setMostrarConductores(true);
    limpiarError();
  };

  const seleccionarConductor = (
    conductor
  ) => {
    if (!conductor?.id) {
      return;
    }

    setConductorSeleccionado(
      conductor
    );

    setForm((anterior) => ({
      ...anterior,
      conductor_id: String(
        conductor.id
      ),
    }));

    setSearchConductor("");
    setMostrarConductores(false);
    limpiarError();
  };

  const quitarConductor = () => {
    setConductorSeleccionado(null);

    setForm((anterior) => ({
      ...anterior,
      conductor_id: "",
    }));

    setSearchConductor("");
    setMostrarConductores(true);
  };

  const validarFormulario = () => {
    if (!form.username.trim()) {
      return "El nombre de usuario es obligatorio.";
    }

    if (
      !esEdicion &&
      !form.password.trim()
    ) {
      return "La contraseña es obligatoria.";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      return "El correo electrónico no es válido.";
    }

    if (!form.rol) {
      return "Debes seleccionar un rol.";
    }

    if (
      esSuperAdmin &&
      necesitaSucursal &&
      !form.sucursal
    ) {
      return "Debes seleccionar una sucursal.";
    }

    /*
     * Se exige conductor al crear un taxista
     * o al cambiar un usuario a taxista.
     */
    if (
      esRolTaxista &&
      !form.conductor_id &&
      !usuarioEraTaxista
    ) {
      return "Debes seleccionar un conductor.";
    }

    return "";
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const errorValidacion =
      validarFormulario();

    if (errorValidacion) {
      setFormError(errorValidacion);

      void Swal.fire({
        title: "Revisa los datos",
        text: errorValidacion,
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#eab308",
      });

      return;
    }

    const confirmacion =
      await Swal.fire({
        title: esEdicion
          ? "¿Actualizar usuario?"
          : "¿Crear usuario?",

        text: esEdicion
          ? "Se guardarán los cambios."
          : "Se creará la cuenta de acceso.",

        icon: "question",
        showCancelButton: true,

        confirmButtonText: esEdicion
          ? "Actualizar"
          : "Crear usuario",

        cancelButtonText: "Cancelar",

        confirmButtonColor: "#eab308",
        cancelButtonColor: "#64748b",
        reverseButtons: true,
      });

    if (!confirmacion.isConfirmed) {
      return;
    }

    const payload = {
      username:
        form.username.trim(),

      first_name:
        form.first_name.trim(),

      last_name:
        form.last_name.trim(),

      email: form.email.trim(),

      telefono:
        form.telefono.trim(),

      rol: Number(form.rol),

      is_active:
        Boolean(form.is_active),
    };

    if (esSuperAdmin) {
      payload.sucursal =
        necesitaSucursal &&
        form.sucursal
          ? Number(form.sucursal)
          : null;
    }

    if (esRolTaxista) {
      if (form.conductor_id) {
        payload.conductor_id =
          Number(form.conductor_id);
      } else if (!usuarioEraTaxista) {
        payload.conductor_id = null;
      }
    } else {
      /*
       * Si cambia de taxista a otro rol,
       * se elimina la relación anterior.
       */
      payload.conductor_id = null;
    }

    if (
      !esEdicion ||
      form.password.trim()
    ) {
      payload.password =
        form.password.trim();
    }

    try {
      setFormError("");

      const resultado =
        await onSave(payload);

      if (resultado === false) {
        return;
      }

      void Swal.fire({
        title: esEdicion
          ? "Usuario actualizado"
          : "Usuario registrado",

        text: esEdicion
          ? "Los cambios se guardaron correctamente."
          : "La cuenta fue creada correctamente.",

        icon: "success",
         confirmButtonColor: "#F5B800",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      const mensaje =
        obtenerMensajeError(error);

      setFormError(mensaje);

      void Swal.fire({
        title: "No se pudo guardar",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const disabled =
    saving || loadingCatalogos;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 p-5 sm:p-6"
      noValidate
    >
      {formError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-black text-red-700">
            Revisa la información
          </p>

          <p className="mt-1 text-sm font-medium text-red-600">
            {formError}
          </p>
        </div>
      )}

      {loadingCatalogos && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Loader2
            size={18}
            className="animate-spin text-yellow-600"
          />

          <p className="text-sm font-bold text-slate-600">
            Cargando catálogos...
          </p>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <UserRound size={20} />
          </div>

          <h3 className="font-black text-slate-900">
            Datos del usuario
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Usuario
            </label>

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={disabled}
              autoComplete="username"
              placeholder="taxista_juan"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Contraseña
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={form.password}
                onChange={handleChange}
                disabled={disabled}
                autoComplete="new-password"
                placeholder={
                  esEdicion
                    ? "Vacío para conservarla"
                    : "Contraseña"
                }
                className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-12 text-sm font-semibold text-slate-800 outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (valor) => !valor
                  )
                }
                disabled={disabled}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Nombre
            </label>

            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              disabled={disabled}
              placeholder="Nombre"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Apellido
            </label>

            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              disabled={disabled}
              placeholder="Apellido"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Correo
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={disabled}
                placeholder="correo@ejemplo.com"
                className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Teléfono
            </label>

            <div className="relative">
              <Phone
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                disabled={disabled}
                placeholder="8888 8888"
                className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <KeyRound size={20} />
          </div>

          <h3 className="font-black text-slate-900">
            Acceso y rol
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Rol
            </label>

            <div className="relative">
              <ShieldCheck
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                disabled={disabled}
                className="w-full appearance-none rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-10 text-sm font-semibold text-slate-800 outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
              >
                <option value="">
                  Selecciona un rol
                </option>

                {listaRoles.map((rolItem) => (
                  <option
                    key={rolItem.id}
                    value={rolItem.id}
                  >
                    {rolItem.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {esSuperAdmin &&
            necesitaSucursal && (
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Sucursal
                </label>

                <div className="relative">
                  <Building2
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    name="sucursal"
                    value={form.sucursal}
                    onChange={handleChange}
                    disabled={disabled}
                    className="w-full appearance-none rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-10 text-sm font-semibold text-slate-800 outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
                  >
                    <option value="">
                      Selecciona una sucursal
                    </option>

                    {listaSucursales.map(
                      (sucursal) => (
                        <option
                          key={sucursal.id}
                          value={sucursal.id}
                        >
                          {sucursal.nombre}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            )}

          {esSuperAdmin &&
            esUsuarioSinSucursal && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 md:col-span-2">
                <p className="text-sm font-bold text-blue-700">
                  Usuario general sin sucursal.
                </p>
              </div>
            )}

          {esAdminSucursal &&
            esRolTaxista && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 md:col-span-2">
                <p className="text-sm font-bold text-emerald-700">
                  Se asociará a tu sucursal.
                </p>
              </div>
            )}

          {esRolTaxista && (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Conductor asociado
              </label>

              {conductorSeleccionado ? (
                <div className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
                      <CheckCircle2
                        size={22}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-emerald-900">
                        {obtenerNombreConductor(
                          conductorSeleccionado
                        )}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-emerald-700">
                        {conductorSeleccionado.cedula ||
                          "Sin cédula"}
                      </p>

                      {conductorSeleccionado.sucursal_nombre && (
                        <p className="mt-1 text-xs font-semibold text-emerald-700">
                          {
                            conductorSeleccionado.sucursal_nombre
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={quitarConductor}
                    disabled={saving}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 hover:bg-emerald-100"
                    aria-label="Cambiar conductor"
                  >
                    <X size={17} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={searchConductor}
                      onChange={
                        handleBusquedaConductor
                      }
                      onFocus={() =>
                        setMostrarConductores(
                          true
                        )
                      }
                      disabled={saving}
                      autoComplete="off"
                      placeholder="Nombre, apellido o cédula..."
                      className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-11 text-sm font-semibold text-slate-800 outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
                    />

                    {buscandoConductores && (
                      <Loader2
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-yellow-600"
                      />
                    )}
                  </div>

                  {mostrarConductores && (
                    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
                      {conductoresFiltrados.length >
                      0 ? (
                        conductoresFiltrados.map(
                          (conductor) => (
                            <button
                              key={
                                conductor.id
                              }
                              type="button"
                              onClick={() =>
                                seleccionarConductor(
                                  conductor
                                )
                              }
                              className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-white p-3 text-left shadow-sm transition hover:border-yellow-300 hover:bg-yellow-50"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                <UserRound
                                  size={20}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-black text-slate-900">
                                  {obtenerNombreConductor(
                                    conductor
                                  )}
                                </p>

                                <p className="mt-1 truncate text-xs font-medium text-slate-500">
                                  {conductor.cedula ||
                                    "Sin cédula"}

                                  {conductor.sucursal_nombre
                                    ? ` · ${conductor.sucursal_nombre}`
                                    : ""}
                                </p>
                              </div>

                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                                Elegir
                              </span>
                            </button>
                          )
                        )
                      ) : (
                        <div className="px-4 py-7 text-center">
                          {buscandoConductores ? (
                            <Loader2
                              size={25}
                              className="mx-auto animate-spin text-yellow-500"
                            />
                          ) : (
                            <UserRound
                              size={28}
                              className="mx-auto text-slate-300"
                            />
                          )}

                          <p className="mt-2 text-sm font-bold text-slate-500">
                            {buscandoConductores
                              ? "Buscando..."
                              : "No hay conductores disponibles"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="md:col-span-2">
            <label
              className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${
                form.is_active
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div>
                <p className="text-sm font-black text-slate-900">
                  Usuario activo
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  Permitir acceso al sistema.
                </p>
              </div>

              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                disabled={disabled}
                className="h-5 w-5 rounded border-slate-300 text-yellow-500 focus:ring-yellow-400"
              />
            </label>
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-100 disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={disabled}
          className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 shadow-md shadow-yellow-100 hover:bg-yellow-500 disabled:opacity-60"
        >
          {saving && (
            <Loader2
              size={18}
              className="animate-spin"
            />
          )}

          {saving
            ? "Guardando..."
            : esEdicion
              ? "Guardar cambios"
              : "Crear usuario"}
        </button>
      </div>
    </form>
  );
};

export default UsuarioForm;