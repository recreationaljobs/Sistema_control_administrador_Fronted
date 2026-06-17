import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Calculator,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { getPreview } from "../services/liquidacionesService";

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const nombreConductor = (conductor) => {
  if (!conductor) return "";
  const nombre = `${conductor.nombre || ""} ${conductor.apellido || ""}`.trim();
  return conductor.cedula ? `${nombre} - ${conductor.cedula}` : nombre;
};

const LiquidacionModal = ({
  open,
  onClose,
  onConfirm,
  saving,
  conductores = [],
  loadingCatalogos,
}) => {
  const [paso, setPaso] = useState(1);

  const [conductorId, setConductorId] = useState("");
  const [busquedaConductor, setBusquedaConductor] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [preview, setPreview] = useState(null);
  const [ajusteManual, setAjusteManual] = useState("0");
  const [notas, setNotas] = useState("");

  const [calculando, setCalculando] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (open) {
      setPaso(1);
      setConductorId("");
      setBusquedaConductor("");
      setFechaInicio("");
      setFechaFin("");
      setPreview(null);
      setAjusteManual("0");
      setNotas("");
      setFormError("");
    }
  }, [open]);

  const conductoresFiltrados = useMemo(() => {
    const value = busquedaConductor.trim().toLowerCase();
    if (!value) return conductores;

    return conductores.filter((conductor) =>
      nombreConductor(conductor).toLowerCase().includes(value)
    );
  }, [conductores, busquedaConductor]);

  const conductorSeleccionado = useMemo(() => {
    return conductores.find(
      (item) => String(item.id) === String(conductorId)
    );
  }, [conductores, conductorId]);

  const totalAPagar = useMemo(() => {
    if (!preview) return 0;
    return (
      Number(preview.total_jornadas || 0) -
      Number(preview.pendiente_adelantos || 0) +
      Number(ajusteManual || 0)
    );
  }, [preview, ajusteManual]);

  if (!open) return null;

  const calcular = async () => {
    setFormError("");

    if (!conductorId) {
      setFormError("Debes seleccionar el conductor.");
      return;
    }

    if (!fechaInicio || !fechaFin) {
      setFormError("Debes indicar el rango de fechas (inicio y fin).");
      return;
    }

    if (fechaInicio > fechaFin) {
      setFormError("La fecha de inicio no puede ser mayor que la fecha fin.");
      return;
    }

    try {
      setCalculando(true);
      const data = await getPreview(conductorId, fechaInicio, fechaFin);
      setPreview(data);
      setAjusteManual("0");
      setPaso(2);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "No se pudo calcular la liquidación. Revisa los datos.";
      setFormError(msg);
    } finally {
      setCalculando(false);
    }
  };

  const confirmar = async () => {
    setFormError("");

    if (!preview) return;

    if (preview.jornadas_count === 0) {
      setFormError(
        "No hay jornadas sin liquidar en este período. No se puede crear el pago."
      );
      return;
    }

    const payload = {
      conductor: Number(conductorId),
      sucursal: conductorSeleccionado?.sucursal
        ? Number(conductorSeleccionado.sucursal)
        : null,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      total_jornadas: Number(preview.total_jornadas || 0),
      total_adelantos_pendientes: Number(preview.pendiente_adelantos || 0),
      ajuste_manual: Number(ajusteManual || 0),
      total_pago: Number(totalAPagar),
      notas: notas.trim(),
    };

    await onConfirm(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40"
        aria-label="Cerrar modal"
      />

      <div className="relative max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:items-center sm:px-6">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
              <Wallet size={26} />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-950 sm:text-xl">
                {paso === 1 ? "Nuevo pago de conductor" : "Confirmar liquidación"}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {paso === 1
                  ? "Paso 1: selecciona el conductor y el período a liquidar."
                  : "Paso 2: revisa el cálculo y confirma el pago."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        <div className="max-h-[calc(94vh-92px)] overflow-y-auto px-6 py-6">
          {formError && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {formError}
            </div>
          )}

          {paso === 1 && (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Conductor
                </label>

                <input
                  type="text"
                  value={busquedaConductor}
                  onChange={(e) => setBusquedaConductor(e.target.value)}
                  disabled={loadingCatalogos}
                  placeholder="Buscar conductor por nombre o cédula..."
                  className="mb-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
                />

                <select
                  value={conductorId}
                  onChange={(e) => setConductorId(e.target.value)}
                  disabled={loadingCatalogos}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
                >
                  <option value="">Selecciona un conductor</option>
                  {conductoresFiltrados.map((conductor) => (
                    <option key={conductor.id} value={conductor.id}>
                      {nombreConductor(conductor)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={calcular}
                  disabled={calculando || loadingCatalogos}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600] disabled:opacity-60"
                >
                  <Calculator size={18} />
                  {calculando ? "Calculando..." : "Calcular"}
                </button>
              </div>
            </div>
          )}

          {paso === 2 && preview && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <UserRound size={17} className="text-blue-500" />
                  {nombreConductor(conductorSeleccionado) || "Conductor"}
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                  <CalendarDays size={15} className="text-slate-400" />
                  {fechaInicio} al {fechaFin}
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                        Ganancia conductor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.jornadas.length === 0 ? (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-4 py-4 text-center text-sm font-semibold text-slate-500"
                        >
                          No hay jornadas sin liquidar en este período.
                        </td>
                      </tr>
                    ) : (
                      preview.jornadas.map((j) => (
                        <tr key={j.id}>
                          <td className="px-4 py-2.5 text-sm font-semibold text-slate-700">
                            {j.fecha}
                          </td>
                          <td className="px-4 py-2.5 text-right text-sm font-black text-slate-900">
                            {formatoDinero(j.monto)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 rounded-2xl border border-slate-200 px-4 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-600">
                    Total jornadas ({preview.jornadas_count})
                  </span>
                  <span className="font-black text-slate-900">
                    {formatoDinero(preview.total_jornadas)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-600">
                    Adelantos pendientes
                  </span>
                  <span className="font-black text-red-600">
                    - {formatoDinero(preview.pendiente_adelantos)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-sm font-bold text-slate-600">
                    Ajuste manual
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={ajusteManual}
                    onChange={(e) => setAjusteManual(e.target.value)}
                    placeholder="0.00 (puede ser negativo)"
                    className="w-40 rounded-xl border border-slate-300 bg-white px-3 py-2 text-right text-sm font-bold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
                  />
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-base font-black text-slate-900">
                    TOTAL A PAGAR
                  </span>
                  <span className="text-xl font-black text-green-600">
                    {formatoDinero(totalAPagar)}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Notas
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows="2"
                  placeholder="Notas u observaciones del pago (opcional)..."
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
                />
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="text-sm font-bold text-amber-700">
                  Al confirmar, las jornadas del período quedarán bloqueadas y no
                  podrán incluirse en otra liquidación.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setPaso(1)}
                  disabled={saving}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Volver
                </button>

                <button
                  type="button"
                  onClick={confirmar}
                  disabled={saving || preview.jornadas_count === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-3 text-sm font-black text-white shadow-md shadow-green-100 transition hover:bg-green-600 disabled:opacity-60"
                >
                  <Wallet size={18} />
                  {saving ? "Confirmando..." : "💰 Confirmar Pago"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiquidacionModal;
