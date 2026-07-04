import {
  CarTaxiFront,
  RefreshCcw,
  Wallet,
  Wrench,
} from "lucide-react";
import FinancialChart from "../components/FinancialChart";
import MaintenanceAlerts from "../components/MaintenanceAlerts";
import RecentJornadas from "../components/RecentJornadas";
import SummaryCards from "../components/SummaryCards";
import { useDashboard } from "../hooks/useDashboard";



const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const DashboardPage = () => {
  const {
    resumen,
    jornadasHoy,
    vehiculosEstado,
    alertas,
    datosGrafica,
    periodo,
    setPeriodo,
    metricasPeriodo,
    loading,
    error,
    cargarDashboard,
  } = useDashboard();



  const tituloJornadas =
    periodo === "dia"
      ? "Jornadas de hoy"
      : periodo === "semana"
      ? "Jornadas de la semana"
      : "Jornadas del mes";

  const totalVehiculos = vehiculosEstado.total || resumen?.vehiculos || 0;

  const porcentajeBuenEstado = totalVehiculos
    ? Math.round((vehiculosEstado.buenEstado / totalVehiculos) * 100)
    : 0;

  const porcentajeProximos = totalVehiculos
    ? Math.round((vehiculosEstado.proximos / totalVehiculos) * 100)
    : 0;

  const porcentajeVencidos = totalVehiculos
    ? Math.round((vehiculosEstado.vencidos / totalVehiculos) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
              Dashboard
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
              Resumen operativo y financiero del sistema de taxis.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="grid grid-cols-3 rounded-2xl border border-slate-200 bg-slate-50 p-1">
              {[
                ["dia", "Día"],
                ["semana", "Semana"],
                ["mes", "Mes"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPeriodo(key)}
                  className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                    periodo === key
                      ? "bg-[#F5B800] text-white shadow-sm"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={cargarDashboard}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCcw size={18} />
              Actualizar
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-500">
          Cargando dashboard...
        </div>
      )}

      <SummaryCards metricas={metricasPeriodo} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <FinancialChart datos={datosGrafica} />

        <MaintenanceAlerts
          alertas={alertas}
          totalAlertas={resumen?.alertas_mantenimiento || 0}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <RecentJornadas
          jornadas={jornadasHoy}
          titulo={tituloJornadas}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-950">
              Gastos operativos
            </h3>

            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
              {periodo}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Wallet size={23} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">
                  Gastos de vehículos
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Gastos registrados por administración.
                </p>
              </div>

              <p className="font-black text-red-600">
                {formatoDinero(metricasPeriodo.gastosVehiculos)}
              </p>
            </div>

            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Wrench size={23} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">Mantenimiento</p>
                <p className="text-xs font-medium text-slate-500">
                  Costos de mantenimiento de vehículos.
                </p>
              </div>

              <p className="font-black text-blue-600">
                {formatoDinero(metricasPeriodo.mantenimiento)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="font-black text-slate-900">Total operativo</p>
            <p className="font-black text-red-500">
              {formatoDinero(metricasPeriodo.gastosOperativos)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-950">
              Estado de vehículos
            </h3>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
              {totalVehiculos} total
            </span>
          </div>

          <div className="flex flex-col items-center gap-6 md:flex-row xl:flex-col 2xl:flex-row">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-[conic-gradient(#39C636_0_62%,#F4C400_62%_87%,#F43F5E_87%_100%)]">
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-4xl font-black text-slate-950">
                  {totalVehiculos}
                </span>
                <span className="text-sm text-slate-500">Total</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded bg-green-500" />

                <div>
                  <p className="text-sm font-medium text-slate-600">
                    En buen estado
                  </p>

                  <p className="font-black text-slate-900">
                    {vehiculosEstado.buenEstado} ({porcentajeBuenEstado}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded bg-yellow-400" />

                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Próx. mantenimiento
                  </p>

                  <p className="font-black text-slate-900">
                    {vehiculosEstado.proximos} ({porcentajeProximos}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded bg-rose-500" />

                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Mantenimiento vencido
                  </p>

                  <p className="font-black text-slate-900">
                    {vehiculosEstado.vencidos} ({porcentajeVencidos}%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!totalVehiculos && (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                <CarTaxiFront size={25} />
              </div>

              <p className="mt-3 text-sm font-bold text-slate-500">
                No hay vehículos registrados.
              </p>
            </div>
          )}
        </div>
      </section>
{/* 
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <AlertTriangle size={23} />
          </div>

          <div>
            <p className="font-black text-blue-900">
              Módulo de adelantos en espera
            </p>

            <p className="mt-1 text-sm font-semibold text-blue-700">
              El dashboard no depende todavía de adelantos. Se está calculando
              con jornadas, gastos, mantenimiento, vehículos y alertas.
            </p>
          </div>
        </div>
      </section> */}


    </div>
  );
};

export default DashboardPage;