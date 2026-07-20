import {
  Banknote,
  FileText,
  Plus,
  ReceiptText,
} from "lucide-react";

import { useLiquidaciones } from "../hooks/useLiquidaciones";
import LiquidacionModal from "../components/LiquidacionModal";
import LiquidacionTable from "../components/LiquidacionTable";

const formatoMoneda = (valor) => {
  const numero = Number(valor || 0);

  return `C$ ${numero.toLocaleString(
    "es-NI",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};

const formatoFecha = (fecha) => {
  if (!fecha) {
    return "";
  }

  return new Date(
    `${fecha}T00:00:00`
  ).toLocaleDateString("es-NI");
};

const LiquidacionesLoader = () => {
  return (
    <div
      translate="no"
      className="flex min-h-[310px] flex-col items-center justify-center px-5 py-10 text-center"
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        {/* Fondo exterior */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />

        {/* Aro amarillo */}
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[#F5B800] border-t-[#F5B800]" />

        {/* Aro verde contrario */}
        <div
          className="absolute inset-[10px] animate-spin rounded-full border-[3px] border-transparent border-b-emerald-500 border-l-emerald-500"
          style={{
            animationDuration: "1.4s",
            animationDirection:
              "reverse",
          }}
        />

        {/* Centro */}
        <div className="absolute inset-[22px] rounded-full bg-gradient-to-br from-yellow-50 via-white to-emerald-50 shadow-inner" />

        {/* Icono */}
        <div
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#D89C00] shadow-lg"
          style={{
            boxShadow:
              "0 8px 25px rgba(245,184,0,0.22)",
          }}
        >
          <Banknote size={29} />
        </div>

        {/* Partículas */}
        <span className="absolute left-1 top-4 h-2.5 w-2.5 animate-pulse rounded-full bg-[#F5B800]" />

        <span
          className="absolute bottom-4 right-0 h-2 w-2 animate-pulse rounded-full bg-emerald-500"
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
        Cargando liquidaciones
      </h3>

      <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">
        Preparando los pagos, jornadas y recibos registrados...
      </p>
    </div>
  );
};

const ResumenSuperior = ({
  icono,
  label,
  value,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
          {icono}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p
            translate="no"
            className="notranslate mt-1 break-words text-lg font-black text-slate-950"
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const DatoRecibo = ({
  label,
  value,
  fuerte = false,
}) => {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        translate="no"
        className={`notranslate mt-1 ${
          fuerte
            ? "text-lg font-black text-slate-950"
            : "text-sm font-bold text-slate-700"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
};

const LiquidacionesPage = () => {
  const {
    liquidaciones,
    conductores,

    loading,
    loadingCatalogos,
    loadingPreview,
    saving,

    error,

    modalOpen,
    abrirModalCrear,
    cerrarModal,

    preview,
    calcularPreview,
    guardarLiquidacion,

    recibo,
    modalReciboOpen,
    verRecibo,
    cerrarRecibo,
    imprimirRecibo,

    esAdminOSuperAdmin,
    esTaxista,

    totalLiquidaciones,
    montoTotalPagado,
  } = useLiquidaciones();

  return (
    <div
      translate="no"
      className="space-y-6 p-5 sm:p-6"
    >
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#F5B800] via-[#FFD45A] to-emerald-500" />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
                Liquidaciones
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
                Registra pagos de conductores por todas sus jornadas pendientes.
              </p>
            </div>

            {esAdminOSuperAdmin && (
              <button
                type="button"
                onClick={
                  abrirModalCrear
                }
                disabled={
                  loading || saving
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:-translate-y-0.5 hover:bg-[#DFA600] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <Plus size={20} />

                Nueva liquidación
              </button>
            )}
          </div>
        </div>
      </section>

      {esTaxista && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Estás viendo tus liquidaciones como taxista. No puedes registrar pagos.
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ResumenSuperior
          icono={
            <ReceiptText size={22} />
          }
          label="Liquidaciones"
          value={totalLiquidaciones}
        />

        <ResumenSuperior
          icono={
            <Banknote size={22} />
          }
          label="Total pagado"
          value={formatoMoneda(
            montoTotalPagado
          )}
        />

        <ResumenSuperior
          icono={
            <FileText size={22} />
          }
          label="Control"
          value="Jornadas bloqueadas al pagar"
        />
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#F5B800] via-[#FFD45A] to-emerald-500" />

        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-black text-slate-900">
            Historial de liquidaciones
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Cada liquidación bloquea las jornadas pagadas para evitar doble pago.
          </p>
        </div>

        {loading ? (
          <LiquidacionesLoader />
        ) : (
          <LiquidacionTable
            liquidaciones={
              liquidaciones
            }
            loading={false}
            onViewRecibo={
              verRecibo
            }
          />
        )}
      </section>

      <LiquidacionModal
        open={modalOpen}
        onClose={cerrarModal}
        onPreview={
          calcularPreview
        }
        onSave={
          guardarLiquidacion
        }
        saving={saving}
        loadingPreview={
          loadingPreview
        }
        loadingCatalogos={
          loadingCatalogos
        }
        conductores={conductores}
        preview={preview}
      />

      {modalReciboOpen &&
        recibo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-3 py-4 backdrop-blur-[2px] print:static print:bg-white">
            <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl print:max-h-none print:shadow-none">
              <div className="mb-5 flex items-start justify-between gap-4 print:hidden">
                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    Recibo de liquidación #
                    {recibo.id}
                  </h2>

                  <p className="text-sm font-medium text-slate-500">
                    Detalle del pago registrado.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    cerrarRecibo
                  }
                  className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Cerrar
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="text-center text-xl font-black text-slate-950">
                  Recibo de liquidación
                </h3>

                <p className="mt-1 text-center text-sm font-semibold text-slate-500">
                  Recibo No.{" "}
                  {recibo.id}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <DatoRecibo
                    label="Conductor"
                    value={
                      recibo.conductor
                        ?.nombre
                    }
                  />

                  <DatoRecibo
                    label="Cédula"
                    value={
                      recibo.conductor
                        ?.cedula
                    }
                  />

                  <DatoRecibo
                    label="Desde"
                    value={formatoFecha(
                      recibo.fecha_inicio
                    )}
                  />

                  <DatoRecibo
                    label="Hasta"
                    value={formatoFecha(
                      recibo.fecha_fin
                    )}
                  />

                  <DatoRecibo
                    label="Total jornadas"
                    value={formatoMoneda(
                      recibo.total_jornadas
                    )}
                  />

                  <DatoRecibo
                    label="Pendiente adelantos"
                    value={formatoMoneda(
                      recibo.total_adelantos_pendientes
                    )}
                  />

                  <DatoRecibo
                    label="Abono aplicado"
                    value={formatoMoneda(
                      recibo.abono_aplicado
                    )}
                  />

                  <DatoRecibo
                    label="Total pagado"
                    value={formatoMoneda(
                      recibo.total_pago
                    )}
                    fuerte
                  />
                </div>

                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-black text-slate-800">
                    Jornadas pagadas
                  </h4>

                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    {recibo.jornadas?.map(
                      (jornada) => (
                        <div
                          key={
                            jornada.id
                          }
                          className="grid grid-cols-2 gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 md:grid-cols-4"
                        >
                          <DatoRecibo
                            label="Fecha"
                            value={formatoFecha(
                              jornada.fecha
                            )}
                          />

                          <DatoRecibo
                            label="Vehículo"
                            value={
                              jornada.vehiculo ||
                              "-"
                            }
                          />

                          <DatoRecibo
                            label="KM"
                            value={
                              jornada.kilometros_recorridos ||
                              0
                            }
                          />

                          <DatoRecibo
                            label="Pago"
                            value={formatoMoneda(
                              jornada.pago_conductor
                            )}
                            fuerte
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                {recibo.notas && (
                  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <strong>
                      Nota:
                    </strong>{" "}
                    {recibo.notas}
                  </div>
                )}
              </div>

              <div className="mt-5 flex justify-end gap-3 print:hidden">
                <button
                  type="button"
                  onClick={
                    cerrarRecibo
                  }
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  onClick={
                    imprimirRecibo
                  }
                  className="rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white transition hover:bg-[#DFA600]"
                >
                  Imprimir
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default LiquidacionesPage;s