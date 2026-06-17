import {
  KeyRound,
  ListChecks,
  RefreshCcw,
  Search,
  Settings,
  Tags,
} from "lucide-react";
import CatalogoModal from "../components/CatalogoModal";
import CatalogoTable from "../components/CatalogoTable";
import ConfiguracionGeneralForm from "../components/ConfiguracionGeneralForm";
import { useConfiguracion } from "../hooks/useConfiguracion";
const tabs = [
  {
    key: "general",
    label: "General",
    icon: Settings,
  },
  {
    key: "roles",
    label: "Roles",
    icon: KeyRound,
  },
  {
    key: "estados",
    label: "Estados",
    icon: ListChecks,
  },
  {
    key: "tipos",
    label: "Tipos",
    icon: Tags,
  },
];

const ConfiguracionPage = () => {
  const {
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,
    tabActiva,
    setTabActiva,
    configuracion,
    catalogos,
    catalogosVisibles,
    loading,
    saving,
    error,
    success,
    search,
    setSearch,
    modalOpen,
    catalogoActivo,
    registroEditando,
    cargarTodo,
    guardarConfiguracionGeneral,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarCatalogo,
    eliminarCatalogo,
    filtrarRegistros,
  } = useConfiguracion();

  const puedeEditarGeneral = esSuperAdmin || esAdminSucursal;
  const puedeAdministrarCatalogos = esSuperAdmin;

  if (esTaxista) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-black text-red-800">
          Acceso no permitido
        </h1>

        <p className="mt-2 text-sm font-semibold text-red-700">
          El usuario taxista no tiene acceso al módulo de configuración.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
              <Settings size={30} />
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
                Configuración
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
                Administra parámetros generales, roles, estados y tipos del
                sistema.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={cargarTodo}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCcw size={18} />
            Actualizar
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
          {success}
        </div>
      )}

      <section className="rounded-[24px] border border-slate-200 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tabActiva === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTabActiva(tab.key)}
                className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
                  active
                    ? "bg-[#F5B800] text-white shadow-md shadow-yellow-100"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {loading ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Cargando configuración...
          </p>
        </div>
      ) : (
        <>
          {tabActiva === "general" && (
            <ConfiguracionGeneralForm
              configuracion={configuracion}
              onSave={guardarConfiguracionGeneral}
              saving={saving}
              puedeEditar={puedeEditarGeneral}
            />
          )}

          {tabActiva !== "general" && (
            <section className="space-y-5">
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      Catálogos del sistema
                    </h2>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {puedeAdministrarCatalogos
                        ? "Puedes crear, editar y eliminar registros de catálogos."
                        : "Puedes consultar catálogos. Solo el superadministrador puede modificarlos."}
                    </p>
                  </div>

                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Buscar por nombre o código..."
                      className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 lg:w-[320px]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {catalogosVisibles.map((meta) => (
                  <CatalogoTable
                    key={meta.key}
                    meta={meta}
                    registros={filtrarRegistros(catalogos[meta.key] || [])}
                    puedeAdministrar={puedeAdministrarCatalogos}
                    onCreate={abrirModalCrear}
                    onEdit={abrirModalEditar}
                    onDelete={eliminarCatalogo}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <CatalogoModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarCatalogo}
        catalogoActivo={catalogoActivo}
        registroEditando={registroEditando}
        saving={saving}
      />
    </div>
  );
};

export default ConfiguracionPage;