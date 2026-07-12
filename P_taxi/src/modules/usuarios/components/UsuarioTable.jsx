// src/modules/usuarios/components/UsuarioTable.jsx

import {
  Building2,
  Edit3,
  Loader2,
  Mail,
  Phone,
  Power,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
} from "lucide-react";

const normalizarUsuarios = (data) => {
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

const obtenerTextoSeguro = (
  valor,
  valorDefault = ""
) => {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return valorDefault;
  }

  if (typeof valor === "object") {
    return String(
      valor.nombre ||
        valor.nombre_completo ||
        valor.codigo ||
        valor.id ||
        valorDefault
    );
  }

  return String(valor);
};

const obtenerActivo = (usuario) => {
  const valor = usuario?.is_active;

  return (
    valor === true ||
    valor === 1 ||
    valor === "1" ||
    String(valor).toLowerCase() === "true"
  );
};

const obtenerNombreCompleto = (usuario) => {
  if (!usuario) {
    return "Sin nombre";
  }

  const nombre = [
    usuario.first_name,
    usuario.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    nombre ||
    usuario.nombre_completo ||
    "Sin nombre"
  );
};

const obtenerIniciales = (usuario) => {
  const nombre =
    obtenerNombreCompleto(usuario);

  if (nombre !== "Sin nombre") {
    return nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) =>
        parte.charAt(0).toUpperCase()
      )
      .join("");
  }

  return String(
    usuario?.username || "U"
  )
    .charAt(0)
    .toUpperCase();
};

const obtenerRol = (usuario) => {
  return obtenerTextoSeguro(
    usuario?.rol_nombre ||
      usuario?.rol?.nombre ||
      usuario?.rol_display,
    "Sin rol"
  );
};

const obtenerSucursal = (usuario) => {
  return obtenerTextoSeguro(
    usuario?.sucursal_nombre ||
      usuario?.sucursal?.nombre,
    "Sin sucursal"
  );
};
const EstadoBadge = ({ activo }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-black ${
        activo
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          activo
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {activo ? "Activo" : "Inactivo"}
    </span>
  );
};

const UsuarioTable = ({
  usuarios = [],
  loading = false,
  esSuperAdmin = false,
  onEdit,
  onToggleStatus,
  onDarBaja,
  onReactivar,
  onDelete,
}) => {
  const listaUsuarios =
    normalizarUsuarios(usuarios);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2
          size={30}
          className="mx-auto animate-spin text-yellow-500"
        />

        <p className="mt-3 text-sm font-bold text-slate-500">
          Cargando usuarios...
        </p>
      </div>
    );
  }

  if (!listaUsuarios.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
          <UserRound size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay usuarios
        </h3>

        <p className="mt-2 text-sm font-medium text-slate-500">
          No se encontraron registros.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="w-full overflow-x-auto overscroll-x-contain">
        <table className="min-w-[1050px] w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Usuario
              </th>

              <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Contacto
              </th>

              <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Rol
              </th>

              <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Sucursal
              </th>

              <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Estado
              </th>

              <th className="whitespace-nowrap px-4 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {listaUsuarios.map(
              (usuario, index) => {
                const activo =
                  obtenerActivo(usuario);

                const username =
                  usuario?.username ||
                  "Sin usuario";

                return (
                  <tr
                    key={
                      usuario?.id ??
                      `${username}-${index}`
                    }
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex min-w-[190px] items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-sm font-black text-yellow-800">
                          {obtenerIniciales(
                            usuario
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[170px] truncate text-sm font-black text-slate-900">
                            {username}
                          </p>

                          <p className="mt-1 max-w-[170px] truncate text-xs font-medium text-slate-500">
                            {obtenerNombreCompleto(
                              usuario
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="min-w-[210px] space-y-1.5">
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Mail
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="max-w-[180px] truncate">
                            {usuario?.email ||
                              "Sin correo"}
                          </span>
                        </p>

                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Phone
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="whitespace-nowrap">
                            {usuario?.telefono ||
                              "Sin teléfono"}
                          </span>
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                        <ShieldCheck size={14} />

                        {obtenerRol(usuario)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <p className="flex min-w-[150px] items-center gap-2 whitespace-nowrap text-sm font-bold text-slate-700">
                        <Building2
                          size={16}
                          className="shrink-0 text-slate-400"
                        />

                        {obtenerSucursal(usuario)}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <EstadoBadge
                        activo={activo}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex min-w-[160px] justify-end gap-2">
                        {typeof onEdit ===
                          "function" && (
                          <button
                            type="button"
                            onClick={() =>
                              onEdit(usuario)
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                            title="Editar"
                            aria-label="Editar usuario"
                          >
                            <Edit3 size={17} />
                          </button>
                        )}

                        {esSuperAdmin ? (
                          activo ? (
                            typeof onDarBaja ===
                              "function" && (
                              <button
                                type="button"
                                onClick={() =>
                                  onDarBaja(
                                    usuario
                                  )
                                }
                                className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-orange-50 px-3 text-xs font-black text-orange-600 transition hover:bg-orange-100"
                                title="Dar de baja"
                              >
                                <UserX
                                  size={16}
                                />

                                Baja
                              </button>
                            )
                          ) : (
                            typeof onReactivar ===
                              "function" && (
                              <button
                                type="button"
                                onClick={() =>
                                  onReactivar(
                                    usuario
                                  )
                                }
                                className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-xs font-black text-emerald-600 transition hover:bg-emerald-100"
                                title="Reactivar"
                              >
                                <UserCheck
                                  size={16}
                                />

                                Reactivar
                              </button>
                            )
                          )
                        ) : (
                          typeof onToggleStatus ===
                            "function" && (
                            <button
                              type="button"
                              onClick={() =>
                                onToggleStatus(
                                  usuario
                                )
                              }
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                                activo
                                  ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              }`}
                              title={
                                activo
                                  ? "Desactivar"
                                  : "Activar"
                              }
                            >
                              <Power
                                size={18}
                              />
                            </button>
                          )
                        )}

                        {typeof onDelete ===
                          "function" && (
                          <button
                            type="button"
                            onClick={() =>
                              onDelete(
                                usuario
                              )
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                            title="Eliminar"
                            aria-label="Eliminar usuario"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 sm:hidden">
        <p className="text-center text-xs font-semibold text-slate-500">
          Desliza horizontalmente para ver
          más información.
        </p>
      </div>
    </div>
  );
};

export default UsuarioTable;