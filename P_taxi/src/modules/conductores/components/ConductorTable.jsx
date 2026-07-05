
import {
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";

const getDaysUntilExpiry = (dateStr) => {
  if (!dateStr) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(
    `${dateStr}T00:00:00`
  );

  return Math.ceil(
    (expiry - today) /
      (1000 * 60 * 60 * 24)
  );
};

const ExpiryBadge = ({ dateStr }) => {
  if (!dateStr) {
    return (
      <span className="text-slate-400">
        —
      </span>
    );
  }

  const days = getDaysUntilExpiry(
    dateStr
  );

  const formatted = new Date(
    `${dateStr}T00:00:00`
  ).toLocaleDateString(
    "es-NI"
  );

  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
        <AlertTriangle size={12} />
        Vencida ({formatted})
      </span>
    );
  }

  if (days === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
        <AlertTriangle size={12} />
        Vence hoy
      </span>
    );
  }

  if (days <= 30) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
        <AlertTriangle size={12} />
        {formatted} · {days}d
      </span>
    );
  }

  return (
    <span className="text-sm text-slate-700">
      {formatted}
    </span>
  );
};

const HEADERS = [
  "Nombre completo",
  "Cédula",
  "Licencia",
  "Venc. licencia",
  "%",
  "Acciones",
];

const ConductorTable = ({
  conductores = [],
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50">
              {HEADERS.map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {conductores.map(
              (conductor) => {
                const numeroLicencia =
                  conductor.numero_licencia ||
                  conductor.licencia ||
                  "—";

                const fechaVencimiento =
                  conductor.fecha_vencimiento_licencia ||
                  conductor.vencimiento_licencia ||
                  null;

                return (
                  <tr
                    key={conductor.id}
                    className="transition hover:bg-slate-50/60"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                      {conductor.nombre}{" "}
                      {conductor.apellido}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                      {conductor.cedula ||
                        "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-700">
                      {numeroLicencia}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <ExpiryBadge
                        dateStr={
                          fechaVencimiento
                        }
                      />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-700">
                      {conductor.porcentaje_pago !=
                        null &&
                      conductor.porcentaje_pago !==
                        ""
                        ? `${conductor.porcentaje_pago}%`
                        : "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onEdit(
                              conductor
                            )
                          }
                          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700"
                          aria-label="Editar conductor"
                          title="Editar conductor"
                        >
                          <Pencil
                            size={15}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onDelete(
                              conductor
                            )
                          }
                          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          aria-label="Eliminar conductor"
                          title="Eliminar conductor"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }
            )}

            {!conductores.length && (
              <tr>
                <td
                  colSpan={HEADERS.length}
                  className="px-5 py-12 text-center text-sm font-semibold text-slate-400"
                >
                  No hay conductores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConductorTable;

