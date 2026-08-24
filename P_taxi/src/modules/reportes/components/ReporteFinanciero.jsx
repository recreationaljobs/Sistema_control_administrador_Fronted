import {
  BadgeDollarSign,
  CalendarDays,
  CircleDollarSign,
  HandCoins,
  ReceiptText,
  TrendingDown,
  Wallet,
  Wrench,
} from "lucide-react";

const formatoMoneda = (valor) => {
  const numero = Number(valor || 0);

  return `C$ ${numero.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatoFecha = (fecha) => {
  if (!fecha) return "-";

  return new Date(`${fecha}T00:00:00`).toLocaleDateString(
    "es-NI"
  );
};

const TarjetaMetrica = ({
  titulo,
  valor,
  icono,
  color = "text-slate-800",
  fondo = "bg-slate-100",
  descripcion,
}) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            {titulo}
          </p>

          <p className={`mt-2 text-xl font-black ${color}`}>
            {valor}
          </p>

          {descripcion && (
            <p className="mt-1 text-xs font-medium text-slate-500">
              {descripcion}
            </p>
          )}
        </div>

        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${fondo} ${color}`}>
          {icono}
        </div>
      </div>
    </article>
  );
};

const ReporteFinanciero = ({
  reporte,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-[28px] border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500 shadow-sm">
        Calculando el reporte financiero...
      </div>
    );
  }

  if (!reporte) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <ReceiptText className="mx-auto text-slate-300" size={40} />
        <h2 className="mt-4 text-lg font-black text-slate-800">
          Aún no hay datos del reporte
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Selecciona un período y presiona “Generar reporte”.
        </p>
      </div>
    );
  }

  const gananciaReal = Number(
    reporte.total_ganancia_real_dueno || 0
  );

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-yellow-700">
              Resultado del período
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              Resumen financiero
            </h2>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
            <CalendarDays size={16} />
            {formatoFecha(reporte.fecha_inicio)} al {" "}
            {formatoFecha(reporte.fecha_fin)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaMetrica
          titulo="Ingresos"
          valor={formatoMoneda(reporte.total_ingresos)}
          descripcion={`${reporte.total_jornadas || 0} jornadas registradas`}
          icono={<CircleDollarSign size={22} />}
          color="text-emerald-600"
          fondo="bg-emerald-50"
        />

        <TarjetaMetrica
          titulo="Pago a conductores"
          valor={formatoMoneda(reporte.total_pago_conductores)}
          icono={<HandCoins size={22} />}
          color="text-blue-600"
          fondo="bg-blue-50"
        />

        <TarjetaMetrica
          titulo="Gastos operativos"
          valor={formatoMoneda(reporte.total_gastos_operativos)}
          descripcion={`${reporte.total_registros_gastos || 0} gastos y ${reporte.total_registros_mantenimiento || 0} mantenimientos`}
          icono={<TrendingDown size={22} />}
          color="text-red-600"
          fondo="bg-red-50"
        />

        <TarjetaMetrica
          titulo="Ganancia real"
          valor={formatoMoneda(gananciaReal)}
          icono={<BadgeDollarSign size={22} />}
          color={gananciaReal < 0 ? "text-red-600" : "text-[#D89C00]"}
          fondo={gananciaReal < 0 ? "bg-red-50" : "bg-yellow-50"}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Wallet size={22} />
            </div>
            <div>
              <h3 className="font-black text-slate-900">
                Distribución de ingresos
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Cómo se reparte el dinero generado.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <FilaDetalle
              etiqueta="Ingreso bruto"
              valor={reporte.total_ingresos}
              color="text-emerald-600"
            />
            <FilaDetalle
              etiqueta="Pago a conductores"
              valor={reporte.total_pago_conductores}
              color="text-blue-600"
            />
            <FilaDetalle
              etiqueta="Adelantos descontados"
              valor={reporte.total_adelantos}
              color="text-orange-600"
            />
            <FilaDetalle
              etiqueta="Ganancia del dueño antes de gastos"
              valor={reporte.total_ganancia_dueno}
              color="text-slate-900"
              destacado
            />
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Wrench size={22} />
            </div>
            <div>
              <h3 className="font-black text-slate-900">
                Costos operativos
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Gastos que reducen la rentabilidad.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <FilaDetalle
              etiqueta="Gastos de vehículos"
              valor={reporte.total_gastos_vehiculos}
              color="text-red-600"
            />
            <FilaDetalle
              etiqueta="Mantenimientos"
              valor={reporte.total_mantenimiento}
              color="text-orange-600"
            />
            <FilaDetalle
              etiqueta="Total de gastos operativos"
              valor={reporte.total_gastos_operativos}
              color="text-red-700"
              destacado
            />
            <FilaDetalle
              etiqueta="Ganancia real del dueño"
              valor={reporte.total_ganancia_real_dueno}
              color={gananciaReal < 0 ? "text-red-600" : "text-emerald-600"}
              destacado
            />
          </div>
        </article>
      </div>
    </section>
  );
};

const FilaDetalle = ({
  etiqueta,
  valor,
  color,
  destacado = false,
}) => {
  return (
    <div className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-3 ${destacado ? "bg-slate-50" : "border border-slate-100"}`}>
      <span className={`text-sm ${destacado ? "font-black text-slate-900" : "font-semibold text-slate-600"}`}>
        {etiqueta}
      </span>
      <strong className={`shrink-0 text-sm font-black ${color}`}>
        {formatoMoneda(valor)}
      </strong>
    </div>
  );
};

export default ReporteFinanciero;