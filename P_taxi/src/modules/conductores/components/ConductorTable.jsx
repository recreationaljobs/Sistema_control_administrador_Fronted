import { Pencil, Trash2, AlertTriangle } from "lucide-react";

const getDaysUntilExpiry = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr + "T00:00:00");
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

const ExpiryBadge = ({ dateStr }) => {
  if (!dateStr) return <span className="text-slate-400">—</span>;

  const days = getDaysUntilExpiry(dateStr);
  const formatted = new Date(dateStr + "T00:00:00").toLocaleDateString("es-ES");

  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
        <AlertTriangle size={12} />
        Vencida ({formatted})
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

  return <span className="text-sm text-slate-700">{formatted}</span>;
};

const HEADERS = ["Nombre completo", "Cédula", "Licencia", "Venc. licencia", "% Pago", "Acciones"];

const ConductorTable = ({ conductores, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100">
        <thead>
          <tr className="bg-slate-50">
            {HEADERS.map((h) => (
              <th
                key={h}
                className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {conductores.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50/60 transition">
              <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                {c.nombre} {c.apellido}
              </td>
              <td className="px-5 py-4 text-sm text-slate-700">{c.cedula}</td>
              <td className="px-5 py-4 text-sm text-slate-700">{c.licencia}</td>
              <td className="px-5 py-4">
                <ExpiryBadge dateStr={c.vencimiento_licencia} />
              </td>
              <td className="px-5 py-4 text-sm text-slate-700">
                {c.porcentaje_pago ?? 30}%
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(c)}
                    className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700 transition"
                    aria-label="Editar conductor"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(c)}
                    className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                    aria-label="Eliminar conductor"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConductorTable;
