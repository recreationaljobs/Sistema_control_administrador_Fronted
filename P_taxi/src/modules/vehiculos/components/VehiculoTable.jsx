import {
  AlertTriangle,
  CarTaxiFront,
  Edit3,
  Gauge,
  MapPin,
  Trash2,
  Wrench,
} from "lucide-react";

const VehiculoTable = ({ vehiculos, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-500">
          Cargando vehículos...
        </p>
      </div>
    );
  }

  if (!vehiculos.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
          <CarTaxiFront size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay vehículos registrados
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Registra vehículos para poder asignarlos a conductores y jornadas.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Vehículo
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Datos
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Kilometraje
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Mantenimiento
              </th>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Ubicación
              </th>
              <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {vehiculos.map((vehiculo) => {
              const alertaAceite =
                vehiculo.necesita_cambio_aceite || vehiculo.alerta_cambio_aceite;

              const alertaMantenimiento =
                vehiculo.necesita_mantenimiento || vehiculo.alerta_mantenimiento;

              return (
                <tr key={vehiculo.id} className="transition hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFE7A3] text-slate-900">
                        <CarTaxiFront size={22} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">
                          {vehiculo.numero} - {vehiculo.placa}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {vehiculo.marca} {vehiculo.modelo} · {vehiculo.anio}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-700">
                        Color: {vehiculo.color || "No registrado"}
                      </p>

                      <p className="text-xs font-medium text-slate-500">
                        Combustible: {vehiculo.tipo_combustible || "No registrado"}
                      </p>

                      <p className="text-xs font-medium text-slate-500">
                        Estado: {vehiculo.estado_nombre || "Sin estado"}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                      <Gauge size={14} />
                      {Number(vehiculo.kilometraje_actual || 0).toLocaleString()} km
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${
                          alertaAceite
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {alertaAceite ? (
                          <AlertTriangle size={14} />
                        ) : (
                          <Wrench size={14} />
                        )}
                        Aceite: {vehiculo.faltan_km_cambio_aceite ?? 0} km
                      </span>

                      <br />

                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${
                          alertaMantenimiento
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {alertaMantenimiento ? (
                          <AlertTriangle size={14} />
                        ) : (
                          <Wrench size={14} />
                        )}
                        Mant.: {vehiculo.faltan_km_mantenimiento ?? 0} km
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <MapPin size={15} className="text-slate-400" />
                      {vehiculo.sucursal_nombre || "Panel superadmin"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(vehiculo)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        title="Editar"
                      >
                        <Edit3 size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(vehiculo)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehiculoTable;