import { useState } from "react";

import {
  Banknote,
  FileText,
  Plus,
  ReceiptText,
} from "lucide-react";

import { useLiquidaciones } from "../hooks/useLiquidaciones";

import LiquidacionModal from "../components/LiquidacionModal";
import LiquidacionTable from "../components/LiquidacionTable";
import ReciboLiquidacionTermico from "../components/ReciboLiquidacionTermico";
import WhatsAppLiquidacionModal from "../components/WhatsAppLiquidacionModal";

const formatoMoneda = (valor) => {
  const numero = Number(valor || 0);

  return `C$ ${numero.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const LiquidacionesLoader = () => {
  return (
    <div
      translate="no"
      className="flex min-h-[310px] flex-col items-center justify-center px-5 py-10 text-center"
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />

        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[#F5B800] border-t-[#F5B800]" />

        <div
          className="absolute inset-[10px] animate-spin rounded-full border-[3px] border-transparent border-b-emerald-500 border-l-emerald-500"
          style={{
            animationDuration: "1.4s",
            animationDirection: "reverse",
          }}
        />

        <div className="absolute inset-[22px] rounded-full bg-gradient-to-br from-yellow-50 via-white to-emerald-50 shadow-inner" />

        <div
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#D89C00] shadow-lg"
          style={{
            boxShadow: "0 8px 25px rgba(245,184,0,0.22)",
          }}
        >
          <Banknote size={29} />
        </div>

        <span className="absolute left-1 top-4 h-2.5 w-2.5 animate-pulse rounded-full bg-[#F5B800]" />

        <span
          className="absolute bottom-4 right-0 h-2 w-2 animate-pulse rounded-full bg-emerald-500"
          style={{
            animationDelay: "200ms",
          }}
        />

        <span
          className="absolute right-6 top-0 h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400"
          style={{
            animationDelay: "400ms",
          }}
        />
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-950">
        Cargando liquidaciones
      </h3>

      <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">
        Preparando los pagos, jornadas y recibos registrados...
      </p>
    </div>
  );
};

const ResumenSuperior = ({
  icono,
  label,
  value,
}) => {
  return (
    <article className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
          {icono}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-lg font-black text-slate-950">
            {value}
          </p>
        </div>
      </div>
    </article>
  );
};

const LiquidacionesPage = () => {
  const {
    liquidaciones,
    conductores,

    loading,
    loadingCatalogos,
    loadingPreview,
    saving,

    error,

    modalOpen,
    abrirModalCrear,
    cerrarModal,

    preview,
    calcularPreview,
    guardarLiquidacion,

    recibo,
    modalReciboOpen,
    verRecibo,
    cerrarRecibo,

    esAdminOSuperAdmin,
    esTaxista,

    totalLiquidaciones,
    montoTotalPagado,
  } = useLiquidaciones();

  const [
    liquidacionWhatsApp,
    setLiquidacionWhatsApp,
  ] = useState(null);

  return (
    <div
      translate="no"
      className="space-y-6 p-5 sm:p-6"
    >
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#F5B800] via-[#FFD45A] to-emerald-500" />

        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-yellow-100/60 blur-3xl" />

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                <ReceiptText size={27} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-700">
                  Control de pagos
                </p>

                <h1 className="mt-1 text-2xl font-black text-slate-950 md:text-[28px]">
                  Liquidaciones
                </h1>

                <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500 md:text-base">
                  Registra el pago acumulado de las jornadas pendientes de cada conductor.
                </p>
              </div>
            </div>

            {esAdminOSuperAdmin && (
              <button
                type="button"
                onClick={abrirModalCrear}
                disabled={loading || saving}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-slate-950 shadow-md shadow-yellow-100 transition hover:-translate-y-0.5 hover:bg-[#DFA600] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <Plus size={20} />
                Nueva liquidación
              </button>
            )}
          </div>
        </div>
      </section>

      {esTaxista && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Estás viendo tus liquidaciones como taxista. No puedes registrar pagos.
        </div>
      )}

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

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ResumenSuperior
          icono={<ReceiptText size={22} />}
          label="Liquidaciones registradas"
          value={totalLiquidaciones}
        />

        <ResumenSuperior
          icono={<Banknote size={22} />}
          label="Total pagado"
          value={formatoMoneda(montoTotalPagado)}
        />

        <ResumenSuperior
          icono={<FileText size={22} />}
          label="Control de pago"
          value="Sin jornadas duplicadas"
        />
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#F5B800] via-[#FFD45A] to-emerald-500" />

        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-base font-black text-slate-900">
            Historial de liquidaciones
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Las jornadas incluidas en una liquidación quedan bloqueadas para evitar pagos duplicados.
          </p>
        </div>

        {loading ? (
          <LiquidacionesLoader />
        ) : (
          <LiquidacionTable
            liquidaciones={liquidaciones}
            loading={false}
            onViewRecibo={verRecibo}
            onWhatsApp={setLiquidacionWhatsApp}
          />
        )}
      </section>

      <LiquidacionModal
        open={modalOpen}
        onClose={cerrarModal}
        onPreview={calcularPreview}
        onSave={guardarLiquidacion}
        saving={saving}
        loadingPreview={loadingPreview}
        loadingCatalogos={loadingCatalogos}
        conductores={conductores}
        preview={preview}
      />

      {modalReciboOpen && recibo && (
        <ReciboLiquidacionTermico
          recibo={recibo}
          onClose={cerrarRecibo}
        />
      )}

      {liquidacionWhatsApp && (
        <WhatsAppLiquidacionModal
          liquidacion={liquidacionWhatsApp}
          onClose={() => setLiquidacionWhatsApp(null)}
        />
      )}
    </div>
  );
};

export default LiquidacionesPage;