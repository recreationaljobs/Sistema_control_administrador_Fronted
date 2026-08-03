// src/modules/adelantos/pages/AdelantosPage.jsx

import { useMemo } from "react";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  CircleCheckBig,
  HandCoins,
  Loader2,
  Plus,
  RotateCcw,
  Scale,
  UserRound,
  UsersRound,
} from "lucide-react";

import AdelantoModal from "../components/AdelantoModal";
import ResumenConductoresTable from "../components/ResumenConductoresTable";
import { useAdelantos } from "../hooks/useAdelantos";

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

const nombreConductor = (
  conductor
) => {
  if (!conductor) {
    return "";
  }

  return `${conductor.nombre || ""} ${
    conductor.apellido || ""
  }`.trim();
};

const FILTROS_SALDO = [
  {
    value: "pendiente",
    label: "Con saldo",
    descripcion:
      "Conductores que todavía tienen saldo pendiente.",
  },
  {
    value: "cancelados",
    label: "Cancelados",
    descripcion:
      "Conductores que ya pagaron completamente.",
  },
  {
    value: "todos",
    label: "Todos",
    descripcion:
      "Todos los conductores con movimientos registrados.",
  },
];

const TarjetaResumen = ({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  fondoIcono,
  textoIcono,
  textoValor = "text-slate-950",
}) => {
  return (
    <article className="group relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-slate-100/70 blur-2xl" />

      <div className="relative flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${fondoIcono} ${textoIcono}`}
        >
          <Icono size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-black uppercase tracking-wide text-slate-400">
            {titulo}
          </p>

          <h3
            translate="no"
            className={`notranslate mt-1 truncate text-lg font-black tabular-nums ${textoValor}`}
            title={String(valor)}
          >
            {valor}
          </h3>

          {descripcion && (
            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400">
              {descripcion}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

const AdelantosPage = () => {
  const {
    resumenConductores,
    conductores,

    loading,
    loadingResumen,
    loadingCatalogos,
    saving,

    error,

    filtroConductor,
    setFiltroConductor,

    filtroEstadoSaldo,
    setFiltroEstadoSaldo,

    limpiarFiltros,

    modalOpen,
    adelantoEditando,
    tipoInicial,

    totalAdelantos,
    totalAbonos,
    montoAdelantos,
    montoAbonos,
    saldo,

    esTaxista,

    obtenerMovimientosConductor,

    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,

    guardarAdelanto,
    eliminarAdelanto,
    verRecibo,
  } = useAdelantos();

  const resumenVisible =
    useMemo(() => {
      const lista = Array.isArray(
        resumenConductores
      )
        ? resumenConductores
        : [];

      if (
        esTaxista ||
        !filtroConductor
      ) {
        return lista;
      }

      return lista.filter(
        (resumen) => {
          return (
            String(
              resumen.conductor_id
            ) ===
            String(
              filtroConductor
            )
          );
        }
      );
    }, [
      resumenConductores,
      filtroConductor,
      esTaxista,
    ]);

  const saldoNumerico = Number(
    saldo || 0
  );

  const cantidadConductores =
    resumenVisible.length;

  const cantidadMovimientos =
    Number(totalAdelantos || 0) +
    Number(totalAbonos || 0);

  const cargandoPrincipal =
    loading || loadingResumen;

  const filtroSaldoActual =
    FILTROS_SALDO.find(
      (filtro) =>
        filtro.value ===
        filtroEstadoSaldo
    ) || FILTROS_SALDO[0];

  const hayFiltrosActivos =
    filtroEstadoSaldo !==
      "pendiente" ||
    Boolean(filtroConductor);

  const textoSaldo =
    saldoNumerico > 0
      ? "Monto total pendiente"
      : "No hay saldo pendiente";

  const tituloConductores =
    filtroEstadoSaldo ===
    "pendiente"
      ? "Conductores con saldo"
      : filtroEstadoSaldo ===
          "cancelados"
        ? "Conductores cancelados"
        : "Conductores registrados";

  const descripcionConductores =
    cantidadConductores === 1
      ? "1 conductor en esta vista"
      : `${cantidadConductores} conductores en esta vista`;

  const IconoConductores =
    filtroEstadoSaldo ===
    "cancelados"
      ? CircleCheckBig
      : UsersRound;

  const limpiarVista = () => {
    if (
      typeof limpiarFiltros ===
      "function"
    ) {
      limpiarFiltros();
      return;
    }

    setFiltroConductor("");
    setFiltroEstadoSaldo(
      "pendiente"
    );
  };

  return (
    <div
      translate="no"
      className="space-y-5"
    >
      {/* Encabezado */}
      <section className="relative overflow-hidden rounded-[24px]  text-white shadow-xl shadow-slate-200">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-yellow-400/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20">
                <HandCoins size={25} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
                  Control financiero
                </p>

                <h1 className="mt-1 text-xl font-black tracking-tight sm:text-2xl text-slate-950">
                  {esTaxista
                    ? "Mis adelantos"
                    : "Adelantos por conductor"}
                </h1>

                {/* <p className="mt-1 max-w-2xl text-sm font-medium leading-5 text-slate-400">
                  {esTaxista
                    ? "Consulta tus adelantos, abonos y el saldo que todavía tienes pendiente."
                    : "Consulta el saldo acumulado de cada conductor y abre su historial cuando necesites revisar los movimientos."}
                </p> */}
              </div>
            </div>

            {!esTaxista && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    abrirModalCrear(
                      "ADELANTO"
                    )
                  }
                  disabled={saving}
                  className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 text-sm font-black text-slate-950 shadow-lg shadow-yellow-950/20 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={18} />

                  Registrar adelanto
                </button>

                <button
                  type="button"
                  onClick={() =>
                    abrirModalCrear(
                      "ABONO"
                    )
                  }
                  disabled={saving}
                  className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-black text-white shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={18} />

                  Registrar abono
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4 text-xs font-semibold text-slate-400">
            {/* <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              {cantidadMovimientos}{" "}
              {cantidadMovimientos ===
              1
                ? "movimiento registrado"
                : "movimientos registrados"}
            </span> */}

            {/* <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              {totalAdelantos}{" "}
              {totalAdelantos === 1
                ? "adelanto"
                : "adelantos"}
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              {totalAbonos}{" "}
              {totalAbonos === 1
                ? "abono"
                : "abonos"}
            </span> */}
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-sm font-black text-red-700">
            No se pudo completar la operación
          </p>

          <p className="mt-1 text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Resumen general */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaResumen
          titulo="Total adelantado"
          valor={formatoDinero(
            montoAdelantos
          )}
          descripcion={`${totalAdelantos} ${
            totalAdelantos === 1
              ? "movimiento"
              : "movimientos"
          }`}
          icono={ArrowDownCircle}
          fondoIcono="bg-yellow-100"
          textoIcono="text-yellow-700"
          textoValor="text-yellow-700"
        />

        <TarjetaResumen
          titulo="Total abonado"
          valor={formatoDinero(
            montoAbonos
          )}
          descripcion={`${totalAbonos} ${
            totalAbonos === 1
              ? "movimiento"
              : "movimientos"
          }`}
          icono={ArrowUpCircle}
          fondoIcono="bg-emerald-100"
          textoIcono="text-emerald-700"
          textoValor="text-emerald-700"
        />

        <TarjetaResumen
          titulo="Saldo pendiente"
          valor={formatoDinero(
            saldoNumerico
          )}
          descripcion={textoSaldo}
          icono={Scale}
          fondoIcono={
            saldoNumerico > 0
              ? "bg-red-100"
              : "bg-emerald-100"
          }
          textoIcono={
            saldoNumerico > 0
              ? "text-red-600"
              : "text-emerald-700"
          }
          textoValor={
            saldoNumerico > 0
              ? "text-red-600"
              : "text-emerald-700"
          }
        />

        <TarjetaResumen
          titulo={tituloConductores}
          valor={cantidadConductores}
          descripcion={
            descripcionConductores
          }
          icono={IconoConductores}
          fondoIcono={
            filtroEstadoSaldo ===
            "cancelados"
              ? "bg-emerald-100"
              : "bg-blue-100"
          }
          textoIcono={
            filtroEstadoSaldo ===
            "cancelados"
              ? "text-emerald-700"
              : "text-blue-600"
          }
          textoValor="text-slate-950"
        />
      </section>

      {/* Listado agrupado */}
      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-emerald-500" />

        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-700">
                Cuentas por conductor
              </p>

              <h2 className="mt-1 text-lg font-black text-slate-950">
                Resumen de saldos
              </h2>

              <p className="mt-1 max-w-xl text-sm font-medium leading-5 text-slate-500">
                Los movimientos están agrupados. Abre un conductor para consultar sus adelantos, abonos, fechas y recibos.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-end xl:w-auto">
              {/* Filtro de saldo */}
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">
                  Estado del saldo
                </label>

                <div className="flex w-full overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-1 lg:w-auto">
                  {FILTROS_SALDO.map(
                    (filtro) => {
                      const activo =
                        filtroEstadoSaldo ===
                        filtro.value;

                      return (
                        <button
                          key={
                            filtro.value
                          }
                          type="button"
                          disabled={
                            loadingResumen
                          }
                          onClick={() =>
                            setFiltroEstadoSaldo(
                              filtro.value
                            )
                          }
                          className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            activo
                              ? "bg-slate-950 text-white shadow-sm"
                              : "text-slate-500 hover:bg-white hover:text-slate-800"
                          }`}
                          title={
                            filtro.descripcion
                          }
                        >
                          {filtro.label}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Filtro de conductor */}
              {!esTaxista && (
                <div className="w-full lg:w-64">
                  <label
                    htmlFor="filtro-conductor"
                    className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500"
                  >
                    Conductor
                  </label>

                  <div className="relative">
                    <UserRound
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      id="filtro-conductor"
                      value={
                        filtroConductor
                      }
                      onChange={(
                        event
                      ) =>
                        setFiltroConductor(
                          event.target
                            .value
                        )
                      }
                      disabled={
                        loading ||
                        loadingResumen ||
                        loadingCatalogos
                      }
                      className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-xs font-bold text-slate-700 outline-none transition hover:border-slate-300 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">
                        Todos los conductores
                      </option>

                      {conductores.map(
                        (
                          conductor
                        ) => (
                          <option
                            key={
                              conductor.id
                            }
                            value={
                              conductor.id
                            }
                          >
                            {nombreConductor(
                              conductor
                            )}
                          </option>
                        )
                      )}
                    </select>

                    {loadingCatalogos && (
                      <Loader2
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-yellow-600"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información de filtros */}
          {!cargandoPrincipal && (
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-700">
                  {cantidadConductores}{" "}
                  {cantidadConductores ===
                  1
                    ? "conductor encontrado"
                    : "conductores encontrados"}
                </p>

                <p className="mt-0.5 text-xs font-semibold text-slate-400">
                  {
                    filtroSaldoActual.descripcion
                  }
                </p>
              </div>

              {hayFiltrosActivos && (
                <button
                  type="button"
                  onClick={
                    limpiarVista
                  }
                  className="inline-flex h-9 w-fit cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <RotateCcw
                    size={15}
                  />

                  Restaurar vista
                </button>
              )}
            </div>
          )}

          {/* Tarjetas agrupadas */}
          <div className="mt-4">
            <ResumenConductoresTable
              resumenConductores={
                resumenVisible
              }
              loading={
                cargandoPrincipal
              }
              obtenerMovimientosConductor={
                obtenerMovimientosConductor
              }
              onEdit={
                abrirModalEditar
              }
              onDelete={
                eliminarAdelanto
              }
              onRecibo={
                verRecibo
              }
              onRegistrarAdelanto={() =>
                abrirModalCrear(
                  "ADELANTO"
                )
              }
              onRegistrarAbono={() =>
                abrirModalCrear(
                  "ABONO"
                )
              }
              esTaxista={
                esTaxista
              }
            />
          </div>
        </div>
      </section>

      {/* Modal de registro y edición */}
      <AdelantoModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarAdelanto}
        saving={saving}
        loadingCatalogos={
          loadingCatalogos
        }
        adelantoEditando={
          adelantoEditando
        }
        tipoInicial={
          tipoInicial
        }
        conductores={
          conductores
        }
      />
    </div>
  );
};

export default AdelantosPage;