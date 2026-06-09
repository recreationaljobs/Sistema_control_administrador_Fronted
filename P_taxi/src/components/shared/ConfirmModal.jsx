const ConfirmModal = ({
  open,
  title = "¿Confirmar acción?",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        {message && (
          <p className="mt-2 text-sm text-slate-600 leading-6">{message}</p>
        )}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition disabled:opacity-50 ${
              danger
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-yellow-400 hover:bg-yellow-500 text-slate-950"
            }`}
          >
            {loading ? "Eliminando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
