// src/modules/asignaciones/components/AsignacionModal.jsx

import { useEffect } from "react";
import {
  Loader2,
  Route,
  X,
} from "lucide-react";

import AsignacionForm from "./AsignacionForm";

const AsignacionModal = ({
  open,
  onClose,
  onSave,
  saving = false,
  loadingCatalogos = false,
  asignacionEditando = null,
  conductores = [],
  vehiculos = [],
  esSuperAdmin = false,
  esAdminSucursal = false,
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
        !saving
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
  }, [open, saving, onClose]);

  if (!open) {
    return null;
  }

  const esEdicion = Boolean(
    asignacionEditando
  );

  const cerrarModal = () => {
    if (saving) {
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:px-5">
      <button
        type="button"
        onClick={cerrarModal}
        disabled={saving}
        className="absolute inset-0 cursor-default bg-slate-950/60"
        aria-label="Cerrar ventana"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="asignacion-modal-title"
        aria-describedby="asignacion-modal-description"
        aria-busy={
          saving || loadingCatalogos
        }
        className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className="h-1.5 w-full bg-yellow-400" />

        <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                <Route size={26} />
              </div>

              <div className="min-w-0">
                <h2
                  id="asignacion-modal-title"
                  className="text-xl font-black tracking-tight text-slate-950"
                >
                  {esEdicion
                    ? "Editar asignación"
                    : "Nueva asignación"}
                </h2>

                <p
                  id="asignacion-modal-description"
                  className="mt-1.5 max-w-xl text-sm font-medium leading-5 text-slate-500"
                >
                  {esEdicion
                    ? "Actualiza el conductor, vehículo, fechas o estado de la asignación."
                    : "Asigna un vehículo a un conductor para habilitar el registro de sus jornadas."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={cerrarModal}
              disabled={saving}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Cerrar"
            >
              <X size={21} />
            </button>
          </div>

          {(loadingCatalogos ||
            saving) && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Loader2
                size={18}
                className="shrink-0 animate-spin text-yellow-600"
              />

              <div>
                <p className="text-sm font-bold text-slate-700">
                  {saving
                    ? esEdicion
                      ? "Actualizando asignación"
                      : "Registrando asignación"
                    : "Preparando formulario"}
                </p>

                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  {saving
                    ? "Estamos guardando la información."
                    : "Estamos cargando los conductores y vehículos disponibles."}
                </p>
              </div>
            </div>
          )}
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50">
          <AsignacionForm
            asignacionEditando={
              asignacionEditando
            }
            conductores={conductores}
            vehiculos={vehiculos}
            onSave={onSave}
            onCancel={cerrarModal}
            saving={saving}
            loadingCatalogos={
              loadingCatalogos
            }
            esSuperAdmin={
              esSuperAdmin
            }
            esAdminSucursal={
              esAdminSucursal
            }
          />
        </main>
      </section>
    </div>
  );
};

export default AsignacionModal;