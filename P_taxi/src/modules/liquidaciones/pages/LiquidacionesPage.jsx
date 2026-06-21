import { Banknote, FileText, Plus, ReceiptText } from "lucide-react";
import { useLiquidaciones } from "../hooks/useLiquidaciones";
import LiquidacionModal from "../components/LiquidacionModal";
import LiquidacionTable from "../components/LiquidacionTable";

const formatoMoneda = (valor) => {
  const numero = Number(valor || 0);

  return `C$ ${numero.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatoFecha = (fecha) => {
  if (!fecha) return "";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-NI");
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
    <div className="space-y-6 p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950">
            Liquidaciones
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Registra pagos de conductores por todas sus jornadas pendientes.
          </p>
        </div>

        {esAdminOSuperAdmin && (
          <button
            type="button"
            onClick={abrirModalCrear}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600]"
          >
            <Plus size={20} />
            Nueva liquidación
          </button>
        )}
      </div>

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ResumenSuperior
          icono={<ReceiptText size={22} />}
          label="Liquidaciones"
          value={totalLiquidaciones}
        />

        <ResumenSuperior
          icono={<Banknote size={22} />}
          label="Total pagado"
          value={formatoMoneda(montoTotalPagado)}
        />

        <ResumenSuperior
          icono={<FileText size={22} />}
          label="Control"
          value="Jornadas bloqueadas al pagar"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-black text-slate-900">
            Historial de liquidaciones
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Cada liquidación bloquea las jornadas pagadas para evitar doble pago.
          </p>
        </div>

        <LiquidacionTable
          liquidaciones={liquidaciones}
          loading={loading}
          onViewRecibo={verRecibo}
        />
      </div>

      <LiquidacionModal
        open={modalOpen}
        onClose={cerrarModal}
        onPreview={calcularPreview}
        onSave={guardarLiquidacion}
        saving={saving}
        loadingPreview={loadingPreview}
        loadingCatalogos={loadingCatalogos}
        conductores={conductores}
        preview={preview}
      />

      {modalReciboOpen && recibo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-3 py-4 backdrop-blur-[2px] print:static print:bg-white">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl print:max-h-none print:shadow-none">
            <div className="mb-5 flex items-start justify-between gap-4 print:hidden">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Recibo de liquidación #{recibo.id}
                </h2>
                <p className="text-sm font-medium text-slate-500">
                  Detalle del pago registrado.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarRecibo}
                className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-center text-xl font-black text-slate-950">
                Recibo de liquidación
              </h3>

              <p className="mt-1 text-center text-sm font-semibold text-slate-500">
                Recibo No. {recibo.id}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                <DatoRecibo
                  label="Conductor"
                  value={recibo.conductor?.nombre}
                />

                <DatoRecibo
                  label="Cédula"
                  value={recibo.conductor?.cedula}
                />

                <DatoRecibo
                  label="Desde"
                  value={formatoFecha(recibo.fecha_inicio)}
                />

                <DatoRecibo
                  label="Hasta"
                  value={formatoFecha(recibo.fecha_fin)}
                />

                <DatoRecibo
                  label="Total jornadas"
                  value={formatoMoneda(recibo.total_jornadas)}
                />

                <DatoRecibo
                  label="Pendiente adelantos"
                  value={formatoMoneda(recibo.total_adelantos_pendientes)}
                />

                <DatoRecibo
                  label="Abono aplicado"
                  value={formatoMoneda(recibo.abono_aplicado)}
                />

                <DatoRecibo
                  label="Total pagado"
                  value={formatoMoneda(recibo.total_pago)}
                  fuerte
                />
              </div>

              <div className="mt-6">
                <h4 className="mb-3 text-sm font-black text-slate-800">
                  Jornadas pagadas
                </h4>

                <div className="rounded-2xl border border-slate-200">
                  {recibo.jornadas?.map((jornada) => (
                    <div
                      key={jornada.id}
                      className="grid grid-cols-2 gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 md:grid-cols-4"
                    >
                      <DatoRecibo
                        label="Fecha"
                        value={formatoFecha(jornada.fecha)}
                      />

                      <DatoRecibo
                        label="Vehículo"
                        value={jornada.vehiculo || "-"}
                      />

                      <DatoRecibo
                        label="KM"
                        value={jornada.kilometros_recorridos || 0}
                      />

                      <DatoRecibo
                        label="Pago"
                        value={formatoMoneda(jornada.pago_conductor)}
                        fuerte
                      />
                    </div>
                  ))}
                </div>
              </div>

              {recibo.notas && (
                <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  <strong>Nota:</strong> {recibo.notas}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={cerrarRecibo}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={imprimirRecibo}
                className="rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white hover:bg-[#DFA600]"
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

const ResumenSuperior = ({ icono, label, value }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
          {icono}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="text-lg font-black text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
};

const DatoRecibo = ({ label, value, fuerte = false }) => {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 ${
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

export default LiquidacionesPage;