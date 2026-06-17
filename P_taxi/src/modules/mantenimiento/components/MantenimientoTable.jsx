import {
  CalendarDays,
  CarTaxiFront,
  Edit3,
  Gauge,
  Trash2,
  Wallet,
  Wrench,
} from "lucide-react";

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const MantenimientoTable = ({
  mantenimientos = [],
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-500">
          Cargando mantenimientos...
        </p>
      </div>
    );
  }

  if (!mantenimientos.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
          <Wrench size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay mantenimientos registrados
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Registra mantenimientos para controlar costos y alertas por vehículo.
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
                Fecha
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Vehículo
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Mantenimiento
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Kilometraje
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Costo
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
            {mantenimientos.map((item) => (
              <tr key={item.id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-4">
                  <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <CalendarDays size={16} className="text-slate-400" />
                    {item.fecha}
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {item.sucursal_nombre || "Panel superadmin"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE7A3] text-slate-900">
                      <CarTaxiFront size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {item.vehiculo_placa || "Sin placa"}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {item.vehiculo_descripcion || "Vehículo"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-black text-slate-900">
                    {item.tipo_mantenimiento_nombre || "Mantenimiento"}
                  </p>

                  <p className="mt-1 max-w-[240px] truncate text-xs font-medium text-slate-500">
                    {item.descripcion || "Sin descripción"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <Gauge size={16} className="text-slate-400" />
                    {item.kilometraje || 0} km
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Próximo: {item.proximo_km_sugerido || "No definido"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="flex items-center gap-2 text-sm font-black text-red-600">
                    <Wallet size={16} />
                    {formatoDinero(item.costo)}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                    {item.estado_nombre || "Sin estado"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                      title="Editar"
                    >
                      <Edit3 size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(item)}
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

export default MantenimientoTable;