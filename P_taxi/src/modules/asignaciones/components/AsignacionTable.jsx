// src/modules/asignaciones/components/AsignacionTable.jsx

import {
  Building2,
  CalendarDays,
  CarTaxiFront,
  Edit3,
  Loader2,
  Power,
  Route,
  Trash2,
  UserRound,
} from "lucide-react";

const formatearFecha = (fecha) => {
  if (!fecha) {
    return "Sin finalizar";
  }

  const valor = String(fecha).slice(0, 10);
  const partes = valor.split("-");

  if (partes.length !== 3) {
    return String(fecha);
  }

  const [anio, mes, dia] = partes;

  return `${dia}/${mes}/${anio}`;
};

const obtenerNombreConductor = (
  asignacion
) => {
  return (
    asignacion.conductor_nombre ||
    asignacion.nombre_conductor ||
    "Sin conductor"
  );
};

const obtenerNombreVehiculo = (
  asignacion
) => {
  const identificacion = [
    asignacion.vehiculo_numero,
    asignacion.vehiculo_placa,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    identificacion ||
    asignacion.vehiculo_nombre ||
    "Sin vehículo"
  );
};

const EstadoAsignacion = ({
  activa,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${
        activa
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          activa
            ? "bg-emerald-500"
            : "bg-red-500"
        }`}
      />

      {activa ? "Activa" : "Inactiva"}
    </span>
  );
};

const AsignacionTable = ({
  asignaciones = [],
  loading = false,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2
          size={30}
          className="mx-auto animate-spin text-yellow-500"
        />

        <p className="mt-3 text-sm font-bold text-slate-600">
          Cargando asignaciones...
        </p>

        <p className="mt-1 text-xs font-medium text-slate-400">
          Estamos consultando los
          conductores y vehículos asignados.
        </p>
      </div>
    );
  }

  if (!asignaciones.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
          <Route size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay asignaciones registradas
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Crea una asignación para relacionar
          un conductor con el vehículo que
          utilizará en sus jornadas.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 lg:hidden">
        {asignaciones.map((asignacion) => (
          <article
            key={asignacion.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div
              className={`h-1 w-full ${
                asignacion.activa
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }`}
            />

            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <UserRound size={21} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      {obtenerNombreConductor(
                        asignacion
                      )}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Conductor asignado
                    </p>
                  </div>
                </div>

                <EstadoAsignacion
                  activa={
                    asignacion.activa
                  }
                />
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <CarTaxiFront
                    size={20}
                    className="mt-0.5 shrink-0 text-yellow-600"
                  />

                  <div>
                    <p className="text-sm font-black text-slate-800">
                      {obtenerNombreVehiculo(
                        asignacion
                      )}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {asignacion.vehiculo_descripcion ||
                        "Vehículo asignado"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <CalendarDays
                      size={15}
                      className="text-slate-400"
                    />

                    Inicio:{" "}
                    {formatearFecha(
                      asignacion.fecha_inicio
                    )}
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-600">
                    <CalendarDays
                      size={15}
                      className="text-slate-400"
                    />

                    Final:{" "}
                    {formatearFecha(
                      asignacion.fecha_fin
                    )}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Building2
                    size={15}
                    className="text-slate-400"
                  />

                  {asignacion.sucursal_nombre ||
                    "Panel general"}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() =>
                      onEdit(asignacion)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                    title="Editar"
                    aria-label="Editar asignación"
                  >
                    <Edit3 size={18} />
                  </button>
                )}

                {onToggleStatus && (
                  <button
                    type="button"
                    onClick={() =>
                      onToggleStatus(
                        asignacion
                      )
                    }
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                      asignacion.activa
                        ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                    title={
                      asignacion.activa
                        ? "Desactivar"
                        : "Activar"
                    }
                    aria-label={
                      asignacion.activa
                        ? "Desactivar asignación"
                        : "Activar asignación"
                    }
                  >
                    <Power size={18} />
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={() =>
                      onDelete(asignacion)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                    title="Eliminar"
                    aria-label="Eliminar asignación"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Conductor
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Vehículo
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Fechas
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Sucursal
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Estado
                </th>

                <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {asignaciones.map(
                (asignacion) => (
                  <tr
                    key={asignacion.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <UserRound
                            size={22}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate text-sm font-black text-slate-900">
                            {obtenerNombreConductor(
                              asignacion
                            )}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            ID:{" "}
                            {asignacion.conductor ||
                              "Sin ID"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
                          <CarTaxiFront
                            size={22}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate text-sm font-black text-slate-900">
                            {obtenerNombreVehiculo(
                              asignacion
                            )}
                          </p>

                          <p className="mt-1 max-w-[220px] truncate text-xs font-medium text-slate-500">
                            {asignacion.vehiculo_descripcion ||
                              "Vehículo asignado"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="space-y-1.5">
                        <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />

                          Inicio:{" "}
                          {formatearFecha(
                            asignacion.fecha_inicio
                          )}
                        </p>

                        <p className="pl-6 text-xs font-medium text-slate-500">
                          Final:{" "}
                          {formatearFecha(
                            asignacion.fecha_fin
                          )}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 whitespace-nowrap text-sm font-bold text-slate-700">
                        <Building2
                          size={16}
                          className="text-slate-400"
                        />

                        {asignacion.sucursal_nombre ||
                          "Panel general"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <EstadoAsignacion
                        activa={
                          asignacion.activa
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() =>
                              onEdit(
                                asignacion
                              )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                            title="Editar"
                            aria-label="Editar asignación"
                          >
                            <Edit3
                              size={18}
                            />
                          </button>
                        )}

                        {onToggleStatus && (
                          <button
                            type="button"
                            onClick={() =>
                              onToggleStatus(
                                asignacion
                              )
                            }
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                              asignacion.activa
                                ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            }`}
                            title={
                              asignacion.activa
                                ? "Desactivar"
                                : "Activar"
                            }
                            aria-label={
                              asignacion.activa
                                ? "Desactivar asignación"
                                : "Activar asignación"
                            }
                          >
                            <Power
                              size={18}
                            />
                          </button>
                        )}

                        {onDelete && (
                          <button
                            type="button"
                            onClick={() =>
                              onDelete(
                                asignacion
                              )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                            title="Eliminar"
                            aria-label="Eliminar asignación"
                          >
                            <Trash2
                              size={18}
                            />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AsignacionTable;