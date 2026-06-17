import {
  AlertTriangle,
  CalendarDays,
  Filter,
  Plus,
  Search,
  Wallet,
  Wrench,
} from "lucide-react";
import AlertasMantenimiento from "../components/AlertasMantenimiento";
import MantenimientoModal from "../components/MantenimientoModal";
import MantenimientoTable from "../components/MantenimientoTable";
import { useMantenimiento } from "../hooks/useMantenimiento";

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const MantenimientoPage = () => {
  const {
    mantenimientosFiltrados,
    vehiculosDisponibles,
    tiposMantenimiento,
    estadosMantenimiento,
    loading,
    loadingCatalogos,
    saving,
    error,
    search,
    setSearch,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    modalOpen,
    mantenimientoEditando,
    totalMantenimientos,
    costoTotal,
    mantenimientosHoy,
    costoHoy,
    pendientes,
    esSuperAdmin,
    esAdminSucursal,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarMantenimiento,
    eliminarMantenimiento,
    aplicarFiltros,
    limpiarFiltros,
  } = useMantenimiento();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
            Mantenimiento
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
            Registra mantenimientos, costos y alertas asociadas a vehículos.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModalCrear}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600]"
        >
          <Plus size={20} />
          Nuevo mantenimiento
        </button>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4CF] text-[#E7A900]">
              <Wrench size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Total mantenimientos
              </p>
              <h3 className="mt-1 text-3xl font-black text-slate-950">
                {totalMantenimientos}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Wallet size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">Costo total</p>
              <h3 className="mt-1 text-xl font-black text-red-600">
                {formatoDinero(costoTotal)}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <CalendarDays size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Costo de hoy
              </p>
              <h3 className="mt-1 text-xl font-black text-blue-600">
                {formatoDinero(costoHoy)}
              </h3>

              <p className="mt-1 text-xs font-bold text-slate-500">
                {mantenimientosHoy.length} registro(s)
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertTriangle size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">Pendientes</p>
              <h3 className="mt-1 text-3xl font-black text-amber-700">
                {pendientes}
              </h3>
            </div>
          </div>
        </div>
      </section>

      <AlertasMantenimiento
        vehiculos={vehiculosDisponibles}
        loading={loadingCatalogos}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Listado de mantenimientos
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Consulta mantenimientos registrados por fecha, vehículo o estado.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-4 xl:w-auto">
            <div className="relative md:col-span-2">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar mantenimiento..."
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
              />
            </div>

            <input
              type="date"
              value={fechaInicio}
              onChange={(event) => setFechaInicio(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
            />

            <input
              type="date"
              value={fechaFin}
              onChange={(event) => setFechaFin(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
            />

            <div className="flex gap-2 md:col-span-4">
              <button
                type="button"
                onClick={aplicarFiltros}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
              >
                <Filter size={18} />
                Filtrar
              </button>

              <button
                type="button"
                onClick={limpiarFiltros}
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <MantenimientoTable
            mantenimientos={mantenimientosFiltrados}
            loading={loading}
            onEdit={abrirModalEditar}
            onDelete={eliminarMantenimiento}
          />
        </div>
      </section>

      <MantenimientoModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarMantenimiento}
        saving={saving}
        loadingCatalogos={loadingCatalogos}
        mantenimientoEditando={mantenimientoEditando}
        vehiculos={vehiculosDisponibles}
        tiposMantenimiento={tiposMantenimiento}
        estadosMantenimiento={estadosMantenimiento}
        esSuperAdmin={esSuperAdmin}
        esAdminSucursal={esAdminSucursal}
      />
    </div>
  );
};

export default MantenimientoPage;