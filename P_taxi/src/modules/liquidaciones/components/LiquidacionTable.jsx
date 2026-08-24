import {
  Eye,
  MessageCircle,
} from "lucide-react";

const formatoMoneda = (valor) => {
  const numero = Number(valor || 0);

  return `C$ ${numero.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatoFecha = (fecha) => {
  if (!fecha) return "";

  return new Date(
    `${fecha}T00:00:00`
  ).toLocaleDateString("es-NI");
};

const LiquidacionTable = ({
  liquidaciones = [],
  loading,
  onViewRecibo,
  onWhatsApp,
}) => {
  if (loading) {
    return (
      <div className="px-5 py-8 text-sm font-semibold text-slate-500">
        Cargando liquidaciones...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[950px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Conductor</th>
            <th className="px-4 py-3">Desde</th>
            <th className="px-4 py-3">Hasta</th>
            <th className="px-4 py-3 text-right">Jornadas</th>
            <th className="px-4 py-3 text-right">
              Pendiente adelantos
            </th>
            <th className="px-4 py-3 text-right">
              Abono aplicado
            </th>
            <th className="px-4 py-3 text-right">
              Total pago
            </th>
            <th className="px-4 py-3 text-center">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
         {liquidaciones.map((item, index) => {
            const idLiquidacion =
              item.id ||
              item.liquidacion_id;

            const liquidacionNormalizada = {
              ...item,
              id: idLiquidacion,
            };

            return (
              <tr
                key={
                    idLiquidacion ||
                    `liquidacion-${index}`
                  }
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-bold text-slate-800">
                  {item.conductor_nombre || "-"}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {formatoFecha(item.fecha_inicio)}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {formatoFecha(item.fecha_fin)}
                </td>

                <td className="px-4 py-3 text-right font-semibold">
                  {formatoMoneda(item.total_jornadas)}
                </td>

                <td className="px-4 py-3 text-right font-semibold">
                  {formatoMoneda(
                    item.total_adelantos_pendientes
                  )}
                </td>

                <td className="px-4 py-3 text-right font-semibold">
                  {formatoMoneda(item.abono_aplicado)}
                </td>

                <td className="px-4 py-3 text-right font-black text-slate-950">
                  {formatoMoneda(item.total_pago)}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                          onViewRecibo(
                            liquidacionNormalizada
                          )
                        }
                      title="Ver recibo"
                      aria-label="Ver recibo"
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                     onClick={() =>
                        onWhatsApp(
                          liquidacionNormalizada
                        )
                      }
                      title="Enviar resumen por WhatsApp"
                      aria-label="Enviar por WhatsApp"
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 hover:text-emerald-800"
                    >
                      <MessageCircle size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {liquidaciones.length === 0 && (
            <tr>
              <td
                colSpan="8"
                className="px-4 py-8 text-center text-sm font-semibold text-slate-500"
              >
                No hay liquidaciones registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LiquidacionTable;