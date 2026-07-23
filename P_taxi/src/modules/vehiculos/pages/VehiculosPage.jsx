import {
  AlertTriangle,
  CarTaxiFront,
  Gauge,
  Plus,
  Search,
  Wrench,
} from "lucide-react";

import VehiculoCard from "../components/VehiculoCard";
import VehiculoModal from "../components/VehiculoModal";
import VehiculoTable from "../components/VehiculoTable";

import DocumentacionVehiculoModal from "../components/DocumentacionVehiculoModal";

import { useDocumentosVehiculo } from "../hooks/useDocumentosVehiculo";
import { useVehiculos } from "../hooks/useVehiculos";

const VehiculosLoader = () => {
  return (
    <div
      translate="no"
      className="flex min-h-[300px] flex-col items-center justify-center px-5 py-10 text-center"
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />

        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[#F5B800] border-t-[#F5B800]" />

        <div
          className="absolute inset-[10px] animate-spin rounded-full border-[3px] border-transparent border-b-blue-500 border-l-blue-500"
          style={{
            animationDuration: "1.4s",
            animationDirection:
              "reverse",
          }}
        />

        <div className="absolute inset-[22px] rounded-full bg-gradient-to-br from-[#FFF7D6] via-white to-blue-50 shadow-inner" />

        <div
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#D89C00] shadow-lg"
          style={{
            boxShadow:
              "0 8px 25px rgba(245,184,0,0.20)",
          }}
        >
          <CarTaxiFront size={30} />
        </div>

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
        Cargando vehículos
      </h3>

      <p className="mt-2 text-sm font-medium text-slate-500">
        Preparando el kilometraje, las
        alertas y la documentación...
      </p>
    </div>
  );
};

const VehiculosPage = () => {
  const {
    vehiculosFiltrados,

    loading,
    saving,

    error,
    search,
    setSearch,

    modalOpen,
    vehiculoEditando,

    totalVehiculos,
    vehiculosAlertaAceite,
    vehiculosAlertaMantenimiento,
    kilometrajeTotal,

    esSuperAdmin,
    esAdminSucursal,
    esTaxista,

    cargarVehiculos,

    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarVehiculo,
    eliminarVehiculo,
  } = useVehiculos();

  const {
    modalDocumentosOpen,

    vehiculoSeleccionado,
    documentosTipoActivo,
    resumenDocumental,

    loadingDocumentos,
    savingDocumento,
    errorDocumentos,

    tipoActivo,
    documentoEditando,

    abrirModalDocumentos,
    cerrarModalDocumentos,

    seleccionarTipoDocumento,

    iniciarEdicionDocumento,
    cancelarEdicionDocumento,

    guardarDocumento,
    eliminarDocumento,
  } = useDocumentosVehiculo({
    onDocumentoGuardado: async () => {
      await cargarVehiculos({
        mostrarCarga: false,
      });
    },
  });

  return (
    <div
      translate="no"
      className="space-y-6"
    >
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
            Vehículos
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
            {esTaxista
              ? "Consulta el vehículo asignado, su kilometraje, mantenimiento y documentación."
              : "Registra vehículos, kilometraje, documentación y alertas de mantenimiento."}
          </p>
        </div>

        {!esTaxista && (
          <button
            type="button"
            onClick={abrirModalCrear}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:-translate-y-0.5 hover:bg-[#DFA600] hover:shadow-lg active:scale-[0.98]"
          >
            <Plus size={20} />

            Nuevo vehículo
          </button>
        )}
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <VehiculoCard
          title={
            esTaxista
              ? "Vehículos asignados"
              : "Total vehículos"
          }
          value={totalVehiculos}
          icon={CarTaxiFront}
          color="bg-[#FFF4CF] text-[#E7A900]"
        />

        <VehiculoCard
          title="Kilometraje total"
          value={`${Number(
            kilometrajeTotal || 0
          ).toLocaleString("es-NI")} km`}
          icon={Gauge}
          color="bg-blue-100 text-blue-600"
        />

        <VehiculoCard
          title="Alertas aceite"
          value={vehiculosAlertaAceite}
          icon={AlertTriangle}
          color="bg-yellow-100 text-yellow-700"
        />

        <VehiculoCard
          title="Alertas mantenimiento"
          value={
            vehiculosAlertaMantenimiento
          }
          icon={Wrench}
          color="bg-red-100 text-red-600"
        />
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#F5B800] via-[#FFD45A] to-blue-500" />

        <div className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                {esTaxista
                  ? "Mi vehículo asignado"
                  : "Listado de vehículos"}
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {esTaxista
                  ? "Consulta el estado general y documental del vehículo que tienes asignado."
                  : "Consulta vehículos y administra su documentación."}
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
                placeholder="Buscar vehículo..."
                disabled={loading}
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
              />
            </div>
          </div>

          <div className="mt-5">
            {loading ? (
              <VehiculosLoader />
            ) : (
              <VehiculoTable
                vehiculos={
                  vehiculosFiltrados
                }
                loading={false}
                onDocumentos={
                  abrirModalDocumentos
                }
                onEdit={
                  abrirModalEditar
                }
                onDelete={
                  eliminarVehiculo
                }
                esTaxista={
                  esTaxista
                }
              />
            )}
          </div>
        </div>
      </section>

      {!esTaxista && (
        <VehiculoModal
          open={modalOpen}
          onClose={cerrarModal}
          onSave={guardarVehiculo}
          saving={saving}
          vehiculoEditando={
            vehiculoEditando
          }
          esSuperAdmin={
            esSuperAdmin
          }
          esAdminSucursal={
            esAdminSucursal
          }
        />
      )}

      <DocumentacionVehiculoModal
        open={modalDocumentosOpen}
        onClose={
          cerrarModalDocumentos
        }
        vehiculo={
          vehiculoSeleccionado
        }
        documentosTipoActivo={
          documentosTipoActivo
        }
        resumenDocumental={
          resumenDocumental
        }
        loading={
          loadingDocumentos
        }
        saving={
          savingDocumento
        }
        error={
          errorDocumentos
        }
        tipoActivo={
          tipoActivo
        }
        documentoEditando={
          documentoEditando
        }
        onSelectTipo={
          seleccionarTipoDocumento
        }
        onSave={
          guardarDocumento
        }
        onEdit={
          iniciarEdicionDocumento
        }
        onCancelEdit={
          cancelarEdicionDocumento
        }
        onDelete={
          eliminarDocumento
        }
        soloLectura={
          esTaxista
        }
      />
    </div>
  );
};

export default VehiculosPage;