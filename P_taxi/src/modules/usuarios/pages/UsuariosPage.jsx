// src/modules/usuarios/pages/UsuariosPage.jsx

import {
  CheckCircle2,
  Loader2,
  Search,
  ShieldCheck,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";

import UsuarioModal from "../components/UsuarioModal";
import UsuarioTable from "../components/UsuarioTable";
import { useUsuarios } from "../hooks/useUsuarios";

const ResumenCard = ({
  titulo,
  valor,
  icono: Icono,
  iconClass,
  valueClass = "text-slate-950",
}) => {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icono size={27} />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-500">
            {titulo}
          </p>

          <h3
            className={`mt-1 text-3xl font-black ${valueClass}`}
          >
            {valor}
          </h3>
        </div>
      </div>
    </article>
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
    cambiarEstadoUsuario,
    darBaja,
    reactivar,
    eliminarUsuario,
  } = useUsuarios();

  /*
   * Protección adicional para evitar que
   * UsuarioTable reciba un objeto o null.
   */
  const listaUsuarios =
    Array.isArray(usuariosFiltrados)
      ? usuariosFiltrados.filter(Boolean)
      : [];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 bg-yellow-400" />

        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
              <Users size={29} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-[28px]">
                Usuarios
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
                Cuentas de acceso del sistema.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirModalCrear}
            disabled={
              saving || loadingCatalogos
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 shadow-md shadow-yellow-100 transition hover:-translate-y-0.5 hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingCatalogos ? (
              <Loader2
                size={19}
                className="animate-spin"
              />
            ) : (
              <UserPlus size={19} />
            )}

            Nuevo usuario
          </button>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
        >
          <p className="text-sm font-black text-red-700">
            No se pudo completar la operación
          </p>

          <p className="mt-1 text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <ResumenCard
          titulo="Total"
          valor={totalUsuarios}
          icono={Users}
          iconClass="bg-yellow-100 text-yellow-700"
        />

        <ResumenCard
          titulo="Activos"
          valor={usuariosActivos}
          icono={CheckCircle2}
          iconClass="bg-emerald-100 text-emerald-600"
          valueClass="text-emerald-600"
        />

        <ResumenCard
          titulo="Administradores"
          valor={administradores}
          icono={ShieldCheck}
          iconClass="bg-blue-100 text-blue-600"
          valueClass="text-blue-600"
        />

        <ResumenCard
          titulo="Taxistas"
          valor={taxistas}
          icono={UserRound}
          iconClass="bg-violet-100 text-violet-600"
          valueClass="text-violet-600"
        />
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Listado de usuarios
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {loading
                ? "Consultando usuarios..."
                : `${listaUsuarios.length} registro(s)`}
            </p>
          </div>

          <div className="relative w-full lg:w-96">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Nombre, usuario, rol o sucursal..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-11 text-sm font-semibold text-slate-800 outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-5">
          <UsuarioTable
            usuarios={listaUsuarios}
            loading={loading}
            esSuperAdmin={esSuperAdmin}
            onEdit={abrirModalEditar}
            onToggleStatus={
              cambiarEstadoUsuario
            }
            onDarBaja={darBaja}
            onReactivar={reactivar}
            onDelete={eliminarUsuario}
          />
        </div>
      </section>

      <UsuarioModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarUsuario}
        saving={saving}
        loadingCatalogos={
          loadingCatalogos
        }
        usuarioEditando={
          usuarioEditando
        }
        roles={roles}
        sucursales={sucursales}
        conductoresDisponibles={
          conductoresDisponibles
        }
        cargarConductoresDisponibles={
          cargarConductoresDisponibles
        }
        esSuperAdmin={esSuperAdmin}
        esAdminSucursal={
          esAdminSucursal
        }
      />
    </div>
  );
};

export default UsuariosPage;