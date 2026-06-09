import {
  AlertTriangle,
  Bell,
  CarTaxiFront,
  ChevronRight,
  CircleDollarSign,
  Fuel,
  Gauge,
  HandCoins,
  Info,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
  MoreHorizontal,
} from "lucide-react";

const summaryCards = [
  {
    title: "Ingreso del día",
    value: "C$ 2,850.00",
    change: "12% vs ayer",
    icon: CircleDollarSign,
    iconBox: "bg-green-100 text-green-600",
    valueColor: "text-green-600",
  },
  {
    title: "Ganancia del dueño",
    value: "C$ 1,995.00",
    change: "10% vs ayer",
    icon: Wallet,
    iconBox: "bg-blue-100 text-blue-600",
    valueColor: "text-blue-600",
  },
  {
    title: "Pago a taxistas (30%)",
    value: "C$ 855.00",
    change: "12% vs ayer",
    icon: Users,
    iconBox: "bg-yellow-100 text-yellow-600",
    valueColor: "text-orange-500",
  },
  {
    title: "Km recorridos hoy",
    value: "245 km",
    change: "8% vs ayer",
    icon: Gauge,
    iconBox: "bg-purple-100 text-purple-600",
    valueColor: "text-purple-600",
  },
];

const jornadas = [
  {
    nombre: "Juan Pérez",
    taxi: "Taxi 001",
    estado: "Completada",
    monto: "C$ 950.00",
    badge: "bg-green-100 text-green-700",
  },
  {
    nombre: "María López",
    taxi: "Taxi 002",
    estado: "Completada",
    monto: "C$ 850.00",
    badge: "bg-green-100 text-green-700",
  },
  {
    nombre: "Carlos Ruiz",
    taxi: "Taxi 003",
    estado: "En proceso",
    monto: "C$ 650.00",
    badge: "bg-yellow-100 text-yellow-700",
  },
  {
    nombre: "Pedro Sánchez",
    taxi: "Taxi 004",
    estado: "Pendiente",
    monto: "-",
    badge: "bg-slate-100 text-slate-600",
  },
];

const gastos = [
  {
    label: "Combustible",
    registros: "3 registros",
    monto: "C$ 750.00",
    icon: Fuel,
    color: "bg-red-100 text-red-500",
  },
  {
    label: "Mantenimiento",
    registros: "1 registro",
    monto: "C$ 250.00",
    icon: Wrench,
    color: "bg-blue-100 text-blue-500",
  },
  {
    label: "Reparaciones",
    registros: "1 registro",
    monto: "C$ 180.00",
    icon: CarTaxiFront,
    color: "bg-sky-100 text-sky-600",
  },
  {
    label: "Otros",
    registros: "2 registros",
    monto: "C$ 120.00",
    icon: MoreHorizontal,
    color: "bg-slate-100 text-slate-600",
  },
];

const alertas = [
  {
    title: "2 vehículos próximos a cambio de aceite",
    description: "Revisa el módulo de mantenimiento",
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-500",
  },
  {
    title: "1 vehículo con mantenimiento vencido",
    description: "Requiere atención inmediata",
    icon: Bell,
    color: "bg-red-100 text-red-500",
  },
  {
    title: "3 adelantos pendientes por cobrar",
    description: "Revisa el módulo de adelantos",
    icon: Info,
    color: "bg-blue-100 text-blue-600",
  },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${card.iconBox}`}
                >
                  <Icon size={30} strokeWidth={2.4} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700">
                    {card.title}
                  </p>

                  <h3
                    className={`mt-2 text-2xl font-black ${card.valueColor}`}
                  >
                    {card.value}
                  </h3>

                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                    <TrendingUp size={16} className="text-green-600" />
                    {card.change}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-950">
              Resumen semanal
            </h3>

            <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-2">
                <span className="h-2 w-5 rounded-full bg-yellow-400" />
                Ingresos
              </span>

              <span className="flex items-center gap-2">
                <span className="h-2 w-5 rounded-full bg-green-500" />
                Ganancia
              </span>
            </div>
          </div>

          <div className="relative h-[250px] overflow-hidden">
            <div className="absolute inset-x-0 top-4 h-px bg-slate-200" />
            <div className="absolute inset-x-0 top-[65px] h-px bg-slate-200" />
            <div className="absolute inset-x-0 top-[116px] h-px bg-slate-200" />
            <div className="absolute inset-x-0 top-[167px] h-px bg-slate-200" />
            <div className="absolute inset-x-0 bottom-8 h-px bg-slate-200" />

            <div className="absolute left-0 top-0 flex h-full flex-col justify-between pb-8 text-sm text-slate-500">
              <span>C$ 4,000</span>
              <span>C$ 3,000</span>
              <span>C$ 2,000</span>
              <span>C$ 1,000</span>
              <span>C$ 0</span>
            </div>

            <div className="ml-20 flex h-full items-end justify-between gap-5 pb-8">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
                (day, index) => {
                  const ingresos = [95, 122, 142, 153, 128, 180, 118][index];
                  const ganancia = [45, 65, 78, 85, 68, 104, 55][index];

                  return (
                    <div
                      key={day}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div className="flex h-[190px] w-full items-end justify-center gap-2">
                        <div
                          className="w-3 rounded-t-full bg-yellow-400"
                          style={{ height: `${ingresos}%` }}
                        />
                        <div
                          className="w-3 rounded-t-full bg-green-500"
                          style={{ height: `${ganancia}%` }}
                        />
                      </div>

                      <span className="text-sm font-medium text-slate-500">
                        {day}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-950">
              Alertas y Notificaciones
            </h3>

            <button className="text-sm font-bold text-blue-600">
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {alertas.map((alerta) => {
              const Icon = alerta.icon;

              return (
                <button
                  key={alerta.title}
                  type="button"
                  className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:bg-slate-50"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${alerta.color}`}
                  >
                    <Icon size={24} strokeWidth={2.4} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">
                      {alerta.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {alerta.description}
                    </p>
                  </div>

                  <ChevronRight size={20} className="text-slate-500" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-950">
              Jornadas de hoy
            </h3>

            <button className="text-sm font-bold text-blue-600">
              Ver todas
            </button>
          </div>

          <div className="space-y-4">
            {jornadas.map((jornada, index) => (
              <div
                key={jornada.nombre}
                className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-sm font-black text-slate-900">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-900">
                    {jornada.nombre}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {jornada.taxi}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${jornada.badge}`}
                >
                  {jornada.estado}
                </span>

                <p className="w-20 text-right text-sm font-black text-slate-900">
                  {jornada.monto}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-950">
              Gastos del día
            </h3>

            <button className="text-sm font-bold text-blue-600">
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {gastos.map((gasto) => {
              const Icon = gasto.icon;

              return (
                <div
                  key={gasto.label}
                  className="flex items-center gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${gasto.color}`}
                  >
                    <Icon size={23} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">
                      {gasto.label}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {gasto.registros}
                    </p>
                  </div>

                  <p className="font-black text-slate-950">
                    {gasto.monto}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="font-black text-slate-900">Total gastos</p>
            <p className="font-black text-red-500">C$ 1,300.00</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-950">
              Estado de vehículos
            </h3>

            <button className="text-sm font-bold text-blue-600">
              Ver todas
            </button>
          </div>

          <div className="flex flex-col items-center gap-6 md:flex-row xl:flex-col 2xl:flex-row">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-[conic-gradient(#39C636_0_62%,#F4C400_62%_87%,#F43F5E_87%_100%)]">
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-4xl font-black text-slate-950">8</span>
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
                  <p className="font-black text-slate-900">5 (62.5%)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded bg-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Próx. mantenimiento
                  </p>
                  <p className="font-black text-slate-900">2 (25%)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded bg-rose-500" />
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Mantenimiento vencido
                  </p>
                  <p className="font-black text-slate-900">1 (12.5%)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;