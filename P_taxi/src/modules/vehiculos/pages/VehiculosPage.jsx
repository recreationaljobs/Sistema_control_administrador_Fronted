import {
  AlertTriangle,
  CarTaxiFront,
  Gauge,
  Plus,
  Search,
  Wrench,
} from "lucide-react";
import VehiculoCard from "../components/VehiculoCard";
import VehiculoModal from "../components/VehiculoModal";
import VehiculoTable from "../components/VehiculoTable";
import { useVehiculos } from "../hooks/useVehiculos";

const VehiculosPage = () => {
  const {
    vehiculosFiltrados,
    loading,
    saving,
    error,
    search,
    setSearch,
    modalOpen,
    vehiculoEditando,
    totalVehiculos,
    vehiculosAlertaAceite,
    vehiculosAlertaMantenimiento,
    kilometrajeTotal,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarVehiculo,
    eliminarVehiculo,
  } = useVehiculos();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
            Vehículos
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
            Registra vehículos, kilometraje y alertas de mantenimiento.
          </p>
        </div>

        {!esTaxista && (
          <button
            type="button"
            onClick={abrirModalCrear}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600]"
          >
            <Plus size={20} />
            Nuevo vehículo
          </button>
        )}
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <VehiculoCard
          title="Total vehículos"
          value={totalVehiculos}
          icon={CarTaxiFront}
          color="bg-[#FFF4CF] text-[#E7A900]"
        />

        <VehiculoCard
          title="Kilometraje total"
          value={`${Number(kilometrajeTotal || 0).toLocaleString()} km`}
          icon={Gauge}
          color="bg-blue-100 text-blue-600"
        />

        <VehiculoCard
          title="Alertas aceite"
          value={vehiculosAlertaAceite}
          icon={AlertTriangle}
          color="bg-yellow-100 text-yellow-700"
        />

        <VehiculoCard
          title="Alertas mantenimiento"
          value={vehiculosAlertaMantenimiento}
          icon={Wrench}
          color="bg-red-100 text-red-600"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Listado de vehículos
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Consulta, edita o elimina los vehículos registrados.
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
              placeholder="Buscar vehículo..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
            />
          </div>
        </div>

        <div className="mt-5">
          <VehiculoTable
            vehiculos={vehiculosFiltrados}
            loading={loading}
            onEdit={abrirModalEditar}
            onDelete={eliminarVehiculo}
          />
        </div>
      </section>

      <VehiculoModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarVehiculo}
        saving={saving}
        vehiculoEditando={vehiculoEditando}
        esSuperAdmin={esSuperAdmin}
        esAdminSucursal={esAdminSucursal}
      />
    </div>
  );
};

export default VehiculosPage;