import {
  Building2,
  CalendarDays,
  Edit3,
  HandCoins,
  MessageSquareText,
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

const obtenerEstiloEstado = (codigo) => {
  const valor = (codigo || "").toLowerCase();

  if (valor.includes("aprob")) return "bg-green-100 text-green-700";
  if (valor.includes("pag")) return "bg-emerald-100 text-emerald-700";
  if (valor.includes("descont")) return "bg-blue-100 text-blue-700";
  if (valor.includes("pend")) return "bg-yellow-100 text-yellow-700";
  if (valor.includes("rechaz") || valor.includes("cancel")) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
};

const EstadoBadge = ({ adelanto }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${obtenerEstiloEstado(
      adelanto.estado_codigo
    )}`}
  >
    {adelanto.estado_nombre || "Sin estado"}
  </span>
);

const AdelantoTable = ({ adelantos, loading, onEdit, onDelete, esTaxista }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-500">
          Cargando adelantos...
        </p>
      </div>
    );
  }

  if (!adelantos.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
          <HandCoins size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay adelantos registrados
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Registra adelantos para llevar el control de los anticipos por
          jornada.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:hidden">
        {adelantos.map((adelanto) => (
          <div
            key={adelanto.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <UserRound size={16} className="text-blue-500" />
                  {adelanto.conductor_nombre || "Sin conductor"}
                </p>

                <p className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                  <CalendarDays size={15} className="text-slate-400" />
                  {adelanto.fecha || "Sin fecha"}
                  {adelanto.jornada ? ` · Jornada #${adelanto.jornada}` : ""}
                </p>
              </div>

              <EstadoBadge adelanto={adelanto} />
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Building2 size={17} className="text-[#E7A900]" />
                {adelanto.sucursal_nombre || "Panel superadmin"}
              </p>

              <p className="mt-2 flex items-start gap-2 text-sm font-medium text-slate-600">
                <MessageSquareText size={17} className="mt-0.5 text-slate-400" />
                {adelanto.observacion || "Sin observación"}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-base font-black text-[#C98A00]">
                <Wallet size={18} />
                {formatoDinero(adelanto.monto)}
              </p>

              {!esTaxista && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(adelanto)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                    title="Editar"
                  >
                    <Edit3 size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(adelanto)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
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
                  Jornada
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Monto
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Estado
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Sucursal
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Observación
                </th>

                {!esTaxista && (
                  <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {adelantos.map((adelanto) => (
                <tr
                  key={adelanto.id}
                  className="transition hover:bg-slate-50/80"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <UserRound size={20} />
                      </div>

                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {adelanto.conductor_nombre || "Sin conductor"}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          ID: {adelanto.conductor || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                      <CalendarDays size={16} className="text-slate-400" />
                      {adelanto.fecha || "Sin fecha"}
                    </p>

                    {adelanto.jornada && (
                      <p className="mt-1 text-xs font-bold text-blue-600">
                        Jornada #{adelanto.jornada}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <p className="flex items-center gap-2 text-sm font-black text-[#C98A00]">
                      <Wallet size={16} />
                      {formatoDinero(adelanto.monto)}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <EstadoBadge adelanto={adelanto} />
                  </td>

                  <td className="px-5 py-4">
                    <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Building2 size={16} className="text-[#E7A900]" />
                      {adelanto.sucursal_nombre || "Panel superadmin"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="max-w-[240px] truncate text-sm font-medium text-slate-500">
                      {adelanto.observacion || "Sin observación"}
                    </p>
                  </td>

                  {!esTaxista && (
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(adelanto)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(adelanto)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdelantoTable;
