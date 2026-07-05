// src/modules/jornadas/components/JornadaModal.jsx

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
    jornadaEditando?.modoFormulario ===
    "cerrar";

  const modoEdicion =
    Boolean(jornadaEditando) &&
    !modoCierre;

  const tituloModal = modoCierre
    ? "Cerrar jornada"
    : modoEdicion
    ? "Editar jornada"
    : "Nueva jornada";

  const descripcionModal = modoCierre
    ? "Ingresa el kilometraje final para terminar la jornada diaria."
    : esTaxista
    ? "Registra el kilometraje inicial para comenzar tu jornada."
    : modoEdicion
    ? "Actualiza la información de la jornada."
    : "Registra los datos operativos de la jornada.";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-950/40 px-4 py-5 backdrop-blur-sm">
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
        className={`relative z-10 flex max-h-[calc(100dvh-2.5rem)] w-full min-w-0 flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ${
          esTaxista
            ? "max-w-md"
            : "max-w-4xl"
        }`}
      >
        <div className="flex min-w-0 shrink-0 items-start gap-3 border-b border-slate-100 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
            <CalendarDays size={25} />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="jornada-modal-title"
              className="break-words text-xl font-black leading-tight text-slate-950"
            >
              {tituloModal}
            </h2>

            <p className="mt-1 break-words text-sm font-medium leading-5 text-slate-500">
              {descripcionModal}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
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