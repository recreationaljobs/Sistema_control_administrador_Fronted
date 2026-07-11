// src/modules/conductores/components/ConductorModal.jsx

import { useEffect } from "react";
import {
  Loader2,
  UserRound,
  X,
} from "lucide-react";

import ConductorForm from "./ConductorForm";

const ConductorModal = ({
  open,
  conductor,
  onClose,
  onSubmit,
  submitting = false,
  submitError = "",
}) => {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const overflowAnterior =
      document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        !submitting
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        overflowAnterior;
    };
  }, [open, submitting, onClose]);

  if (!open) {
    return null;
  }

  const esEdicion = Boolean(conductor);

  const cerrarModal = () => {
    if (submitting) {
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-3 py-4 sm:px-5">
      <button
        type="button"
        onClick={cerrarModal}
        disabled={submitting}
        className="absolute inset-0 cursor-default bg-slate-950/60"
        aria-label="Cerrar modal"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="conductor-modal-title"
        aria-busy={submitting}
        className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className="h-1.5 w-full bg-yellow-400" />

        <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                <UserRound size={25} />
              </div>

              <div>
                <h2
                  id="conductor-modal-title"
                  className="text-xl font-black tracking-tight text-slate-950"
                >
                  {esEdicion
                    ? "Editar conductor"
                    : "Nuevo conductor"}
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Datos personales, licencia y pago.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={cerrarModal}
              disabled={submitting}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Cerrar"
            >
              <X size={21} />
            </button>
          </div>

          {submitting && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Loader2
                size={18}
                className="animate-spin text-yellow-600"
              />

              <p className="text-sm font-bold text-slate-600">
                {esEdicion
                  ? "Actualizando conductor..."
                  : "Registrando conductor..."}
              </p>
            </div>
          )}
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50">
          <ConductorForm
            initialData={conductor}
            onSubmit={onSubmit}
            onCancel={cerrarModal}
            submitting={submitting}
            submitError={submitError}
          />
        </main>
      </section>
    </div>
  );
};

export default ConductorModal;