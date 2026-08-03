import { UserPlus, X } from "lucide-react";
import UsuarioForm from "./UsuarioForm";

const UsuarioModal = ({
  open,
  onClose,
  onSave,
  saving,
  loadingCatalogos,
  usuarioEditando,
  roles = [],
  sucursales = [],
  conductoresDisponibles = [],
  cargarConductoresDisponibles = () => {},
  esSuperAdmin = false,
  esAdminSucursal = false,
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

      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
              <UserPlus size={26} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-950">
                {usuarioEditando ? "Editar usuario" : "Nuevo usuario"}
              </h2>

              <p className="text-sm font-medium text-slate-500">
                Crea cuentas de acceso según el rol correspondiente.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <X size={22} />
          </button>
        </div>

        <div className="max-h-[calc(92vh-90px)] overflow-y-auto">
          <UsuarioForm
            usuarioEditando={usuarioEditando}
            roles={roles}
            sucursales={sucursales}
            conductoresDisponibles={conductoresDisponibles}
            cargarConductoresDisponibles={cargarConductoresDisponibles}
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

export default UsuarioModal;