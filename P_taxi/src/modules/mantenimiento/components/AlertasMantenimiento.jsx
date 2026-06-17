import { AlertTriangle, CarTaxiFront, Gauge, Wrench } from "lucide-react";

const AlertasMantenimiento = ({ vehiculos = [], loading = false }) => {
  const alertas = vehiculos.filter((vehiculo) => {
    return (
      vehiculo.necesita_cambio_aceite ||
      vehiculo.necesita_mantenimiento ||
      vehiculo.alerta_cambio_aceite ||
      vehiculo.alerta_mantenimiento
    );
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-slate-500">
          Cargando alertas de mantenimiento...
        </p>
      </div>
    );
  }

  if (!alertas.length) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Wrench size={24} />
          </div>

          <div>
            <h3 className="text-base font-black text-emerald-900">
              Sin alertas de mantenimiento
            </h3>

            <p className="mt-1 text-sm font-medium text-emerald-700">
              No hay vehículos con mantenimiento o cambio de aceite pendiente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertTriangle size={24} />
        </div>

        <div>
          <h3 className="text-base font-black text-amber-950">
            Alertas de mantenimiento
          </h3>

          <p className="text-sm font-medium text-amber-700">
            Vehículos próximos o vencidos para mantenimiento.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {alertas.map((vehiculo) => (
          <div
            key={vehiculo.id}
            className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFE7A3] text-slate-900">
                <CarTaxiFront size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-950">
                  {vehiculo.numero} - {vehiculo.placa}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {vehiculo.marca} {vehiculo.modelo}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {vehiculo.necesita_cambio_aceite && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                      Cambio de aceite vencido
                    </span>
                  )}

                  {!vehiculo.necesita_cambio_aceite &&
                    vehiculo.alerta_cambio_aceite && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                        Próximo cambio de aceite
                      </span>
                    )}

                  {vehiculo.necesita_mantenimiento && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                      Mantenimiento vencido
                    </span>
                  )}

                  {!vehiculo.necesita_mantenimiento &&
                    vehiculo.alerta_mantenimiento && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                        Próximo mantenimiento
                      </span>
                    )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 text-xs font-bold text-slate-600 sm:grid-cols-2">
                  <p className="flex items-center gap-2">
                    <Gauge size={15} />
                    Actual: {vehiculo.kilometraje_actual || 0} km
                  </p>

                  <p>
                    Aceite en: {vehiculo.faltan_km_cambio_aceite ?? 0} km
                  </p>

                  <p>
                    Mant. en: {vehiculo.faltan_km_mantenimiento ?? 0} km
                  </p>

                  <p>Alerta previa: {vehiculo.alerta_previa_km || 0} km</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AlertasMantenimiento;