// src/modules/conductores/pages/ConductoresPage.jsx

import {
  AlertTriangle,
  Plus,
  Search,
  UserCheck,
  UserRound,
  UserX,
  XCircle,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import Swal from "sweetalert2";

import "sweetalert2/dist/sweetalert2.min.css";

import { useConductores } from "../hooks/useConductores";
import { useAuth } from "../../../hooks/useAuth";

import ConductorCard from "../components/ConductorCard";
import ConductorTable from "../components/ConductorTable";
import ConductorModal from "../components/ConductorModal";
import ConfirmModal from "../../../components/shared/ConfirmModal";

const diasHastaVencimiento = (fecha) => {
  if (!fecha) {
    return null;
  }

  const hoy = new Date();

  hoy.setHours(
    0,
    0,
    0,
    0
  );

  const vencimiento = new Date(
    `${String(fecha).slice(
      0,
      10
    )}T00:00:00`
  );

  return Math.ceil(
    (
      vencimiento.getTime() -
      hoy.getTime()
    ) /
      86_400_000
  );
};

const obtenerMensajeError = (
  error
) => {
  const data =
    error?.response?.data;

  if (
    typeof data?.detail ===
    "string"
  ) {
    return data.detail;
  }

  if (
    typeof data?.message ===
    "string"
  ) {
    return data.message;
  }

  if (
    data &&
    typeof data === "object"
  ) {
    const primerValor =
      Object.values(data)[0];

    if (
      Array.isArray(primerValor)
    ) {
      return (
        primerValor[0] ||
        "No se pudo completar la operación."
      );
    }

    if (
      typeof primerValor ===
      "string"
    ) {
      return primerValor;
    }
  }

  return (
    error?.message ||
    "No se pudo completar la operación."
  );
};

const ConductoresLoader = () => {
  return (
    <div
      translate="no"
      className="flex min-h-[310px] flex-col items-center justify-center px-5 py-10 text-center"
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        {/* Fondo exterior */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />

        {/* Aro amarillo */}
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-yellow-400 border-t-yellow-400" />

        {/* Aro azul contrario */}
        <div
          className="absolute inset-[10px] animate-spin rounded-full border-[3px] border-transparent border-b-blue-500 border-l-blue-500"
          style={{
            animationDuration:
              "1.4s",
            animationDirection:
              "reverse",
          }}
        />

        {/* Centro */}
        <div className="absolute inset-[22px] rounded-full bg-gradient-to-br from-yellow-50 via-white to-blue-50 shadow-inner" />

        {/* Icono central */}
        <div
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-yellow-700 shadow-lg"
          style={{
            boxShadow:
              "0 8px 25px rgba(234,179,8,0.22)",
          }}
        >
          <UserRound size={29} />
        </div>

        {/* Partículas */}
        <span className="absolute left-1 top-4 h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-400" />

        <span
          className="absolute bottom-4 right-0 h-2 w-2 animate-pulse rounded-full bg-blue-500"
          style={{
            animationDelay:
              "200ms",
          }}
        />

        <span
          className="absolute right-6 top-0 h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400"
          style={{
            animationDelay:
              "400ms",
          }}
        />
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-950">
        Cargando conductores
      </h3>

      <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">
        Preparando la información de conductores y licencias...
      </p>
    </div>
  );
};

const ConductoresPage = () => {
  const {
    conductores,
    loading,
    error,

    isModalOpen,
    selectedConductor,

    submitting,
    submitError,

    conductorToDelete,
    deleting,

    openCreate,
    openEdit,
    closeModal,

    openDelete,
    closeDelete,

    handleCreate,
    handleUpdate,
    handleDelete,
    handleDespedir,
    handleReactivar,
  } = useConductores();

  const { rol } = useAuth();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filtroEstado,
    setFiltroEstado,
  ] = useState("TODOS");

  const rolNormalizado = String(
    rol || ""
  )
    .trim()
    .toLowerCase();

  const canManage =
    rolNormalizado ===
      "superadmin" ||
    rolNormalizado ===
      "super_admin" ||
    rolNormalizado ===
      "admin_sucursal";

  const conductoresActivos =
    conductores.filter(
      (conductor) =>
        conductor.activo !== false
    ).length;

  const conductoresInactivos =
    conductores.length -
    conductoresActivos;

  const licenciasPorVencer =
    conductores.filter(
      (conductor) => {
        const fecha =
          conductor.fecha_vencimiento_licencia ||
          conductor.vencimiento_licencia;

        const dias =
          diasHastaVencimiento(
            fecha
          );

        return (
          dias !== null &&
          dias >= 0 &&
          dias <= 30
        );
      }
    ).length;

  const conductoresFiltrados =
    useMemo(() => {
      const termino = search
        .trim()
        .toLowerCase();

      return conductores.filter(
        (conductor) => {
          const activo =
            conductor.activo !==
            false;

          if (
            filtroEstado ===
              "ACTIVOS" &&
            !activo
          ) {
            return false;
          }

          if (
            filtroEstado ===
              "INACTIVOS" &&
            activo
          ) {
            return false;
          }

          if (!termino) {
            return true;
          }

          const texto = [
            conductor.nombre,
            conductor.apellido,
            conductor.cedula,
            conductor.numero_licencia,
            conductor.telefono,
            conductor.sucursal_nombre,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return texto.includes(
            termino
          );
        }
      );
    }, [
      conductores,
      search,
      filtroEstado,
    ]);

  const guardarConductor = async (
    payload
  ) => {
    const esEdicion = Boolean(
      selectedConductor
    );

    try {
      const resultado = esEdicion
        ? await handleUpdate(
            payload
          )
        : await handleCreate(
            payload
          );

      if (resultado === false) {
        return false;
      }

      await Swal.fire({
        title: esEdicion
          ? "¡Conductor actualizado!"
          : "¡Conductor registrado!",

        text: esEdicion
          ? "Los cambios del conductor se guardaron correctamente."
          : "El conductor fue registrado correctamente.",

        icon: "success",

        showConfirmButton: false,
        showCancelButton: false,

        timer: 2200,
        timerProgressBar: true,

        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      return true;
    } catch (errorGuardar) {
      console.error(
        "Error al guardar el conductor:",
        errorGuardar
      );

      const mensaje =
        obtenerMensajeError(
          errorGuardar
        );

      await Swal.fire({
        title: esEdicion
          ? "No se pudo actualizar"
          : "No se pudo registrar",

        text: mensaje,

        icon: "error",

        confirmButtonText:
          "Entendido",

        confirmButtonColor:
          "#eab308",
      });

      return false;
    }
  };

  const despedirConConfirmacion =
    async (conductor) => {
      const confirmacion =
        await Swal.fire({
          title:
            "¿Desactivar conductor?",

          text: `${conductor.nombre} ${conductor.apellido} quedará inactivo y no aparecerá en las selecciones disponibles.`,

          icon: "warning",

          showCancelButton: true,

          confirmButtonText:
            "Desactivar",

          cancelButtonText:
            "Cancelar",

          confirmButtonColor:
            "#dc2626",

          cancelButtonColor:
            "#64748b",

          reverseButtons: true,

          allowOutsideClick: false,
          allowEscapeKey: false,
        });

      if (
        !confirmacion.isConfirmed
      ) {
        return;
      }

      try {
        const resultado =
          await handleDespedir(
            conductor
          );

        if (
          resultado === false
        ) {
          return;
        }

        await Swal.fire({
          title:
            "¡Conductor desactivado!",

          text: "El conductor quedó inactivo correctamente.",

          icon: "success",

          showConfirmButton: false,

          timer: 2000,
          timerProgressBar: true,

          allowOutsideClick: false,
          allowEscapeKey: false,
        });
      } catch (
        errorDesactivar
      ) {
        console.error(
          "Error al desactivar el conductor:",
          errorDesactivar
        );

        await Swal.fire({
          title:
            "No se pudo desactivar",

          text: obtenerMensajeError(
            errorDesactivar
          ),

          icon: "error",

          confirmButtonText:
            "Entendido",

          confirmButtonColor:
            "#eab308",
        });
      }
    };

  const reactivarConConfirmacion =
    async (conductor) => {
      const confirmacion =
        await Swal.fire({
          title:
            "¿Reactivar conductor?",

          text: `${conductor.nombre} ${conductor.apellido} volverá a estar activo.`,

          icon: "question",

          showCancelButton: true,

          confirmButtonText:
            "Reactivar",

          cancelButtonText:
            "Cancelar",

          confirmButtonColor:
            "#059669",

          cancelButtonColor:
            "#64748b",

          reverseButtons: true,

          allowOutsideClick: false,
          allowEscapeKey: false,
        });

      if (
        !confirmacion.isConfirmed
      ) {
        return;
      }

      try {
        const resultado =
          await handleReactivar(
            conductor
          );

        if (
          resultado === false
        ) {
          return;
        }

        await Swal.fire({
          title:
            "¡Conductor reactivado!",

          text: "El conductor volvió a estar activo correctamente.",

          icon: "success",

          showConfirmButton: false,

          timer: 2000,
          timerProgressBar: true,

          allowOutsideClick: false,
          allowEscapeKey: false,
        });
      } catch (
        errorReactivar
      ) {
        console.error(
          "Error al reactivar el conductor:",
          errorReactivar
        );

        await Swal.fire({
          title:
            "No se pudo reactivar",

          text: obtenerMensajeError(
            errorReactivar
          ),

          icon: "error",

          confirmButtonText:
            "Entendido",

          confirmButtonColor:
            "#eab308",
        });
      }
    };

  const eliminarConductor =
    async () => {
      try {
        const resultado =
          await handleDelete();

        if (
          resultado === false
        ) {
          return false;
        }

        await Swal.fire({
          title:
            "¡Conductor eliminado!",

          text: "El registro del conductor fue eliminado correctamente.",

          icon: "success",

          showConfirmButton: false,

          timer: 2000,
          timerProgressBar: true,

          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        return true;
      } catch (
        errorEliminar
      ) {
        console.error(
          "Error al eliminar el conductor:",
          errorEliminar
        );

        await Swal.fire({
          title:
            "No se pudo eliminar",

          text: obtenerMensajeError(
            errorEliminar
          ),

          icon: "error",

          confirmButtonText:
            "Entendido",

          confirmButtonColor:
            "#eab308",
        });

        return false;
      }
    };

  return (
    <div
      className="notranslate space-y-6"
      translate="no"
    >
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-yellow-300 to-blue-500" />

        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
              <UserRound size={29} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-[28px]">
                Conductores
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
                Gestión de conductores y licencias.
              </p>
            </div>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={openCreate}
              disabled={
                submitting ||
                loading
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 shadow-md shadow-yellow-100 transition hover:-translate-y-0.5 hover:bg-yellow-500 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <Plus size={19} />

              Nuevo conductor
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <XCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <p className="text-sm font-bold text-red-700">
            {error}
          </p>
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <ConductorCard
          title="Total"
          value={conductores.length}
          icon={UserRound}
          tone="yellow"
        />

        <ConductorCard
          title="Activos"
          value={conductoresActivos}
          icon={UserCheck}
          tone="green"
        />

        <ConductorCard
          title="Inactivos"
          value={conductoresInactivos}
          icon={UserX}
          tone="red"
        />

        <ConductorCard
          title="Licencias por vencer"
          value={licenciasPorVencer}
          icon={AlertTriangle}
          tone="blue"
        />
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-yellow-300 to-blue-500" />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Listado de conductores
              </h2>

              {!loading && (
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {
                    conductoresFiltrados.length
                  }{" "}
                  registro(s)
                </p>
              )}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="relative w-full sm:w-80">
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
                  placeholder="Buscar conductor..."
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
                />
              </div>

              <select
                value={filtroEstado}
                onChange={(
                  event
                ) =>
                  setFiltroEstado(
                    event.target
                      .value
                  )
                }
                disabled={loading}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
              >
                <option value="TODOS">
                  Todos
                </option>

                <option value="ACTIVOS">
                  Activos
                </option>

                <option value="INACTIVOS">
                  Inactivos
                </option>
              </select>
            </div>
          </div>

          <div className="mt-5">
            {loading ? (
              <ConductoresLoader />
            ) : (
              <ConductorTable
                conductores={
                  conductoresFiltrados
                }
                loading={false}
                onEdit={openEdit}
                onDelete={openDelete}
                onDespedir={
                  despedirConConfirmacion
                }
                onReactivar={
                  reactivarConConfirmacion
                }
                canManage={
                  canManage
                }
              />
            )}
          </div>
        </div>
      </section>

      <ConductorModal
        open={isModalOpen}
        conductor={
          selectedConductor
        }
        onClose={closeModal}
        onSubmit={
          guardarConductor
        }
        submitting={
          submitting
        }
        submitError={
          submitError
        }
      />

      <ConfirmModal
        open={Boolean(
          conductorToDelete
        )}
        title="Eliminar conductor"
        message={
          conductorToDelete
            ? `¿Eliminar a ${conductorToDelete.nombre} ${conductorToDelete.apellido}?`
            : ""
        }
        confirmLabel="Eliminar"
        onConfirm={
          eliminarConductor
        }
        onCancel={closeDelete}
        loading={deleting}
        danger
      />
    </div>
  );
};

export default ConductoresPage;