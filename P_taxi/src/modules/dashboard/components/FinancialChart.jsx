import Chart from "react-apexcharts";
import { DollarSign, Wallet, Wrench } from "lucide-react";

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatoDineroCorto = (valor) => {
  const numero = Number(valor || 0);

  if (numero >= 1000000) return `C$ ${(numero / 1000000).toFixed(1)}M`;
  if (numero >= 1000) return `C$ ${(numero / 1000).toFixed(1)}K`;

  return `C$ ${numero.toFixed(0)}`;
};

const FinancialChart = ({ datos = [] }) => {
  const datosSeguros = Array.isArray(datos) ? datos : [];

  const categorias = datosSeguros.map((item) => item.label || "");
  const ingresos = datosSeguros.map((item) => Number(item.ingreso || 0));
  const ganancias = datosSeguros.map((item) => Number(item.ganancia || 0));
  const gastos = datosSeguros.map((item) => Number(item.gastos || 0));

  const totalIngresos = ingresos.reduce((total, valor) => total + valor, 0);
  const totalGanancia = ganancias.reduce((total, valor) => total + valor, 0);
  const totalGastos = gastos.reduce((total, valor) => total + valor, 0);

  const options = {
    chart: {
      type: "area",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      fontFamily: "Inter, system-ui, sans-serif",
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    colors: ["#F5B800", "#22C55E", "#EF4444"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0,
        stops: [0, 95, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
    xaxis: {
      categories: categorias,
      labels: {
        style: {
          colors: "#64748b",
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
    },
    yaxis: {
      labels: {
        formatter: (value) => formatoDineroCorto(value),
        style: {
          colors: "#64748b",
          fontSize: "12px",
          fontWeight: 700,
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "13px",
      fontWeight: 700,
      labels: {
        colors: "#334155",
      },
    },
    tooltip: {
      theme: "dark",
      shared: true,
      y: {
        formatter: (value) => formatoDinero(value),
      },
    },
  };

  const series = [
    {
      name: "Ingresos",
      data: ingresos,
    },
    {
      name: "Ganancia real",
      data: ganancias,
    },
    {
      name: "Gastos operativos",
      data: gastos,
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">
            Resumen financiero mensual
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Ingresos, ganancia real y gastos operativos por mes.
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-xl font-extrabold text-emerald-600">
            {formatoDinero(totalGanancia)}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Ganancia real acumulada
          </p>
        </div>
      </div>

      {!datosSeguros.length ? (
        <div className="flex h-[340px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-400">
          No hay datos financieros registrados aún.
        </div>
      ) : (
        <>
          <Chart options={options} series={series} type="area" height={340} />

          <div className="mx-auto -mt-2 grid w-full max-w-3xl grid-cols-1 gap-4 rounded-3xl border border-slate-100 bg-slate-50 px-6 py-4 shadow-sm md:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5B800] text-white">
                <DollarSign size={22} />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Ingresos
                </p>

                <p className="text-base font-extrabold text-slate-900">
                  {formatoDinero(totalIngresos)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <Wallet size={22} />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Ganancia real
                </p>

                <p className="text-base font-extrabold text-slate-900">
                  {formatoDinero(totalGanancia)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white">
                <Wrench size={22} />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Gastos operativos
                </p>

                <p className="text-base font-extrabold text-slate-900">
                  {formatoDinero(totalGastos)}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialChart;