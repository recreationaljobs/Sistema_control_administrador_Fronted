import {
  Building2,
  Edit3,
  MapPin,
  Phone,
  Power,
  Trash2,
  UserRound,
} from "lucide-react";

const SucursalTable = ({
  sucursales,
  loading,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-500">
          Cargando sucursales...
        </p>
      </div>
    );
  }

  if (!sucursales.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
          <Building2 size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay sucursales registradas
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Crea la primera sucursal para empezar a administrar clientes,
          conductores y vehículos.
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
                Sucursal
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Propietario
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Contacto
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
            {sucursales.map((sucursal) => (
              <tr key={sucursal.id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
                      <Building2 size={23} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">
                        {sucursal.nombre}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                        <MapPin size={13} />
                        {sucursal.direccion || "Sin dirección"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <UserRound size={17} className="text-slate-400" />
                    {sucursal.propietario || "No registrado"}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Phone size={17} className="text-slate-400" />
                    {sucursal.telefono || "No registrado"}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                      sucursal.activa
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {sucursal.activa ? "Activa" : "Inactiva"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(sucursal)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                      title="Editar"
                    >
                      <Edit3 size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleStatus(sucursal)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                        sucursal.activa
                          ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                      title={sucursal.activa ? "Desactivar" : "Activar"}
                    >
                      <Power size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(sucursal)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SucursalTable;