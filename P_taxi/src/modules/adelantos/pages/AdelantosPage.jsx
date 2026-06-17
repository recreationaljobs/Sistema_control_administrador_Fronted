import {
  HandCoins,
  Plus,
  Wallet,
  Scale,
} from "lucide-react";
import AdelantoModal from "../components/AdelantoModal";
import AdelantoTable from "../components/AdelantoTable";
import { useAdelantos } from "../hooks/useAdelantos";

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const FILTROS_TIPO = [
  { value: "TODOS", label: "Todos" },
  { value: "ADELANTO", label: "Adelantos 💸" },
  { value: "ABONO", label: "Abonos ✅" },
];

const AdelantosPage = () => {
  const {
    adelantosFiltrados,
    conductores,
    sucursales,
    estadosAdelanto,
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

  const nombreConductor = (conductor) =>
    `${conductor.nombre || ""} ${conductor.apellido || ""}`.trim();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
              <HandCoins size={29} />
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
                {esTaxista ? "Mis adelantos y abonos" : "Adelantos y abonos"}
              </h1>

              <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500 md:text-base">
                Control de adelantos (dinero que sale) y abonos (dinero que
                entra) por conductor.
              </p>
            </div>
          </div>

          {!esTaxista && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => abrirModalCrear("ADELANTO")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-black text-white shadow-md shadow-red-100 transition hover:bg-red-600"
              >
                <Plus size={20} />
                Nuevo Adelanto 💸
              </button>

              <button
                type="button"
                onClick={() => abrirModalCrear("ABONO")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-3 text-sm font-black text-white shadow-md shadow-green-100 transition hover:bg-green-600"
              >
                <Plus size={20} />
                Registrar Abono ✅
              </button>
            </div>
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Wallet size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Adelantos</p>
              <h3 className="mt-1 text-xl font-black text-red-600">
                {formatoDinero(montoAdelantos)}
              </h3>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {totalAdelantos} registro(s)
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <Wallet size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Abonos</p>
              <h3 className="mt-1 text-xl font-black text-green-600">
                {formatoDinero(montoAbonos)}
              </h3>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {totalAbonos} registro(s)
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
              <Scale size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">
                Saldo (adelantos - abonos)
              </p>
              <h3
                className={`mt-1 text-xl font-black ${
                  saldo > 0
                    ? "text-red-600"
                    : saldo < 0
                    ? "text-green-600"
                    : "text-slate-900"
                }`}
              >
                {formatoDinero(saldo)}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <HandCoins size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">
                Total registros
              </p>
              <h3 className="mt-1 text-3xl font-black text-slate-950">
                {totalAdelantos + totalAbonos}
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Listado de movimientos
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Filtra por tipo de movimiento o por conductor.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
              {FILTROS_TIPO.map((opcion) => (
                <button
                  key={opcion.value}
                  type="button"
                  onClick={() => setFiltroTipo(opcion.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                    filtroTipo === opcion.value
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {opcion.label}
                </button>
              ))}
            </div>

            <select
              value={filtroConductor}
              onChange={(e) => setFiltroConductor(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
            >
              <option value="">Todos los conductores</option>
              {conductores.map((conductor) => (
                <option key={conductor.id} value={conductor.id}>
                  {nombreConductor(conductor)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <AdelantoTable
            adelantos={adelantosFiltrados}
            loading={loading}
            onEdit={abrirModalEditar}
            onDelete={eliminarAdelanto}
            onRecibo={verRecibo}
            esTaxista={esTaxista}
          />
        </div>
      </section>

      <AdelantoModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarAdelanto}
        saving={saving}
        loadingCatalogos={loadingCatalogos}
        adelantoEditando={adelantoEditando}
        tipoInicial={tipoInicial}
        conductores={conductores}
        sucursales={sucursales}
        estadosAdelanto={estadosAdelanto}
      />
    </div>
  );
};

export default AdelantosPage;
