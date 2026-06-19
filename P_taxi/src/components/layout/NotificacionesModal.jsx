import { AlertTriangle } from "lucide-react";

const obtenerFechaHoy = () => {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const yaSeVieronNotificaciones = () => {
  return localStorage.getItem(`notif_vistas_${obtenerFechaHoy()}`) === "true";
};

const formatearTimestamp = (valor) => {
  if (!valor) return "";

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor);

  return fecha.toLocaleString("es-NI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificacionesModal = ({ open, alertas = [], onClose }) => {
  if (!open) return null;

  const cerrar = () => {
    localStorage.setItem(`notif_vistas_${obtenerFechaHoy()}`, "true");
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={cerrar}
      />

      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-black text-slate-950">
            Notificaciones pendientes
          </h2>
        </div>

        <div className="flex items-center gap-4 bg-red-500 px-6 py-4 text-white">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <AlertTriangle size={26} />
          </div>

          <div>
            <p className="text-base font-black">Mantenimientos vencidos</p>
            <p className="text-sm font-semibold text-red-50">
              Revisión requerida
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {alertas.map((alerta, index) => {
            const placa = alerta.placa || alerta.vehiculo_placa || "";
            const modelo = alerta.modelo || alerta.vehiculo_modelo || "";
            const tipo =
              alerta.tipo_mantenimiento ||
              alerta.tipo ||
              alerta.nombre_mantenimiento ||
              "mantenimiento";
            const timestamp = formatearTimestamp(
              alerta.fecha || alerta.creado || alerta.timestamp || alerta.fecha_alerta
            );

            return (
              <div
                key={alerta.id ?? index}
                className="rounded-2xl border border-red-200 bg-red-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <AlertTriangle size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-red-700">
                        Mantenimiento vencido
                      </p>

                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                        Requiere atención
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      El vehículo "{placa} - {modelo}" tiene {tipo} vencido.
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-bold text-slate-600">
                      <div>
                        <p className="text-slate-400">Vehículo</p>
                        <p className="text-slate-800">{placa || "—"}</p>
                      </div>

                      <div>
                        <p className="text-slate-400">Tipo</p>
                        <p className="text-slate-800">{tipo}</p>
                      </div>
                    </div>

                    {timestamp && (
                      <p className="mt-3 text-xs font-semibold text-slate-400">
                        {timestamp}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={cerrar}
            className="w-full rounded-2xl bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-600"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificacionesModal;
