import {
  CalendarDays,
  Download,
  FileBarChart,
  RefreshCcw,
  Search,
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
  if (!fecha) return "-";

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

const Tarjeta = ({
  titulo,
  valor,
  color = "text-slate-900",
}) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {titulo}
      </p>

      <p
        className={`mt-2 text-xl font-black ${color}`}
      >
        {valor}
      </p>
    </article>
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

  const detalleVehiculos = useMemo(() => {
    if (
      !Array.isArray(
        reporte?.detalle_por_vehiculo
      )
    ) {
      return [];
    }

    return reporte.detalle_por_vehiculo;
  }, [reporte]);

  const gananciaReal = Number(
    reporte?.total_ganancia_real_dueno || 0
  );

  return (
    <div className="space-y-6 p-5 sm:p-6">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#F5B800] via-[#FFD45A] to-emerald-500" />

        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-yellow-100/60 blur-3xl" />

        <div className="relative p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
              <FileBarChart size={27} />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-700">
                Análisis del negocio
              </p>

              <h1 className="mt-1 text-2xl font-black text-slate-950 md:text-[28px]">
                Reporte financiero
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Consulta resultados generales y el detalle ordenado por vehículo.
              </p>
            </div>
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
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#F5B800] focus:ring-2 focus:ring-yellow-100"
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
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#F5B800] focus:ring-2 focus:ring-yellow-100"
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

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={cargarReporte}
                disabled={loading}
                className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#F5B800] px-4 text-sm font-black text-slate-950 shadow-sm transition hover:bg-[#DFA600] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Search size={17} />
                Generar
              </button>

              <button
                type="button"
                onClick={exportarExcel}
                disabled={
                  exportandoExcel ||
                  !reporte
                }
                title="Exportar Excel"
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download
                  size={19}
                  className={
                    exportandoExcel
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs font-medium text-slate-500">
            Si seleccionas fechas, estas tienen prioridad sobre el período rápido.
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
            <Tarjeta
              titulo="Ingresos"
              valor={formatoMoneda(
                reporte?.total_ingresos
              )}
              color="text-emerald-600"
            />

            <Tarjeta
              titulo="Pago a conductores"
              valor={formatoMoneda(
                reporte?.total_pago_conductores
              )}
              color="text-blue-600"
            />

            <Tarjeta
              titulo="Gastos operativos"
              valor={formatoMoneda(
                reporte?.total_gastos_operativos
              )}
              color="text-red-600"
            />

            <Tarjeta
              titulo="Ganancia real"
              valor={formatoMoneda(
                reporte?.total_ganancia_real_dueno
              )}
              color={
                gananciaReal < 0
                  ? "text-red-600"
                  : "text-[#D89C00]"
              }
            />
          </section>

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Detalle por vehículo
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

              <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-black text-yellow-700">
                {detalleVehiculos.length} vehículo(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">
                      Vehículo
                    </th>

                    <th className="px-4 py-3 text-right">
                      Jornadas
                    </th>

                    <th className="px-4 py-3 text-right">
                      Kilómetros
                    </th>

                    <th className="px-4 py-3 text-right">
                      Ingresos
                    </th>

                    <th className="px-4 py-3 text-right">
                      Gastos
                    </th>

                    <th className="px-4 py-3 text-right">
                      Mantenimiento
                    </th>

                    <th className="px-4 py-3 text-right">
                      Ganancia real
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {detalleVehiculos.map(
                    (item) => (
                      <tr
                        key={
                          item.vehiculo_id
                        }
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-black text-slate-800">
                          {item.vehiculo}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-slate-700">
                          {item.jornadas}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-slate-700">
                          {formatoNumero(
                            item.kilometros
                          )}{" "}
                          km
                        </td>

                        <td className="px-4 py-3 text-right font-black text-emerald-600">
                          {formatoMoneda(
                            item.ingresos
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-red-600">
                          {formatoMoneda(
                            item.gastos
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-orange-600">
                          {formatoMoneda(
                            item.mantenimiento
                          )}
                        </td>

                        <td
                          className={`px-4 py-3 text-right font-black ${
                            Number(
                              item.ganancia_real
                            ) < 0
                              ? "text-red-600"
                              : "text-blue-700"
                          }`}
                        >
                          {formatoMoneda(
                            item.ganancia_real
                          )}
                        </td>
                      </tr>
                    )
                  )}

                  {!detalleVehiculos.length && (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-10 text-center text-sm font-semibold text-slate-500"
                      >
                        No hay registros para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ReportesPage;