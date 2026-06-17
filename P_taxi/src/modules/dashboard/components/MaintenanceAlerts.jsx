import { AlertTriangle, Bell, ChevronRight, Wrench } from "lucide-react";

const MaintenanceAlerts = ({ alertas = [], totalAlertas = 0 }) => {
  if (!alertas.length && !totalAlertas) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-950">
            Alertas y notificaciones
          </h3>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Wrench size={24} />
            </div>

            <div>
              <p className="font-black text-emerald-900">
                Sin alertas de mantenimiento
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">
                Los vehículos no tienen alertas pendientes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const primerasAlertas = alertas.slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-950">
          Alertas y notificaciones
        </h3>

        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
          {totalAlertas || alertas.length} alerta(s)
        </span>
      </div>

      <div className="space-y-3">
        {primerasAlertas.map((alerta, index) => {
          const danger = alerta.nivel === "danger";
          const Icon = danger ? Bell : AlertTriangle;

          return (
            <button
              key={`${alerta.vehiculo_id}-${alerta.tipo}-${index}`}
              type="button"
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:bg-slate-50"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                  danger
                    ? "bg-red-100 text-red-600"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                <Icon size={24} strokeWidth={2.4} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">
                  {alerta.tipo || "Alerta de mantenimiento"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Vehículo {alerta.vehiculo || "sin placa"} · Faltan{" "}
                  {alerta.faltan_km ?? 0} km
                </p>
              </div>

              <ChevronRight size={20} className="text-slate-500" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MaintenanceAlerts;