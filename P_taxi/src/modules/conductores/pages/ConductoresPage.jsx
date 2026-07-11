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
  hoy.setHours(0, 0, 0, 0);

  const vencimiento = new Date(
    `${String(fecha).slice(0, 10)}T00:00:00`
  );

  return Math.ceil(
    (vencimiento.getTime() -
      hoy.getTime()) /
      86_400_000
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

  const [search, setSearch] =
    useState("");

  const [filtroEstado, setFiltroEstado] =
    useState("TODOS");

  const rolNormalizado = String(rol || "")
    .trim()
    .toLowerCase();

  const canManage =
    rolNormalizado === "superadmin" ||
    rolNormalizado === "super_admin" ||
    rolNormalizado === "admin_sucursal";

  const conductoresActivos =
    conductores.filter(
      (conductor) =>
        conductor.activo !== false
    ).length;

  const conductoresInactivos =
    conductores.length - conductoresActivos;

  const licenciasPorVencer =
    conductores.filter((conductor) => {
      const fecha =
        conductor.fecha_vencimiento_licencia ||
        conductor.vencimiento_licencia;

      const dias =
        diasHastaVencimiento(fecha);

      return (
        dias !== null &&
        dias >= 0 &&
        dias <= 30
      );
    }).length;

  const conductoresFiltrados = useMemo(() => {
    const termino = search
      .trim()
      .toLowerCase();

    return conductores.filter(
      (conductor) => {
        const activo =
          conductor.activo !== false;

        if (
          filtroEstado === "ACTIVOS" &&
          !activo
        ) {
          return false;
        }

        if (
          filtroEstado === "INACTIVOS" &&
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

        return texto.includes(termino);
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

    const resultado = esEdicion
      ? await handleUpdate(payload)
      : await handleCreate(payload);

    if (resultado === false) {
      return false;
    }

    void Swal.fire({
      title: esEdicion
        ? "Conductor actualizado"
        : "Conductor registrado",
      text: esEdicion
        ? "Los cambios se guardaron correctamente."
        : "El conductor fue registrado correctamente.",
      icon: "success",
      showConfirmButton: false,
      timerProgressBar: true,
    });

    return true;
  };

  const despedirConConfirmacion = async (
    conductor
  ) => {
    const confirmacion = await Swal.fire({
      title: "¿Despedir conductor?",
      text: `${conductor.nombre} ${conductor.apellido} quedará inactivo.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Despedir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    const resultado =
      await handleDespedir(conductor);

    if (resultado === false) {
      return;
    }

    void Swal.fire({
      title: "Conductor despedido",
      icon: "success",
      showConfirmButton: false,
      timerProgressBar: true,
    });
  };

  const reactivarConConfirmacion = async (
    conductor
  ) => {
    const confirmacion = await Swal.fire({
      title: "¿Reactivar conductor?",
      text: `${conductor.nombre} ${conductor.apellido} volverá a estar activo.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Reactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#059669",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    const resultado =
      await handleReactivar(conductor);

    if (resultado === false) {
      return;
    }

    void Swal.fire({
      title: "Conductor reactivado",
      icon: "success",
      showConfirmButton: false,
      timerProgressBar: true,
    });
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 bg-yellow-400" />

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
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 shadow-md shadow-yellow-100 transition hover:-translate-y-0.5 hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="mt-0.5 text-red-600"
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
          title="Despedidos"
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

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Listado de conductores
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {conductoresFiltrados.length} registro(s)
            </p>
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
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar conductor..."
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(event) =>
                setFiltroEstado(
                  event.target.value
                )
              }
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
            >
              <option value="TODOS">
                Todos
              </option>

              <option value="ACTIVOS">
                Activos
              </option>

              <option value="INACTIVOS">
                Despedidos
              </option>
            </select>
          </div>
        </div>

        <div className="mt-5">
          <ConductorTable
            conductores={
              conductoresFiltrados
            }
            loading={loading}
            onEdit={openEdit}
            onDelete={openDelete}
            onDespedir={
              despedirConConfirmacion
            }
            onReactivar={
              reactivarConConfirmacion
            }
            canManage={canManage}
          />
        </div>
      </section>

      <ConductorModal
        open={isModalOpen}
        conductor={selectedConductor}
        onClose={closeModal}
        onSubmit={guardarConductor}
        submitting={submitting}
        submitError={submitError}
      />

      <ConfirmModal
        open={Boolean(conductorToDelete)}
        title="Eliminar conductor"
        message={
          conductorToDelete
            ? `¿Eliminar a ${conductorToDelete.nombre} ${conductorToDelete.apellido}?`
            : ""
        }
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={closeDelete}
        loading={deleting}
        danger
      />
    </div>
  );
};

export default ConductoresPage;