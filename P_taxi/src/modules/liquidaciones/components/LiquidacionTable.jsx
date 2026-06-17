import {
  CalendarDays,
  Printer,
  UserRound,
  Wallet,
} from "lucide-react";

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const LiquidacionTable = ({ liquidaciones, loading, onRecibo }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-500">
          Cargando liquidaciones...
        </p>
      </div>
    );
  }

  if (!liquidaciones.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
          <Wallet size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay liquidaciones registradas
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Crea un nuevo pago para liquidar las jornadas de un conductor.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:hidden">
        {liquidaciones.map((liq) => (
          <div
            key={liq.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <UserRound size={16} className="text-blue-500" />
                  {liq.conductor_nombre || "Sin conductor"}
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                  <CalendarDays size={15} className="text-slate-400" />
                  {liq.fecha_inicio} al {liq.fecha_fin}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onRecibo(liq)}
                className="flex h-10 items-center justify-center gap-1 rounded-xl bg-amber-50 px-3 text-xs font-black text-[#C98A00] transition hover:bg-amber-100"
                title="Recibo"
              >
                <Printer size={16} /> Recibo
              </button>
            </div>

            <div className="mt-4 space-y-1.5 rounded-2xl bg-slate-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Total jornadas</span>
                <span className="font-black text-slate-900">
                  {formatoDinero(liq.total_jornadas)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">
                  Adelantos descontados
                </span>
                <span className="font-black text-red-600">
                  - {formatoDinero(liq.total_adelantos_pendientes)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Ajuste</span>
                <span className="font-black text-slate-900">
                  {formatoDinero(liq.ajuste_manual)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="font-black text-slate-900">Total pagado</span>
                <span className="font-black text-green-600">
                  {formatoDinero(liq.total_pago)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Conductor
                </th>
                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Período
                </th>
                <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                  Total Jornadas
                </th>
                <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                  Adelantos Descontados
                </th>
                <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                  Ajuste
                </th>
                <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                  Total Pagado
                </th>
                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Fecha
                </th>
                <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {liquidaciones.map((liq) => (
                <tr key={liq.id} className="transition hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <UserRound size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {liq.conductor_nombre || "Sin conductor"}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {liq.sucursal_nombre || "Sin sucursal"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-700">
                      {liq.fecha_inicio}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      al {liq.fecha_fin}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-black text-slate-900">
                    {formatoDinero(liq.total_jornadas)}
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-black text-red-600">
                    - {formatoDinero(liq.total_adelantos_pendientes)}
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-bold text-slate-700">
                    {formatoDinero(liq.ajuste_manual)}
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-black text-green-600">
                    {formatoDinero(liq.total_pago)}
                  </td>

                  <td className="px-5 py-4">
                    <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <CalendarDays size={16} className="text-slate-400" />
                      {(liq.fecha_creacion || "").slice(0, 10) || "—"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => onRecibo(liq)}
                        className="flex h-10 items-center justify-center gap-1 rounded-xl bg-amber-50 px-3 text-xs font-black text-[#C98A00] transition hover:bg-amber-100"
                        title="Recibo"
                      >
                        <Printer size={16} /> Recibo
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default LiquidacionTable;
