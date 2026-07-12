// src/modules/asignaciones/pages/AsignacionesPage.jsx

import {
  CheckCircle2,
  Clock3,
  Loader2,
  Plus,
  Route,
  Search,
  XCircle,
} from "lucide-react";

import Swal from "sweetalert2";

import AsignacionModal from "../components/AsignacionModal";
import AsignacionTable from "../components/AsignacionTable";
import { useAsignaciones } from "../hooks/useAsignaciones";

const TarjetaResumen = ({
  titulo,
  valor,
  icono: Icono,
  fondoIcono,
  textoIcono,
  textoValor,
  descripcion,
}) => {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${fondoIcono} ${textoIcono}`}
        >
          <Icono size={28} />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-500">
            {titulo}
          </p>

          <h3
            className={`mt-1 text-3xl font-black ${textoValor}`}
          >
            {valor}
          </h3>

          {descripcion && (
            <p className="mt-1 text-xs font-medium text-slate-400">
              {descripcion}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

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

 const guardarConAlerta = async (datos) => {
  const resultado =
    await guardarAsignacion(datos);

  return resultado;
};

    try {
      const resultado =
        await guardarAsignacion(datos);

      /*
       * Si el hook devuelve false cuando ocurre
       * un error, no se muestra la alerta.
       */
      if (resultado === false) {
        return;
      }

      void Swal.fire({
        title: esEdicion
          ? "Asignación actualizada"
          : "Asignación registrada",
        text: esEdicion
          ? ""
          : "El vehículo fue asignado correctamente al conductor.",
        icon: "success",
        confirmButtonColor: "#F5B800",
        confirmButtonText: "Aceptar",
      });
    } catch (guardarError) {
     const mensaje =
             obtenerMensajeError(error);
     
           setFormError(mensaje);
     
           void Swal.fire({
             title: "No se pudo guardar",
             text: mensaje,
             icon: "error",
             confirmButtonText: "Entendido",
             confirmButtonColor: "#dc2626",
           });
    }
  };

  const listaAsignaciones =
  Array.isArray(asignacionesFiltradas)
    ? asignacionesFiltradas.filter(Boolean)
    : [];

const cantidadResultados =
  listaAsignaciones.length;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 w-full bg-yellow-400" />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                <Route size={29} />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-[28px]">
                  Asignaciones
                </h1>

                <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500 md:text-base">
                  Relaciona conductores con
                  vehículos para habilitar el
                  registro de sus jornadas
                  diarias.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={abrirModalCrear}
              disabled={
                saving || loadingCatalogos
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 shadow-md shadow-yellow-100 transition hover:-translate-y-0.5 hover:bg-yellow-500 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loadingCatalogos ? (
                <Loader2
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Plus size={20} />
              )}

              Nueva asignación
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <XCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="text-sm font-black text-red-700">
                No se pudo completar la
                operación
              </p>

              <p className="mt-1 text-sm font-medium text-red-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <TarjetaResumen
          titulo="Total de asignaciones"
          valor={totalAsignaciones}
          descripcion="Registros encontrados"
          icono={Route}
          fondoIcono="bg-yellow-100"
          textoIcono="text-yellow-700"
          textoValor="text-slate-950"
        />

        <TarjetaResumen
          titulo="Asignaciones activas"
          valor={asignacionesActivas}
          descripcion="Habilitadas para trabajar"
          icono={CheckCircle2}
          fondoIcono="bg-emerald-100"
          textoIcono="text-emerald-600"
          textoValor="text-emerald-600"
        />

        <TarjetaResumen
          titulo="Asignaciones inactivas"
          valor={asignacionesInactivas}
          descripcion="Sin acceso a jornadas"
          icono={Clock3}
          fondoIcono="bg-red-100"
          textoIcono="text-red-600"
          textoValor="text-red-600"
        />
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Listado de asignaciones
            </h2>

            <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
              Consulta qué vehículo tiene
              asignado cada conductor.
            </p>
          </div>

          <div className="relative w-full lg:w-96">
            <label
              htmlFor="buscar-asignacion"
              className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500"
            >
              Buscar asignación
            </label>

            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="buscar-asignacion"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Conductor, placa, número o sucursal..."
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-500">
            {loading
              ? "Consultando asignaciones..."
              : `${cantidadResultados} ${
                  cantidadResultados === 1
                    ? "asignación encontrada"
                    : "asignaciones encontradas"
                }`}
          </p>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-sm font-black text-yellow-700 transition hover:text-yellow-800"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>

        <div className="mt-5">
          <AsignacionTable
            asignaciones={listaAsignaciones}
            loading={loading}
            onEdit={abrirModalEditar}
            onToggle={cambiarEstadoAsignacion}
            onDelete={eliminarAsignacion}
          />
        </div>
      </section>

      <AsignacionModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarConAlerta}
        saving={saving}
        loadingCatalogos={
          loadingCatalogos
        }
        asignacionEditando={
          asignacionEditando
        }
        conductores={conductores}
        vehiculos={vehiculos}
        esSuperAdmin={esSuperAdmin}
        esAdminSucursal={
          esAdminSucursal
        }
      />
    </div>
  );
};

export default AsignacionesPage;