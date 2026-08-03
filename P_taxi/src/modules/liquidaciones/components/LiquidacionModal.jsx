import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Banknote,
  CalendarDays,
  Calculator,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Loader2,
  ReceiptText,
  Search,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

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

const nombreConductor = (
  conductor
) => {
  if (!conductor) {
    return "";
  }

  const nombre = `
    ${conductor.nombre || ""}
    ${conductor.apellido || ""}
  `.trim();

  if (conductor.cedula) {
    return `${nombre} - ${conductor.cedula}`;
  }

  return nombre;
};

const buscarConductorPorId = (
  conductores,
  id
) => {
  if (!id) {
    return null;
  }

  return (
    conductores.find(
      (conductor) =>
        String(conductor.id) ===
        String(id)
    ) || null
  );
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
  const [form, setForm] =
    useState({
      conductor: "",
      abono_aplicado: "0.00",
      ajuste_manual: "0.00",
      notas: "",
    });

  const [
    busquedaConductor,
    setBusquedaConductor,
  ] = useState("");

  const [
    mostrarResultados,
    setMostrarResultados,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape" &&
        !saving
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        "";
    };
  }, [
    open,
    saving,
    onClose,
  ]);

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

  const conductoresFiltrados =
    useMemo(() => {
      const value =
        busquedaConductor
          .trim()
          .toLowerCase();

      if (!value) {
        return conductores.slice(
          0,
          8
        );
      }

      return conductores
        .filter(
          (conductor) => {
            const texto =
              nombreConductor(
                conductor
              ).toLowerCase();

            const sucursal = String(
              conductor
                .sucursal_nombre ||
                ""
            ).toLowerCase();

            return (
              texto.includes(value) ||
              sucursal.includes(value)
            );
          }
        )
        .slice(0, 10);
    }, [
      conductores,
      busquedaConductor,
    ]);

  const conductorSeleccionado =
    useMemo(() => {
      return buscarConductorPorId(
        conductores,
        form.conductor
      );
    }, [
      conductores,
      form.conductor,
    ]);

  const previewCoincide =
    useMemo(() => {
      if (!preview) {
        return false;
      }

      return (
        String(
          preview?.conductor?.id
        ) ===
        String(form.conductor)
      );
    }, [
      preview,
      form.conductor,
    ]);

  const totalIngresoBruto =
    useMemo(() => {
      if (
        !previewCoincide ||
        !Array.isArray(
          preview?.jornadas
        )
      ) {
        return 0;
      }

      return preview.jornadas.reduce(
        (
          total,
          jornada
        ) =>
          total +
          Number(
            jornada
              ?.ingreso_bruto ||
              0
          ),
        0
      );
    }, [
      previewCoincide,
      preview,
    ]);

  const totalFinal =
    useMemo(() => {
      if (!previewCoincide) {
        return 0;
      }

      const totalJornadas =
        Number(
          preview
            ?.total_jornadas ||
            0
        );

      const abonoAplicado =
        Number(
          form
            .abono_aplicado ||
            0
        );

      const ajusteManual =
        Number(
          form
            .ajuste_manual ||
            0
        );

      const total =
        totalJornadas -
        abonoAplicado +
        ajusteManual;

      return Math.max(
        total,
        0
      );
    }, [
      previewCoincide,
      preview,
      form.abono_aplicado,
      form.ajuste_manual,
    ]);

  if (!open) {
    return null;
  }

  const cerrarConFondo = () => {
    if (!saving) {
      onClose();
    }
  };

  const seleccionarConductor =
    async (
      conductor
    ) => {
      const conductorId =
        String(conductor.id);

      setForm(
        (prev) => ({
          ...prev,
          conductor:
            conductorId,
          abono_aplicado:
            "0.00",
          ajuste_manual:
            "0.00",
        })
      );

      setBusquedaConductor(
        nombreConductor(
          conductor
        )
      );

      setMostrarResultados(
        false
      );

      setFormError("");

      await onPreview({
        conductor:
          conductorId,
      });
    };

  const limpiarConductor =
    () => {
      setForm(
        (prev) => ({
          ...prev,
          conductor: "",
          abono_aplicado:
            "0.00",
          ajuste_manual:
            "0.00",
        })
      );

      setBusquedaConductor("");
      setMostrarResultados(true);
      setFormError("");
    };

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );

    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (!form.conductor) {
      setFormError(
        "Debes seleccionar el conductor."
      );

      return;
    }

    if (!previewCoincide) {
      setFormError(
        "Debes seleccionar un conductor con jornadas pendientes."
      );

      return;
    }

    if (
      !preview?.jornadas_count ||
      Number(
        preview.jornadas_count
      ) <= 0
    ) {
      setFormError(
        "No hay jornadas pendientes para liquidar."
      );

      return;
    }

    const abonoAplicado =
      Number(
        form.abono_aplicado ||
          0
      );

    const ajusteManual =
      Number(
        form.ajuste_manual ||
          0
      );

    const pendienteAdelantos =
      Number(
        preview
          .pendiente_adelantos ||
          0
      );

    const totalJornadas =
      Number(
        preview
          .total_jornadas ||
          0
      );

    if (
      Number.isNaN(
        abonoAplicado
      ) ||
      abonoAplicado < 0
    ) {
      setFormError(
        "El abono aplicado no puede ser negativo."
      );

      return;
    }

    if (
      Number.isNaN(
        ajusteManual
      ) ||
      ajusteManual < 0
    ) {
      setFormError(
        "El ajuste manual no puede ser negativo."
      );

      return;
    }

    if (
      abonoAplicado >
      pendienteAdelantos
    ) {
      setFormError(
        "El abono aplicado no puede ser mayor al saldo pendiente."
      );

      return;
    }

    if (
      abonoAplicado >
      totalJornadas +
        ajusteManual
    ) {
      setFormError(
        "El abono aplicado no puede ser mayor al total disponible para pagar."
      );

      return;
    }

    onSave({
      conductor:
        Number(
          form.conductor
        ),

      abono_aplicado:
        abonoAplicado,

      ajuste_manual:
        ajusteManual,

      notas:
        form.notas.trim(),
    });
  };

  const cargando =
    loadingCatalogos ||
    loadingPreview ||
    saving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        onClick={
          cerrarConFondo
        }
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
        aria-label="Cerrar modal"
      />

      <section className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[26px] border border-white/10 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.45)]">
        <header className="relative overflow-hidden bg-slate-950 px-4 py-4 text-white sm:px-5">
          <div className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full bg-yellow-400/20 blur-3xl" />

          <div className="pointer-events-none absolute bottom-0 left-1/3 h-16 w-48 bg-blue-500/10 blur-3xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20">
                <Calculator
                  size={23}
                  strokeWidth={2.4}
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-400">
                  Control de pagos
                </p>

                <h2 className="truncate text-lg font-black sm:text-xl">
                  Registrar liquidación
                </h2>

                <p className="mt-0.5 hidden text-xs font-medium text-slate-400 sm:block">
                  Calcula y registra el pago pendiente del conductor.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50"
              aria-label="Cerrar"
            >
              <X size={19} />
            </button>
          </div>

          {cargando && (
            <div className="relative mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-slate-200">
              <Loader2
                size={15}
                className="animate-spin text-yellow-400"
              />

              {saving
                ? "Registrando liquidación..."
                : loadingPreview
                  ? "Calculando jornadas pendientes..."
                  : "Cargando conductores..."}
            </div>
          )}
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#F5F7FB]">
          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-4 p-3 sm:p-5"
          >
            {formError && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />

                <p className="text-sm font-bold text-red-700">
                  {formError}
                </p>
              </div>
            )}

            <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 sm:w-[220px]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
                    <Search
                      size={19}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Seleccionar conductor
                    </h3>

                    <p className="text-[11px] font-medium text-slate-400">
                      Nombre o cédula
                    </p>
                  </div>
                </div>

                <div className="relative min-w-0 flex-1">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={
                      busquedaConductor
                    }
                    onChange={(
                      event
                    ) => {
                      setBusquedaConductor(
                        event.target
                          .value
                      );

                      setMostrarResultados(
                        true
                      );

                      setForm(
                        (prev) => ({
                          ...prev,
                          conductor:
                            "",
                          abono_aplicado:
                            "0.00",
                          ajuste_manual:
                            "0.00",
                        })
                      );
                    }}
                    onFocus={() =>
                      setMostrarResultados(
                        true
                      )
                    }
                    disabled={
                      saving ||
                      loadingPreview ||
                      loadingCatalogos
                    }
                    placeholder="Buscar conductor..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100 disabled:opacity-60"
                  />

                  {mostrarResultados &&
                    !cargando && (
                      <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                        {conductoresFiltrados.length >
                        0 ? (
                          conductoresFiltrados.map(
                            (
                              conductor
                            ) => (
                              <button
                                key={
                                  conductor.id
                                }
                                type="button"
                                onClick={() =>
                                  seleccionarConductor(
                                    conductor
                                  )
                                }
                                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-yellow-50"
                              >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-yellow-100 group-hover:text-yellow-700">
                                  <UserRound
                                    size={
                                      18
                                    }
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-black text-slate-800">
                                    {
                                      conductor.nombre
                                    }{" "}
                                    {
                                      conductor.apellido
                                    }
                                  </p>

                                  <p className="truncate text-[11px] font-semibold text-slate-400">
                                    {conductor.cedula
                                      ? `Cédula: ${conductor.cedula}`
                                      : "Sin cédula registrada"}
                                  </p>
                                </div>

                                <ChevronRight
                                  size={
                                    17
                                  }
                                  className="text-slate-300"
                                />
                              </button>
                            )
                          )
                        ) : (
                          <div className="px-4 py-5 text-center text-sm font-semibold text-slate-500">
                            No se encontraron conductores.
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>

              {conductorSeleccionado && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-emerald-600"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-emerald-800">
                        {
                          conductorSeleccionado.nombre
                        }{" "}
                        {
                          conductorSeleccionado.apellido
                        }
                      </p>

                      <p className="text-[11px] font-semibold text-emerald-600">
                        Conductor seleccionado
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      limpiarConductor
                    }
                    disabled={
                      saving ||
                      loadingPreview
                    }
                    className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-black text-emerald-700 shadow-sm transition hover:bg-emerald-100 disabled:opacity-50"
                  >
                    Cambiar
                  </button>
                </div>
              )}
            </section>

            {previewCoincide && (
              <>
                <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <CalendarDays
                          size={18}
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-slate-900">
                          Jornadas pendientes
                        </h3>

                        <p className="text-[11px] font-medium text-slate-400">
                          Resumen del período
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                      {preview.jornadas_count ||
                        0}{" "}
                      días
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                  
                    <ResumenCard
                      icono={
                        Clock3
                      }
                      label="Desde"
                      value={
                        formatoFecha(
                          preview.fecha_inicio
                        ) || "-"
                      }
                      compacto
                    />

                    <ResumenCard
                      icono={
                        Clock3
                      }
                      label="Hasta"
                      value={
                        formatoFecha(
                          preview.fecha_fin
                        ) || "-"
                      }
                      compacto
                    />

                    <ResumenCard
                      icono={
                        CircleDollarSign
                      }
                      label="Ingreso bruto"
                      value={
                        formatoMoneda(
                          totalIngresoBruto
                        )
                      }
                    />

                    <ResumenCard
                      icono={
                        Banknote
                      }
                      label="Pago conductor"
                      value={
                        formatoMoneda(
                          preview.total_jornadas
                        )
                      }
                      resaltado
                    />

                    <ResumenCard
                      icono={
                        CalendarDays
                      }
                      label="Días"
                      value={
                        preview.jornadas_count ||
                        0
                      }
                    />

                  </div>

                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="hidden grid-cols-[1fr_1.2fr_.7fr_1fr_1fr] bg-slate-950 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-400 md:grid">
                      <span>Fecha</span>
                      <span>Vehículo</span>
                      <span>KM</span>
                      <span>Ingreso</span>
                      <span className="text-right">
                        Pago
                      </span>
                    </div>

                    <div className="max-h-52 overflow-y-auto">
                      {preview.jornadas
                        ?.length >
                      0 ? (
                        preview.jornadas.map(
                          (
                            jornada
                          ) => (
                            <div
                              key={
                                jornada.id
                              }
                              className="grid grid-cols-2 gap-2 border-b border-slate-100 px-3 py-2.5 text-xs last:border-b-0 md:grid-cols-[1fr_1.2fr_.7fr_1fr_1fr] md:items-center"
                            >
                              <DatoFila
                                label="Fecha"
                                value={
                                  formatoFecha(
                                    jornada.fecha
                                  )
                                }
                              />

                              <DatoFila
                                label="Vehículo"
                                value={
                                  jornada.vehiculo ||
                                  "-"
                                }
                              />

                              <DatoFila
                                label="KM"
                                value={
                                  jornada.kilometros_recorridos ||
                                  0
                                }
                              />

                              <DatoFila
                                label="Ingreso"
                                value={
                                  formatoMoneda(
                                    jornada.ingreso_bruto
                                  )
                                }
                              />

                              <DatoFila
                                label="Pago"
                                value={
                                  formatoMoneda(
                                    jornada.pago_conductor
                                  )
                                }
                                fuerte
                                derecha
                              />
                            </div>
                          )
                        )
                      ) : (
                        <div className="px-4 py-6 text-center text-sm font-semibold text-slate-500">
                          No hay jornadas pendientes.
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                      <WalletCards
                        size={18}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        Adelantos y ajustes
                      </h3>

                      <p className="text-[11px] font-medium text-slate-400">
                        Descuentos aplicados al pago
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <ResumenCard
                      label="Adelantos"
                      value={
                        formatoMoneda(
                          preview.total_adelantos
                        )
                      }
                      compacto
                    />

                    <ResumenCard
                      label="Abonos"
                      value={
                        formatoMoneda(
                          preview.total_abonos
                        )
                      }
                      compacto
                    />

                    <ResumenCard
                      label="Pendiente"
                      value={
                        formatoMoneda(
                          preview.pendiente_adelantos
                        )
                      }
                      compacto
                      resaltado
                    />
                  </div>

                  {preview
                    .historial_adelantos
                    ?.length >
                    0 && (
                    <div className="mt-3 max-h-36 overflow-y-auto rounded-xl border border-slate-200">
                      {preview.historial_adelantos.map(
                        (
                          movimiento
                        ) => (
                          <div
                            key={
                              movimiento.id
                            }
                            className="grid grid-cols-3 items-center gap-2 border-b border-slate-100 px-3 py-2 text-xs last:border-b-0"
                          >
                            <span className="font-semibold text-slate-500">
                              {formatoFecha(
                                movimiento.fecha
                              )}
                            </span>

                            <span className="font-bold text-slate-700">
                              {movimiento.tipo_display ||
                                movimiento.tipo}
                            </span>

                            <span className="text-right font-black text-slate-900">
                              {formatoMoneda(
                                movimiento.monto
                              )}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <CampoMoneda
                      label="Abono aplicado"
                      descripcion="Se descuenta del pago."
                      name="abono_aplicado"
                      value={
                        form.abono_aplicado
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        saving
                      }
                    />

                    <CampoMoneda
                      label="Ajuste manual"
                      descripcion="Monto adicional al pago."
                      name="ajuste_manual"
                      value={
                        form.ajuste_manual
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        saving
                      }
                    />
                  </div>
                </section>

                <section className="relative overflow-hidden rounded-[22px] bg-slate-950 p-4 text-white shadow-lg">
                  <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-yellow-400/20 blur-3xl" />

                  <div className="relative">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400 text-slate-950">
                        <ReceiptText
                          size={18}
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-black">
                          Resumen final
                        </h3>

                        <p className="text-[11px] font-medium text-slate-400">
                          Resultado de la liquidación
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                      <ResumenFinal
                        label="Ingreso bruto"
                        value={
                          formatoMoneda(
                            totalIngresoBruto
                          )
                        }
                      />

                      <ResumenFinal
                        label="Pago jornadas"
                        value={
                          formatoMoneda(
                            preview.total_jornadas
                          )
                        }
                      />

                      <ResumenFinal
                        label="Abono"
                        value={`- ${formatoMoneda(
                          form.abono_aplicado
                        )}`}
                      />

                      <ResumenFinal
                        label="Ajuste"
                        value={`+ ${formatoMoneda(
                          form.ajuste_manual
                        )}`}
                      />

                      <ResumenFinal
                        label="Total a pagar"
                        value={
                          formatoMoneda(
                            totalFinal
                          )
                        }
                        principal
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                  <label
                    htmlFor="notas-liquidacion"
                    className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500"
                  >
                    Nota de liquidación
                  </label>

                  <textarea
                    id="notas-liquidacion"
                    name="notas"
                    value={form.notas}
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                    rows="2"
                    placeholder="Ejemplo: Pago semanal del conductor..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100 disabled:opacity-60"
                  />
                </section>
              </>
            )}

            <footer className="sticky bottom-0 -mx-3 -mb-3 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-md sm:-mx-5 sm:-mb-5 sm:flex-row sm:justify-end sm:p-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  loadingPreview ||
                  !previewCoincide ||
                  !preview
                    ?.jornadas_count ||
                  Number(
                    preview
                      .jornadas_count
                  ) <= 0
                }
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 text-sm font-black text-slate-950 shadow-lg shadow-yellow-200 transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Registrando...
                  </>
                ) : (
                  <>
                    <Banknote
                      size={18}
                    />

                    Registrar liquidación
                  </>
                )}
              </button>
            </footer>
          </form>
        </main>
      </section>
    </div>
  );
};

const ResumenCard = ({
  icono: Icono,
  label,
  value,
  resaltado = false,
  compacto = false,
}) => {
  return (
    <div
      className={`min-w-0 rounded-xl border px-3 py-2.5 ${
        resaltado
          ? "border-yellow-300 bg-yellow-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {Icono && (
          <Icono
            size={13}
            className={
              resaltado
                ? "text-yellow-700"
                : "text-slate-400"
            }
          />
        )}

        <p className="truncate text-[9px] font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <p
        className={`mt-1 truncate font-black text-slate-950 ${
          compacto
            ? "text-xs"
            : "text-sm"
        }`}
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
};

const CampoMoneda = ({
  label,
  descripcion,
  name,
  value,
  onChange,
  disabled,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black text-slate-700">
        {label}
      </label>

      <div className="relative">
        <CircleDollarSign
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          min="0"
          step="0.01"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-black text-slate-800 outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100 disabled:opacity-60"
        />
      </div>

      <p className="mt-1 text-[10px] font-medium text-slate-400">
        {descripcion}
      </p>
    </div>
  );
};

const ResumenFinal = ({
  label,
  value,
  principal = false,
}) => {
  return (
    <div
      className={`rounded-xl px-3 py-2.5 ${
        principal
          ? "col-span-2 bg-yellow-400 text-slate-950 md:col-span-1"
          : "bg-white/10"
      }`}
    >
      <p
        className={`text-[9px] font-black uppercase tracking-wide ${
          principal
            ? "text-slate-700"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-1 truncate font-black ${
          principal
            ? "text-base"
            : "text-sm text-white"
        }`}
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
};

const DatoFila = ({
  label,
  value,
  fuerte = false,
  derecha = false,
}) => {
  return (
    <div
      className={
        derecha
          ? "md:text-right"
          : ""
      }
    >
      <p className="mb-0.5 text-[9px] font-black uppercase text-slate-400 md:hidden">
        {label}
      </p>

      <p
        className={`truncate ${
          fuerte
            ? "font-black text-slate-950"
            : "font-bold text-slate-600"
        }`}
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
};

export default LiquidacionModal;