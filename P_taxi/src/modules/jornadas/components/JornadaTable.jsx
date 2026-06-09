import {
  CalendarDays,
  CarTaxiFront,
  Edit3,
  Gauge,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const JornadaTable = ({ jornadas, loading, onEdit, onDelete, esTaxista }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-500">
          Cargando jornadas...
        </p>
      </div>
    );
  }

  if (!jornadas.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
          <CalendarDays size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay jornadas registradas
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Registra una jornada diaria para iniciar el control operativo.
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
                Conductor
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Vehículo
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Kilómetros
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Ingresos
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Ganancia
              </th>
              <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {jornadas.map((jornada) => (
              <tr key={jornada.id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-4">
                  <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <CalendarDays size={16} className="text-slate-400" />
                    {jornada.fecha}
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {jornada.sucursal_nombre || "Panel superadmin"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <UserRound size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {jornada.conductor_nombre}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        ID: {jornada.conductor}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE7A3] text-slate-900">
                      <CarTaxiFront size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {jornada.vehiculo_numero} - {jornada.vehiculo_placa}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {jornada.vehiculo_descripcion || "Vehículo"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                    <Gauge size={14} />
                    {Number(jornada.kilometros_recorridos || 0).toLocaleString()} km
                  </span>

                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {jornada.kilometraje_inicial} → {jornada.kilometraje_final}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <Wallet size={16} className="text-green-500" />
                    {formatoDinero(jornada.ingreso_bruto)}
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Pago conductor: {formatoDinero(jornada.pago_conductor)}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-black text-green-600">
                    {formatoDinero(jornada.ganancia_dueno)}
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Gastos: {formatoDinero(jornada.total_gastos)}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(jornada)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                      title="Editar"
                    >
                      <Edit3 size={18} />
                    </button>

                    {!esTaxista && (
                      <button
                        type="button"
                        onClick={() => onDelete(jornada)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
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

export default JornadaTable;