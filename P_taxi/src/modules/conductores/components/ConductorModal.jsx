
import { X } from "lucide-react";
import ConductorForm from "./ConductorForm";

const ConductorModal = ({
  open,
  conductor,
  onClose,
  onSubmit,
  submitting,
  submitError,
}) => {
  if (!open) return null;

  const handleBackdropClick = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 lg:p-8">
      {/* Fondo oscuro */}
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Contenedor del modal */}
      <div
        className="
          relative
          flex
          max-h-[94vh]
          w-full
          max-w-md
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-2xl

          sm:max-w-2xl
          lg:max-w-5xl
          xl:max-w-6xl
        "
      >
        {/* Encabezado fijo */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
              {conductor
                ? "Editar conductor"
                : "Nuevo conductor"}
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Ingresa la información personal y los datos de la licencia.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <ConductorForm
            initialData={conductor}
            onSubmit={onSubmit}
            submitting={submitting}
            submitError={submitError}
          />
        </div>
      </div>
    </div>
  );
};

export default ConductorModal;

