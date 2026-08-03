import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  CarTaxiFront,
  RefreshCcw,
  Wallet,
  Wrench,
} from "lucide-react";

import FinancialChart from "../components/FinancialChart";
import MaintenanceAlerts from "../components/MaintenanceAlerts";
import RecentJornadas from "../components/RecentJornadas";
import SummaryCards from "../components/SummaryCards";
import VehicleStatusChart from "../components/VehicleStatusChart";

import { useDashboard } from "../hooks/useDashboard";

const formatoDinero = (
  valor,
  moneda
) => {
  return `${moneda} ${Number(
    valor || 0
  ).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const ETIQUETAS_PERIODO = {
  dia: "Día",
  semana: "Semana",
  mes: "Mes",
};

const DashboardLoader = () => {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#F5B800] via-[#FFD45A] to-[#3B82F6]" />

      <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100" />

          <div className="absolute inset-0 animate-spin rounded-full border-[4px] border-transparent border-r-[#F5B800] border-t-[#F5B800]" />

          <div
            className="absolute inset-[10px] animate-spin rounded-full border-[3px] border-transparent border-b-blue-500 border-l-blue-500"
            style={{
              animationDuration:
                "1.3s",
            }}
          />

          <div
            className="absolute inset-[22px] rounded-full bg-gradient-to-br from-[#FFF7D6] via-white to-[#E8F1FF] shadow-inner"
            style={{
              boxShadow:
                "inset 0 2px 12px rgba(15,23,42,0.08), 0 0 25px rgba(245,184,0,0.14)",
            }}
          />

          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#D89C00] shadow-md">
            <CarTaxiFront
              size={28}
            />
          </div>

          <span className="absolute left-2 top-3 h-2.5 w-2.5 animate-pulse rounded-full bg-[#F5B800]" />

          <span
            className="absolute bottom-4 right-1 h-2 w-2 animate-pulse rounded-full bg-blue-500"
            style={{
              animationDelay:
                "200ms",
            }}
          />

          <span
            className="absolute right-5 top-1 h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400"
            style={{
              animationDelay:
                "400ms",
            }}
          />
        </div>

        <h3 className="mt-5 text-lg font-black text-slate-950">
          Cargando dashboard
        </h3>

        <p className="mt-2 max-w-md text-sm font-medium text-slate-500">
          Estamos preparando el
          resumen financiero, las
          jornadas y las alertas
          del sistema.
        </p>
      </div>
    </section>
  );
};

const DashboardPage = () => {
  const {
    resumen,
    jornadasHoy,
    vehiculosEstado,
    alertas,
    datosGrafica,
    moneda,

    periodo,
    setPeriodo,

    metricasPeriodo,

    loading,
    error,

    cargarDashboard,

    anioSeleccionado,
    setAnioSeleccionado,
  } = useDashboard();

  const [
    dashboardCargado,
    setDashboardCargado,
  ] = useState(false);

  useEffect(() => {
    if (!loading) {
      setDashboardCargado(
        true
      );
    }
  }, [loading]);

  const mostrarCargaInicial =
    loading &&
    !dashboardCargado;

  const anioActual =
    new Date().getFullYear();

  const aniosDisponibles =
    Array.from(
      {
        length: 8,
      },

      (_, index) =>
        anioActual - index
    );

  const tituloJornadas =
    periodo === "dia"
      ? "Jornadas de hoy"
      : periodo === "semana"
      ? "Jornadas de la semana"
      : "Jornadas del mes";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-52 w-52 rounded-full bg-amber-100/50 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
              Dashboard
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
              Resumen operativo y
              financiero del sistema
              de taxis.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="grid grid-cols-3 rounded-2xl border border-slate-200 bg-slate-50 p-1">
              {[
                [
                  "dia",
                  "Día",
                ],
                [
                  "semana",
                  "Semana",
                ],
                [
                  "mes",
                  "Mes",
                ],
              ].map(
                ([
                  key,
                  label,
                ]) => (
                  <button
                    key={key}
                    type="button"

                    onClick={() =>
                      setPeriodo(
                        key
                      )
                    }

                    disabled={
                      loading
                    }

                    className={`rounded-xl px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-70 ${
                      periodo === key
                        ? "bg-[#F5B800] text-white shadow-sm"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarDays
                  size={18}
                />
              </div>

              <div>
                <label
                  htmlFor="anio-financiero"
                  className="block text-[10px] font-black uppercase tracking-wide text-slate-400"
                >
                  Año financiero
                </label>

                <select
                  id="anio-financiero"

                  value={
                    anioSeleccionado
                  }

                  onChange={(
                    event
                  ) =>
                    setAnioSeleccionado(
                      Number(
                        event
                          .target
                          .value
                      )
                    )
                  }

                  disabled={
                    loading
                  }

                  className="cursor-pointer border-0 bg-transparent pr-8 text-sm font-black text-slate-800 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {aniosDisponibles.map(
                    (anio) => (
                      <option
                        key={
                          anio
                        }

                        value={
                          anio
                        }
                      >
                        {anio}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <button
              type="button"

              onClick={
                cargarDashboard
              }

              disabled={loading}

              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                size={18}

                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              {loading
                ? "Actualizando"
                : "Actualizar"}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {mostrarCargaInicial ? (
        <DashboardLoader />
      ) : (
        <>
          <SummaryCards
            metricas={
              metricasPeriodo
            }

            moneda={moneda}
          />

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
            <FinancialChart
              datos={
                datosGrafica
              }

              moneda={moneda}

              loading={
                loading
              }

              anio={
                anioSeleccionado
              }
            />

            <MaintenanceAlerts
              alertas={
                Array.isArray(
                  alertas
                )
                  ? alertas
                  : []
              }

              totalAlertas={
                resumen
                  ?.alertas_mantenimiento ??
                (
                  Array.isArray(
                    alertas
                  )
                    ? alertas.length
                    : 0
                )
              }
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <RecentJornadas
              jornadas={
                Array.isArray(
                  jornadasHoy
                )
                  ? jornadasHoy
                  : []
              }

              titulo={
                tituloJornadas
              }

              moneda={moneda}
            />

            <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-rose-100/50 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">
                      Gastos operativos
                    </h3>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Costos que reducen
                      la ganancia real.
                    </p>
                  </div>

                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                    {ETIQUETAS_PERIODO[
                      periodo
                    ] || periodo}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                      <Wallet
                        size={23}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">
                        Gastos de
                        vehículos
                      </p>

                      <p className="text-xs font-medium text-slate-500">
                        Gastos registrados
                        por administración.
                      </p>
                    </div>

                    <p className="shrink-0 font-black text-red-600">
                      {formatoDinero(
                        metricasPeriodo
                          ?.gastosVehiculos,

                        moneda
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                      <Wrench
                        size={23}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">
                        Mantenimiento
                      </p>

                      <p className="text-xs font-medium text-slate-500">
                        Solo mantenimientos
                        finalizados.
                      </p>
                    </div>

                    <p className="shrink-0 font-black text-blue-600">
                      {formatoDinero(
                        metricasPeriodo
                          ?.mantenimiento,

                        moneda
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
                  <div>
                    <p className="font-black text-slate-900">
                      Total operativo
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Gastos y
                      mantenimiento.
                    </p>
                  </div>

                  <p className="font-black text-red-600">
                    {formatoDinero(
                      metricasPeriodo
                        ?.gastosOperativos,

                      moneda
                    )}
                  </p>
                </div>
              </div>
            </div>

            <VehicleStatusChart
              estado={{
                ...vehiculosEstado,

                total:
                  vehiculosEstado
                    ?.total ??
                  resumen
                    ?.vehiculos ??
                  0,
              }}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default DashboardPage;