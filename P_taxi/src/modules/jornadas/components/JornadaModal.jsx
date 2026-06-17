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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40"
        aria-label="Cerrar modal"
      />

      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
              <CalendarDays size={26} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-950">
                {jornadaEditando?.modoFormulario === "cerrar"
                  ? "Cerrar jornada"
                  : jornadaEditando
                  ? "Editar jornada"
                  : "Nueva jornada"}
              </h2>

             <p className="text-sm font-medium text-slate-500">
                {jornadaEditando?.modoFormulario === "cerrar"
                  ? "Ingresa el kilometraje final al terminar la jornada diaria."
                  : "Registra el kilometraje inicial y los datos operativos del día."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <X size={22} />
          </button>
        </div>

        <div className="max-h-[calc(92vh-90px)] overflow-y-auto">
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