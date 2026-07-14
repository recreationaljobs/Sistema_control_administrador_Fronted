// src/modules/configuracion/pages/ConfiguracionPage.jsx

import {
  AlertTriangle,
  BellRing,
  Database,
  KeyRound,
  ListChecks,
  Loader2,
  RefreshCcw,
  Search,
  Settings,
  ShieldX,
  Tags,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
} from "react";

import Swal from "sweetalert2";

import "sweetalert2/dist/sweetalert2.min.css";

import ActivarNotificaciones from "../../jornadas/components/ActivarNotificaciones";

import CatalogoModal from "../components/CatalogoModal";
import CatalogoTable from "../components/CatalogoTable";
import ConfiguracionGeneralForm from "../components/ConfiguracionGeneralForm";

import {
  useConfiguracion,
} from "../hooks/useConfiguracion";


const tabs = [
  {
    key: "general",
    label: "General",
    descripcion: "Parámetros",
    icon: Settings,
  },
  {
    key: "roles",
    label: "Roles",
    descripcion: "Permisos",
    icon: KeyRound,
  },
  {
    key: "estados",
    label: "Estados",
    descripcion: "Situaciones",
    icon: ListChecks,
  },
  {
    key: "tipos",
    label: "Tipos",
    descripcion: "Clasificaciones",
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


  const puedeEditarGeneral =
    esSuperAdmin ||
    esAdminSucursal;


  const puedeAdministrarCatalogos =
    esSuperAdmin ||
    esAdminSucursal;


  const puedeActivarNotificaciones =
    esSuperAdmin ||
    esAdminSucursal;


  const tabsVisibles = esAdminSucursal
    ? tabs.filter(
        (tab) =>
          tab.key === "general" ||
          tab.key === "estados"
      )
    : tabs;


  const tabSeleccionada =
    tabsVisibles.find(
      (tab) =>
        tab.key === tabActiva
    ) ||
    tabsVisibles[0];


  const totalRegistros =
    useMemo(() => {
      return catalogosVisibles.reduce(
        (total, meta) =>
          total +
          filtrarRegistros(
            catalogos[meta.key] || []
          ).length,
        0
      );
    }, [
      catalogos,
      catalogosVisibles,
      filtrarRegistros,
      search,
    ]);


  useEffect(() => {
    if (!success) {
      return;
    }

    void Swal.fire({
      title: success,
      icon: "success",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,
    });
  }, [success]);


  const eliminarConConfirmacion =
    async (
      meta,
      item
    ) => {
      const confirmacion =
        await Swal.fire({
          title:
            "¿Eliminar registro?",

          html: `
            <p style="margin:0;color:#475569">
              Se eliminará
              <strong>${item.nombre}</strong>.
            </p>
          `,

          icon: "warning",

          showCancelButton: true,

          confirmButtonText:
            "Eliminar",

          cancelButtonText:
            "Cancelar",

          confirmButtonColor:
            "#dc2626",

          cancelButtonColor:
            "#64748b",

          reverseButtons: true,
        });

      if (
        !confirmacion.isConfirmed
      ) {
        return;
      }

      await eliminarCatalogo(
        meta,
        item
      );
    };


  if (esTaxista) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-[28px] border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <ShieldX size={32} />
          </div>

          <h1 className="mt-4 text-xl font-black text-slate-950">
            Acceso restringido
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Este módulo está disponible para administradores.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Encabezado principal */}
      <section className="overflow-hidden rounded-[30px] bg-slate-950 shadow-lg">
        <div className="h-1.5 bg-yellow-400" />

        <div className="relative p-5 sm:p-7">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-yellow-400/10" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950">
                <Settings size={29} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-yellow-400">
                  Administración
                </p>

                <h1 className="mt-1 text-2xl font-black text-white md:text-[28px]">
                  Configuración
                </h1>

                <p className="mt-1 text-sm font-medium text-slate-400">
                  Parámetros, notificaciones y catálogos del sistema.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={cargarTodo}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                size={18}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Actualizar
            </button>
          </div>
        </div>
      </section>


      {/* Mensaje de error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
        >
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="text-sm font-black text-red-700">
              No se pudo completar la operación
            </p>

            <p className="mt-1 text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}


      {/* Navegación por pestañas */}
      <section className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex min-w-max gap-2 md:grid md:min-w-0 md:grid-cols-4">
          {tabsVisibles.map(
            (tab) => {
              const Icono =
                tab.icon;

              const activa =
                tabActiva ===
                tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setTabActiva(
                      tab.key
                    );

                    setSearch("");
                  }}
                  className={`flex min-w-[145px] items-center gap-3 rounded-2xl px-4 py-3 text-left transition md:min-w-0 ${
                    activa
                      ? "bg-yellow-400 text-slate-950 shadow-md shadow-yellow-100"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      activa
                        ? "bg-slate-950/10"
                        : "bg-slate-100"
                    }`}
                  >
                    <Icono
                      size={18}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      {tab.label}
                    </p>

                    <p
                      className={`text-xs font-medium ${
                        activa
                          ? "text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {
                        tab.descripcion
                      }
                    </p>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </section>


      {loading ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-yellow-500"
          />

          <p className="mt-3 text-sm font-bold text-slate-500">
            Cargando configuración...
          </p>
        </div>
      ) : (
        <>
          {/* Configuración general */}
          {tabActiva ===
            "general" && (
            <div className="space-y-6">
              <ConfiguracionGeneralForm
                configuracion={
                  configuracion
                }
                onSave={
                  guardarConfiguracionGeneral
                }
                saving={saving}
                puedeEditar={
                  puedeEditarGeneral
                }
              />


              {/* Configuración de notificaciones */}
              {puedeActivarNotificaciones && (
                <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                  <div className="h-1.5 w-full bg-blue-500" />

                  <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                        <BellRing
                          size={24}
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-lg font-black text-slate-950">
                          Notificaciones del sistema
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                          Activa las notificaciones en este dispositivo
                          para recibir alertas relacionadas con los
                          vehículos que pertenecen a tu panel.
                        </p>


                        {esAdminSucursal && (
                          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                            <p className="text-sm font-semibold leading-6 text-green-700">
                              Recibirás alertas de mantenimiento y
                              cambio de aceite únicamente de los
                              vehículos registrados en tu sucursal.
                              No recibirás notificaciones de vehículos
                              pertenecientes a otras sucursales ni del
                              panel del superadministrador.
                            </p>
                          </div>
                        )}


                        {esSuperAdmin && (
                          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                            <p className="text-sm font-semibold leading-6 text-blue-700">
                              Recibirás alertas de mantenimiento y
                              cambio de aceite únicamente de los
                              vehículos registrados sin sucursal, es
                              decir, los vehículos que pertenecen al
                              panel del superadministrador.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>


                    <div className="w-full shrink-0 lg:w-[330px]">
                      <ActivarNotificaciones />
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}


          {/* Catálogos */}
          {tabActiva !==
            "general" && (
            <section className="space-y-5">
              <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <Database
                        size={23}
                      />
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-slate-950">
                        {
                          tabSeleccionada
                            ?.label
                        }
                      </h2>

                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {
                          catalogosVisibles
                            .length
                        }{" "}
                        catálogo(s) ·{" "}
                        {
                          totalRegistros
                        }{" "}
                        registro(s)
                      </p>
                    </div>
                  </div>


                  <div className="relative w-full lg:w-96">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(
                        event
                      ) =>
                        setSearch(
                          event.target
                            .value
                        )
                      }
                      placeholder="Buscar nombre o código..."
                      className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-11 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearch("")
                        }
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Limpiar búsqueda"
                      >
                        <X
                          size={16}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>


              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {catalogosVisibles.map(
                  (meta) => (
                    <CatalogoTable
                      key={
                        meta.key
                      }
                      meta={meta}
                      registros={filtrarRegistros(
                        catalogos[
                          meta.key
                        ] || []
                      )}
                      puedeAdministrar={
                        puedeAdministrarCatalogos
                      }
                      onCreate={
                        abrirModalCrear
                      }
                      onEdit={
                        abrirModalEditar
                      }
                      onDelete={
                        eliminarConConfirmacion
                      }
                    />
                  )
                )}
              </div>
            </section>
          )}
        </>
      )}


      <CatalogoModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarCatalogo}
        catalogoActivo={
          catalogoActivo
        }
        registroEditando={
          registroEditando
        }
        saving={saving}
      />
    </div>
  );
};


export default ConfiguracionPage;