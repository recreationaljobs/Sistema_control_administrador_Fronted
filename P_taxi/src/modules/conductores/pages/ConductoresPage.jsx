import {
  CheckCircle2,
  Link2,
  Search,
  UserPlus,
  UserRound,
  XCircle,
} from "lucide-react";
import ConductorCard from "../components/ConductorCard";
import ConductorModal from "../components/ConductorModal";
import ConductorTable from "../components/ConductorTable";
import { useConductores } from "../hooks/useConductores";

const ConductoresPage = () => {
  const {
  conductoresFiltrados,
  loading,
  saving,
  error,
  search,
  setSearch,
  modalOpen,
  conductorEditando,
  totalConductores,
  conductoresActivos,
  conductoresInactivos,
  conductoresConUsuario,
  esSuperAdmin,
  esAdminSucursal,
  abrirModalCrear,
  abrirModalEditar,
  cerrarModal,
  guardarConductor,
  cambiarEstadoConductor,
  eliminarConductor,
} = useConductores();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
            Conductores
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
            Administra los taxistas registrados y sus datos de licencia.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModalCrear}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600]"
        >
          <UserPlus size={20} />
          Nuevo conductor
        </button>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ConductorCard
          title="Total conductores"
          value={totalConductores}
          icon={UserRound}
          color="bg-[#FFF4CF] text-[#E7A900]"
        />

        <ConductorCard
          title="Activos"
          value={conductoresActivos}
          icon={CheckCircle2}
          color="bg-green-100 text-green-600"
        />

        <ConductorCard
          title="Inactivos"
          value={conductoresInactivos}
          icon={XCircle}
          color="bg-red-100 text-red-600"
        />

        <ConductorCard
          title="Con usuario"
          value={conductoresConUsuario}
          icon={Link2}
          color="bg-blue-100 text-blue-600"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Listado de conductores
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Consulta, edita o cambia el estado de cada conductor.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar conductor..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
            />
          </div>
        </div>

        <div className="mt-5">
          <ConductorTable
            conductores={conductoresFiltrados}
            loading={loading}
            onEdit={abrirModalEditar}
            onToggleStatus={cambiarEstadoConductor}
            onDelete={eliminarConductor}
          />
        </div>
      </section>

     <ConductorModal
      open={modalOpen}
      onClose={cerrarModal}
      onSave={guardarConductor}
      saving={saving}
      conductorEditando={conductorEditando}
      esSuperAdmin={esSuperAdmin}
      esAdminSucursal={esAdminSucursal}
    />
    </div>
  );
};

export default ConductoresPage;