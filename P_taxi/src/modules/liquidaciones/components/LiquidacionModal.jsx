import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Calculator,
  CheckCircle2,
  Loader2,
  Search,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

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

const nombreConductor = (conductor) => {
  if (!conductor) return "";

  const nombre = `${conductor.nombre || ""} ${conductor.apellido || ""}`.trim();

  if (conductor.cedula) {
    return `${nombre} - ${conductor.cedula}`;
  }

  return nombre;
};

const buscarConductorPorId = (conductores, id) => {
  if (!id) return null;

  return conductores.find((conductor) => {
    return String(conductor.id) === String(id);
  });
};

const LiquidacionModal = ({
  open,
  onClose,
  onPreview,
  onSave,
  saving,
  loadingPreview,
  loadingCatalogos,
  conductores = [],
  preview,
}) => {
  const [form, setForm] = useState({
    conductor: "",
    abono_aplicado: "0.00",
    ajuste_manual: "0.00",
    notas: "",
  });

  const [busquedaConductor, setBusquedaConductor] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, saving, onClose]);

  useEffect(() => {
    if (!open) {
      setForm({
        conductor: "",
        abono_aplicado: "0.00",
        ajuste_manual: "0.00",
        notas: "",
      });
      setBusquedaConductor("");
      setMostrarResultados(false);
      setFormError("");
    }
  }, [open]);

  const conductoresFiltrados = useMemo(() => {
    const value = busquedaConductor.trim().toLowerCase();

    if (!value) {
      return conductores.slice(0, 8);
    }

    return conductores
      .filter((conductor) => {
        const texto = nombreConductor(conductor).toLowerCase();
        const sucursal = `${conductor.sucursal_nombre || ""}`.toLowerCase();

        return texto.includes(value) || sucursal.includes(value);
      })
      .slice(0, 10);
  }, [conductores, busquedaConductor]);

  const conductorSeleccionado = useMemo(() => {
    return buscarConductorPorId(conductores, form.conductor);
  }, [conductores, form.conductor]);

  const previewCoincide = useMemo(() => {
    if (!preview) return false;

    const conductorPreview = preview?.conductor?.id;

    return String(conductorPreview) === String(form.conductor);
  }, [preview, form.conductor]);

  const totalFinal = useMemo(() => {
    if (!previewCoincide) return 0;

    const totalJornadas = Number(preview.total_jornadas || 0);
    const abonoAplicado = Number(form.abono_aplicado || 0);
    const ajusteManual = Number(form.ajuste_manual || 0);

    const total = totalJornadas - abonoAplicado + ajusteManual;

    return total < 0 ? 0 : total;
  }, [previewCoincide, preview, form.abono_aplicado, form.ajuste_manual]);

  if (!open) return null;

  const cerrarConFondo = () => {
    if (saving) return;
    onClose();
  };

  const seleccionarConductor = async (conductor) => {
    const conductorId = String(conductor.id);

    setForm((prev) => ({
      ...prev,
      conductor: conductorId,
      abono_aplicado: "0.00",
      ajuste_manual: "0.00",
    }));

    setBusquedaConductor(nombreConductor(conductor));
    setMostrarResultados(false);
    setFormError("");

    await onPreview({
      conductor: conductorId,
    });
  };

  const limpiarConductor = () => {
    setForm((prev) => ({
      ...prev,
      conductor: "",
      abono_aplicado: "0.00",
      ajuste_manual: "0.00",
    }));

    setBusquedaConductor("");
    setMostrarResultados(true);
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formError) setFormError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.conductor) {
      setFormError("Debes seleccionar el conductor.");
      return;
    }

    if (!previewCoincide) {
      setFormError("Debes seleccionar un conductor con jornadas pendientes.");
      return;
    }

    if (!preview.jornadas_count || Number(preview.jornadas_count) <= 0) {
      setFormError("No hay jornadas pendientes para liquidar.");
      return;
    }

    const abonoAplicado = Number(form.abono_aplicado || 0);
    const ajusteManual = Number(form.ajuste_manual || 0);
    const pendienteAdelantos = Number(preview.pendiente_adelantos || 0);
    const totalJornadas = Number(preview.total_jornadas || 0);

    if (Number.isNaN(abonoAplicado) || abonoAplicado < 0) {
      setFormError("El abono aplicado no puede ser negativo.");
      return;
    }

    if (Number.isNaN(ajusteManual) || ajusteManual < 0) {
      setFormError("El ajuste manual no puede ser negativo.");
      return;
    }

    if (abonoAplicado > pendienteAdelantos) {
      setFormError("El abono aplicado no puede ser mayor al saldo pendiente.");
      return;
    }

    if (abonoAplicado > totalJornadas + ajusteManual) {
      setFormError(
        "El abono aplicado no puede ser mayor al total disponible para pagar."
      );
      return;
    }

    onSave({
      conductor: Number(form.conductor),
      abono_aplicado: abonoAplicado,
      ajuste_manual: ajusteManual,
      notas: form.notas.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:px-5">
      <button
        type="button"
        onClick={cerrarConFondo}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
        aria-label="Cerrar modal"
      />

      <section className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <header className="border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
                <Calculator size={26} />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950 sm:text-xl">
                  Registrar liquidación
                </h2>

                <p className="mt-1 max-w-3xl text-sm font-medium leading-5 text-slate-500">
                  Busca el conductor y el sistema mostrará automáticamente todas sus jornadas pendientes de pago.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Cerrar"
            >
              <X size={22} />
            </button>
          </div>

          {(loadingCatalogos || loadingPreview || saving) && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
              <Loader2 size={17} className="animate-spin" />
              {saving
                ? "Registrando liquidación..."
                : loadingPreview
                ? "Buscando jornadas pendientes..."
                : "Cargando conductores..."}
            </div>
          )}
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60">
          <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
            {formError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {formError}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
                  <Search size={22} />
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Buscar conductor
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    Al seleccionar un conductor, el sistema cargará todos los días pendientes de pago.
                  </p>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={busquedaConductor}
                  onChange={(event) => {
                    setBusquedaConductor(event.target.value);
                    setMostrarResultados(true);

                    setForm((prev) => ({
                      ...prev,
                      conductor: "",
                      abono_aplicado: "0.00",
                      ajuste_manual: "0.00",
                    }));
                  }}
                  onFocus={() => setMostrarResultados(true)}
                  disabled={saving || loadingPreview || loadingCatalogos}
                  placeholder="Buscar por nombre o cédula..."
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
                />

                {mostrarResultados &&
                  !saving &&
                  !loadingPreview &&
                  !loadingCatalogos && (
                    <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                      {conductoresFiltrados.length > 0 ? (
                        conductoresFiltrados.map((conductor) => (
                          <button
                            key={conductor.id}
                            type="button"
                            onClick={() => seleccionarConductor(conductor)}
                            className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-yellow-50"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                              <UserRound size={20} />
                            </div>

                            <div>
                              <p className="text-sm font-black text-slate-800">
                                {conductor.nombre} {conductor.apellido}
                              </p>

                              <p className="text-xs font-semibold text-slate-500">
                                Cédula: {conductor.cedula || "Sin cédula"}
                              </p>

                              {conductor.sucursal_nombre && (
                                <p className="text-xs font-semibold text-slate-400">
                                  Sucursal: {conductor.sucursal_nombre}
                                </p>
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-sm font-semibold text-slate-500">
                          No se encontraron conductores.
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {conductorSeleccionado && (
                <div className="mt-3 flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <div>
                      <p className="text-sm font-black text-emerald-800">
                        {conductorSeleccionado.nombre}{" "}
                        {conductorSeleccionado.apellido}
                      </p>

                      <p className="text-xs font-semibold text-emerald-700">
                        Cédula: {conductorSeleccionado.cedula || "Sin cédula"}
                      </p>

                      {conductorSeleccionado.sucursal_nombre && (
                        <p className="text-xs font-semibold text-emerald-700">
                          Sucursal detectada:{" "}
                          {conductorSeleccionado.sucursal_nombre}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={limpiarConductor}
                    disabled={saving || loadingPreview}
                    className="rounded-xl bg-white px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                  >
                    Cambiar
                  </button>
                </div>
              )}
            </div>

            {previewCoincide && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <CalendarDays size={22} />
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Jornadas pendientes encontradas
                      </h3>
                      <p className="text-sm font-medium text-slate-500">
                        Estas son todas las fechas trabajadas que todavía no han sido liquidadas.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <ResumenCard
                      label="Días trabajados"
                      value={preview.jornadas_count || 0}
                    />

                    <ResumenCard
                      label="Desde"
                      value={formatoFecha(preview.fecha_inicio) || "-"}
                    />

                    <ResumenCard
                      label="Hasta"
                      value={formatoFecha(preview.fecha_fin) || "-"}
                    />

                    <ResumenCard
                      label="Total jornadas"
                      value={formatoMoneda(preview.total_jornadas)}
                      resaltado
                    />
                  </div>

                  <div className="mt-5 max-h-64 overflow-y-auto rounded-2xl border border-slate-200">
                    {preview.jornadas?.length > 0 ? (
                      preview.jornadas.map((jornada) => (
                        <div
                          key={jornada.id}
                          className="grid grid-cols-2 gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 md:grid-cols-5"
                        >
                          <InfoItem
                            label="Fecha"
                            value={formatoFecha(jornada.fecha)}
                          />

                          <InfoItem
                            label="Vehículo"
                            value={jornada.vehiculo || "-"}
                          />

                          <InfoItem
                            label="KM"
                            value={jornada.kilometros_recorridos || 0}
                          />

                          <InfoItem
                            label="Ingreso"
                            value={formatoMoneda(jornada.ingreso_bruto)}
                          />

                          <InfoItem
                            label="Pago conductor"
                            value={formatoMoneda(jornada.pago_conductor)}
                            alignRight
                            strong
                          />
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm font-semibold text-slate-500">
                        Este conductor no tiene jornadas pendientes de liquidar.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <WalletCards size={22} />
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Adelantos y abonos del conductor
                      </h3>
                      <p className="text-sm font-medium text-slate-500">
                        Historial de anticipos, adelantos y abonos registrados.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <ResumenCard
                      label="Total adelantos"
                      value={formatoMoneda(preview.total_adelantos)}
                    />

                    <ResumenCard
                      label="Total abonos"
                      value={formatoMoneda(preview.total_abonos)}
                    />

                    <ResumenCard
                      label="Saldo pendiente"
                      value={formatoMoneda(preview.pendiente_adelantos)}
                      resaltado
                    />
                  </div>

                  <div className="mt-5 max-h-52 overflow-y-auto rounded-2xl border border-slate-200">
                    {preview.historial_adelantos?.length > 0 ? (
                      preview.historial_adelantos.map((movimiento) => (
                        <div
                          key={movimiento.id}
                          className="grid grid-cols-2 gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 md:grid-cols-4"
                        >
                          <InfoItem
                            label="Fecha"
                            value={formatoFecha(movimiento.fecha)}
                          />

                          <InfoItem
                            label="Tipo"
                            value={movimiento.tipo_display || movimiento.tipo}
                            strong
                          />

                          <InfoItem
                            label="Estado"
                            value={movimiento.estado_nombre || "Sin estado"}
                          />

                          <InfoItem
                            label="Monto"
                            value={formatoMoneda(movimiento.monto)}
                            alignRight
                            strong
                          />
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm font-semibold text-slate-500">
                        Este conductor no tiene adelantos ni abonos registrados.
                      </div>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Abono aplicado en esta liquidación
                      </label>

                      <input
                        type="number"
                        name="abono_aplicado"
                        value={form.abono_aplicado}
                        onChange={handleChange}
                        disabled={saving}
                        min="0"
                        step="0.01"
                        placeholder="Ejemplo: 200.00"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
                      />

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Este monto se descuenta del pago y se registra como abono.
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Ajuste manual
                      </label>

                      <input
                        type="number"
                        name="ajuste_manual"
                        value={form.ajuste_manual}
                        onChange={handleChange}
                        disabled={saving}
                        min="0"
                        step="0.01"
                        placeholder="Ejemplo: 0.00"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <ResumenCard
                      label="Total jornadas"
                      value={formatoMoneda(preview.total_jornadas)}
                    />

                    <ResumenCard
                      label="Abono aplicado"
                      value={formatoMoneda(form.abono_aplicado)}
                    />

                    <ResumenCard
                      label="Ajuste"
                      value={formatoMoneda(form.ajuste_manual)}
                    />

                    <ResumenCard
                      label="Total a pagar"
                      value={formatoMoneda(totalFinal)}
                      resaltado
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Nota
                  </label>

                  <textarea
                    name="notas"
                    value={form.notas}
                    onChange={handleChange}
                    disabled={saving}
                    rows="3"
                    placeholder="Ejemplo: Pago semanal del conductor..."
                    className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  loadingPreview ||
                  !previewCoincide ||
                  !preview?.jornadas_count ||
                  Number(preview.jornadas_count) <= 0
                }
                className="rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600] disabled:opacity-60"
              >
                {saving ? "Registrando pago..." : "Registrar liquidación"}
              </button>
            </div>
          </form>
        </main>
      </section>
    </div>
  );
};

const ResumenCard = ({ label, value, resaltado = false }) => {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        resaltado
          ? "border-yellow-300 bg-white text-slate-950"
          : "border-slate-200 bg-white text-slate-800"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
};

const InfoItem = ({ label, value, alignRight = false, strong = false }) => {
  return (
    <div className={alignRight ? "md:text-right" : ""}>
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p
        className={`${
          strong ? "font-black text-slate-900" : "font-bold text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default LiquidacionModal;