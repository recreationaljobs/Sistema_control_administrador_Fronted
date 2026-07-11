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

const obtenerNombreCompleto = (
  usuario
) => {
  return `${usuario.first_name || ""} ${
    usuario.last_name || ""
  }`.trim();
};

const obtenerIniciales = (usuario) => {
  const nombre =
    obtenerNombreCompleto(usuario);

  if (nombre) {
    return nombre
      .split(" ")
      .slice(0, 2)
      .map((parte) =>
        parte.charAt(0).toUpperCase()
      )
      .join("");
  }

  return (
    usuario.username
      ?.charAt(0)
      ?.toUpperCase() || "U"
  );
};

const EstadoBadge = ({ activo }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${
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

const AccionesUsuario = ({
  usuario,
  esSuperAdmin,
  onEdit,
  onToggleStatus,
  onDarBaja,
  onReactivar,
  onDelete,
}) => {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <button
        type="button"
        onClick={() =>
          onEdit?.(usuario)
        }
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
        title="Editar"
        aria-label="Editar usuario"
      >
        <Edit3 size={17} />
      </button>

      {esSuperAdmin ? (
        usuario.is_active ? (
          <button
            type="button"
            onClick={() =>
              onDarBaja?.(usuario)
            }
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-orange-50 px-3 text-xs font-black text-orange-600 transition hover:bg-orange-100"
            title="Dar de baja"
          >
            <UserX size={16} />
            <span className="hidden sm:inline">
              Baja
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              onReactivar?.(usuario)
            }
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-xs font-black text-emerald-600 transition hover:bg-emerald-100"
            title="Reactivar"
          >
            <UserCheck size={16} />
            <span className="hidden sm:inline">
              Reactivar
            </span>
          </button>
        )
      ) : (
        <button
          type="button"
          onClick={() =>
            onToggleStatus?.(usuario)
          }
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
            usuario.is_active
              ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
          }`}
          title={
            usuario.is_active
              ? "Desactivar"
              : "Activar"
          }
          aria-label={
            usuario.is_active
              ? "Desactivar usuario"
              : "Activar usuario"
          }
        >
          <Power size={18} />
        </button>
      )}

      <button
        type="button"
        onClick={() =>
          onDelete?.(usuario)
        }
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
        title="Eliminar"
        aria-label="Eliminar usuario"
      >
        <Trash2 size={17} />
      </button>
    </div>
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

  if (!usuarios.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
          <UserRound size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay usuarios
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          No se encontraron registros.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Vista móvil */}
      <div className="grid gap-4 lg:hidden">
        {usuarios.map((usuario) => {
          const nombreCompleto =
            obtenerNombreCompleto(usuario);

          return (
            <article
              key={usuario.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div
                className={`h-1 w-full ${
                  usuario.is_active
                    ? "bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-sm font-black text-yellow-800">
                      {obtenerIniciales(
                        usuario
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">
                        {usuario.username}
                      </p>

                      <p className="mt-1 truncate text-xs font-medium text-slate-500">
                        {nombreCompleto ||
                          "Sin nombre"}
                      </p>
                    </div>
                  </div>

                  <EstadoBadge
                    activo={
                      usuario.is_active
                    }
                  />
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                      <ShieldCheck
                        size={13}
                      />

                      {usuario.rol_nombre ||
                        "Sin rol"}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                      <Building2
                        size={13}
                      />

                      {usuario.sucursal_nombre ||
                        "Sin sucursal"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Mail
                        size={14}
                        className="text-slate-400"
                      />

                      <span className="truncate">
                        {usuario.email ||
                          "Sin correo"}
                      </span>
                    </p>

                    <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Phone
                        size={14}
                        className="text-slate-400"
                      />

                      {usuario.telefono ||
                        "Sin teléfono"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <AccionesUsuario
                    usuario={usuario}
                    esSuperAdmin={
                      esSuperAdmin
                    }
                    onEdit={onEdit}
                    onToggleStatus={
                      onToggleStatus
                    }
                    onDarBaja={onDarBaja}
                    onReactivar={
                      onReactivar
                    }
                    onDelete={onDelete}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Vista escritorio */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Usuario
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Contacto
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Rol
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Sucursal
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Estado
                </th>

                <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {usuarios.map((usuario) => {
                const nombreCompleto =
                  obtenerNombreCompleto(
                    usuario
                  );

                return (
                  <tr
                    key={usuario.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-sm font-black text-yellow-800">
                          {obtenerIniciales(
                            usuario
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-900">
                            {usuario.username}
                          </p>

                          <p className="mt-1 truncate text-xs font-medium text-slate-500">
                            {nombreCompleto ||
                              "Sin nombre"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="max-w-[240px] space-y-1.5">
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Mail
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="truncate">
                            {usuario.email ||
                              "Sin correo"}
                          </span>
                        </p>

                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Phone
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          {usuario.telefono ||
                            "Sin teléfono"}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                        <ShieldCheck
                          size={14}
                        />

                        {usuario.rol_nombre ||
                          "Sin rol"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 whitespace-nowrap text-sm font-bold text-slate-700">
                        <Building2
                          size={16}
                          className="text-slate-400"
                        />

                        {usuario.sucursal_nombre ||
                          "Sin sucursal"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <EstadoBadge
                        activo={
                          usuario.is_active
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <AccionesUsuario
                        usuario={usuario}
                        esSuperAdmin={
                          esSuperAdmin
                        }
                        onEdit={onEdit}
                        onToggleStatus={
                          onToggleStatus
                        }
                        onDarBaja={
                          onDarBaja
                        }
                        onReactivar={
                          onReactivar
                        }
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UsuarioTable;