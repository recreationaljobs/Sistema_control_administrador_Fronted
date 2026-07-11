// src/modules/adelantos/pages/AdelantosPage.jsx

import {
  ArrowDownCircle,
  ArrowUpCircle,
  HandCoins,
  ListChecks,
  Loader2,
  Plus,
  Scale,
  UserRound,
  Wallet,
} from "lucide-react";

import AdelantoModal from "../components/AdelantoModal";
import AdelantoTable from "../components/AdelantoTable";
import { useAdelantos } from "../hooks/useAdelantos";

const formateadorDinero = new Intl.NumberFormat("es-NI", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatoDinero = (valor) => {
  const monto = Number(valor);

  return `C$ ${formateadorDinero.format(
    Number.isFinite(monto) ? monto : 0
  )}`;
};

const FILTROS_TIPO = [
  {
    value: "TODOS",
    label: "Todos",
  },
  {
    value: "ADELANTO",
    label: "Adelantos",
  },
  {
    value: "ABONO",
    label: "Abonos",
  },
];

const nombreConductor = (conductor) => {
  if (!conductor) {
    return "";
  }

  return `${conductor.nombre || ""} ${
    conductor.apellido || ""
  }`.trim();
};

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
    <article className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${fondoIcono} ${textoIcono}`}
        >
          <Icono size={27} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500">
            {titulo}
          </p>

          <h3
            className={`mt-1 truncate text-xl font-black tabular-nums ${textoValor}`}
            title={String(valor)}
          >
            {valor}
          </h3>

          {descripcion && (
            <p className="mt-1 text-xs font-bold text-slate-400">
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
    adelantosFiltrados,
    conductores,
    loading,
    loadingCatalogos,
    saving,
    error,
    filtroTipo,
    setFiltroTipo,
    filtroConductor,
    setFiltroConductor,
    modalOpen,
    adelantoEditando,
    tipoInicial,
    totalAdelantos,
    totalAbonos,
    montoAdelantos,
    montoAbonos,
    saldo,
    esTaxista,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarAdelanto,
    eliminarAdelanto,
    verRecibo,
  } = useAdelantos();

  const cantidadRegistros =
    totalAdelantos + totalAbonos;

  const cantidadFiltrada =
    adelantosFiltrados.length;

  const saldoNumerico = Number(saldo || 0);

  const textoSaldo =
    saldoNumerico > 0
      ? "Saldo pendiente por recuperar"
      : saldoNumerico < 0
        ? "Los abonos superan los adelantos"
        : "No hay saldo pendiente";

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 w-full bg-yellow-400" />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                <HandCoins size={29} />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-[28px]">
                  {esTaxista
                    ? "Mis adelantos y abonos"
                    : "Adelantos y abonos"}
                </h1>

                <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500 md:text-base">
                  {esTaxista
                    ? "Consulta los adelantos recibidos, los abonos realizados y tu saldo pendiente."
                    : "Registra y controla el dinero entregado a los conductores y los abonos realizados a sus saldos."}
                </p>
              </div>
            </div>

            {!esTaxista && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    abrirModalCrear("ADELANTO")
                  }
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 shadow-md shadow-yellow-100 transition hover:-translate-y-0.5 hover:bg-yellow-500 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
                >
                  <Plus size={19} />
                  Registrar adelanto
                </button>

                <button
                  type="button"
                  onClick={() =>
                    abrirModalCrear("ABONO")
                  }
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-md shadow-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
                >
                  <Plus size={19} />
                  Registrar abono
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mensaje de error */}
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
        >
          <p className="text-sm font-black text-red-700">
            No se pudo completar la operación
          </p>

          <p className="mt-1 text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Tarjetas */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaResumen
          titulo="Total de adelantos"
          valor={formatoDinero(montoAdelantos)}
          descripcion={`${totalAdelantos} ${
            totalAdelantos === 1
              ? "registro"
              : "registros"
          }`}
          icono={ArrowDownCircle}
          fondoIcono="bg-yellow-100"
          textoIcono="text-yellow-700"
          textoValor="text-yellow-700"
        />

        <TarjetaResumen
          titulo="Total de abonos"
          valor={formatoDinero(montoAbonos)}
          descripcion={`${totalAbonos} ${
            totalAbonos === 1
              ? "registro"
              : "registros"
          }`}
          icono={ArrowUpCircle}
          fondoIcono="bg-emerald-100"
          textoIcono="text-emerald-700"
          textoValor="text-emerald-700"
        />

        <TarjetaResumen
          titulo="Saldo pendiente"
          valor={formatoDinero(saldoNumerico)}
          descripcion={textoSaldo}
          icono={Scale}
          fondoIcono={
            saldoNumerico > 0
              ? "bg-red-100"
              : saldoNumerico < 0
                ? "bg-emerald-100"
                : "bg-slate-100"
          }
          textoIcono={
            saldoNumerico > 0
              ? "text-red-600"
              : saldoNumerico < 0
                ? "text-emerald-600"
                : "text-slate-600"
          }
          textoValor={
            saldoNumerico > 0
              ? "text-red-600"
              : saldoNumerico < 0
                ? "text-emerald-600"
                : "text-slate-950"
          }
        />

        <TarjetaResumen
          titulo="Total de movimientos"
          valor={cantidadRegistros}
          descripcion="Adelantos y abonos registrados"
          icono={ListChecks}
          fondoIcono="bg-blue-100"
          textoIcono="text-blue-600"
          textoValor="text-slate-950"
        />
      </section>

      {/* Listado */}
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Listado de movimientos
            </h2>

            <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
              Consulta y filtra los adelantos y abonos
              registrados.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-end xl:w-auto">
            {/* Filtros de tipo */}
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                Tipo de movimiento
              </label>

              <div className="flex w-full overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-1 lg:w-auto">
                {FILTROS_TIPO.map((opcion) => {
                  const activo =
                    filtroTipo === opcion.value;

                  return (
                    <button
                      key={opcion.value}
                      type="button"
                      onClick={() =>
                        setFiltroTipo(
                          opcion.value
                        )
                      }
                      className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-black transition cursor-pointer ${
                        activo
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
                      }`}
                    >
                      {opcion.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtro de conductor */}
            {!esTaxista && (
              <div className="w-full lg:w-64">
                <label
                  htmlFor="filtro-conductor"
                  className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500"
                >
                  Conductor
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    id="filtro-conductor"
                    value={filtroConductor}
                    onChange={(event) =>
                      setFiltroConductor(
                        event.target.value
                      )
                    }
                    disabled={
                      loadingCatalogos
                    }
                    className="w-full appearance-none rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-10 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="">
                      Todos los conductores
                    </option>

                    {conductores.map(
                      (conductor) => (
                        <option
                          key={conductor.id}
                          value={conductor.id}
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
                      size={17}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-yellow-600"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500">
            {loading
              ? "Consultando movimientos..."
              : `${cantidadFiltrada} ${
                  cantidadFiltrada === 1
                    ? "movimiento encontrado"
                    : "movimientos encontrados"
                }`}
          </p>

          {(filtroTipo !== "TODOS" ||
            filtroConductor) && (
            <button
              type="button"
              onClick={() => {
                setFiltroTipo("TODOS");
                setFiltroConductor("");
              }}
              className="self-start text-sm font-black text-yellow-700 transition hover:text-yellow-800 sm:self-auto cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="mt-5">
          <AdelantoTable
            adelantos={adelantosFiltrados}
            loading={loading}
            onEdit={abrirModalEditar}
            onDelete={eliminarAdelanto}
            onRecibo={verRecibo}
            esTaxista={esTaxista}
            mostrarConductor={!esTaxista}
            mostrarSucursal={!esTaxista}
          />
        </div>
      </section>

      {/* Modal */}
      <AdelantoModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarAdelanto}
        saving={saving}
        loadingCatalogos={loadingCatalogos}
        adelantoEditando={adelantoEditando}
        tipoInicial={tipoInicial}
        conductores={conductores}
      />
    </div>
  );
};

export default AdelantosPage;