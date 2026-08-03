import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import Chart from "react-apexcharts";

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  DollarSign,
  Wallet,
  Wrench,
} from "lucide-react";

const numeroSeguro = (valor) => {
  const numero = Number(valor ?? 0);

  return Number.isFinite(numero)
    ? numero
    : 0;
};

const formatoDinero = (
  valor,
  moneda
) => {
  return `${moneda} ${numeroSeguro(
    valor
  ).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatoDineroCorto = (
  valor,
  moneda
) => {
  const numero = numeroSeguro(valor);

  if (
    Math.abs(numero) >=
    1000000
  ) {
    return `${moneda} ${(
      numero / 1000000
    ).toFixed(1)}M`;
  }

  if (
    Math.abs(numero) >=
    1000
  ) {
    return `${moneda} ${(
      numero / 1000
    ).toFixed(1)}K`;
  }

  return `${moneda} ${numero.toFixed(
    0
  )}`;
};

const FinancialChart = ({
  datos = [],
  moneda = "C$",
  loading = false,
  anio = new Date().getFullYear(),
}) => {
  const ultimosDatosRef =
    useRef([]);

  const datosEntrada = useMemo(
    () =>
      Array.isArray(datos)
        ? datos
        : [],
    [datos]
  );

  useEffect(() => {
    if (!loading) {
      ultimosDatosRef.current =
        datosEntrada;
    }
  }, [
    datosEntrada,
    loading,
  ]);

  const datosSeguros = useMemo(() => {
    if (datosEntrada.length > 0) {
      return datosEntrada;
    }

    if (
      loading &&
      ultimosDatosRef.current
        .length > 0
    ) {
      return ultimosDatosRef.current;
    }

    return [];
  }, [
    datosEntrada,
    loading,
  ]);

  const {
    categorias,
    ingresos,
    ganancias,
    gastos,
    totalIngresos,
    totalGanancia,
    totalGastos,
    margenGanancia,
  } = useMemo(() => {
    const categoriasCalculadas =
      datosSeguros.map(
        (item) =>
          String(item?.label ?? "")
      );

    const ingresosCalculados =
      datosSeguros.map(
        (item) =>
          numeroSeguro(
            item?.ingreso
          )
      );

    const gananciasCalculadas =
      datosSeguros.map(
        (item) =>
          numeroSeguro(
            item?.ganancia
          )
      );

    const gastosCalculados =
      datosSeguros.map(
        (item) =>
          numeroSeguro(
            item?.gastos
          )
      );

    const sumaIngresos =
      ingresosCalculados.reduce(
        (total, valor) =>
          total + valor,
        0
      );

    const sumaGanancias =
      gananciasCalculadas.reduce(
        (total, valor) =>
          total + valor,
        0
      );

    const sumaGastos =
      gastosCalculados.reduce(
        (total, valor) =>
          total + valor,
        0
      );

    return {
      categorias:
        categoriasCalculadas,

      ingresos:
        ingresosCalculados,

      ganancias:
        gananciasCalculadas,

      gastos:
        gastosCalculados,

      totalIngresos:
        sumaIngresos,

      totalGanancia:
        sumaGanancias,

      totalGastos:
        sumaGastos,

      margenGanancia:
        sumaIngresos
          ? (
              sumaGanancias /
              sumaIngresos
            ) * 100
          : 0,
    };
  }, [datosSeguros]);

  const options = useMemo(
    () => ({
      chart: {
        id:
          "financial-dashboard-chart",

        type: "area",

        background:
          "transparent",

        animations: {
          enabled: false,

          animateGradually: {
            enabled: false,
          },

          dynamicAnimation: {
            enabled: false,
          },
        },

        toolbar: {
          show: false,
        },

        zoom: {
          enabled: false,
        },

        redrawOnParentResize:
          true,

        redrawOnWindowResize:
          true,

        parentHeightOffset: 0,

        fontFamily:
          "Inter, system-ui, sans-serif",
      },

      colors: [
        "#F5B800",
        "#10B981",
        "#F43F5E",
      ],

      stroke: {
        curve: "smooth",

        width: [
          3,
          4,
          2.5,
        ],

        dashArray: [
          0,
          0,
          6,
        ],

        lineCap: "round",
      },

      fill: {
        type: "gradient",

        gradient: {
          shade: "light",
          shadeIntensity: 0.25,
          opacityFrom: 0.35,
          opacityTo: 0.02,

          stops: [
            0,
            75,
            100,
          ],
        },
      },

      markers: {
        size: 0,

        strokeWidth: 3,

        strokeColors: "#FFFFFF",

        hover: {
          size: 7,
          sizeOffset: 2,
        },
      },

      dataLabels: {
        enabled: false,
      },

      grid: {
        show: true,
        borderColor:
          "rgba(148, 163, 184, 0.22)",

        strokeDashArray: 5,

        padding: {
          top: 10,
          right: 18,
          bottom: 0,
          left: 8,
        },

        xaxis: {
          lines: {
            show: false,
          },
        },

        yaxis: {
          lines: {
            show: true,
          },
        },
      },

      xaxis: {
        categories: categorias,

        tooltip: {
          enabled: false,
        },

        labels: {
          rotate: 0,

          style: {
            colors: "#64748B",
            fontSize: "12px",
            fontWeight: 700,
          },
        },

        axisBorder: {
          show: false,
        },

        axisTicks: {
          show: false,
        },

        crosshairs: {
          show: true,

          width: 1,

          stroke: {
            color: "#CBD5E1",
            width: 1,
            dashArray: 5,
          },

          fill: {
            type: "solid",
            color: "transparent",
          },
        },
      },

      yaxis: {
        forceNiceScale: true,

        labels: {
          formatter: (value) =>
            formatoDineroCorto(
              value,
              moneda
            ),

          style: {
            colors: "#64748B",
            fontSize: "11px",
            fontWeight: 600,
          },
        },
      },

      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
        offsetY: -4,
        fontSize: "12px",
        fontWeight: 700,

        labels: {
          colors: "#475569",
        },

        markers: {
          width: 9,
          height: 9,
          radius: 9,
          offsetX: -3,
        },

        itemMargin: {
          horizontal: 10,
          vertical: 4,
        },
      },

      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,

        custom: ({
          series,
          dataPointIndex,
        }) => {
          const mes =
            categorias[
              dataPointIndex
            ] || "";

          const ingreso =
            numeroSeguro(
              series?.[0]?.[
                dataPointIndex
              ]
            );

          const ganancia =
            numeroSeguro(
              series?.[1]?.[
                dataPointIndex
              ]
            );

          const gasto =
            numeroSeguro(
              series?.[2]?.[
                dataPointIndex
              ]
            );

          const margen =
            ingreso
              ? (
                  ganancia /
                  ingreso
                ) * 100
              : 0;

          return `
            <div style="
              min-width: 245px;
              padding: 16px;
              border: 1px solid rgba(148, 163, 184, 0.25);
              border-radius: 18px;
              background: rgba(15, 23, 42, 0.96);
              box-shadow: 0 20px 50px rgba(15, 23, 42, 0.28);
              backdrop-filter: blur(16px);
              color: #F8FAFC;
              font-family: Inter, system-ui, sans-serif;
            ">
              <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 14px;
                padding-bottom: 12px;
                margin-bottom: 12px;
                border-bottom: 1px solid rgba(148, 163, 184, 0.20);
              ">
                <div>
                  <div style="
                    color: #94A3B8;
                    font-size: 11px;
                    font-weight: 500;
                  ">
                    Período financiero
                  </div>

                  <div style="
                    margin-top: 3px;
                    font-size: 15px;
                    font-weight: 700;
                  ">
                    ${mes} ${anio}
                  </div>
                </div>

                <div style="
                  padding: 6px 9px;
                  border-radius: 999px;
                  background: rgba(16, 185, 129, 0.14);
                  color: #6EE7B7;
                  font-size: 11px;
                  font-weight: 700;
                ">
                  ${margen.toFixed(1)}% margen
                </div>
              </div>

              <div style="
                display: grid;
                gap: 11px;
              ">
                <div style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 18px;
                ">
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #CBD5E1;
                    font-size: 12px;
                    font-weight: 500;
                  ">
                    <span style="
                      width: 9px;
                      height: 9px;
                      border-radius: 999px;
                      background: #F5B800;
                      box-shadow: 0 0 12px rgba(245,184,0,.6);
                    "></span>

                    Ingresos
                  </div>

                  <span style="
                    color: #FFFFFF;
                    font-size: 13px;
                    font-weight: 700;
                  ">
                    ${formatoDinero(
                      ingreso,
                      moneda
                    )}
                  </span>
                </div>

                <div style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 18px;
                ">
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #CBD5E1;
                    font-size: 12px;
                    font-weight: 500;
                  ">
                    <span style="
                      width: 9px;
                      height: 9px;
                      border-radius: 999px;
                      background: #10B981;
                      box-shadow: 0 0 12px rgba(16,185,129,.6);
                    "></span>

                    Ganancia real
                  </div>

                  <span style="
                    color: ${
                      ganancia < 0
                        ? "#FDA4AF"
                        : "#6EE7B7"
                    };
                    font-size: 13px;
                    font-weight: 700;
                  ">
                    ${formatoDinero(
                      ganancia,
                      moneda
                    )}
                  </span>
                </div>

                <div style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 18px;
                ">
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #CBD5E1;
                    font-size: 12px;
                    font-weight: 500;
                  ">
                    <span style="
                      width: 9px;
                      height: 9px;
                      border-radius: 999px;
                      background: #F43F5E;
                      box-shadow: 0 0 12px rgba(244,63,94,.6);
                    "></span>

                    Gastos operativos
                  </div>

                  <span style="
                    color: #FDA4AF;
                    font-size: 13px;
                    font-weight: 700;
                  ">
                    ${formatoDinero(
                      gasto,
                      moneda
                    )}
                  </span>
                </div>
              </div>
            </div>
          `;
        },
      },

      states: {
        hover: {
          filter: {
            type: "lighten",
            value: 0.05,
          },
        },

        active: {
          filter: {
            type: "none",
          },
        },
      },

      noData: {
        text:
          "No hay datos financieros",

        align: "center",
        verticalAlign: "middle",

        style: {
          color: "#94A3B8",
          fontSize: "14px",
          fontFamily:
            "Inter, system-ui, sans-serif",
        },
      },
    }),
    [
      anio,
      categorias,
      moneda,
    ]
  );

  const series = useMemo(
    () => [
      {
        name: "Ingresos",
        data: ingresos,
      },
      {
        name: "Ganancia real",
        data: ganancias,
      },
      {
        name:
          "Gastos operativos",
        data: gastos,
      },
    ],
    [
      ingresos,
      ganancias,
      gastos,
    ]
  );

  const gananciaPositiva =
    totalGanancia >= 0;

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f8fafc_55%,#eff6ff_100%)] p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] md:p-6">
      <div className="pointer-events-none absolute -left-28 -top-28 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 -right-24 h-64 w-64 rounded-full bg-emerald-200/25 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-black text-slate-950">
                Resumen financiero
              </h3>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                <CalendarDays
                  size={14}
                />

                Año {anio}
              </span>
            </div>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Comparación mensual de
              ingresos, ganancia real y
              gastos operativos.
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between gap-5">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Ganancia real acumulada
                </p>

                <p
                  className={`mt-1 text-xl font-black ${
                    gananciaPositiva
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {formatoDinero(
                    totalGanancia,
                    moneda
                  )}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                  gananciaPositiva
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {gananciaPositiva ? (
                  <ArrowUpRight
                    size={22}
                  />
                ) : (
                  <ArrowDownRight
                    size={22}
                  />
                )}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between gap-4 border-t border-slate-100 pt-2">
              <span className="text-[11px] font-semibold text-slate-400">
                Margen acumulado
              </span>

              <span
                className={`text-xs font-black ${
                  margenGanancia >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {margenGanancia.toFixed(
                  1
                )}
                %
              </span>
            </div>
          </div>
        </div>

        {!datosSeguros.length ? (
          <div className="flex h-[360px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 text-center text-sm font-bold text-slate-400 backdrop-blur">
            {loading
              ? "Actualizando información financiera..."
              : `No hay información financiera registrada para ${anio}.`}
          </div>
        ) : (
          <>
            <div className="relative min-h-[365px] rounded-3xl border border-white/80 bg-white/55 px-1 pb-1 pt-2 shadow-inner backdrop-blur-sm">
              <Chart
                options={options}
                series={series}
                type="area"
                height={360}
                width="100%"
              />

              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/55 backdrop-blur-[2px]">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xl">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500" />

                    <span className="text-sm font-bold text-slate-600">
                      Actualizando gráfica
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="group rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <DollarSign
                      size={21}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Ingresos anuales
                    </p>

                    <p className="mt-1 text-base font-black text-slate-950">
                      {formatoDinero(
                        totalIngresos,
                        moneda
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      gananciaPositiva
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    <Wallet size={21} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Ganancia real anual
                    </p>

                    <p
                      className={`mt-1 text-base font-black ${
                        gananciaPositiva
                          ? "text-slate-950"
                          : "text-rose-600"
                      }`}
                    >
                      {formatoDinero(
                        totalGanancia,
                        moneda
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-rose-100 bg-white/80 p-4 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                    <Wrench size={21} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Gastos operativos anuales
                    </p>

                    <p className="mt-1 text-base font-black text-slate-950">
                      {formatoDinero(
                        totalGastos,
                        moneda
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FinancialChart;