// src/modules/conductores/components/ConductorTable.jsx

import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CalendarDays,
  IdCard,
  LoaderCircle,
  Pencil,
  Percent,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
} from "lucide-react";

const calcularDiasVencimiento = (
  fecha
) => {
  if (!fecha) {
    return null;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const vencimiento = new Date(
    `${String(fecha).slice(0, 10)}T00:00:00`
  );

  return Math.ceil(
    (vencimiento.getTime() -
      hoy.getTime()) /
      86_400_000
  );
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return "Sin fecha";
  }

  const valor = String(fecha).slice(0, 10);
  const partes = valor.split("-");

  if (partes.length !== 3) {
    return valor;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const LicenciaBadge = ({ fecha }) => {
  const dias =
    calcularDiasVencimiento(fecha);

  if (dias === null) {
    return (
      <span className="text-sm font-medium text-slate-400">
        Sin fecha
      </span>
    );
  }

  if (dias < 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700">
        <AlertTriangle size={13} />
        Vencida
      </span>
    );
  }

  if (dias === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700">
        <AlertTriangle size={13} />
        Vence hoy
      </span>
    );
  }

  if (dias <= 30) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
        <AlertTriangle size={13} />
        {dias} días
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
      <BadgeCheck size={13} />
      Vigente
    </span>
  );
};

const EstadoBadge = ({ activo }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${
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

      {activo ? "Activo" : "Inactivo"}
    </span>
  );
};

const Acciones = ({
  conductor,
  activo,
  onEdit,
  onDelete,
  onDespedir,
  onReactivar,
  canManage,
}) => {
  if (!canManage) {
    return null;
  }

  return (
    <div
      className="notranslate flex justify-end gap-2"
      translate="no"
    >
      <button
        type="button"
        onClick={() => onEdit?.(conductor)}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
        title="Editar"
        aria-label="Editar conductor"
      >
        <Pencil
          size={17}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        onClick={() =>
          onDespedir?.(conductor)
        }
        disabled={!activo}
        aria-hidden={!activo}
        tabIndex={activo ? 0 : -1}
        className={`h-10 w-10 items-center justify-center rounded-xl transition ${
          activo
            ? "flex bg-orange-50 text-orange-600 hover:bg-orange-100"
            : "hidden"
        }`}
        title="Desactivar"
        aria-label="Desactivar conductor"
      >
        <UserX
          size={18}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        onClick={() =>
          onReactivar?.(conductor)
        }
        disabled={activo}
        aria-hidden={activo}
        tabIndex={activo ? -1 : 0}
        className={`h-10 w-10 items-center justify-center rounded-xl transition ${
          activo
            ? "hidden"
            : "flex bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
        }`}
        title="Reactivar"
        aria-label="Reactivar conductor"
      >
        <UserCheck
          size={18}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        onClick={() =>
          onDelete?.(conductor)
        }
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
        title="Eliminar"
        aria-label="Eliminar conductor"
      >
        <Trash2
          size={17}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

const ConductorTable = ({
  conductores = [],
  loading = false,
  onEdit,
  onDelete,
  onDespedir,
  onReactivar,
  canManage = false,
}) => {
  if (loading) {
    return (
      <div className="notranslate rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm" translate="no">
        <LoaderCircle
          size={30}
          className="mx-auto animate-spin text-yellow-500"
        />

        <p className="mt-3 text-sm font-bold text-slate-500">
          Cargando conductores...
        </p>
      </div>
    );
  }

  if (!conductores.length) {
    return (
      <div className="notranslate rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm" translate="no">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
          <UserRound size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay conductores
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          No se encontraron registros.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 lg:hidden">
        {conductores.map((conductor) => {
          const activo =
            conductor.activo !== false;

          const fechaVencimiento =
            conductor.fecha_vencimiento_licencia ||
            conductor.vencimiento_licencia;

          return (
            <article
              key={conductor.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div
                className={`h-1 w-full ${
                  activo
                    ? "bg-emerald-500"
                    : "bg-slate-400"
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
                        {conductor.nombre}{" "}
                        {conductor.apellido}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                        <IdCard size={13} />
                        {conductor.cedula ||
                          "Sin cédula"}
                      </p>
                    </div>
                  </div>

                  <EstadoBadge
                    activo={activo}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-black uppercase text-slate-400">
                      Licencia
                    </p>

                    <p className="mt-1 truncate text-sm font-bold text-slate-700">
                      {conductor.numero_licencia ||
                        "Sin licencia"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-black uppercase text-slate-400">
                      Pago
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-sm font-black text-slate-700">
                      <Percent size={14} />
                      {conductor.porcentaje_pago ??
                        "—"}
                      %
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="text-[11px] font-black uppercase text-slate-400">
                      Vencimiento
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-600">
                      <CalendarDays size={14} />
                      {formatearFecha(
                        fechaVencimiento
                      )}
                    </p>
                  </div>

                  <LicenciaBadge
                    fecha={fechaVencimiento}
                  />
                </div>

                {conductor.sucursal_nombre && (
                  <p className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Building2 size={14} />
                    {conductor.sucursal_nombre}
                  </p>
                )}

                {canManage && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <Acciones
                      conductor={conductor}
                      activo={activo}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onDespedir={onDespedir}
                      onReactivar={
                        onReactivar
                      }
                      canManage={canManage}
                    />
                  </div>
                )}
              </div>
            </article>
          );
        })}
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
                  Licencia
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Vencimiento
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Sucursal
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Pago
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Estado
                </th>

                {canManage && (
                  <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {conductores.map((conductor) => {
                const activo =
                  conductor.activo !== false;

                const fechaVencimiento =
                  conductor.fecha_vencimiento_licencia ||
                  conductor.vencimiento_licencia;

                return (
                  <tr
                    key={conductor.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <UserRound
                            size={21}
                          />
                        </div>

                        <div>
                          <p className="whitespace-nowrap text-sm font-black text-slate-900">
                            {conductor.nombre}{" "}
                            {conductor.apellido}
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                            <IdCard size={13} />
                            {conductor.cedula ||
                              "Sin cédula"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-700">
                      {conductor.numero_licencia ||
                        conductor.licencia ||
                        "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="space-y-2">
                        <LicenciaBadge
                          fecha={
                            fechaVencimiento
                          }
                        />

                        <p className="text-xs font-medium text-slate-500">
                          {formatearFecha(
                            fechaVencimiento
                          )}
                        </p>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Building2
                          size={16}
                          className="text-slate-400"
                        />

                        {conductor.sucursal_nombre ||
                          "Panel general"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="flex items-center gap-1 text-sm font-black text-slate-700">
                        <Percent size={15} />
                        {conductor.porcentaje_pago ??
                          "—"}
                        %
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <EstadoBadge
                        activo={activo}
                      />
                    </td>

                    {canManage && (
                      <td className="whitespace-nowrap px-5 py-4">
                        <Acciones
                          conductor={conductor}
                          activo={activo}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onDespedir={
                            onDespedir
                          }
                          onReactivar={
                            onReactivar
                          }
                          canManage={
                            canManage
                          }
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ConductorTable;