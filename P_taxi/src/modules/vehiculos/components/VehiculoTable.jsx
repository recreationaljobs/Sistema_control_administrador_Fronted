import {
  AlertTriangle,
  CarTaxiFront,
  Edit3,
  FileText,
  Gauge,
  MapPin,
  Trash2,
  Wrench,
} from "lucide-react";

const TIPOS_DOCUMENTOS = [
  {
    codigo: "inspeccion_mecanica",
    nombre: "Inspección",
  },
  {
    codigo: "emision_gases",
    nombre: "Emisión de gases",
  },
  {
    codigo: "seguro_vehicular",
    nombre: "Seguro vehicular",
  },
  {
    codigo: "seguro_pasajero",
    nombre: "Seguro pasajero",
  },
];

const ESTILOS_ESTADO_DOCUMENTO = {
  vigente: {
    contenedor:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    punto: "bg-emerald-500",
  },

  por_vencer: {
    contenedor:
      "border-amber-200 bg-amber-50 text-amber-700",
    punto: "bg-amber-500",
  },

  vencido: {
    contenedor:
      "border-red-200 bg-red-50 text-red-700",
    punto: "bg-red-500",
  },

  sin_registrar: {
    contenedor:
      "border-slate-200 bg-slate-100 text-slate-600",
    punto: "bg-slate-400",
  },
};

const obtenerEstadoDocumento = (
  vehiculo,
  codigo
) => {
  const documento =
    vehiculo?.estado_documental?.[
      codigo
    ];

  if (!documento) {
    return {
      estado: "sin_registrar",
      estado_nombre: "Sin registrar",
      fecha_vencimiento: null,
    };
  }

  return {
    estado:
      documento.estado ||
      "sin_registrar",

    estado_nombre:
      documento.estado_nombre ||
      "Sin registrar",

    fecha_vencimiento:
      documento.fecha_vencimiento ||
      null,
  };
};

const formatearKilometraje = (
  valor
) => {
  const numero = Number(valor || 0);

  if (!Number.isFinite(numero)) {
    return "0";
  }

  return numero.toLocaleString(
    "es-NI"
  );
};

const VehiculoTable = ({
  vehiculos = [],
  loading = false,
  onEdit,
  onDelete,
  onDocumentos,
  esTaxista = false,
}) => {
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

        <p className="mt-2 text-sm font-medium text-slate-500">
          Registra vehículos para poder
          asignarlos a conductores y
          jornadas.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Vehículo
              </th>

              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Kilometraje
              </th>

              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Mantenimiento
              </th>

              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Estado documental
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
            {vehiculos.map(
              (vehiculo) => {
                const alertaAceite =
                  vehiculo.necesita_cambio_aceite ||
                  vehiculo.alerta_cambio_aceite;

                const alertaMantenimiento =
                  vehiculo.necesita_mantenimiento ||
                  vehiculo.alerta_mantenimiento;

                return (
                  <tr
                    key={vehiculo.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFE7A3] text-slate-900">
                          <CarTaxiFront
                            size={22}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-900">
                            {vehiculo.numero ||
                              "Sin número"}{" "}
                            -{" "}
                            {vehiculo.placa ||
                              "Sin placa"}
                          </p>

                          <p className="mt-1 truncate text-xs font-medium text-slate-500">
                            {[
                              vehiculo.marca,
                              vehiculo.modelo,
                              vehiculo.anio,
                            ]
                              .filter(Boolean)
                              .join(" · ") ||
                              "Datos no registrados"}
                          </p>

                          {vehiculo.color && (
                            <p className="mt-1 truncate text-xs font-medium text-slate-400">
                              {vehiculo.color}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                        <Gauge size={14} />

                        {formatearKilometraje(
                          vehiculo.kilometraje_actual
                        )}{" "}
                        km
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="space-y-2">
                        <div>
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${
                              alertaAceite
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {alertaAceite ? (
                              <AlertTriangle
                                size={14}
                              />
                            ) : (
                              <Wrench
                                size={14}
                              />
                            )}

                            Aceite:{" "}
                            {formatearKilometraje(
                              vehiculo.faltan_km_cambio_aceite
                            )}{" "}
                            km
                          </span>
                        </div>

                        <div>
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${
                              alertaMantenimiento
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {alertaMantenimiento ? (
                              <AlertTriangle
                                size={14}
                              />
                            ) : (
                              <Wrench
                                size={14}
                              />
                            )}

                            Mant.:{" "}
                            {formatearKilometraje(
                              vehiculo.faltan_km_mantenimiento
                            )}{" "}
                            km
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="min-w-[235px] space-y-1.5">
                        {TIPOS_DOCUMENTOS.map(
                          (tipo) => {
                            const documento =
                              obtenerEstadoDocumento(
                                vehiculo,
                                tipo.codigo
                              );

                            const estilos =
                              ESTILOS_ESTADO_DOCUMENTO[
                                documento.estado
                              ] ||
                              ESTILOS_ESTADO_DOCUMENTO
                                .sin_registrar;

                            return (
                              <div
                                key={
                                  tipo.codigo
                                }
                                className="flex items-center justify-between gap-3"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <span
                                    className={`h-2 w-2 shrink-0 rounded-full ${estilos.punto}`}
                                  />

                                  <p className="truncate text-[11px] font-bold text-slate-600">
                                    {
                                      tipo.nombre
                                    }
                                  </p>
                                </div>

                                <span
                                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${estilos.contenedor}`}
                                >
                                  {
                                    documento.estado_nombre
                                  }
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <MapPin
                          size={15}
                          className="shrink-0 text-slate-400"
                        />

                        <span className="max-w-[180px] truncate">
                          {vehiculo.sucursal_nombre ||
                            "Panel superadmin"}
                        </span>
                      </p>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              typeof onDocumentos ===
                              "function"
                            ) {
                              onDocumentos(
                                vehiculo
                              );
                            }
                          }}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition hover:-translate-y-0.5 hover:bg-violet-100 focus:outline-none focus:ring-4 focus:ring-violet-100"
                          title={
                            esTaxista
                              ? "Consultar documentación"
                              : "Gestionar documentación"
                          }
                          aria-label={
                            esTaxista
                              ? "Consultar documentación"
                              : "Gestionar documentación"
                          }
                        >
                          <FileText
                            size={18}
                          />
                        </button>

                        {!esTaxista && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  typeof onEdit ===
                                  "function"
                                ) {
                                  onEdit(
                                    vehiculo
                                  );
                                }
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:-translate-y-0.5 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
                              title="Editar vehículo"
                              aria-label="Editar vehículo"
                            >
                              <Edit3
                                size={18}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  typeof onDelete ===
                                  "function"
                                ) {
                                  onDelete(
                                    vehiculo
                                  );
                                }
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100"
                              title="Eliminar vehículo"
                              aria-label="Eliminar vehículo"
                            >
                              <Trash2
                                size={18}
                              />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehiculoTable;