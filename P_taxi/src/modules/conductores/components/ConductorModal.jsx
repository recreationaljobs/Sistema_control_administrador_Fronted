import { X } from "lucide-react";
import ConductorForm from "./ConductorForm";

const ConductorModal = ({ open, conductor, onClose, onSubmit, submitting, submitError }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">
            {conductor ? "Editar conductor" : "Nuevo conductor"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 transition"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <ConductorForm
          initialData={conductor}
          onSubmit={onSubmit}
          submitting={submitting}
          submitError={submitError}
        />
      </div>
    </div>
  );
};

export default ConductorModal;
