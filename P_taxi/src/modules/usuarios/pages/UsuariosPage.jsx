import {
  CheckCircle2,
  Search,
  ShieldCheck,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";

import UsuarioModal from "../components/UsuarioModal";
import UsuarioTable from "../components/UsuarioTable";
import { useUsuarios } from "../hooks/useUsuarios";

const UsuariosLoader = () => {
  return (
    <div
      translate="no"
      className="flex min-h-[300px] flex-col items-center justify-center px-5 py-10 text-center"
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />

        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[#F5B800] border-t-[#F5B800]" />

        <div
          className="absolute inset-[10px] animate-spin rounded-full border-[3px] border-transparent border-b-purple-500 border-l-purple-500"
          style={{
            animationDuration: "1.4s",
            animationDirection: "reverse",
          }}
        />

        <div className="absolute inset-[22px] rounded-full bg-gradient-to-br from-[#FFF7D6] via-white to-purple-50 shadow-inner" />

        <div
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#D89C00] shadow-lg"
          style={{
            boxShadow:
              "0 8px 25px rgba(245,184,0,0.20)",
          }}
        >
          <Users size={29} />
        </div>

        <span className="absolute left-1 top-4 h-2.5 w-2.5 animate-pulse rounded-full bg-[#F5B800]" />

        <span
          className="absolute bottom-4 right-0 h-2 w-2 animate-pulse rounded-full bg-purple-500"
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
        Cargando usuarios
      </h3>

      <p className="mt-2 text-sm font-medium text-slate-500">
        Preparando las cuentas y permisos del sistema...
      </p>
    </div>
  );
};

const UsuariosPage = () => {
  const {
    usuariosFiltrados,
    roles,
    sucursales,
    conductoresDisponibles,

    loading,
    loadingCatalogos,
    saving,

    error,
    search,
    setSearch,

    modalOpen,
    usuarioEditando,

    totalUsuarios,
    usuariosActivos,
    administradores,
    taxistas,

    esSuperAdmin,
    esAdminSucursal,

    cargarConductoresDisponibles,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarUsuario,
    enviarDatosWhatsApp,
    cambiarEstadoUsuario,
    darBaja,
    reactivar,
    eliminarUsuario,
  } = useUsuarios();

  return (
    <div
      translate="no"
      className="space-y-6"
    >
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
            Usuarios
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
            Administra las cuentas de acceso del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModalCrear}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:-translate-y-0.5 hover:bg-[#DFA600] hover:shadow-lg active:scale-[0.98]"
        >
          <UserPlus size={20} />

          Nuevo usuario
        </button>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFF4CF] text-[#E7A900]">
              <Users size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Total usuarios
              </p>

              <h3 className="mt-1 text-3xl font-black text-slate-950">
                {totalUsuarios}
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
                Activos
              </p>

              <h3 className="mt-1 text-3xl font-black text-green-600">
                {usuariosActivos}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <ShieldCheck size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Administradores
              </p>

              <h3 className="mt-1 text-3xl font-black text-blue-600">
                {administradores}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <UserRound size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Taxistas
              </p>

              <h3 className="mt-1 text-3xl font-black text-purple-600">
                {taxistas}
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#F5B800] via-[#FFD45A] to-purple-500" />

        <div className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Listado de usuarios
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Consulta, edita o cambia el estado de cada usuario.
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
                  setSearch(event.target.value)
                }
                placeholder="Buscar usuario..."
                disabled={loading}
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
              />
            </div>
          </div>

          <div className="mt-5">
            {loading ? (
              <UsuariosLoader />
            ) : (
              <UsuarioTable
                usuarios={usuariosFiltrados}
                loading={false}
                esSuperAdmin={esSuperAdmin}
                onWhatsApp={enviarDatosWhatsApp}
                onEdit={abrirModalEditar}
                onToggleStatus={cambiarEstadoUsuario}
                onDarBaja={darBaja}
                onReactivar={reactivar}
                onDelete={eliminarUsuario}
              />
            )}
          </div>
        </div>
      </section>

      <UsuarioModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarUsuario}
        saving={saving}
        loadingCatalogos={loadingCatalogos}
        usuarioEditando={usuarioEditando}
        roles={roles}
        sucursales={sucursales}
        conductoresDisponibles={conductoresDisponibles}
        cargarConductoresDisponibles={
          cargarConductoresDisponibles
        }
        esSuperAdmin={esSuperAdmin}
        esAdminSucursal={esAdminSucursal}
      />
    </div>
  );
};

export default UsuariosPage;