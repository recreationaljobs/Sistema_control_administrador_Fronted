import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  CalendarDays,
  CarTaxiFront,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Gauge,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";

const formatoDinero = (valor) => {
  return `C$ ${Number(
    valor || 0
  ).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const mesesTexto = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const diasTexto = [
  "DOM",
  "LUN",
  "MAR",
  "MIÉ",
  "JUE",
  "VIE",
  "SÁB",
];

const crearFechaLocal = (fecha) => {
  if (!fecha) {
    return null;
  }

  const fechaNormalizada =
    String(fecha).slice(0, 10);

  return new Date(
    `${fechaNormalizada}T00:00:00`
  );
};

const formatearFechaInput = (date) => {
  if (!date) {
    return "";
  }

  const year =
    date.getFullYear();

  const month = `${
    date.getMonth() + 1
  }`.padStart(2, "0");

  const day = `${
    date.getDate()
  }`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatearFechaTexto = (fecha) => {
  const date =
    crearFechaLocal(fecha);

  if (!date) {
    return "Todas las fechas";
  }

  return date.toLocaleDateString(
    "es-NI",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
};

const construirDiasMes = (
  year,
  month
) => {
  const primerDia =
    new Date(year, month, 1);

  const inicioSemana =
    primerDia.getDay();

  const totalDias =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const dias = [];

  for (
    let i = 0;
    i < inicioSemana;
    i += 1
  ) {
    dias.push(null);
  }

  for (
    let dia = 1;
    dia <= totalDias;
    dia += 1
  ) {
    dias.push(
      new Date(
        year,
        month,
        dia
      )
    );
  }

  return dias;
};

const estaEnRango = (
  fecha,
  inicio,
  fin
) => {
  if (!fecha || !inicio) {
    return false;
  }

  const fechaJornada =
    String(fecha).slice(0, 10);

  const fechaInicio =
    String(inicio).slice(0, 10);

  const fechaFinal = fin
    ? String(fin).slice(0, 10)
    : fechaInicio;

  return (
    fechaJornada >= fechaInicio &&
    fechaJornada <= fechaFinal
  );
};

const jornadaEstaLiquidada = (
  jornada
) => {
  return Boolean(
    jornada?.liquidada
  );
};

const obtenerIdConductor = (
  jornada
) => {
  return (
    jornada?.conductor?.id ??
    jornada?.conductor ??
    ""
  );
};

const obtenerNombreConductor = (
  jornada
) => {
  if (
    jornada?.conductor_nombre
  ) {
    return jornada.conductor_nombre;
  }

  if (
    jornada?.conductor
      ?.nombre_completo
  ) {
    return (
      jornada.conductor
        .nombre_completo
    );
  }

  const nombreCompleto = [
    jornada?.conductor?.nombre,
    jornada?.conductor?.apellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (nombreCompleto) {
    return nombreCompleto;
  }

  const conductorId =
    obtenerIdConductor(jornada);

  return conductorId
    ? `Conductor ${conductorId}`
    : "Conductor sin nombre";
};

const JornadaTable = ({
  jornadas = [],
  loading = false,
  onEdit,
  onDelete,
  esTaxista = false,
}) => {
  const hoy = new Date();

  const fechaHoy =
    formatearFechaInput(hoy);

  const [
    modalCalendario,
    setModalCalendario,
  ] = useState(false);

  const [
    mesActual,
    setMesActual,
  ] = useState(
    hoy.getMonth()
  );

  const [
    anioActual,
    setAnioActual,
  ] = useState(
    hoy.getFullYear()
  );

  const [
    fechaInicio,
    setFechaInicio,
  ] = useState(fechaHoy);

  const [
    fechaFin,
    setFechaFin,
  ] = useState("");

  const [
    primerClickRango,
    setPrimerClickRango,
  ] = useState(fechaHoy);

  const [
    conductorFiltro,
    setConductorFiltro,
  ] = useState("");

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const calendarioDesdeMenu =
    searchParams.get(
      "calendario"
    ) === "1";

  useEffect(() => {
    if (!esTaxista) {
      return;
    }

    if (calendarioDesdeMenu) {
      const fechaSeleccionada =
        crearFechaLocal(
          fechaInicio
        ) || new Date();

      setMesActual(
        fechaSeleccionada.getMonth()
      );

      setAnioActual(
        fechaSeleccionada.getFullYear()
      );

      setModalCalendario(true);
    } else {
      setModalCalendario(false);
    }
  }, [
    esTaxista,
    calendarioDesdeMenu,
    fechaInicio,
  ]);

  const diasCalendario =
    useMemo(() => {
      return construirDiasMes(
        anioActual,
        mesActual
      );
    }, [
      anioActual,
      mesActual,
    ]);

  const conductoresDisponibles =
    useMemo(() => {
      const mapaConductores =
        new Map();

      jornadas.forEach(
        (jornada) => {
          const conductorId =
            obtenerIdConductor(
              jornada
            );

          if (
            conductorId === null ||
            conductorId === undefined ||
            conductorId === ""
          ) {
            return;
          }

          mapaConductores.set(
            String(conductorId),
            {
              id: String(
                conductorId
              ),

              nombre:
                obtenerNombreConductor(
                  jornada
                ),
            }
          );
        }
      );

      return Array.from(
        mapaConductores.values()
      ).sort((a, b) =>
        a.nombre.localeCompare(
          b.nombre,
          "es",
          {
            sensitivity: "base",
          }
        )
      );
    }, [jornadas]);

  useEffect(() => {
    if (!conductorFiltro) {
      return;
    }

    const conductorExiste =
      conductoresDisponibles.some(
        (conductor) =>
          String(conductor.id) ===
          String(conductorFiltro)
      );

    if (!conductorExiste) {
      setConductorFiltro("");
    }
  }, [
    conductorFiltro,
    conductoresDisponibles,
  ]);

  const jornadasFiltradas =
    useMemo(() => {
      return jornadas.filter(
        (jornada) => {
          const cumpleFecha =
            !fechaInicio ||
            estaEnRango(
              jornada.fecha,
              fechaInicio,
              fechaFin
            );

          const conductorId =
            obtenerIdConductor(
              jornada
            );

          const cumpleConductor =
            !conductorFiltro ||
            String(conductorId) ===
              String(
                conductorFiltro
              );

          return (
            cumpleFecha &&
            cumpleConductor
          );
        }
      );
    }, [
      jornadas,
      fechaInicio,
      fechaFin,
      conductorFiltro,
    ]);

  const resumenFiltro =
    useMemo(() => {
      if (!fechaInicio) {
        return "Todas las fechas";
      }

      if (
        !fechaFin ||
        fechaInicio === fechaFin
      ) {
        return formatearFechaTexto(
          fechaInicio
        );
      }

      return `${formatearFechaTexto(
        fechaInicio
      )} - ${formatearFechaTexto(
        fechaFin
      )}`;
    }, [
      fechaInicio,
      fechaFin,
    ]);

  const nombreConductorFiltro =
    useMemo(() => {
      if (!conductorFiltro) {
        return "Todos los conductores";
      }

      const conductor =
        conductoresDisponibles.find(
          (item) =>
            String(item.id) ===
            String(
              conductorFiltro
            )
        );

      return (
        conductor?.nombre ||
        "Conductor seleccionado"
      );
    }, [
      conductorFiltro,
      conductoresDisponibles,
    ]);

  const cambiarMes = (
    direccion
  ) => {
    const nuevaFecha =
      new Date(
        anioActual,
        mesActual + direccion,
        1
      );

    setMesActual(
      nuevaFecha.getMonth()
    );

    setAnioActual(
      nuevaFecha.getFullYear()
    );
  };

  const cerrarCalendario = () => {
    setModalCalendario(false);

    if (
      esTaxista &&
      calendarioDesdeMenu
    ) {
      const nuevosParametros =
        new URLSearchParams(
          searchParams
        );

      nuevosParametros.delete(
        "calendario"
      );

      setSearchParams(
        nuevosParametros,
        {
          replace: true,
        }
      );
    }
  };

  const seleccionarDia = (
    date
  ) => {
    const fecha =
      formatearFechaInput(date);

    if (esTaxista) {
      setFechaInicio(fecha);
      setFechaFin("");
      setPrimerClickRango(
        fecha
      );
      cerrarCalendario();
      return;
    }

    if (
      !primerClickRango ||
      fechaFin
    ) {
      setFechaInicio(fecha);
      setFechaFin("");
      setPrimerClickRango(
        fecha
      );
      return;
    }

    if (
      fecha ===
      primerClickRango
    ) {
      setFechaInicio(fecha);
      setFechaFin("");
      setPrimerClickRango(
        fecha
      );
      cerrarCalendario();
      return;
    }

    const inicio =
      crearFechaLocal(
        primerClickRango
      );

    const final =
      crearFechaLocal(fecha);

    if (final < inicio) {
      setFechaInicio(fecha);

      setFechaFin(
        primerClickRango
      );
    } else {
      setFechaInicio(
        primerClickRango
      );

      setFechaFin(fecha);
    }

    setPrimerClickRango("");
    cerrarCalendario();
  };

  const limpiarFiltros = () => {
    setConductorFiltro("");
    setFechaInicio(fechaHoy);
    setFechaFin("");
    setPrimerClickRango(
      fechaHoy
    );

    const hoyActual =
      new Date();

    setMesActual(
      hoyActual.getMonth()
    );

    setAnioActual(
      hoyActual.getFullYear()
    );
  };

  const esDiaHoy = (date) => {
    return (
      formatearFechaInput(
        date
      ) === fechaHoy
    );
  };

  const esInicioRango = (
    date
  ) => {
    return (
      formatearFechaInput(
        date
      ) === fechaInicio
    );
  };

  const esFinRango = (
    date
  ) => {
    return (
      fechaFin &&
      formatearFechaInput(
        date
      ) === fechaFin
    );
  };

  const esDiaSeleccionado = (
    date
  ) => {
    if (
      !date ||
      !fechaInicio
    ) {
      return false;
    }

    const fecha =
      formatearFechaInput(
        date
      );

    const actual =
      crearFechaLocal(fecha);

    const inicio =
      crearFechaLocal(
        fechaInicio
      );

    const fin = fechaFin
      ? crearFechaLocal(
          fechaFin
        )
      : inicio;

    return (
      actual >= inicio &&
      actual <= fin
    );
  };

  const obtenerClaseDia = (
    date
  ) => {
    const seleccionado =
      esDiaSeleccionado(date);

    const hoyMarcado =
      esDiaHoy(date);

    const inicio =
      esInicioRango(date);

    const fin =
      esFinRango(date);

    if (inicio || fin) {
      return "bg-[#F5B800] text-white shadow-md shadow-yellow-100 hover:bg-[#DFA600]";
    }

    if (seleccionado) {
      return "bg-yellow-100 text-[#9A6A00] hover:bg-yellow-200";
    }

    if (hoyMarcado) {
      return "bg-blue-50 text-blue-700 ring-2 ring-blue-200 hover:bg-blue-100";
    }

    return "text-slate-700 hover:bg-slate-100";
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-500">
          Cargando jornadas...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!esTaxista && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5">
           

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="filtro-conductor-jornada"
                  className="mb-2 block text-sm font-black text-slate-700"
                >
                  Conductor o taxista
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />

                  <select
                    id="filtro-conductor-jornada"
                    value={
                      conductorFiltro
                    }
                    onChange={(
                      event
                    ) =>
                      setConductorFiltro(
                        event.target
                          .value
                      )
                    }
                    className=" cursor-pointer w-full appearance-none rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-10 text-sm font-bold text-slate-800 outline-none transition hover:border-slate-400 focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
                  >
                    <option value="">
                     Seleccione un conductor
                    </option>

                    {conductoresDisponibles.map(
                      (
                        conductor
                      ) => (
                        <option className="cursor-pointer"
                          key={
                            conductor.id
                          }
                          value={
                            conductor.id
                          }
                        >
                          {
                            conductor.nombre
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {!conductoresDisponibles.length && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    No hay conductores
                    con jornadas
                    registradas.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Fecha o rango
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setPrimerClickRango(
                      fechaFin
                        ? ""
                        : fechaInicio
                    );

                    setModalCalendario(
                      true
                    );
                  }}
                  className=" cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600]"
                >
                  <CalendarDays
                    size={20}
                  />

                  Elegir fecha
                </button>
              </div>
            </div>

            {/* <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Filtro actual
                </p>

                <p className="mt-1 truncate text-sm font-black capitalize text-slate-800">
                  {
                    nombreConductorFiltro
                  }
                </p>

                <p className="mt-1 text-xs font-semibold capitalize text-slate-500">
                  {resumenFiltro}
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                <p className="text-sm font-black text-slate-800">
                  {
                    jornadasFiltradas.length
                  }{" "}
                  {jornadasFiltradas.length ===
                  1
                    ? "jornada encontrada"
                    : "jornadas encontradas"}
                </p>

                {(conductorFiltro ||
                  fechaInicio !==
                    fechaHoy ||
                  fechaFin) && (
                  <button
                    type="button"
                    onClick={
                      limpiarFiltros
                    }
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-100"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div> */}
          </div>
        </div>
      )}

      <div className="block lg:hidden">
        <div className="space-y-4">
          {jornadasFiltradas.length ===
            0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <CalendarDays
                  size={28}
                />
              </div>

              <p className="mt-4 text-sm font-black text-slate-900">
                No hay jornadas con
                los filtros
                seleccionados.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {esTaxista
                  ? "Selecciona otro día desde el botón Fecha."
                  : "Selecciona otro conductor o cambia el rango de fechas."}
              </p>
            </div>
          )}

          {jornadasFiltradas.map(
            (jornada) => {
              const liquidada =
                jornadaEstaLiquidada(
                  jornada
                );

              return (
                <div
                  key={jornada.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#F5B800]">
                        <CalendarDays
                          size={24}
                        />
                      </div>

                      <div>
                        <p className="text-base font-black text-slate-900">
                          {
                            jornada.fecha
                          }
                        </p>

                        <p className="text-xs font-medium text-slate-500">
                          {jornada.sucursal_nombre ||
                            "Panel superadmin"}
                        </p>
                      </div>
                    </div>

                    {!esTaxista && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              !liquidada &&
                              typeof onEdit ===
                                "function"
                            ) {
                              onEdit(
                                jornada
                              );
                            }
                          }}
                          disabled={
                            liquidada
                          }
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition active:scale-95 ${
                            liquidada
                              ? "cursor-not-allowed bg-slate-100 text-slate-400"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                          title={
                            liquidada
                              ? `Incluida en liquidación #${
                                  jornada.liquidacion_id ||
                                  ""
                                }`
                              : "Editar jornada completa"
                          }
                        >
                          <Edit3
                            size={18}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (
                              !liquidada &&
                              typeof onDelete ===
                                "function"
                            ) {
                              onDelete(
                                jornada
                              );
                            }
                          }}
                          disabled={
                            liquidada
                          }
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition active:scale-95 ${
                            liquidada
                              ? "cursor-not-allowed bg-slate-100 text-slate-400"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                          title={
                            liquidada
                              ? "No se puede eliminar una jornada liquidada"
                              : "Eliminar jornada"
                          }
                        >
                          <Trash2
                            size={18}
                          />
                        </button>
                      </div>
                    )}
                  </div>

                  {!esTaxista && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <UserRound
                          size={20}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-900">
                          {obtenerNombreConductor(
                            jornada
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE7A3] text-slate-900">
                      <CarTaxiFront
                        size={20}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-900">
                        {jornada.vehiculo_numero ||
                          "Sin número"}{" "}
                        -{" "}
                        {jornada.vehiculo_placa ||
                          "Sin placa"}
                      </p>

                      <p className="truncate text-xs font-medium text-slate-500">
                        {jornada.vehiculo_descripcion ||
                          "Vehículo"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 shadow-sm">
                        <Gauge
                          size={14}
                        />

                        {Number(
                          jornada.kilometros_recorridos ||
                            0
                        ).toLocaleString(
                          "es-NI"
                        )}{" "}
                        km
                      </span>

                      <span className="text-xs font-medium text-slate-500">
                        {jornada.kilometraje_inicial ??
                          "Pendiente"}{" "}
                        →{" "}
                        {jornada.kilometraje_final ??
                          "Pendiente"}
                      </span>
                    </div>
                  </div>

                  {esTaxista ? (
                    <div className="mt-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-4">
                      <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                        Ganancia del día
                      </p>

                      <p className="mt-1 text-2xl font-black text-blue-700">
                        {formatoDinero(
                          jornada.pago_conductor
                        )}
                      </p>

                      <p className="mt-1 text-xs font-medium text-blue-600">
                        {liquidada
                          ? "Liquidación completada"
                          : "Pendiente de liquidación"}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-green-50 p-3">
                        <p className="text-xs font-black uppercase tracking-wide text-green-600">
                          Ingresos
                        </p>

                        <p className="mt-1 text-lg font-black text-green-700">
                          {formatoDinero(
                            jornada.ingreso_bruto
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50 p-3">
                        <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
                          Ganancia dueño
                        </p>

                        <p className="mt-1 text-lg font-black text-emerald-700">
                          {formatoDinero(
                            jornada.ganancia_real_dueno ??
                              jornada.ganancia_dueno
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-100 p-3">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Pago conductor
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-700">
                          {formatoDinero(
                            jornada.pago_conductor
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-100 p-3">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Gastos
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-700">
                          {formatoDinero(
                            jornada.gastos_operativos ??
                              jornada.total_gastos
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Fecha
                </th>

                {!esTaxista && (
                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    Conductor
                  </th>
                )}

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Vehículo
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  Kilómetros
                </th>

                {esTaxista ? (
                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    Ganancia diaria
                  </th>
                ) : (
                  <>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                      Ingresos
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                      Ganancia dueño
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                      Acciones
                    </th>
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {jornadasFiltradas.length ===
                0 && (
                <tr>
                  <td
                    colSpan={
                      esTaxista
                        ? 5
                        : 7
                    }
                    className="px-5 py-10 text-center"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                      <CalendarDays
                        size={28}
                      />
                    </div>

                    <p className="mt-4 text-sm font-black text-slate-900">
                      No hay jornadas
                      con los filtros
                      seleccionados.
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {esTaxista
                        ? "Selecciona otro día desde el botón Fecha."
                        : "Selecciona otro conductor o cambia el rango de fechas."}
                    </p>
                  </td>
                </tr>
              )}

              {jornadasFiltradas.map(
                (jornada) => {
                  const liquidada =
                    jornadaEstaLiquidada(
                      jornada
                    );

                  return (
                    <tr
                      key={jornada.id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                          <CalendarDays
                            size={16}
                            className="text-slate-400"
                          />

                          {
                            jornada.fecha
                          }
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {jornada.sucursal_nombre ||
                            "Panel superadmin"}
                        </p>
                      </td>

                      {!esTaxista && (
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              <UserRound
                                size={20}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-base font-black text-slate-900">
                                {obtenerNombreConductor(
                                  jornada
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                      )}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE7A3] text-slate-900">
                            <CarTaxiFront
                              size={20}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-900">
                              {jornada.vehiculo_numero ||
                                "Sin número"}{" "}
                              -{" "}
                              {jornada.vehiculo_placa ||
                                "Sin placa"}
                            </p>

                            <p className="mt-1 truncate text-xs font-medium text-slate-500">
                              {jornada.vehiculo_descripcion ||
                                "Vehículo"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                          <Gauge
                            size={14}
                          />

                          {Number(
                            jornada.kilometros_recorridos ||
                              0
                          ).toLocaleString(
                            "es-NI"
                          )}{" "}
                          km
                        </span>

                        <p className="mt-2 text-xs font-medium text-slate-500">
                          {jornada.kilometraje_inicial ??
                            "Pendiente"}{" "}
                          →{" "}
                          {jornada.kilometraje_final ??
                            "Pendiente"}
                        </p>
                      </td>

                      {esTaxista ? (
                        <td className="px-5 py-4">
                          <p className="flex items-center gap-2 text-sm font-black text-blue-600">
                            <Wallet
                              size={16}
                            />

                            {formatoDinero(
                              jornada.pago_conductor
                            )}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {liquidada
                              ? "Ganancia del día"
                              : "Pendiente de liquidación"}
                          </p>
                        </td>
                      ) : (
                        <>
                          <td className="px-5 py-4">
                            <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                              <Wallet
                                size={16}
                                className="text-green-500"
                              />

                              {formatoDinero(
                                jornada.ingreso_bruto
                              )}
                            </p>

                            <p className="mt-1 text-xs font-medium text-slate-500">
                              Pago conductor:{" "}
                              {formatoDinero(
                                jornada.pago_conductor
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-black text-green-600">
                              {formatoDinero(
                                jornada.ganancia_real_dueno ??
                                  jornada.ganancia_dueno
                              )}
                            </p>

                            <p className="mt-1 text-xs font-medium text-slate-500">
                              Gastos:{" "}
                              {formatoDinero(
                                jornada.gastos_operativos ??
                                  jornada.total_gastos
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    !liquidada &&
                                    typeof onEdit ===
                                      "function"
                                  ) {
                                    onEdit(
                                      jornada
                                    );
                                  }
                                }}
                                disabled={
                                  liquidada
                                }
                                className={` cursor-pointer flex h-10 w-10 items-center justify-center rounded-xl transition active:scale-95 ${
                                  liquidada
                                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                }`}
                                title={
                                  liquidada
                                    ? `Incluida en liquidación #${
                                        jornada.liquidacion_id ||
                                        ""
                                      }`
                                    : "Editar jornada completa"
                                }
                              >
                                <Edit3
                                  size={18}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    !liquidada &&
                                    typeof onDelete ===
                                      "function"
                                  ) {
                                    onDelete(
                                      jornada
                                    );
                                  }
                                }}
                                disabled={
                                  liquidada
                                }
                                className={` cursor-pointer flex h-10 w-10 items-center justify-center rounded-xl transition active:scale-95 ${
                                  liquidada
                                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                    : "bg-red-50 text-red-600 hover:bg-red-100"
                                }`}
                                title={
                                  liquidada
                                    ? "No se puede eliminar una jornada liquidada"
                                    : "Eliminar jornada"
                                }
                              >
                                <Trash2
                                  size={18}
                                />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalCalendario && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={
              cerrarCalendario
            }
            className="absolute inset-0"
            aria-label="Cerrar calendario"
          />

          <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overflow-x-hidden rounded-[32px] border border-yellow-100 bg-white shadow-2xl">
            <div className="bg-gradient-to-br from-[#FFF7D6] via-[#FFE9A8] to-[#F8C84A] px-6 pb-5 pt-6 text-slate-900">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    cambiarMes(-1)
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-sm transition hover:bg-white"
                  aria-label="Mes anterior"
                >
                  <ChevronLeft
                    size={20}
                  />
                </button>

                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-[#8A6500]">
                    {
                      mesesTexto[
                        mesActual
                      ]
                    }
                  </p>

                  <p className="text-5xl font-black leading-none text-slate-950">
                    {anioActual}
                  </p>

                  <p className="mt-2 text-xs font-bold text-[#8A6500]">
                    {esTaxista
                      ? "Toca un día para filtrar tus jornadas."
                      : "Toca un día. Toca otro día para seleccionar un rango."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    cambiarMes(1)
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-sm transition hover:bg-white"
                  aria-label="Mes siguiente"
                >
                  <ChevronRight
                    size={20}
                  />
                </button>
              </div>
            </div>

            <div className="bg-white p-6">
              <div className="mb-4 grid grid-cols-7 gap-2">
                {diasTexto.map(
                  (dia) => (
                    <div
                      key={dia}
                      className={`text-center text-xs font-black ${
                        dia === "DOM"
                          ? "text-red-400"
                          : "text-slate-400"
                      }`}
                    >
                      {dia}
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {diasCalendario.map(
                  (
                    date,
                    index
                  ) => {
                    if (!date) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="h-11"
                        />
                      );
                    }

                    return (
                      <button
                        key={formatearFechaInput(
                          date
                        )}
                        type="button"
                        onClick={() =>
                          seleccionarDia(
                            date
                          )
                        }
                        className={`flex h-11 items-center justify-center rounded-full text-sm font-black transition ${obtenerClaseDia(
                          date
                        )}`}
                      >
                        {
                          date.getDate()
                        }
                      </button>
                    );
                  }
                )}
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Selección actual
                </p>

                <p className="mt-1 text-sm font-bold capitalize text-slate-800">
                  {resumenFiltro}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-blue-200 ring-2 ring-blue-300" />

                <p className="text-xs font-bold text-blue-700">
                  El día de hoy
                  aparece marcado
                  en azul suave.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JornadaTable;