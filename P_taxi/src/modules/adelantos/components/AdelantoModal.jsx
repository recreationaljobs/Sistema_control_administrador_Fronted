// src/modules/adelantos/components/AdelantoModal.jsx

import { useEffect } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  HandCoins,
  Loader2,
  X,
} from "lucide-react";

import AdelantoForm from "./AdelantoForm";

const normalizarTipo = (tipo) => {
  return String(tipo || "")
    .trim()
    .toUpperCase() === "ABONO"
    ? "ABONO"
    : "ADELANTO";
};

const AdelantoModal = ({
  open,
  onClose,
  onSave,
  saving = false,
  loadingCatalogos = false,
  adelantoEditando = null,
  tipoInicial = "ADELANTO",
  conductores = [],
}) => {
  const tipoMovimiento = normalizarTipo(
    adelantoEditando?.tipo || tipoInicial
  );

  const esAbono = tipoMovimiento === "ABONO";
  const esEdicion = Boolean(adelantoEditando);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const overflowAnterior = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflowAnterior;
    };
  }, [open, saving, onClose]);

  if (!open) {
    return null;
  }

  const titulo = esEdicion
    ? esAbono
      ? "Editar abono"
      : "Editar adelanto"
    : esAbono
      ? "Registrar abono"
      : "Registrar adelanto";

  const descripcion = esAbono
    ? "Registra un pago realizado por el conductor para reducir su saldo pendiente."
    : "Registra el dinero entregado al conductor antes o durante su jornada de trabajo.";

  const IconoTipo = esAbono
    ? ArrowUpCircle
    : ArrowDownCircle;

  const estilos = esAbono
    ? {
        barra: "bg-emerald-500",
        fondoIcono: "bg-emerald-100",
        textoIcono: "text-emerald-700",
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        textoTipo: "Abono",
      }
    : {
        barra: "bg-yellow-400",
        fondoIcono: "bg-yellow-100",
        textoIcono: "text-yellow-700",
        badge:
          "border-yellow-200 bg-yellow-50 text-yellow-700",
        textoTipo: "Adelanto",
      };

  const cerrarModal = () => {
    if (saving) {
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:px-5">
      <button
        type="button"
        onClick={cerrarModal}
        disabled={saving}
        className="absolute inset-0 cursor-default bg-slate-950/60"
        aria-label="Cerrar ventana"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="adelanto-modal-title"
        aria-describedby="adelanto-modal-description"
        aria-busy={saving || loadingCatalogos}
        className="relative flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className={`h-1.5 w-full ${estilos.barra}`} />

        <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-6">
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
                    className="text-xl font-black tracking-tight text-slate-950"
                  >
                    {titulo}
                  </h2>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black ${estilos.badge}`}
                  >
                    <IconoTipo size={14} />
                    {estilos.textoTipo}
                  </span>
                </div>

                <p
                  id="adelanto-modal-description"
                  className="mt-1.5 max-w-xl text-sm font-medium leading-5 text-slate-500"
                >
                  {descripcion}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={cerrarModal}
              disabled={saving}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              aria-label="Cerrar"
            >
              <X size={21} />
            </button>
          </div>

          {(loadingCatalogos || saving) && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Loader2
                size={18}
                className="shrink-0 animate-spin text-yellow-600"
              />

              <div>
                <p className="text-sm font-bold text-slate-700">
                  {saving
                    ? "Guardando movimiento"
                    : "Preparando formulario"}
                </p>

                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  {saving
                    ? "Estamos registrando la información."
                    : "Estamos cargando los conductores disponibles."}
                </p>
              </div>
            </div>
          )}
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50">
          <AdelantoForm
            adelantoEditando={adelantoEditando}
            tipoInicial={tipoMovimiento}
            conductores={conductores}
            onSave={onSave}
            onCancel={cerrarModal}
            saving={saving}
            loadingCatalogos={loadingCatalogos}
          />
        </main>
      </section>
    </div>
  );
};

export default AdelantoModal;