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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-950/40 px-3 py-4 backdrop-blur-sm sm:px-4">
  <button
    type="button"
    onClick={onClose}
    className="absolute inset-0"
    aria-label="Cerrar modal"
  />

  <div className="relative my-auto w-full min-w-0 max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl">
    {/* Encabezado */}

    <div className="max-h-[calc(100dvh-2rem)] w-full min-w-0 overflow-y-auto overflow-x-hidden">
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