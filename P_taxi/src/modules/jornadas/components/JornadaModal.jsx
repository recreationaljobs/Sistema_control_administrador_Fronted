import { CalendarDays, X } from "lucide-react";
import JornadaForm from "./JornadaForm";

const JornadaModal = ({
  open,
  onClose,
  onSave,
  saving,
  loadingCatalogos,
  jornadaEditando,
  conductores = [],
  vehiculos = [],
  asignaciones = [],
  esSuperAdmin = false,
  esAdminSucursal = false,
  esTaxista = false,
}) => {
  if (!open) {
    return null;
  }

  const modoCierre =
    jornadaEditando?.modoFormulario === "cerrar";

  const modoEdicion =
    Boolean(jornadaEditando) && !modoCierre;

  const tituloModal = modoCierre
    ? "Cerrar jornada"
    : modoEdicion
    ? "Editar jornada"
    : "Nueva jornada";

  const descripcionModal = modoCierre
    ? "Completa los datos para cerrar la jornada."
    : modoEdicion
    ? "Corrige los datos necesarios."
    : esTaxista
    ? "Registra el kilometraje inicial."
    : "Registra la jornada.";

  const anchoModal = esTaxista
    ? "max-w-md"
    : modoEdicion
    ? "max-w-2xl"
    : "max-w-4xl";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/40 px-3 py-4 backdrop-blur-sm">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar modal"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="jornada-modal-title"
        className={`relative z-10 flex max-h-[calc(100dvh-2rem)] w-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${anchoModal}`}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF4CF] text-[#E7A900]">
            <CalendarDays size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="jornada-modal-title"
              className="text-lg font-black leading-tight text-slate-950"
            >
              {tituloModal}
            </h2>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {descripcionModal}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <JornadaForm
            jornadaEditando={jornadaEditando}
            conductores={conductores}
            vehiculos={vehiculos}
            asignaciones={asignaciones}
            onSave={onSave}
            onCancel={onClose}
            saving={saving}
            loadingCatalogos={loadingCatalogos}
            esSuperAdmin={esSuperAdmin}
            esAdminSucursal={esAdminSucursal}
            esTaxista={esTaxista}
          />
        </div>
      </div>
    </div>
  );
};

export default JornadaModal;