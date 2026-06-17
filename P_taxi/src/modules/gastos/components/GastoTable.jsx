import {
  CalendarDays,
  CarTaxiFront,
  Edit3,
  ReceiptText,
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

const obtenerVehiculoTexto = (gasto) => {
  const placa = gasto.vehiculo_placa || "";
  const descripcion = gasto.vehiculo_descripcion || "";

  if (placa && descripcion) return `${placa} - ${descripcion}`;
  if (placa) return placa;
  if (descripcion) return descripcion;

  return "Vehículo no asignado";
};

const GastoTable = ({ gastos, loading, onEdit, onDelete, esTaxista }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-500">Cargando gastos...</p>
      </div>
    );
  }

  if (!gastos.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
          <ReceiptText size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay gastos registrados
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Registra gastos para controlar mejor la ganancia de cada jornada.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:hidden">
        {gastos.map((gasto) => (
          <div
            key={gasto.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <CalendarDays size={16} className="text-slate-400" />
                  {gasto.fecha}
                </p>

                <p className="mt-2 text-base font-black text-slate-900">
                  {gasto.tipo_gasto_nombre || "Gasto general"}
                </p>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  {gasto.descripcion || "Sin descripción"}
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                {gasto.estado_nombre || "Sin estado"}
              </span>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <CarTaxiFront size={17} className="text-[#E7A900]" />
                {obtenerVehiculoTexto(gasto)}
              </p>

              {!esTaxista && (
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <UserRound size={17} className="text-blue-500" />
                  {gasto.conductor_nombre || "Sin conductor"}
                </p>
              )}

              {gasto.jornada && (
                <p className="mt-2 text-xs font-black text-blue-600">
                  Jornada #{gasto.jornada}
                </p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-base font-black text-red-600">
                <Wallet size={18} />
                {formatoDinero(gasto.monto)}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(gasto)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                  title="Editar"
                >
                  <Edit3 size={18} />
                </button>

                {!esTaxista && (
                  <button
                    type="button"
                    onClick={() => onDelete(gasto)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
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
                  Fecha
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Gasto
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Vehículo
                </th>

                {!esTaxista && (
                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    Conductor
                  </th>
                )}

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Monto
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
              {gastos.map((gasto) => (
                <tr key={gasto.id} className="transition hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                      <CalendarDays size={16} className="text-slate-400" />
                      {gasto.fecha}
                    </p>

                    {!esTaxista && (
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {gasto.sucursal_nombre || "Panel superadmin"}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-black text-slate-900">
                      {gasto.tipo_gasto_nombre || "Gasto general"}
                    </p>

                    <p className="mt-1 max-w-[240px] truncate text-xs font-medium text-slate-500">
                      {gasto.descripcion || "Sin descripción"}
                    </p>

                    {gasto.jornada && (
                      <p className="mt-1 text-xs font-bold text-blue-600">
                        Jornada #{gasto.jornada}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE7A3] text-slate-900">
                        <CarTaxiFront size={20} />
                      </div>

                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {gasto.vehiculo_placa || "Sin placa"}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {gasto.vehiculo_descripcion || "Vehículo"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {!esTaxista && (
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <UserRound size={20} />
                        </div>

                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {gasto.conductor_nombre || "Sin conductor"}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            ID: {gasto.conductor || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                  )}

                  <td className="px-5 py-4">
                    <p className="flex items-center gap-2 text-sm font-black text-red-600">
                      <Wallet size={16} />
                      {formatoDinero(gasto.monto)}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                      {gasto.estado_nombre || "Sin estado"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(gasto)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        title="Editar"
                      >
                        <Edit3 size={18} />
                      </button>

                      {!esTaxista && (
                        <button
                          type="button"
                          onClick={() => onDelete(gasto)}
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
    </>
  );
};

export default GastoTable;