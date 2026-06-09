import {
  CalendarDays,
  CarTaxiFront,
  Edit3,
  Power,
  Route,
  Trash2,
  UserRound,
} from "lucide-react";

const AsignacionTable = ({
  asignaciones,
  loading,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-500">
          Cargando asignaciones...
        </p>
      </div>
    );
  }

  if (!asignaciones.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
          <Route size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay asignaciones registradas
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Crea una asignación para unir un conductor con un vehículo.
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
                Vehículo
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Fechas
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
            {asignaciones.map((asignacion) => (
              <tr
                key={asignacion.id}
                className="transition hover:bg-slate-50/80"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <UserRound size={22} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">
                        {asignacion.conductor_nombre}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        ID conductor: {asignacion.conductor}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFE7A3] text-slate-900">
                      <CarTaxiFront size={22} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">
                        {asignacion.vehiculo_numero} -{" "}
                        {asignacion.vehiculo_placa}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {asignacion.vehiculo_descripcion ||
                          "Vehículo asignado"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <CalendarDays size={15} className="text-slate-400" />
                      Inicio: {asignacion.fecha_inicio}
                    </p>

                    <p className="text-xs font-medium text-slate-500">
                      Fin: {asignacion.fecha_fin || "Sin finalizar"}
                    </p>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-bold text-slate-700">
                    {asignacion.sucursal_nombre || "Panel superadmin"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                      asignacion.activa
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {asignacion.activa ? "Activa" : "Inactiva"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(asignacion)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                      title="Editar"
                    >
                      <Edit3 size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleStatus(asignacion)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                        asignacion.activa
                          ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                      title={asignacion.activa ? "Desactivar" : "Activar"}
                    >
                      <Power size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(asignacion)}
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

export default AsignacionTable;