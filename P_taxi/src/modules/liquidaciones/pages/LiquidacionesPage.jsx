import { Plus, Wallet, FileText } from "lucide-react";
import LiquidacionModal from "../components/LiquidacionModal";
import LiquidacionTable from "../components/LiquidacionTable";
import { useLiquidaciones } from "../hooks/useLiquidaciones";

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const LiquidacionesPage = () => {
  const {
    liquidaciones,
    conductores,
    loading,
    loadingCatalogos,
    saving,
    error,
    modalOpen,
    totalLiquidaciones,
    montoTotalPagado,
    abrirModal,
    cerrarModal,
    guardarLiquidacion,
    verRecibo,
  } = useLiquidaciones();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
              <Wallet size={29} />
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
                Liquidaciones
              </h1>
              <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500 md:text-base">
                Liquida y paga a los conductores por sus jornadas, descontando
                adelantos pendientes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-3 text-sm font-black text-white shadow-md shadow-green-100 transition hover:bg-green-600"
          >
            <Plus size={20} />
            💰 Nuevo Pago
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">
                Total liquidaciones
              </p>
              <h3 className="mt-1 text-3xl font-black text-slate-950">
                {totalLiquidaciones}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <Wallet size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">
                Total pagado
              </p>
              <h3 className="mt-1 text-xl font-black text-green-600">
                {formatoDinero(montoTotalPagado)}
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-950">
            Historial de liquidaciones
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Registro de pagos realizados a los conductores.
          </p>
        </div>

        <LiquidacionTable
          liquidaciones={liquidaciones}
          loading={loading}
          onRecibo={verRecibo}
        />
      </section>

      {modalOpen && (
        <LiquidacionModal
          open={modalOpen}
          onClose={cerrarModal}
          onConfirm={guardarLiquidacion}
          saving={saving}
          conductores={conductores}
          loadingCatalogos={loadingCatalogos}
        />
      )}
    </div>
  );
};

export default LiquidacionesPage;
