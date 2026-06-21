import { CarTaxiFront } from "lucide-react";

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const obtenerBadge = (estadoCodigo = "", estadoNombre = "") => {
  const value = `${estadoCodigo} ${estadoNombre}`.toLowerCase();

  if (value.includes("cerrada") || value.includes("completa")) {
    return "bg-green-100 text-green-700";
  }

  if (value.includes("abierta") || value.includes("proceso")) {
    return "bg-yellow-100 text-yellow-700";
  }

  if (value.includes("anulada")) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
};

const RecentJornadas = ({
  jornadas = [],
  titulo = "Jornadas de hoy",}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-950">
          {titulo}
        </h3>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
          {jornadas.length} registro(s)
        </span>
      </div>

      {!jornadas.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
            <CarTaxiFront size={28} />
          </div>

          <p className="mt-4 text-sm font-bold text-slate-500">
            No hay jornadas registradas hoy.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jornadas.slice(0, 6).map((jornada, index) => {
            const badge = obtenerBadge(
              jornada.estado_codigo,
              jornada.estado_nombre
            );

            return (
              <div
                key={jornada.id}
                className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-sm font-black text-slate-900">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-900">
                    {jornada.conductor_nombre || "Sin conductor"}
                  </p>

                  <p className="truncate text-xs font-medium text-slate-500">
                    {jornada.vehiculo_descripcion ||
                      jornada.vehiculo_placa ||
                      "Sin vehículo"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${badge}`}
                >
                  {jornada.estado_nombre || "Sin estado"}
                </span>

                <p className="w-24 text-right text-sm font-black text-slate-900">
                  {formatoDinero(jornada.ingreso_bruto)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentJornadas;