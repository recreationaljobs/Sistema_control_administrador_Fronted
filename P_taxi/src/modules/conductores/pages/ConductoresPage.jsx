import { Plus, UserCircle2 } from "lucide-react";
import { useConductores } from "../hooks/useConductores";
import { useAuth } from "../../../hooks/useAuth";
import ConductorTable from "../components/ConductorTable";
import ConductorModal from "../components/ConductorModal";
import Loading from "../../../components/shared/Loading";
import EmptyState from "../../../components/shared/EmptyState";
import ConfirmModal from "../../../components/shared/ConfirmModal";
import PageHeader from "../../../components/shared/PageHeader";

const ConductoresPage = () => {
  const {
    conductores,
    loading,
    error,
    isModalOpen,
    selectedConductor,
    submitting,
    submitError,
    conductorToDelete,
    deleting,
    openCreate,
    openEdit,
    closeModal,
    openDelete,
    closeDelete,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleDespedir,
    handleReactivar,
  } = useConductores();

  const { rol } = useAuth();
  const canManage = rol === "superadmin" || rol === "admin_sucursal";

  return (
    <div>
      <PageHeader
        title="Conductores"
        description="Gestiona los conductores de la flota."
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-2.5 text-sm font-black text-slate-950 shadow-sm hover:bg-yellow-500 transition"
          >
            <Plus size={17} />
            Nuevo conductor
          </button>
        }
      />

      {loading && <Loading text="Cargando conductores..." />}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && conductores.length === 0 && (
        <EmptyState
          icon={UserCircle2}
          title="Sin conductores registrados"
          description="Agrega el primer conductor usando el botón de arriba."
        />
      )}

      {!loading && !error && conductores.length > 0 && (
        <ConductorTable
          conductores={conductores}
          onEdit={openEdit}
          onDelete={openDelete}
          onDespedir={handleDespedir}
          onReactivar={handleReactivar}
          canManage={canManage}
        />
      )}

      <ConductorModal
        open={isModalOpen}
        conductor={selectedConductor}
        onClose={closeModal}
        onSubmit={selectedConductor ? handleUpdate : handleCreate}
        submitting={submitting}
        submitError={submitError}
      />

      <ConfirmModal
        open={Boolean(conductorToDelete)}
        title="Eliminar conductor"
        message={
          conductorToDelete
            ? `¿Eliminar a ${conductorToDelete.nombre} ${conductorToDelete.apellido}? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={closeDelete}
        loading={deleting}
        danger
      />
    </div>
  );
};

export default ConductoresPage;
