import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

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

const mostrarAlertaExito = async (usuarioEditando) => {
  await Swal.fire({
    title: usuarioEditando
      ? "Usuario actualizado"
      : "Usuario registrado",

    text: usuarioEditando
      ? "Los cambios del usuario se guardaron correctamente."
      : "El usuario se registró correctamente.",

    icon: "success",

    showConfirmButton: false,
    showCancelButton: false,

    timer: 2200,
    timerProgressBar: true,

    allowOutsideClick: false,
    allowEscapeKey: false,
  });
};

const UsuarioForm = ({
  usuarioEditando,
  roles = [],
  sucursales = [],
  conductoresDisponibles = [],
  cargarConductoresDisponibles = () => {},
  onSave,
  onCancel,
  saving,
  loadingCatalogos,
  esSuperAdmin = false,
  esAdminSucursal = false,
}) => {
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [searchConductor, setSearchConductor] = useState("");

  useEffect(() => {
    if (usuarioEditando) {
      setForm({
        username: usuarioEditando.username || "",
        password: "",
        first_name: usuarioEditando.first_name || "",
        last_name: usuarioEditando.last_name || "",
        email: usuarioEditando.email || "",
        telefono: usuarioEditando.telefono || "",
        rol: usuarioEditando.rol
          ? String(usuarioEditando.rol)
          : "",
        sucursal: usuarioEditando.sucursal
          ? String(usuarioEditando.sucursal)
          : "",
        conductor_id: "",
        is_active:
          typeof usuarioEditando.is_active === "boolean"
            ? usuarioEditando.is_active
            : true,
      });
    } else {
      setForm(initialForm);
    }

    setSearchConductor("");
    setFormError("");
  }, [usuarioEditando]);

  const rolSeleccionado = useMemo(() => {
    return roles.find(
      (item) => String(item.id) === String(form.rol)
    );
  }, [roles, form.rol]);

  const necesitaSucursal =
    rolSeleccionado?.codigo === "admin_sucursal";

  const esRolTaxista =
    rolSeleccionado?.codigo === "taxista";

  const esUsuarioSinSucursal = [
    "superadmin",
    "usuario_sistema",
  ].includes(rolSeleccionado?.codigo);

  const limpiarError = () => {
    if (formError) {
      setFormError("");
    }
  };

  const cargarTaxistasDisponibles = (searchText = "") => {
    cargarConductoresDisponibles({
      sucursalId: "",
      searchText,
    });
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "rol") {
      const nuevoRol = roles.find(
        (item) => String(item.id) === String(value)
      );

      setForm((prev) => ({
        ...prev,
        rol: value,
        sucursal: "",
        conductor_id: "",
      }));

      setSearchConductor("");

      if (nuevoRol?.codigo === "taxista") {
        cargarTaxistasDisponibles("");
      }

      limpiarError();
      return;
    }

    if (name === "sucursal") {
      setForm((prev) => ({
        ...prev,
        sucursal: value,
        conductor_id: "",
      }));

      setSearchConductor("");
      limpiarError();
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    limpiarError();
  };

  const buscarConductores = (value) => {
    setSearchConductor(value);
    cargarTaxistasDisponibles(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.username.trim()) {
      setFormError("El nombre de usuario es obligatorio.");
      return;
    }

    if (!usuarioEditando && !form.password.trim()) {
      setFormError(
        "La contraseña es obligatoria al crear un usuario."
      );
      return;
    }

    if (!form.rol) {
      setFormError("Debes seleccionar un rol.");
      return;
    }

    if (
      esSuperAdmin &&
      necesitaSucursal &&
      !form.sucursal
    ) {
      setFormError(
        "Debes seleccionar una sucursal para este administrador."
      );
      return;
    }

    if (
      !usuarioEditando &&
      esRolTaxista &&
      !form.conductor_id
    ) {
      setFormError(
        "Debes seleccionar el taxista/conductor al que se le creará el usuario."
      );
      return;
    }

    const payload = {
      ...form,
      username: form.username.trim(),
      password: form.password.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      rol: form.rol ? Number(form.rol) : null,
      sucursal: form.sucursal
        ? Number(form.sucursal)
        : null,
      conductor_id: form.conductor_id
        ? Number(form.conductor_id)
        : null,
    };

    try {
      setFormError("");

      await Promise.resolve(
        onSave(payload)
      );

      await mostrarAlertaExito(
        usuarioEditando
      );
    } catch (error) {
      const data = error?.response?.data;

      if (data?.detail) {
        setFormError(data.detail);
        return;
      }

      if (typeof data === "object" && data !== null) {
        const firstKey = Object.keys(data)[0];
        const firstValue = data[firstKey];

        if (Array.isArray(firstValue)) {
          setFormError(`${firstKey}: ${firstValue[0]}`);
          return;
        }

        if (typeof firstValue === "string") {
          setFormError(`${firstKey}: ${firstValue}`);
          return;
        }
      }

      setFormError(
        "No se pudo guardar el usuario."
      );
    }
  };

  useEffect(() => {
    if (esRolTaxista) {
      cargarTaxistasDisponibles("");
    }
  }, [esRolTaxista]);

  return (
    <form
      onSubmit={handleSubmit}
      className="px-6 py-6"
    >
      {formError && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError}
        </div>
      )}

      {loadingCatalogos && (
        <div className="mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-700">
          Cargando roles y sucursales...
        </div>
      )}

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
            placeholder="Ejemplo: taxista_juan"
            autoComplete="username"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Contraseña
          </label>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder={
              usuarioEditando
                ? "Dejar vacío para no cambiar"
                : "Contraseña del usuario"
            }
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
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
            placeholder="Nombre"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
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
            placeholder="Apellido"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Correo
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Teléfono
          </label>

          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Ejemplo: 8888 8888"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Rol
          </label>

          <select
            name="rol"
            value={form.rol}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          >
            <option value="">
              Selecciona un rol
            </option>

            {roles.map((rolItem) => (
              <option
                key={rolItem.id}
                value={rolItem.id}
              >
                {rolItem.nombre}
              </option>
            ))}
          </select>
        </div>

        {esSuperAdmin && necesitaSucursal && (
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Sucursal
            </label>

            <select
              name="sucursal"
              value={form.sucursal}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
            >
              <option value="">
                Selecciona una sucursal
              </option>

              {sucursales.map((sucursal) => (
                <option
                  key={sucursal.id}
                  value={sucursal.id}
                >
                  {sucursal.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {esSuperAdmin && esUsuarioSinSucursal && (
          <div className="md:col-span-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
            Este usuario pertenece al sistema general y no requiere sucursal.
            Solo será visible para el superadministrador.
          </div>
        )}

        {esRolTaxista && (
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Buscar taxista/conductor
            </label>

            <input
              type="text"
              value={searchConductor}
              onChange={(event) =>
                buscarConductores(event.target.value)
              }
              placeholder="Escribe el nombre, apellido o cédula del taxista"
              className="mb-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
            />

            <select
              name="conductor_id"
              value={form.conductor_id}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
            >
              <option value="">
                Selecciona el taxista
              </option>

              {(conductoresDisponibles || []).map(
                (conductor) => {
                  const nombreCompleto =
                    conductor.nombre_completo ||
                    `${conductor.nombre || ""} ${
                      conductor.apellido || ""
                    }`.trim();

                  return (
                    <option
                      key={conductor.id}
                      value={conductor.id}
                    >
                      {nombreCompleto} - {conductor.cedula}
                      {conductor.sucursal_nombre
                        ? ` - ${conductor.sucursal_nombre}`
                        : " - Panel superadmin"}
                    </option>
                  );
                }
              )}
            </select>

            <p className="mt-2 text-xs font-medium text-slate-500">
              Primero registra al taxista en el módulo Conductores.
              Aquí solo se crea su cuenta de acceso.
            </p>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div>
              <p className="text-sm font-black text-slate-900">
                Usuario activo
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Si está activo, podrá iniciar sesión en el sistema.
              </p>
            </div>

            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="h-5 w-5 rounded border-slate-300 text-[#F5B800] focus:ring-[#F5B800]"
            />
          </label>
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600] disabled:opacity-60"
        >
          {saving
            ? "Guardando..."
            : usuarioEditando
            ? "Guardar cambios"
            : "Crear usuario"}
        </button>
      </div>
    </form>
  );
};

export default UsuarioForm;