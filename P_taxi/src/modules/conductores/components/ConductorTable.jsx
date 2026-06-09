import {
 
  CalendarDays,
  Edit3,
  IdCard,
  Phone,
  Power,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

const ConductorTable = ({
  conductores,
  loading,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-500">
          Cargando conductores...
        </p>
      </div>
    );
  }

  if (!conductores.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
          <UserRound size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay conductores registrados
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Registra conductores para poder asignarlos a vehículos y jornadas.
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
                Conductor
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Contacto
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Documentos
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
            {conductores.map((conductor) => {
              const nombreCompleto =
                conductor.nombre_completo ||
                `${conductor.nombre || ""} ${conductor.apellido || ""}`.trim();

              return (
                <tr key={conductor.id} className="transition hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFE7A3] text-sm font-black text-slate-900">
                        {conductor.nombre?.charAt(0)?.toUpperCase() || "C"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">
                          {nombreCompleto}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          Usuario: {conductor.usuario_username || "Sin usuario"}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {conductor.sucursal_nombre || "Sin sucursal"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Phone size={15} className="text-slate-400" />
                        {conductor.telefono || "Sin teléfono"}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <IdCard size={15} className="text-slate-400" />
                        {conductor.cedula || "Sin cédula"}
                      </p>

                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <ShieldCheck size={15} className="text-slate-400" />
                        {conductor.licencia || "Sin licencia"}
                      </p>

                      <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <CalendarDays size={14} className="text-slate-400" />
                        Vence: {conductor.vencimiento_licencia || "No registrado"}
                      </p>
                    </div>
                  </td>

                  

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                        conductor.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {conductor.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(conductor)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        title="Editar"
                      >
                        <Edit3 size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(conductor)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                          conductor.activo
                            ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                        title={conductor.activo ? "Desactivar" : "Activar"}
                      >
                        <Power size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(conductor)}
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

export default ConductorTable;