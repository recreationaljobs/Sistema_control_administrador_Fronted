// src/modules/adelantos/components/AdelantoTable.jsx

import {
  Building2,
  CalendarDays,
  Edit3,
  HandCoins,
  Loader2,
  Printer,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";

const formateadorDinero =
  new Intl.NumberFormat("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatoDinero = (valor) => {
  const monto = Number(valor);

  return `C$ ${formateadorDinero.format(
    Number.isFinite(monto) ? monto : 0
  )}`;
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return "Sin fecha";
  }

  const valor = String(fecha).slice(0, 10);
  const partes = valor.split("-");

  if (partes.length !== 3) {
    return String(fecha);
  }

  const [anio, mes, dia] = partes;

  return `${dia}/${mes}/${anio}`;
};

const normalizarTipo = (tipo) => {
  return String(tipo || "")
    .trim()
    .toUpperCase();
};

const obtenerSaldo = (adelanto) => {
  const saldo = Number(
    adelanto.saldo_movimiento ??
      adelanto.saldo_pendiente ??
      0
  );

  return Number.isFinite(saldo)
    ? saldo
    : 0;
};

const TipoBadge = ({ adelanto }) => {
  const esAbono =
    normalizarTipo(adelanto.tipo) ===
    "ABONO";

  const texto =
    adelanto.tipo_display ||
    (esAbono ? "Abono" : "Adelanto");

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${
        esAbono
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-yellow-200 bg-yellow-50 text-yellow-700"
      }`}
    >
      {texto}
    </span>
  );
};

const EstadoBadge = ({ adelanto }) => {
  const texto =
    adelanto.estado_nombre ||
    adelanto.estado_display ||
    adelanto.estado ||
    "Sin estado";

  const estado = String(texto)
    .trim()
    .toUpperCase();

  let estilos =
    "border-slate-200 bg-slate-50 text-slate-700";

  if (
    estado.includes("PAGADO") ||
    estado.includes("COMPLETO") ||
    estado.includes("COMPLETADO")
  ) {
    estilos =
      "border-emerald-200 bg-emerald-50 text-emerald-700";
  } else if (
    estado.includes("PENDIENTE") ||
    estado.includes("PARCIAL")
  ) {
    estilos =
      "border-amber-200 bg-amber-50 text-amber-700";
  } else if (
    estado.includes("ANULADO") ||
    estado.includes("CANCELADO")
  ) {
    estilos =
      "border-red-200 bg-red-50 text-red-700";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${estilos}`}
    >
      {texto}
    </span>
  );
};

const AdelantoTable = ({
  adelantos = [],
  loading = false,
  onEdit,
  onDelete,
  onRecibo,
  esTaxista = false,
  mostrarConductor = true,
  mostrarSucursal = true,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2
          size={30}
          className="mx-auto animate-spin text-yellow-500"
        />

        <p className="mt-3 text-sm font-bold text-slate-600">
          Cargando movimientos...
        </p>

        <p className="mt-1 text-xs font-medium text-slate-400">
          Estamos consultando los adelantos y
          abonos registrados.
        </p>
      </div>
    );
  }

  if (!adelantos.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
          <HandCoins size={34} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay movimientos
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {esTaxista
            ? "No tienes adelantos ni abonos registrados con los filtros seleccionados."
            : "No hay adelantos ni abonos registrados con los filtros seleccionados."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Vista para teléfonos */}
      <div className="grid gap-4 md:hidden">
        {adelantos.map((adelanto) => {
          const esAbono =
            normalizarTipo(
              adelanto.tipo
            ) === "ABONO";

          const saldoMovimiento =
            obtenerSaldo(adelanto);

          const mostrarAcciones =
            Boolean(onRecibo) ||
            (!esTaxista &&
              (Boolean(onEdit) ||
                Boolean(onDelete)));

          return (
            <article
              key={adelanto.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div
                className={`h-1 w-full ${
                  esAbono
                    ? "bg-emerald-500"
                    : "bg-yellow-400"
                }`}
              />

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {mostrarConductor && (
                      <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                        <UserRound
                          size={16}
                          className="shrink-0 text-blue-500"
                        />

                        <span className="truncate">
                          {adelanto.conductor_nombre ||
                            "Sin conductor"}
                        </span>
                      </p>
                    )}

                    <p
                      className={`flex items-center gap-2 text-xs font-bold text-slate-500 ${
                        mostrarConductor
                          ? "mt-2"
                          : ""
                      }`}
                    >
                      <CalendarDays
                        size={15}
                        className="shrink-0 text-slate-400"
                      />

                      {formatearFecha(
                        adelanto.fecha_movimiento ||
                          adelanto.fecha
                      )}
                    </p>
                  </div>

                  <TipoBadge
                    adelanto={adelanto}
                  />
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                  {mostrarSucursal && (
                    <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Building2
                        size={17}
                        className="shrink-0 text-yellow-600"
                      />

                      <span className="truncate">
                        {adelanto.sucursal_nombre ||
                          "Sin sucursal"}
                      </span>
                    </p>
                  )}

                  <p
                    className={`text-sm font-medium leading-6 text-slate-600 ${
                      mostrarSucursal
                        ? "mt-2"
                        : ""
                    }`}
                  >
                    {adelanto.observacion ||
                      "Sin observación"}
                  </p>

                  <div className="mt-3">
                    <EstadoBadge
                      adelanto={adelanto}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                      Monto
                    </p>

                    <p
                      className={`mt-1 flex items-center gap-1 text-sm font-black tabular-nums ${
                        esAbono
                          ? "text-emerald-600"
                          : "text-yellow-700"
                      }`}
                    >
                      <Wallet size={16} />

                      {formatoDinero(
                        adelanto.monto
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                      Saldo pendiente
                    </p>

                    <p
                      className={`mt-1 text-sm font-black tabular-nums ${
                        saldoMovimiento > 0
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {formatoDinero(
                        saldoMovimiento
                      )}
                    </p>
                  </div>
                </div>

                {mostrarAcciones && (
                  <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                    {onRecibo && (
                      <button
                        type="button"
                        onClick={() =>
                          onRecibo(adelanto)
                        }
                        className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-3 text-xs font-black text-amber-700 transition hover:bg-amber-100 hover:cursor-pointer"
                        title="Abrir recibo"
                      >
                        <Printer size={16} className="cursor-pointer"/>
                        Recibo
                      </button>
                    )}

                    {!esTaxista && onEdit && (
                      <button
                        type="button"
                        onClick={() =>
                          onEdit(adelanto)
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100 cursor-pointer"
                        title="Editar"
                        aria-label="Editar movimiento"
                      >
                        <Edit3 size={18} />
                      </button>
                    )}

                    {!esTaxista &&
                      onDelete && (
                        <button
                          type="button"
                          onClick={() =>
                            onDelete(
                              adelanto
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 cursor-pointer"
                          title="Eliminar"
                          aria-label="Eliminar movimiento"
                        >
                          <Trash2
                            size={18}
                          />
                        </button>
                      )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Vista para computadoras */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                {mostrarConductor && (
                  <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    Conductor
                  </th>
                )}

                {mostrarSucursal && (
                  <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    Sucursal
                  </th>
                )}

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Fecha
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Tipo
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Monto
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Saldo
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Estado
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Observación
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {adelantos.map((adelanto) => {
                const esAbono =
                  normalizarTipo(
                    adelanto.tipo
                  ) === "ABONO";

                const saldoMovimiento =
                  obtenerSaldo(adelanto);

                return (
                  <tr
                    key={adelanto.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    {mostrarConductor && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <UserRound
                              size={20}
                            />
                          </div>

                          <p className="whitespace-nowrap text-sm font-black text-slate-900">
                            {adelanto.conductor_nombre ||
                              "Sin conductor"}
                          </p>
                        </div>
                      </td>
                    )}

                    {mostrarSucursal && (
                      <td className="px-5 py-4">
                        <p className="flex items-center gap-2 whitespace-nowrap text-sm font-bold text-slate-700">
                          <Building2
                            size={16}
                            className="shrink-0 text-yellow-600"
                          />

                          {adelanto.sucursal_nombre ||
                            "Sin sucursal"}
                        </p>
                      </td>
                    )}

                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <CalendarDays
                          size={16}
                          className="text-slate-400"
                        />

                        {formatearFecha(
                          adelanto.fecha_movimiento ||
                            adelanto.fecha
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <TipoBadge
                        adelanto={adelanto}
                      />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <p
                        className={`flex items-center gap-2 text-sm font-black tabular-nums ${
                          esAbono
                            ? "text-emerald-600"
                            : "text-yellow-700"
                        }`}
                      >
                        <Wallet size={16} />

                        {formatoDinero(
                          adelanto.monto
                        )}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <p
                        className={`text-sm font-black tabular-nums ${
                          saldoMovimiento > 0
                            ? "text-red-600"
                            : saldoMovimiento < 0
                              ? "text-emerald-600"
                              : "text-slate-700"
                        }`}
                      >
                        {formatoDinero(
                          saldoMovimiento
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <EstadoBadge
                        adelanto={adelanto}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <p
                        className="max-w-[240px] truncate text-sm font-medium text-slate-500"
                        title={
                          adelanto.observacion ||
                          ""
                        }
                      >
                        {adelanto.observacion ||
                          "Sin observación"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {onRecibo && (
                          <button
                            type="button"
                            onClick={() =>
                              onRecibo(
                                adelanto
                              )
                            }
                            className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-3 text-xs font-black text-amber-700 transition hover:bg-amber-100"
                            title="Abrir recibo"
                          >
                            <Printer
                              size={16}
                            />
                            Recibo
                          </button>
                        )}

                        {!esTaxista &&
                          onEdit && (
                            <button
                              type="button"
                              onClick={() =>
                                onEdit(
                                  adelanto
                                )
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                              title="Editar"
                              aria-label="Editar movimiento"
                            >
                              <Edit3
                                size={18}
                              />
                            </button>
                          )}

                        {!esTaxista &&
                          onDelete && (
                            <button
                              type="button"
                              onClick={() =>
                                onDelete(
                                  adelanto
                                )
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                              title="Eliminar"
                              aria-label="Eliminar movimiento"
                            >
                              <Trash2
                                size={18}
                              />
                            </button>
                          )}
                      </div>
                    </td>
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

export default AdelantoTable;