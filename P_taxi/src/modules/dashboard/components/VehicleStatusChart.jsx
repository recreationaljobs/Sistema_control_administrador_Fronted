import { useMemo } from "react";

import Chart from "react-apexcharts";

import {
  CarTaxiFront,
  CheckCircle2,
  Clock3,
  History,
  TriangleAlert,
} from "lucide-react";

const numeroSeguro = (valor) => {
  const numero = Number(valor ?? 0);

  return Number.isFinite(numero)
    ? numero
    : 0;
};

const calcularPorcentaje = (
  cantidad,
  total
) => {
  if (!total) {
    return 0;
  }

  return (
    numeroSeguro(cantidad) /
    total
  ) * 100;
};

const VehicleStatusChart = ({
  estado = {},
}) => {
  const datos = useMemo(() => {
    const buenEstado =
      numeroSeguro(
        estado?.buenEstado
      );

    const proximos =
      numeroSeguro(
        estado?.proximos
      );

    const vencidos =
      numeroSeguro(
        estado?.vencidos
      );

    const sinHistorial =
      numeroSeguro(
        estado?.sinHistorial
      );

    const sumaEstados =
      buenEstado +
      proximos +
      vencidos +
      sinHistorial;

    const total =
      numeroSeguro(
        estado?.total
      ) || sumaEstados;

    return {
      total,
      buenEstado,
      proximos,
      vencidos,
      sinHistorial,

      series: [
        buenEstado,
        proximos,
        vencidos,
        sinHistorial,
      ],
    };
  }, [estado]);

  const elementos = useMemo(
    () => [
      {
        nombre: "En buen estado",

        descripcion:
          "El vehículo se encuentra dentro del kilometraje permitido.",

        cantidad:
          datos.buenEstado,

        color: "#22C55E",

        fondo:
          "bg-emerald-50",

        texto:
          "text-emerald-700",

        Icono:
          CheckCircle2,
      },
      {
        nombre:
          "Próximo mantenimiento",

        descripcion:
          "El vehículo está cerca del kilometraje configurado.",

        cantidad:
          datos.proximos,

        color: "#F5B800",

        fondo:
          "bg-amber-50",

        texto:
          "text-amber-700",

        Icono:
          Clock3,
      },
      {
        nombre:
          "Mantenimiento vencido",

        descripcion:
          "El vehículo superó el kilometraje definido para su servicio.",

        cantidad:
          datos.vencidos,

        color: "#F43F5E",

        fondo:
          "bg-rose-50",

        texto:
          "text-rose-700",

        Icono:
          TriangleAlert,
      },
      {
        nombre:
          "Sin historial suficiente",

        descripcion:
          "No existe un mantenimiento finalizado para calcular su estado.",

        cantidad:
          datos.sinHistorial,

        color: "#94A3B8",

        fondo:
          "bg-slate-100",

        texto:
          "text-slate-700",

        Icono:
          History,
      },
    ],
    [datos]
  );

  const options = useMemo(
    () => ({
      chart: {
        type: "donut",

        animations: {
          enabled: false,
        },

        toolbar: {
          show: false,
        },

        fontFamily:
          "Inter, system-ui, sans-serif",
      },

      labels:
        elementos.map(
          (item) =>
            item.nombre
        ),

      colors:
        elementos.map(
          (item) =>
            item.color
        ),

      stroke: {
        show: true,
        width: 6,

        colors: [
          "#FFFFFF",
        ],
      },

      dataLabels: {
        enabled: true,

        formatter: (
          porcentaje
        ) => {
          if (
            porcentaje < 8
          ) {
            return "";
          }

          return `${Math.round(
            porcentaje
          )}%`;
        },

        style: {
          fontSize: "13px",
          fontWeight: 800,

          colors: [
            "#FFFFFF",
          ],
        },

        dropShadow: {
          enabled: false,
        },
      },

      legend: {
        show: false,
      },

      plotOptions: {
        pie: {
          expandOnClick:
            false,

          donut: {
            size: "72%",

            labels: {
              show: true,

              name: {
                show: true,
                offsetY: 24,
                color: "#64748B",
                fontSize: "12px",
                fontWeight: 600,

                formatter: () =>
                  "Vehículos",
              },

              value: {
                show: true,
                offsetY: -12,
                color: "#0F172A",
                fontSize: "34px",
                fontWeight: 900,

                formatter: () =>
                  String(
                    datos.total
                  ),
              },

              total: {
                show: true,
                showAlways: true,
                label: "Vehículos",
                color: "#64748B",
                fontSize: "12px",
                fontWeight: 600,

                formatter: () =>
                  String(
                    datos.total
                  ),
              },
            },
          },
        },
      },

      tooltip: {
        enabled: true,

        fillSeriesColor:
          false,

        theme: "light",

        y: {
          formatter: (
            valor,
            context
          ) => {
            const porcentaje =
              calcularPorcentaje(
                valor,
                datos.total
              );

            const nombre =
              elementos[
                context
                  .seriesIndex
              ]?.nombre || "";

            return (
              `${valor} vehículo(s) · ` +
              `${porcentaje.toFixed(
                1
              )}% · ${nombre}`
            );
          },

          title: {
            formatter: () =>
              "",
          },
        },

        style: {
          fontSize: "13px",
        },
      },

      states: {
        hover: {
          filter: {
            type: "lighten",
            value: 0.08,
          },
        },

        active: {
          filter: {
            type: "none",
          },
        },
      },

      responsive: [
        {
          breakpoint: 640,

          options: {
            chart: {
              height: 260,
            },

            plotOptions: {
              pie: {
                donut: {
                  size: "68%",
                },
              },
            },
          },
        },
      ],
    }),
    [
      datos.total,
      elementos,
    ]
  );

  const soloSinHistorial =
    datos.total > 0 &&
    datos.sinHistorial ===
      datos.total;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-100/50 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-amber-100/50 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-950">
              Estado de vehículos
            </h3>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Estado calculado según
              mantenimiento y kilometraje.
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-black text-slate-700 shadow-sm backdrop-blur">
            {datos.total} total
          </span>
        </div>

        {!datos.total ? (
          <div className="flex min-h-[330px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
              <CarTaxiFront
                size={30}
              />
            </div>

            <p className="mt-4 text-sm font-black text-slate-700">
              No hay vehículos
              registrados
            </p>

            <p className="mt-2 max-w-xs text-xs font-medium leading-5 text-slate-500">
              La gráfica aparecerá
              cuando exista al menos
              un vehículo registrado.
            </p>
          </div>
        ) : (
          <>
            <div className="mx-auto max-w-[310px]">
              <Chart
                options={options}
                series={
                  datos.series
                }
                type="donut"
                height={285}
                width="100%"
              />
            </div>

            <div className="mt-1 grid gap-3">
              {elementos.map(
                ({
                  nombre,
                  descripcion,
                  cantidad,
                  color,
                  fondo,
                  texto,
                  Icono,
                }) => {
                  const porcentaje =
                    calcularPorcentaje(
                      cantidad,
                      datos.total
                    );

                  return (
                    <div
                      key={nombre}
                      className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/80 p-3 transition duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${fondo} ${texto}`}
                      >
                        <Icono
                          size={19}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-extrabold text-slate-800">
                            {nombre}
                          </p>

                          <p className="shrink-0 text-sm font-black text-slate-950">
                            {cantidad}
                          </p>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width:
                                `${porcentaje}%`,

                              background:
                                color,
                            }}
                          />
                        </div>

                        <div className="mt-1.5 flex items-start justify-between gap-3">
                          <p className="text-[11px] font-medium leading-4 text-slate-500">
                            {descripcion}
                          </p>

                          <span className="shrink-0 text-[11px] font-black text-slate-500">
                            {porcentaje.toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {soloSinHistorial && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3">
                <p className="text-xs font-extrabold text-blue-800">
                  ¿Por qué toda la
                  rueda está gris?
                </p>

                <p className="mt-1 text-xs font-medium leading-5 text-blue-700">
                  Los {datos.total} vehículos
                  todavía no tienen un
                  mantenimiento finalizado
                  
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleStatusChart;