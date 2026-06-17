import { Wrench, X } from "lucide-react";
import MantenimientoForm from "./MantenimientoForm";

const MantenimientoModal = ({
  open,
  onClose,
  onSave,
  saving,
  loadingCatalogos,
  mantenimientoEditando,
  vehiculos = [],
  tiposMantenimiento = [],
  estadosMantenimiento = [],
  esSuperAdmin = false,
  esAdminSucursal = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40"
        aria-label="Cerrar modal"
      />

      <div className="relative max-h-[94vh] w-full max-w-4xl overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:items-center sm:px-6">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
              <Wrench size={26} />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-950 sm:text-xl">
                {mantenimientoEditando
                  ? "Editar mantenimiento"
                  : "Nuevo mantenimiento"}
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Registra mantenimiento aplicado directamente a un vehículo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        <div className="max-h-[calc(94vh-92px)] overflow-y-auto">
          <MantenimientoForm
            mantenimientoEditando={mantenimientoEditando}
            vehiculos={vehiculos}
            tiposMantenimiento={tiposMantenimiento}
            estadosMantenimiento={estadosMantenimiento}
            onSave={onSave}
            onCancel={onClose}
            saving={saving}
            loadingCatalogos={loadingCatalogos}
            esSuperAdmin={esSuperAdmin}
            esAdminSucursal={esAdminSucursal}
          />
        </div>
      </div>
    </div>
  );
};

export default MantenimientoModal;