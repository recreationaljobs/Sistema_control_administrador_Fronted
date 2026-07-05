import {
  Edit3,
  Mail,
  Phone,
  Power,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
} from "lucide-react";

const UsuarioTable = ({
  usuarios,
  loading,
  esSuperAdmin = false,
  onEdit,
  onToggleStatus,
  onDarBaja,
  onReactivar,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-500">
          Cargando usuarios...
        </p>
      </div>
    );
  }

  if (!usuarios.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
          <UserRound size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay usuarios registrados
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Crea usuarios para administrar sucursales, conductores y operaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
              const nombreCompleto = `${usuario.first_name || ""} ${
                usuario.last_name || ""
              }`.trim();

              return (
                <tr key={usuario.id} className="transition hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFE7A3] text-sm font-black text-slate-900">
                        {usuario.username?.charAt(0)?.toUpperCase() || "U"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">
                          {usuario.username}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {nombreCompleto || "Sin nombre registrado"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Mail size={15} className="text-slate-400" />
                        {usuario.email || "Sin correo"}
                      </p>

                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Phone size={15} className="text-slate-400" />
                        {usuario.telefono || "Sin teléfono"}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                      <ShieldCheck size={14} />
                      {usuario.rol_nombre || "Sin rol"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-700">
                      {usuario.sucursal_nombre || "Sin sucursal"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                        usuario.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {usuario.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(usuario)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        title="Editar"
                      >
                        <Edit3 size={18} />
                      </button>

                      {esSuperAdmin ? (
                        usuario.is_active ? (
                          <button
                            type="button"
                            onClick={() => onDarBaja(usuario)}
                            className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-red-50 px-3 text-xs font-black text-red-600 transition hover:bg-red-100"
                            title="Dar de baja"
                          >
                            <UserX size={16} />
                            Dar de baja
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onReactivar(usuario)}
                            className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-green-50 px-3 text-xs font-black text-green-600 transition hover:bg-green-100"
                            title="Reactivar"
                          >
                            <UserCheck size={16} />
                            Reactivar
                          </button>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(usuario)}
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                            usuario.is_active
                              ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                          title={usuario.is_active ? "Desactivar" : "Activar"}
                        >
                          <Power size={18} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDelete(usuario)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuarioTable;