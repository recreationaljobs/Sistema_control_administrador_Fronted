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

const normalizarAsignaciones = (data) => {
  if (Array.isArray(data)) {
    return data.filter(Boolean);
  }

  if (Array.isArray(data?.results)) {
    return data.results.filter(Boolean);
  }

  if (Array.isArray(data?.data)) {
    return data.data.filter(Boolean);
  }

  if (Array.isArray(data?.data?.results)) {
    return data.data.results.filter(
      Boolean
    );
  }

  return [];
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return "Sin fecha";
  }

  const valor = String(fecha).slice(
    0,
    10
  );

  const partes = valor.split("-");

  if (partes.length !== 3) {
    return valor;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const obtenerEstado = (asignacion) => {
  const valor =
    asignacion?.activa ??
    asignacion?.activo ??
    asignacion?.is_active;

  return (
    valor === true ||
    valor === 1 ||
    valor === "1" ||
    String(valor).toLowerCase() ===
      "true"
  );
};

const obtenerConductor = (
  asignacion
) => {
  return (
    asignacion?.conductor_nombre ||
    asignacion?.conductor?.nombre_completo ||
    [
      asignacion?.conductor?.nombre,
      asignacion?.conductor?.apellido,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Sin conductor"
  );
};

const obtenerCedula = (asignacion) => {
  return (
    asignacion?.conductor_cedula ||
    asignacion?.conductor?.cedula ||
    ""
  );
};

const obtenerVehiculo = (
  asignacion
) => {
  return (
    asignacion?.vehiculo_numero ||
    asignacion?.vehiculo?.numero_unidad ||
    asignacion?.vehiculo?.numero ||
    "Sin número"
  );
};

const obtenerPlaca = (asignacion) => {
  return (
    asignacion?.vehiculo_placa ||
    asignacion?.vehiculo?.placa ||
    "Sin placa"
  );
};

const obtenerDescripcionVehiculo = (
  asignacion
) => {
  return (
    asignacion?.vehiculo_descripcion ||
    [
      asignacion?.vehiculo?.marca,
      asignacion?.vehiculo?.modelo,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    ""
  );
};

const obtenerSucursal = (
  asignacion
) => {
  return (
    asignacion?.sucursal_nombre ||
    asignacion?.sucursal?.nombre ||
    "Sin sucursal"
  );
};

const EstadoBadge = ({ activo }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-black ${
        activo
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          activo
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {activo ? "Activa" : "Inactiva"}
    </span>
  );
};

const AsignacionTable = ({
  asignaciones = [],
  loading = false,
  onEdit,
  onToggle,
  onDelete,
  onCambiarEstado,
}) => {
  const listaAsignaciones =
    normalizarAsignaciones(asignaciones);

  const cambiarEstado =
    onToggle || onCambiarEstado;

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2
          size={30}
          className="mx-auto animate-spin text-yellow-500"
        />

        <p className="mt-3 text-sm font-bold text-slate-500">
          Cargando asignaciones...
        </p>
      </div>
    );
  }

  if (!listaAsignaciones.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
          <Route size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay asignaciones
        </h3>

        <p className="mt-2 text-sm font-medium text-slate-500">
          No se encontraron registros.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="w-full overflow-x-auto overscroll-x-contain">
        <table className="min-w-[1100px] w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Conductor
              </th>

              <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Vehículo
              </th>

              <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Inicio
              </th>

              <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Finalización
              </th>

              <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Sucursal
              </th>

              <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Estado
              </th>

              <th className="whitespace-nowrap px-4 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {listaAsignaciones.map(
              (asignacion, index) => {
                const activa =
                  obtenerEstado(asignacion);

                const conductor =
                  obtenerConductor(
                    asignacion
                  );

                const cedula =
                  obtenerCedula(asignacion);

                const vehiculo =
                  obtenerVehiculo(
                    asignacion
                  );

                const placa =
                  obtenerPlaca(asignacion);

                const descripcion =
                  obtenerDescripcionVehiculo(
                    asignacion
                  );

                return (
                  <tr
                    key={
                      asignacion?.id ??
                      `${conductor}-${vehiculo}-${index}`
                    }
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex min-w-[210px] items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <UserRound
                            size={20}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate text-sm font-black text-slate-900">
                            {conductor}
                          </p>

                          <p className="mt-1 max-w-[180px] truncate text-xs font-medium text-slate-500">
                            {cedula
                              ? `Cédula: ${cedula}`
                              : "Sin cédula"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex min-w-[210px] items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
                          <CarTaxiFront
                            size={19}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate text-sm font-black text-slate-900">
                            Unidad {vehiculo}
                          </p>

                          <p className="mt-1 max-w-[180px] truncate text-xs font-medium text-slate-500">
                            {placa}

                            {descripcion
                              ? ` · ${descripcion}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <CalendarDays
                          size={16}
                          className="text-slate-400"
                        />

                        {formatearFecha(
                          asignacion?.fecha_inicio
                        )}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <CalendarDays
                          size={16}
                          className="text-slate-400"
                        />

                        {asignacion?.fecha_fin
                          ? formatearFecha(
                              asignacion.fecha_fin
                            )
                          : "Sin finalizar"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="flex min-w-[150px] items-center gap-2 whitespace-nowrap text-sm font-bold text-slate-700">
                        <Building2
                          size={16}
                          className="shrink-0 text-slate-400"
                        />

                        {obtenerSucursal(
                          asignacion
                        )}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <EstadoBadge
                        activo={activa}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex min-w-[135px] justify-end gap-2">
                        {typeof onEdit ===
                          "function" && (
                          <button
                            type="button"
                            onClick={() =>
                              onEdit(
                                asignacion
                              )
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                            title="Editar"
                            aria-label="Editar asignación"
                          >
                            <Edit3
                              size={17}
                            />
                          </button>
                        )}

                        {typeof cambiarEstado ===
                          "function" && (
                          <button
                            type="button"
                            onClick={() =>
                              cambiarEstado(
                                asignacion
                              )
                            }
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                              activa
                                ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            }`}
                            title={
                              activa
                                ? "Desactivar"
                                : "Activar"
                            }
                            aria-label={
                              activa
                                ? "Desactivar asignación"
                                : "Activar asignación"
                            }
                          >
                            <Power
                              size={18}
                            />
                          </button>
                        )}

                        {typeof onDelete ===
                          "function" && (
                          <button
                            type="button"
                            onClick={() =>
                              onDelete(
                                asignacion
                              )
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                            title="Eliminar"
                            aria-label="Eliminar asignación"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
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

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 sm:hidden">
        <p className="text-center text-xs font-semibold text-slate-500">
          Desliza horizontalmente para ver
          más información.
        </p>
      </div>
    </div>
  );
};

export default AsignacionTable;