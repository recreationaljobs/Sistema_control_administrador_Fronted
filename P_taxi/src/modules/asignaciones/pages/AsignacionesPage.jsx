import {
  CheckCircle2,
  Clock3,
  Plus,
  Route,
  Search,
} from "lucide-react";
import AsignacionModal from "../components/AsignacionModal";
import AsignacionTable from "../components/AsignacionTable";
import { useAsignaciones } from "../hooks/useAsignaciones";

const AsignacionesPage = () => {
  const {
    asignacionesFiltradas,
    conductores,
    vehiculos,
    loading,
    loadingCatalogos,
    saving,
    error,
    search,
    setSearch,
    modalOpen,
    asignacionEditando,
    totalAsignaciones,
    asignacionesActivas,
    asignacionesInactivas,
    esSuperAdmin,
    esAdminSucursal,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarAsignacion,
    cambiarEstadoAsignacion,
    eliminarAsignacion,
  } = useAsignaciones();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
            Asignaciones
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
            Une conductores con vehículos para habilitar sus jornadas diarias.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModalCrear}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600]"
        >
          <Plus size={20} />
          Nueva asignación
        </button>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4CF] text-[#E7A900]">
              <Route size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Total asignaciones
              </p>
              <h3 className="mt-1 text-3xl font-black text-slate-950">
                {totalAsignaciones}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">Activas</p>
              <h3 className="mt-1 text-3xl font-black text-green-600">
                {asignacionesActivas}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Clock3 size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">Inactivas</p>
              <h3 className="mt-1 text-3xl font-black text-red-600">
                {asignacionesInactivas}
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Listado de asignaciones
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Consulta qué vehículo tiene asignado cada conductor.
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
              placeholder="Buscar asignación..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
            />
          </div>
        </div>

        <div className="mt-5">
          <AsignacionTable
            asignaciones={asignacionesFiltradas}
            loading={loading}
            onEdit={abrirModalEditar}
            onToggleStatus={cambiarEstadoAsignacion}
            onDelete={eliminarAsignacion}
          />
        </div>
      </section>

      <AsignacionModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarAsignacion}
        saving={saving}
        loadingCatalogos={loadingCatalogos}
        asignacionEditando={asignacionEditando}
        conductores={conductores}
        vehiculos={vehiculos}
        esSuperAdmin={esSuperAdmin}
        esAdminSucursal={esAdminSucursal}
      />
    </div>
  );
};

export default AsignacionesPage;