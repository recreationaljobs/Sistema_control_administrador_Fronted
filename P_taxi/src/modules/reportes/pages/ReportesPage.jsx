import {
  Building2,
  CalendarDays,
  Download,
  FileBarChart,
  RefreshCcw,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  descargarReporteFinancieroExcel,
  getReporteFinanciero,
  getVehiculosReporte,
} from "../services/reportesService";

import {
  registrarMovimientoAuditoria,
} from "../../auditoria/services/auditoriaService";

const formatoMoneda = (valor) => {
  return `C$ ${Number(
    valor || 0
  ).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatoNumero = (valor) => {
  return Number(
    valor || 0
  ).toLocaleString("es-NI");
};

const formatoFecha = (fecha) => {
  if (!fecha) {
    return "-";
  }

  return new Date(
    `${fecha}T00:00:00`
  ).toLocaleDateString("es-NI");
};

const normalizarLista = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const nombreVehiculo = (vehiculo) => {
  if (!vehiculo) {
    return "Vehículo";
  }

  return [
    vehiculo.numero,
    vehiculo.placa,
    vehiculo.marca,
    vehiculo.modelo,
  ]
    .filter(Boolean)
    .join(" - ");
};

const TarjetaResumen = ({
  titulo,
  valor,
  icono,
  iconoClase,
  valorClase = "text-slate-950",
}) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconoClase}`}
        >
          {icono}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            {titulo}
          </p>

          <p
            className={`mt-1 truncate text-lg font-black ${valorClase}`}
          >
            {valor}
          </p>
        </div>
      </div>
    </article>
  );
};

const BarraComparativa = ({
  etiqueta,
  valor,
  maximo,
  claseBarra,
}) => {
  const porcentaje =
    maximo > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (Number(valor || 0) / maximo) * 100
          )
        )
      : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-bold text-slate-700">
          {etiqueta}
        </span>

        <span className="text-sm font-black text-slate-950">
          {formatoMoneda(valor)}
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${claseBarra}`}
          style={{
            width: `${porcentaje}%`,
          }}
        />
      </div>
    </div>
  );
};

const ReportesPage = () => {
  const [periodo, setPeriodo] =
    useState("mes");

  const [fechaInicio, setFechaInicio] =
    useState("");

  const [fechaFin, setFechaFin] =
    useState("");

  const [vehiculo, setVehiculo] =
    useState("");

  const [vehiculos, setVehiculos] =
    useState([]);

  const [reporte, setReporte] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [loadingVehiculos, setLoadingVehiculos] =
    useState(true);

  const [exportandoExcel, setExportandoExcel] =
    useState(false);

  const [error, setError] =
    useState("");

  const cargarVehiculos = async () => {
    try {
      setLoadingVehiculos(true);

      const data =
        await getVehiculosReporte();

      setVehiculos(
        normalizarLista(data)
      );
    } catch {
      setVehiculos([]);
    } finally {
      setLoadingVehiculos(false);
    }
  };

  const construirParametros = () => {
    if (
      (fechaInicio && !fechaFin) ||
      (!fechaInicio && fechaFin)
    ) {
      throw new Error(
        "Selecciona ambas fechas para usar un rango personalizado."
      );
    }

    if (
      fechaInicio &&
      fechaFin &&
      fechaInicio > fechaFin
    ) {
      throw new Error(
        "La fecha inicial no puede ser mayor que la fecha final."
      );
    }

    const params = {
      periodo,
    };

    if (fechaInicio && fechaFin) {
      params.fecha_inicio =
        fechaInicio;

      params.fecha_fin =
        fechaFin;
    }

    if (vehiculo) {
      params.vehiculo = vehiculo;
    }

    return params;
  };

  const cargarReporte = async () => {
    try {
      setLoading(true);
      setError("");

      const params =
        construirParametros();

      const data =
        await getReporteFinanciero(
          params
        );

      setReporte(data);
      void registrarMovimientoAuditoria({
        evento: "reporte_consultado",
        referencia: `Período: ${
          params.fecha_inicio && params.fecha_fin
            ? `${params.fecha_inicio} al ${params.fecha_fin}`
            : params.periodo
        }${
          params.vehiculo
            ? ` · Vehículo ID: ${params.vehiculo}`
            : " · Todos los vehículos"
        }`,
      });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "No se pudo generar el reporte financiero."
      );
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = async () => {
    try {
      setExportandoExcel(true);
      setError("");

      const params =
        construirParametros();

      const archivo =
        await descargarReporteFinancieroExcel(
          params
        );

      const url = URL.createObjectURL(
        archivo
      );

      const enlace =
        document.createElement("a");

      enlace.href = url;

      enlace.download =
        "reporte_financiero_taxi_control.xlsx";

      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);

      URL.revokeObjectURL(url);
      void registrarMovimientoAuditoria({
        evento: "reporte_excel_descargado",
        referencia: `Período: ${
          params.fecha_inicio && params.fecha_fin
            ? `${params.fecha_inicio} al ${params.fecha_fin}`
            : params.periodo
        }${
          params.vehiculo
            ? ` · Vehículo ID: ${params.vehiculo}`
            : " · Todos los vehículos"
        }`,
      });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "No se pudo exportar el reporte a Excel."
      );
    } finally {
      setExportandoExcel(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
    cargarReporte();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detalleJornadas = useMemo(() => {
    if (
      !Array.isArray(
        reporte?.detalle_jornadas
      )
    ) {
      return [];
    }

    return reporte.detalle_jornadas;
  }, [reporte]);

  const totalIngresos = Number(
    reporte?.total_ingresos || 0
  );

  const totalPagoConductores = Number(
    reporte?.total_pago_conductores || 0
  );

  const totalGananciaDueno = Number(
    reporte?.total_ganancia_dueno || 0
  );

  const totalGastosVehiculos = Number(
    reporte?.total_gastos_vehiculos || 0
  );

  const totalMantenimiento = Number(
    reporte?.total_mantenimiento || 0
  );

  const totalGastosOperativos = Number(
    reporte?.total_gastos_operativos || 0
  );

  const gananciaReal = Number(
    reporte?.total_ganancia_real_dueno || 0
  );

  const maximoComparativa = Math.max(
    totalIngresos,
    totalGastosOperativos,
    Math.abs(gananciaReal),
    1
  );

  return (
    <div className="space-y-6 p-5 sm:p-6">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#F5B800] via-[#FFD45A] to-emerald-500" />

        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-yellow-100/60 blur-3xl" />

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                <FileBarChart size={27} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-700">
                  Análisis financiero
                </p>

                <h1 className="mt-1 text-2xl font-black text-slate-950 md:text-[28px]">
                  Ingresos vs gastos
                </h1>

                <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  Consulta el resumen financiero y cada jornada registrada por fecha, vehículo y conductor.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={exportarExcel}
              disabled={
                exportandoExcel ||
                !reporte
              }
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download
                size={18}
                className={
                  exportandoExcel
                    ? "animate-spin"
                    : ""
                }
              />
              Exportar Excel
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label>
              <span className="mb-1.5 block text-xs font-black text-slate-600">
                Período rápido
              </span>

              <select
                value={periodo}
                onChange={(event) => {
                  setPeriodo(
                    event.target.value
                  );

                  setFechaInicio("");
                  setFechaFin("");
                }}
                className="h-11 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#F5B800] focus:ring-2 focus:ring-yellow-100"
              >
                <option value="dia">
                  Hoy
                </option>

                <option value="semana">
                  Esta semana
                </option>

                <option value="mes">
                  Este mes
                </option>
              </select>
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-black text-slate-600">
                Fecha desde
              </span>

              <input
                type="date"
                value={fechaInicio}
                onChange={(event) =>
                  setFechaInicio(
                    event.target.value
                  )
                }
                className="h-11 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#F5B800] focus:ring-2 focus:ring-yellow-100"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-black text-slate-600">
                Fecha hasta
              </span>

              <input
                type="date"
                value={fechaFin}
                onChange={(event) =>
                  setFechaFin(
                    event.target.value
                  )
                }
                className="h-11 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#F5B800] focus:ring-2 focus:ring-yellow-100"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-black text-slate-600">
                Vehículo
              </span>

              <select
                value={vehiculo}
                onChange={(event) =>
                  setVehiculo(
                    event.target.value
                  )
                }
                disabled={loadingVehiculos}
                className="h-11 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#F5B800] focus:ring-2 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  Todos los vehículos
                </option>

                {vehiculos.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {nombreVehiculo(item)}
                    </option>
                  )
                )}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={cargarReporte}
                disabled={loading}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#F5B800] px-4 text-sm font-black text-slate-950 shadow-sm transition hover:bg-[#DFA600] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Search size={17} />
                Generar reporte
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs font-medium text-slate-500">
            Al seleccionar ambas fechas, el rango personalizado tiene prioridad sobre el período rápido.
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-[28px] border border-slate-200 bg-white text-sm font-bold text-slate-500 shadow-sm">
          <RefreshCcw
            className="mr-2 animate-spin"
            size={18}
          />
          Generando reporte...
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TarjetaResumen
              titulo="Ingresos de jornadas"
              valor={formatoMoneda(
                totalIngresos
              )}
              icono={
                <TrendingUp size={22} />
              }
              iconoClase="bg-emerald-100 text-emerald-600"
              valorClase="text-emerald-600"
            />

            <TarjetaResumen
              titulo="Pago a conductores"
              valor={formatoMoneda(
                totalPagoConductores
              )}
              icono={
                <Users size={22} />
              }
              iconoClase="bg-blue-100 text-blue-600"
              valorClase="text-blue-600"
            />

            <TarjetaResumen
              titulo="Ganancia del dueño"
              valor={formatoMoneda(
                totalGananciaDueno
              )}
              icono={
                <Wallet size={22} />
              }
              iconoClase="bg-yellow-100 text-yellow-700"
              valorClase="text-[#C48A00]"
            />

            <TarjetaResumen
              titulo="Ganancia real"
              valor={formatoMoneda(
                gananciaReal
              )}
              icono={
                <TrendingUp size={22} />
              }
              iconoClase={
                gananciaReal < 0
                  ? "bg-red-100 text-red-600"
                  : "bg-violet-100 text-violet-600"
              }
              valorClase={
                gananciaReal < 0
                  ? "text-red-600"
                  : "text-violet-600"
              }
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <TrendingDown size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Comparación financiera
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Relación entre ingresos, gastos operativos y ganancia real.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <BarraComparativa
                  etiqueta="Ingresos"
                  valor={totalIngresos}
                  maximo={maximoComparativa}
                  claseBarra="bg-emerald-500"
                />

                <BarraComparativa
                  etiqueta="Gastos operativos"
                  valor={totalGastosOperativos}
                  maximo={maximoComparativa}
                  claseBarra="bg-red-500"
                />

                <BarraComparativa
                  etiqueta="Ganancia real"
                  valor={Math.abs(gananciaReal)}
                  maximo={maximoComparativa}
                  claseBarra={
                    gananciaReal < 0
                      ? "bg-red-700"
                      : "bg-blue-500"
                  }
                />
              </div>
            </article>

            <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <Wrench size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Desglose de gastos
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Costos que reducen la ganancia final del período.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-bold text-slate-600">
                    Gastos de vehículos
                  </span>

                  <span className="font-black text-red-600">
                    {formatoMoneda(
                      totalGastosVehiculos
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-bold text-slate-600">
                    Mantenimiento
                  </span>

                  <span className="font-black text-orange-600">
                    {formatoMoneda(
                      totalMantenimiento
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
                  <span className="text-sm font-black text-slate-800">
                    Total operativo
                  </span>

                  <span className="font-black text-red-700">
                    {formatoMoneda(
                      totalGastosOperativos
                    )}
                  </span>
                </div>
              </div>
            </article>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <CalendarDays size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Jornadas por fecha
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Del {formatoFecha(
                      reporte?.fecha_inicio
                    )}{" "}
                    al {formatoFecha(
                      reporte?.fecha_fin
                    )}
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                <Building2 size={15} />
                {detalleJornadas.length} jornada(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">
                      Fecha
                    </th>

                    <th className="px-4 py-3">
                      Vehículo
                    </th>

                    <th className="px-4 py-3">
                      Conductor
                    </th>

                    <th className="px-4 py-3">
                      Cobro
                    </th>

                    <th className="px-4 py-3 text-right">
                      Kilómetros
                    </th>

                    <th className="px-4 py-3 text-right">
                      Ingreso
                    </th>

                    <th className="px-4 py-3 text-right">
                      Pago conductor
                    </th>

                    

                    <th className="px-4 py-3 text-right">
                      Ganancia dueño
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {detalleJornadas.map(
                    (jornada) => (
                      <tr
                        key={
                          jornada.jornada_id
                        }
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-bold text-slate-700">
                          {formatoFecha(
                            jornada.fecha
                          )}
                        </td>

                        <td className="px-4 py-3 font-black text-slate-800">
                          {jornada.vehiculo}
                        </td>

                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {jornada.conductor}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-black ${
                              jornada.tipo_cobro ===
                              "alquiler"
                                ? "bg-violet-50 text-violet-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {jornada.tipo_cobro_nombre}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-slate-700">
                          {formatoNumero(
                            jornada.kilometros
                          )}{" "}
                          km
                        </td>

                        <td className="px-4 py-3 text-right font-black text-emerald-600">
                          {formatoMoneda(
                            jornada.ingreso_bruto
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-blue-600">
                          {formatoMoneda(
                            jornada.pago_conductor
                          )}
                        </td>

                        

                        <td className="px-4 py-3 text-right font-black text-[#C48A00]">
                          {formatoMoneda(
                            jornada.ganancia_dueno
                          )}
                        </td>
                      </tr>
                    )
                  )}

                  {!detalleJornadas.length && (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-5 py-12 text-center text-sm font-semibold text-slate-500"
                      >
                        No hay jornadas para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>

                {!!detalleJornadas.length && (
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                      <td
                        colSpan="5"
                        className="px-4 py-4 text-right text-sm font-black text-slate-800"
                      >
                        Totales del período
                      </td>

                      <td className="px-4 py-4 text-right font-black text-emerald-700">
                        {formatoMoneda(
                          totalIngresos
                        )}
                      </td>

                      <td className="px-4 py-4 text-right font-black text-blue-700">
                        {formatoMoneda(
                          totalPagoConductores
                        )}
                      </td>

                      

                      <td className="px-4 py-4 text-right font-black text-[#B77D00]">
                        {formatoMoneda(
                          totalGananciaDueno
                        )}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ReportesPage;