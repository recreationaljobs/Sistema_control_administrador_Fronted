import { useState } from "react";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CircleCheckBig,
  CircleDollarSign,
  HandCoins,
  History,
  Loader2,
  Plus,
  ReceiptText,
  Scale,
  UserRound,
} from "lucide-react";

import AdelantoTable from "./AdelantoTable";

const formateadorDinero =
  new Intl.NumberFormat("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatoDinero = (valor) => {
  const numero = Number(valor);

  return `C$ ${formateadorDinero.format(
    Number.isFinite(numero)
      ? numero
      : 0
  )}`;
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return "Sin movimientos";
  }

  const valor = String(fecha).slice(
    0,
    10
  );

  const partes = valor.split("-");

  if (partes.length !== 3) {
    return String(fecha);
  }

  const [anio, mes, dia] = partes;

  return `${dia}/${mes}/${anio}`;
};

const obtenerNumero = (valor) => {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : 0;
};

const ResumenConductoresTable = ({
  resumenConductores = [],
  loading = false,

  obtenerMovimientosConductor,

  onEdit,
  onDelete,
  onRecibo,

  onRegistrarAdelanto,
  onRegistrarAbono,

  esTaxista = false,
}) => {
  const [
    conductorAbierto,
    setConductorAbierto,
  ] = useState(null);

  const alternarConductor = (
    conductorId
  ) => {
    setConductorAbierto(
      (valorActual) => {
        return String(valorActual) ===
          String(conductorId)
          ? null
          : conductorId;
      }
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-slate-200 bg-white px-5 py-10 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100" />

          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-yellow-400 border-t-yellow-400" />

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 text-yellow-700">
            <HandCoins size={25} />
          </div>
        </div>

        <h3 className="mt-4 text-base font-black text-slate-900">
          Cargando saldos
        </h3>

        <p className="mt-1 text-sm font-medium text-slate-500">
          Agrupando los movimientos por
          conductor...
        </p>
      </div>
    );
  }

  if (!resumenConductores.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CircleCheckBig size={32} />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-900">
          No hay conductores en esta vista
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
          No existen conductores que
          coincidan con el filtro de saldo
          seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {resumenConductores.map(
        (resumen) => {
          const conductorId =
            resumen.conductor_id;

          const abierto =
            String(conductorAbierto) ===
            String(conductorId);

          const totalAdelantos =
            obtenerNumero(
              resumen.total_adelantos
            );

          const totalAbonos =
            obtenerNumero(
              resumen.total_abonos
            );

          const saldoPendiente =
            obtenerNumero(
              resumen.saldo_pendiente
            );

          const saldoFavor =
            obtenerNumero(
              resumen.saldo_a_favor
            );

          const cantidadMovimientos =
            obtenerNumero(
              resumen.cantidad_movimientos
            );

          const cantidadAdelantos =
            obtenerNumero(
              resumen.cantidad_adelantos
            );

          const cantidadAbonos =
            obtenerNumero(
              resumen.cantidad_abonos
            );

          const tieneSaldo =
            saldoPendiente > 0;

          const movimientos =
            abierto &&
            typeof obtenerMovimientosConductor ===
              "function"
              ? obtenerMovimientosConductor(
                  conductorId
                )
              : [];

          return (
            <article
              key={conductorId}
              className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:border-slate-300 hover:shadow-lg"
            >
              <div
                className={`h-1.5 w-full ${
                  tieneSaldo
                    ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"
                    : "bg-gradient-to-r from-emerald-400 to-emerald-600"
                }`}
              />

              <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                        tieneSaldo
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <UserRound size={24} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-black text-slate-950 sm:text-lg">
                          {resumen.conductor_nombre ||
                            "Sin conductor"}
                        </h3>

                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                            tieneSaldo
                              ? "border-red-200 bg-red-50 text-red-600"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {tieneSaldo
                            ? "Saldo pendiente"
                            : "Cancelado"}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Building2
                            size={14}
                            className="text-slate-400"
                          />

                          {resumen.sucursal_nombre ||
                            "Sin sucursal"}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <CalendarDays
                            size={14}
                            className="text-slate-400"
                          />

                          Último movimiento:{" "}
                          {formatearFecha(
                            resumen.ultimo_movimiento
                          )}
                        </span>

                        {resumen.conductor_cedula && (
                          <span>
                            Cédula:{" "}
                            {
                              resumen.conductor_cedula
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    {/* {!esTaxista &&
                      typeof onRegistrarAdelanto ===
                        "function" && (
                        <button
                          type="button"
                          onClick={() =>
                            onRegistrarAdelanto(
                              resumen
                            )
                          }
                          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-yellow-400 px-3.5 text-xs font-black text-slate-950 transition hover:bg-yellow-500"
                        >
                          <Plus size={16} />
                          Adelanto
                        </button>
                      )} */}

{/* 
                    {!esTaxista &&
                      tieneSaldo &&
                      typeof onRegistrarAbono ===
                        "function" && (
                        <button
                          type="button"
                          onClick={() =>
                            onRegistrarAbono(
                              resumen
                            )
                          }
                          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3.5 text-xs font-black text-white transition hover:bg-emerald-600"
                        >
                          <Plus size={16} />
                          Abono
                        </button>
                      )} */}

                    <button
                      type="button"
                      onClick={() =>
                        alternarConductor(
                          conductorId
                        )
                      }
                      className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-3.5 text-xs font-black transition ${
                        abierto
                          ? "bg-slate-950 text-white"
                          : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <History size={16} />

                      {abierto
                        ? "Ocultar movimientos"
                        : "Ver movimientos"}

                      {abierto ? (
                        <ChevronUp
                          size={16}
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                  <ResumenMonto
                    titulo="Total adelantado"
                    valor={formatoDinero(
                      totalAdelantos
                    )}
                    descripcion={`${cantidadAdelantos} ${
                      cantidadAdelantos === 1
                        ? "adelanto"
                        : "adelantos"
                    }`}
                    icono={
                      ArrowDownCircle
                    }
                    estiloIcono="bg-yellow-100 text-yellow-700"
                    estiloValor="text-yellow-700"
                  />

                  <ResumenMonto
                    titulo="Total abonado"
                    valor={formatoDinero(
                      totalAbonos
                    )}
                    descripcion={`${cantidadAbonos} ${
                      cantidadAbonos === 1
                        ? "abono"
                        : "abonos"
                    }`}
                    icono={
                      ArrowUpCircle
                    }
                    estiloIcono="bg-emerald-100 text-emerald-700"
                    estiloValor="text-emerald-700"
                  />

                  <ResumenMonto
                    titulo="Saldo pendiente"
                    valor={formatoDinero(
                      saldoPendiente
                    )}
                    descripcion={
                      tieneSaldo
                        ? "Monto por recuperar"
                        : "Cuenta cancelada"
                    }
                    icono={Scale}
                    estiloIcono={
                      tieneSaldo
                        ? "bg-red-100 text-red-600"
                        : "bg-emerald-100 text-emerald-700"
                    }
                    estiloValor={
                      tieneSaldo
                        ? "text-red-600"
                        : "text-emerald-700"
                    }
                    principal
                  />

                  <ResumenMonto
                    titulo={
                      saldoFavor > 0
                        ? "Saldo a favor"
                        : "Movimientos"
                    }
                    valor={
                      saldoFavor > 0
                        ? formatoDinero(
                            saldoFavor
                          )
                        : cantidadMovimientos
                    }
                    descripcion={
                      saldoFavor > 0
                        ? "Crédito del conductor"
                        : "Registros guardados"
                    }
                    icono={
                      saldoFavor > 0
                        ? CircleDollarSign
                        : ReceiptText
                    }
                    estiloIcono="bg-blue-100 text-blue-600"
                    estiloValor="text-slate-950"
                  />
                </div> */}
              </div>

              {abierto && (
                <div className="border-t border-slate-200 bg-slate-50/80 p-3 sm:p-5">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-black text-slate-900">
                        <History
                          size={17}
                          className="text-blue-600"
                        />

                        Historial de movimientos
                      </h4>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Adelantos y abonos
                        registrados para este
                        conductor.
                      </p>
                    </div>

                    <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600">
                      {movimientos.length}{" "}
                      {movimientos.length === 1
                        ? "movimiento"
                        : "movimientos"}
                    </span>
                  </div>

                  <AdelantoTable
                    adelantos={movimientos}
                    loading={false}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onRecibo={onRecibo}
                    esTaxista={esTaxista}
                    mostrarConductor={false}
                    mostrarSucursal={false}
                  />
                </div>
              )}
            </article>
          );
        }
      )}
    </div>
  );
};

const ResumenMonto = ({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  estiloIcono,
  estiloValor,
  principal = false,
}) => {
  return (
    <div
      className={`min-w-0 rounded-2xl border p-3 ${
        principal
          ? "border-slate-300 bg-white shadow-sm"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${estiloIcono}`}
        >
          <Icono size={18} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-wide text-slate-400">
            {titulo}
          </p>

          <p
            className={`mt-0.5 truncate text-sm font-black tabular-nums sm:text-base ${estiloValor}`}
            title={String(valor)}
          >
            {valor}
          </p>

          <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">
            {descripcion}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumenConductoresTable;