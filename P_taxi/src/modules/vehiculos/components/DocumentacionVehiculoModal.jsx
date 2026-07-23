import {
  CarTaxiFront,
  CloudFog,
  FileCheck2,
  Plus,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  TIPOS_DOCUMENTO_VEHICULO,
} from "../hooks/useDocumentosVehiculo";

import DocumentoVehiculoForm from "./DocumentoVehiculoForm";
import DocumentoVehiculoTable from "./DocumentoVehiculoTable";

const ICONOS_DOCUMENTO = {
  inspeccion_mecanica: FileCheck2,
  emision_gases: CloudFog,
  seguro_vehicular: ShieldCheck,
  seguro_pasajero: UserRound,
};

const ESTILOS_ESTADO = {
  vigente: {
    badge:
      "border-emerald-100 bg-emerald-50/60 text-emerald-600",
    punto: "bg-emerald-400",
  },

  por_vencer: {
    badge:
      "border-amber-100 bg-amber-50/60 text-amber-600",
    punto: "bg-amber-400",
  },

  vencido: {
    badge:
      "border-red-100 bg-red-50/60 text-red-500",
    punto: "bg-red-400",
  },

  sin_registrar: {
    badge:
      "border-slate-100 bg-slate-50/60 text-slate-500",
    punto: "bg-slate-300",
  },
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return "Sin registrar";
  }

  const partes = String(fecha).split("-");

  if (partes.length !== 3) {
    return fecha;
  }

  const [year, month, day] = partes;

  return `${day}/${month}/${year}`;
};

const obtenerEstadoDocumento = (
  tipoCodigo,
  resumenDocumental
) => {
  const documento =
    resumenDocumental?.[tipoCodigo];

  if (!documento) {
    return {
      estado: "sin_registrar",
      estado_nombre: "Sin registrar",
      fecha_vencimiento: null,
    };
  }

  return {
    estado:
      documento.estado ||
      "sin_registrar",

    estado_nombre:
      documento.estado_nombre ||
      "Sin registrar",

    fecha_vencimiento:
      documento.fecha_vencimiento ||
      null,
  };
};

const DocumentacionVehiculoModal = ({
  open,
  onClose,

  vehiculo,
  documentosTipoActivo = [],
  resumenDocumental = {},

  loading = false,
  saving = false,
  error = "",

  tipoActivo,
  documentoEditando,

  onSelectTipo,
  onSave,
  onEdit,
  onCancelEdit,
  onDelete,

  soloLectura = false,
}) => {
  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const tipoSeleccionado = useMemo(() => {
    return (
      TIPOS_DOCUMENTO_VEHICULO.find(
        (tipo) =>
          tipo.codigo === tipoActivo
      ) ||
      TIPOS_DOCUMENTO_VEHICULO[0]
    );
  }, [tipoActivo]);

  useEffect(() => {
    if (documentoEditando?.id) {
      setMostrarFormulario(true);
    }
  }, [documentoEditando]);

  useEffect(() => {
    if (!open) {
      setMostrarFormulario(false);
      return undefined;
    }

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        !saving
      ) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        overflowAnterior;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
    saving,
    onClose,
  ]);

  if (!open || !vehiculo) {
    return null;
  }

  const identificacionVehiculo = [
    vehiculo.numero,
    vehiculo.placa,
  ]
    .filter(Boolean)
    .join(" - ");

  const descripcionVehiculo = [
    vehiculo.marca,
    vehiculo.modelo,
    vehiculo.anio,
  ]
    .filter(Boolean)
    .join(" · ");

  const cerrarFormulario = () => {
    if (saving) {
      return;
    }

    setMostrarFormulario(false);

    if (
      typeof onCancelEdit ===
      "function"
    ) {
      onCancelEdit();
    }
  };

  const guardarDesdeFormulario =
    async (form) => {
      const resultado =
        await onSave(form);

      if (resultado !== false) {
        setMostrarFormulario(false);
      }

      return resultado;
    };

  const editarDocumento = (
    documento
  ) => {
    if (
      typeof onEdit ===
      "function"
    ) {
      onEdit(documento);
    }

    setMostrarFormulario(true);
  };

  const seleccionarTipo = (
    codigo
  ) => {
    if (saving) {
      return;
    }

    setMostrarFormulario(false);

    if (
      typeof onCancelEdit ===
      "function"
    ) {
      onCancelEdit();
    }

    onSelectTipo(codigo);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-3 py-4 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="documentacion-modal-title"
    >
      <button
        type="button"
        onClick={() => {
          if (!saving) {
            onClose();
          }
        }}
        disabled={saving}
        className="absolute inset-0 cursor-default bg-slate-900/30 backdrop-blur-[2px]"
        aria-label="Cerrar documentación"
        tabIndex={-1}
      />

      <section className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/20 backdrop-blur-sm">
        <div className="h-1.5 shrink-0 bg-gradient-to-r from-amber-400/80 via-amber-300/70 to-blue-400/70" />

        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200/70 bg-white/90 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50/70 text-amber-600">
              <CarTaxiFront size={25} />
            </div>

            <div className="min-w-0">
              <h2
                id="documentacion-modal-title"
                className="truncate text-xl font-black text-slate-800"
              >
                Documentación del vehículo
              </h2>

              <p className="mt-1 truncate text-sm font-black text-slate-600">
                {identificacionVehiculo}
              </p>

              <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">
                {descripcionVehiculo}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-3xl bg-slate-100/70 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={21} className="cursor-pointer"/>
          </button>
        </header>

        <div className="shrink-0 border-b border-slate-200/70 bg-slate-50/70 px-4 py-3 sm:px-6">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {TIPOS_DOCUMENTO_VEHICULO.map(
              (tipo) => {
                const Icon =
                  ICONOS_DOCUMENTO[
                    tipo.codigo
                  ] || FileCheck2;

                const estadoDocumento =
                  obtenerEstadoDocumento(
                    tipo.codigo,
                    resumenDocumental
                  );

                const estilos =
                  ESTILOS_ESTADO[
                    estadoDocumento.estado
                  ] ||
                  ESTILOS_ESTADO
                    .sin_registrar;

                const seleccionado =
                  tipoActivo === tipo.codigo;

                return (
                  <button
                    key={tipo.codigo}
                    type="button"
                    onClick={() =>
                      seleccionarTipo(
                        tipo.codigo
                      )
                    }
                    disabled={saving}
                    className={`
                      flex min-h-[72px] items-center gap-3
                      rounded-2xl border px-3 py-3
                      text-left transition-all duration-200
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      ${
                        seleccionado
                          ? "border-amber-300/60 bg-white/90 shadow-md shadow-amber-100/30 ring-2 ring-amber-200/40"
                          : "border-slate-200/70 bg-white/80 hover:border-slate-300/70 hover:shadow-sm hover:bg-white/95"
                      }
                    `}
                  >
                    <div
                      className={`
                        flex h-10 w-10 shrink-0
                        items-center justify-center
                        rounded-xl
                        ${
                          seleccionado
                            ? "bg-amber-50/80 text-amber-600"
                            : "bg-slate-100/70 text-slate-500"
                        }
                      `}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-black text-slate-700">
                        {tipo.nombre}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span
                          className={`
                            inline-flex items-center gap-1.5
                            rounded-full border
                            px-2 py-0.5
                            text-[10px] font-black
                            ${estilos.badge}
                          `}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${estilos.punto}`}
                          />

                          {
                            estadoDocumento
                              .estado_nombre
                          }
                        </span>
                      </div>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto bg-white/80">
          <div className="space-y-4 px-4 py-5 sm:px-6">
            {error && (
              <div className="rounded-2xl border border-red-200/60 bg-red-50/70 px-4 py-3 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  {tipoSeleccionado.nombre}
                </h3>

                
              </div>

              {!soloLectura &&
                !mostrarFormulario && (
                  <button
                    type="button"
                    onClick={() =>
                      setMostrarFormulario(
                        true
                      )
                    }
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500/90 px-4 py-2.5 text-sm font-black text-white shadow-sm shadow-blue-200/50 transition hover:bg-blue-600/90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    <Plus size={18} />

                    Agregar documento
                  </button>
                )}
            </div>

            {!mostrarFormulario && (
              <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/60 bg-slate-50/70 px-4 py-3 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Estado actual
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-700">
                    {
                      obtenerEstadoDocumento(
                        tipoActivo,
                        resumenDocumental
                      ).estado_nombre
                    }
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Vencimiento
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-700">
                    {formatearFecha(
                      obtenerEstadoDocumento(
                        tipoActivo,
                        resumenDocumental
                      ).fecha_vencimiento
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Registros
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-700">
                    {
                      documentosTipoActivo.length
                    }
                  </p>
                </div>
              </div>
            )}

            {!soloLectura &&
              mostrarFormulario && (
                <DocumentoVehiculoForm
                  tipoDocumento={
                    tipoSeleccionado
                  }
                  documentoEditando={
                    documentoEditando
                  }
                  onSave={
                    guardarDesdeFormulario
                  }
                  onCancel={
                    cerrarFormulario
                  }
                  saving={saving}
                  soloLectura={false}
                />
              )}

            <div>
              <div className="mb-3">
                <h4 className="text-base font-black text-slate-800">
                  Historial registrado
                </h4>

                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {
                    documentosTipoActivo.length
                  }{" "}
                  {documentosTipoActivo.length ===
                  1
                    ? "registro encontrado"
                    : "registros encontrados"}
                </p>
              </div>

              <DocumentoVehiculoTable
                documentos={
                  documentosTipoActivo
                }
                loading={loading}
                onEdit={
                  editarDocumento
                }
                onDelete={onDelete}
                saving={saving}
                soloLectura={
                  soloLectura
                }
              />
            </div>
          </div>
        </main>

        <footer className="flex shrink-0 items-center justify-end border-t border-slate-200/70 bg-white/90 px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="cursor rounded-xl border border-slate-200/80 bg-white/80 px-5 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cerrar
          </button>
        </footer>
      </section>
    </div>
  );
};

export default DocumentacionVehiculoModal;