import { useEffect } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  HandCoins,
  Loader2,
  X,
} from "lucide-react";
import AdelantoForm from "./AdelantoForm";

const AdelantoModal = ({
  open,
  onClose,
  onSave,
  saving,
  loadingCatalogos,
  adelantoEditando,
  tipoInicial = "ADELANTO",
  conductores = [],
  sucursales = [],
  estadosAdelanto = [],
}) => {
  const esAbono = tipoInicial === "ABONO";
  const esEdicion = Boolean(adelantoEditando);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, saving, onClose]);

  if (!open) return null;

  const titulo = esEdicion
    ? esAbono
      ? "Editar abono"
      : "Editar adelanto"
    : esAbono
    ? "Registrar abono"
    : "Registrar adelanto";

  const descripcion = esAbono
    ? "Registra un abono para reducir el saldo pendiente del conductor."
    : "Registra un adelanto entregado al conductor antes o durante su trabajo.";

  const IconoTipo = esAbono ? ArrowUpCircle : ArrowDownCircle;

  const estilos = esAbono
    ? {
        fondoIcono: "bg-emerald-50",
        textoIcono: "text-emerald-600",
        bordeBadge: "border-emerald-200",
        fondoBadge: "bg-emerald-50",
        textoBadge: "text-emerald-700",
        textoTipo: "Abono",
      }
    : {
        fondoIcono: "bg-yellow-50",
        textoIcono: "text-yellow-600",
        bordeBadge: "border-yellow-200",
        fondoBadge: "bg-yellow-50",
        textoBadge: "text-yellow-700",
        textoTipo: "Adelanto",
      };

  const cerrarConFondo = () => {
    if (saving) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:px-5">
      <button
        type="button"
        onClick={cerrarConFondo}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
        aria-label="Cerrar modal"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="adelanto-modal-title"
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${estilos.fondoIcono} ${estilos.textoIcono}`}
              >
                <HandCoins size={25} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="adelanto-modal-title"
                    className="text-lg font-black text-slate-950 sm:text-xl"
                  >
                    {titulo}
                  </h2>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${estilos.bordeBadge} ${estilos.fondoBadge} ${estilos.textoBadge}`}
                  >
                    <IconoTipo size={14} />
                    {estilos.textoTipo}
                  </span>
                </div>

                <p className="mt-1 max-w-2xl text-sm font-medium leading-5 text-slate-500">
                  {descripcion}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Cerrar"
            >
              <X size={22} />
            </button>
          </div>

          {(loadingCatalogos || saving) && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
              <Loader2 size={17} className="animate-spin" />
              {saving ? "Guardando información..." : "Cargando catálogos..."}
            </div>
          )}
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60">
          <div className="p-4 sm:p-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <AdelantoForm
                adelantoEditando={adelantoEditando}
                tipoInicial={tipoInicial}
                conductores={conductores}
    
                estadosAdelanto={estadosAdelanto}
                onSave={onSave}
                onCancel={onClose}
                saving={saving}
                loadingCatalogos={loadingCatalogos}
              />
            </div>
          </div>
        </main>
      </section>
    </div>
  );
};

export default AdelantoModal;