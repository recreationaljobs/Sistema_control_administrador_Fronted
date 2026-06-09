import {
  CalendarDays,
  CarTaxiFront,
  Filter,
  Gauge,
  Plus,
  Search,
  Wallet,
} from "lucide-react";
import JornadaModal from "../components/JornadaModal";
import JornadaTable from "../components/JornadaTable";
import { useJornadas } from "../hooks/useJornadas";

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const JornadasPage = () => {
  const {
    jornadasFiltradas,
    conductores,
    vehiculos,
    asignaciones,
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
    jornadaEditando,
    totalJornadas,
    ingresoTotal,
    pagoConductoresTotal,
    gananciaTotal,
    kilometrosTotal,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarJornada,
    eliminarJornada,
    aplicarFiltros,
    limpiarFiltros,
  } = useJornadas();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
            Jornadas
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
            Registra ingresos diarios, kilometraje recorrido y resultados financieros.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModalCrear}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600]"
        >
          <Plus size={20} />
          Nueva jornada
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
              <CalendarDays size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Total jornadas
              </p>
              <h3 className="mt-1 text-3xl font-black text-slate-950">
                {totalJornadas}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Wallet size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Ingreso bruto
              </p>
              <h3 className="mt-1 text-xl font-black text-green-600">
                {formatoDinero(ingresoTotal)}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <CarTaxiFront size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Pago conductores
              </p>
              <h3 className="mt-1 text-xl font-black text-blue-600">
                {formatoDinero(pagoConductoresTotal)}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <Gauge size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Kilómetros
              </p>
              <h3 className="mt-1 text-xl font-black text-slate-950">
                {Number(kilometrosTotal || 0).toLocaleString()} km
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Listado de jornadas
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Consulta el detalle de cada jornada registrada.
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
                placeholder="Buscar jornada..."
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
          <JornadaTable
            jornadas={jornadasFiltradas}
            loading={loading}
            onEdit={abrirModalEditar}
            onDelete={eliminarJornada}
            esTaxista={esTaxista}
          />
        </div>
      </section>

      <JornadaModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarJornada}
        saving={saving}
        loadingCatalogos={loadingCatalogos}
        jornadaEditando={jornadaEditando}
        conductores={conductores}
        vehiculos={vehiculos}
        asignaciones={asignaciones}
        esSuperAdmin={esSuperAdmin}
        esAdminSucursal={esAdminSucursal}
        esTaxista={esTaxista}
      />
    </div>
  );
};

export default JornadasPage;