import {
  Building2,
  CheckCircle2,
  Plus,
  Search,
  XCircle,
} from "lucide-react";

import SucursalModal from "../components/SucursalModal";
import SucursalTable from "../components/SucursalTable";
import { useSucursales } from "../hooks/useSucursales";

const SucursalesLoader = () => {
  return (
    <div
      translate="no"
      className="flex min-h-[280px] flex-col items-center justify-center px-5 py-10 text-center"
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        {/* Aro exterior */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />

        {/* Aro amarillo */}
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[#F5B800] border-t-[#F5B800]" />

        {/* Aro azul contrario */}
        <div
          className="absolute inset-[10px] animate-spin rounded-full border-[3px] border-transparent border-b-blue-500 border-l-blue-500"
          style={{
            animationDuration: "1.4s",
            animationDirection: "reverse",
          }}
        />

        {/* Centro */}
        <div className="absolute inset-[22px] rounded-full bg-gradient-to-br from-[#FFF7D6] via-white to-blue-50 shadow-inner" />

        <div
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#D89C00] shadow-lg"
          style={{
            boxShadow:
              "0 8px 25px rgba(245,184,0,0.18)",
          }}
        >
          <Building2 size={28} />
        </div>

        {/* Partículas */}
        <span className="absolute left-1 top-4 h-2.5 w-2.5 animate-pulse rounded-full bg-[#F5B800]" />

        <span
          className="absolute bottom-4 right-0 h-2 w-2 animate-pulse rounded-full bg-blue-500"
          style={{
            animationDelay: "200ms",
          }}
        />

        <span
          className="absolute right-6 top-0 h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400"
          style={{
            animationDelay: "400ms",
          }}
        />
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-950">
        Cargando sucursales
      </h3>

      <p className="mt-2 text-sm font-medium text-slate-500">
        Preparando la información...
      </p>
    </div>
  );
};

const SucursalesPage = () => {
  const {
    sucursalesFiltradas,
    loading,
    saving,
    error,
    search,
    setSearch,
    modalOpen,
    sucursalEditando,
    totalSucursales,
    sucursalesActivas,
    sucursalesInactivas,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarSucursal,
    cambiarEstadoSucursal,
    eliminarSucursal,
  } = useSucursales();

  return (
    <div
      translate="no"
      className="space-y-6"
    >
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
            Sucursales
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
            Administra las sucursales o clientes que usarán el sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModalCrear}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:-translate-y-0.5 hover:bg-[#DFA600] hover:shadow-lg active:scale-[0.98]"
        >
          <Plus size={20} />
          Nueva sucursal
        </button>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFF4CF] text-[#E7A900]">
              <Building2 size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Total sucursales
              </p>

              <h3 className="mt-1 text-3xl font-black text-slate-950">
                {totalSucursales}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Activas
              </p>

              <h3 className="mt-1 text-3xl font-black text-green-600">
                {sucursalesActivas}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <XCircle size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Inactivas
              </p>

              <h3 className="mt-1 text-3xl font-black text-red-600">
                {sucursalesInactivas}
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#F5B800] via-[#FFD45A] to-blue-500" />

        <div className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Listado de sucursales
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Consulta, edita o cambia el estado de cada sucursal.
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
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Buscar sucursal..."
                disabled={loading}
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
              />
            </div>
          </div>

          <div className="mt-5">
            {loading ? (
              <SucursalesLoader />
            ) : (
              <SucursalTable
                sucursales={
                  sucursalesFiltradas
                }
                loading={false}
                onEdit={
                  abrirModalEditar
                }
                onToggleStatus={
                  cambiarEstadoSucursal
                }
                onDelete={
                  eliminarSucursal
                }
              />
            )}
          </div>
        </div>
      </section>

      <SucursalModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarSucursal}
        saving={saving}
        sucursalEditando={
          sucursalEditando
        }
      />
    </div>
  );
};

export default SucursalesPage;