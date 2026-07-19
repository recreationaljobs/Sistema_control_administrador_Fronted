import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
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

const diasTexto = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

const crearFechaLocal = (fecha) => {
  if (!fecha) return null;

  const fechaNormalizada = String(fecha).slice(0, 10);

  return new Date(`${fechaNormalizada}T00:00:00`);
};

const formatearFechaInput = (date) => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatearFechaTexto = (fecha) => {
  const date = crearFechaLocal(fecha);

  if (!date) return "Todas las fechas";

  return date.toLocaleDateString("es-NI", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const construirDiasMes = (year, month) => {
  const primerDia = new Date(year, month, 1);
  const inicioSemana = primerDia.getDay();
  const totalDias = new Date(year, month + 1, 0).getDate();

  const dias = [];

  for (let i = 0; i < inicioSemana; i += 1) {
    dias.push(null);
  }

  for (let dia = 1; dia <= totalDias; dia += 1) {
    dias.push(new Date(year, month, dia));
  }

  return dias;
};

const estaEnRango = (fecha, inicio, fin) => {
  if (!fecha || !inicio) return false;

  const fechaJornada = String(fecha).slice(0, 10);
  const fechaInicio = String(inicio).slice(0, 10);
  const fechaFinal = fin
    ? String(fin).slice(0, 10)
    : fechaInicio;

  return (
    fechaJornada >= fechaInicio &&
    fechaJornada <= fechaFinal
  );
};

const jornadaEstaLiquidada = (jornada) => {
  return Boolean(jornada?.liquidada);
};

const JornadaTable = ({ jornadas, loading, onEdit, onDelete, esTaxista }) => {
  const hoy = new Date();
  const fechaHoy = formatearFechaInput(hoy);

  const [modalCalendario, setModalCalendario] = useState(false);
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());

  const [fechaInicio, setFechaInicio] = useState(fechaHoy);
  const [fechaFin, setFechaFin] = useState("");
  const [primerClickRango, setPrimerClickRango] = useState(fechaHoy);

  const [searchParams, setSearchParams] = useSearchParams();

  const calendarioDesdeMenu =
    searchParams.get("calendario") === "1";

  useEffect(() => {
    if (!esTaxista) return;

    if (calendarioDesdeMenu) {
      const fechaSeleccionada =
        crearFechaLocal(fechaInicio) || new Date();

      setMesActual(fechaSeleccionada.getMonth());
      setAnioActual(fechaSeleccionada.getFullYear());
      setModalCalendario(true);
    } else {
      setModalCalendario(false);
    }
  }, [
    esTaxista,
    calendarioDesdeMenu,
    fechaInicio,
  ]);

  const diasCalendario = useMemo(() => {
    return construirDiasMes(anioActual, mesActual);
  }, [anioActual, mesActual]);

  const jornadasFiltradas = useMemo(() => {
    if (!fechaInicio) {
      return jornadas;
    }

    return jornadas.filter((jornada) =>
      estaEnRango(jornada.fecha, fechaInicio, fechaFin)
    );
  }, [jornadas, fechaInicio, fechaFin]);

  const resumenFiltro = useMemo(() => {
    if (!fechaInicio) {
      return "Todas las fechas";
    }

    if (!fechaFin || fechaInicio === fechaFin) {
      return formatearFechaTexto(fechaInicio);
    }

    return `${formatearFechaTexto(fechaInicio)} - ${formatearFechaTexto(
      fechaFin
    )}`;
  }, [fechaInicio, fechaFin]);


  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(anioActual, mesActual + direccion, 1);
    setMesActual(nuevaFecha.getMonth());
    setAnioActual(nuevaFecha.getFullYear());
  };

  const cerrarCalendario = () => {
    setModalCalendario(false);

    if (esTaxista && calendarioDesdeMenu) {
      const nuevosParametros =
        new URLSearchParams(searchParams);

      nuevosParametros.delete("calendario");

      setSearchParams(nuevosParametros, {
        replace: true,
      });
    }
  };

  const seleccionarDia = (date) => {
    const fecha = formatearFechaInput(date);

    if (esTaxista) {
      setFechaInicio(fecha);
      setFechaFin("");
      setPrimerClickRango(fecha);
      cerrarCalendario();
      return;
    }

    if (!primerClickRango || fechaFin) {
      setFechaInicio(fecha);
      setFechaFin("");
      setPrimerClickRango(fecha);
      return;
    }

    if (fecha === primerClickRango) {
      setFechaInicio(fecha);
      setFechaFin("");
      setPrimerClickRango(fecha);
      cerrarCalendario();
      return;
    }

    const inicio = crearFechaLocal(primerClickRango);
    const final = crearFechaLocal(fecha);

    if (final < inicio) {
      setFechaInicio(fecha);
      setFechaFin(primerClickRango);
    } else {
      setFechaInicio(primerClickRango);
      setFechaFin(fecha);
    }

    setPrimerClickRango("");
    cerrarCalendario();
  };

  const esDiaHoy = (date) => {
    return formatearFechaInput(date) === fechaHoy;
  };

  const esInicioRango = (date) => {
    return formatearFechaInput(date) === fechaInicio;
  };

  const esFinRango = (date) => {
    return fechaFin && formatearFechaInput(date) === fechaFin;
  };

  const esDiaSeleccionado = (date) => {
    if (!date || !fechaInicio) return false;

    const fecha = formatearFechaInput(date);
    const actual = crearFechaLocal(fecha);
    const inicio = crearFechaLocal(fechaInicio);
    const fin = fechaFin ? crearFechaLocal(fechaFin) : inicio;

    return actual >= inicio && actual <= fin;
  };

  const obtenerClaseDia = (date) => {
    const seleccionado = esDiaSeleccionado(date);
    const hoyMarcado = esDiaHoy(date);
    const inicio = esInicioRango(date);
    const fin = esFinRango(date);

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950">
                Jornadas por fecha
              </h3>

              <p className="mt-1 text-sm font-medium capitalize text-slate-500">
                {resumenFiltro}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPrimerClickRango(fechaFin ? "" : fechaInicio);
                setModalCalendario(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600]"
            >
              <CalendarDays size={20} />
              Elegir fecha
            </button>
          </div>
        </div>
      )}

      {/* VERSIÓN RESPONSIVE: Tarjetas en móvil, tabla en desktop */}
      <div className="block lg:hidden">
        <div className="space-y-4">
          {jornadasFiltradas.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <CalendarDays size={28} />
              </div>
              <p className="mt-4 text-sm font-black text-slate-900">
                No hay jornadas en esta fecha.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {esTaxista
                  ? "Selecciona otro día desde el botón Fecha."
                  : "Puedes seleccionar otro día desde el calendario."}
              </p>
            </div>
          )}

          {jornadasFiltradas.map((jornada) => {
            const liquidada = jornadaEstaLiquidada(jornada);

            return (
              <div
                key={jornada.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#F5B800]">
                      <CalendarDays size={24} />
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900">
                        {jornada.fecha}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {jornada.sucursal_nombre || "Panel superadmin"}
                      </p>
                    </div>
                  </div>

                  {!esTaxista && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!liquidada) {
                            onEdit(jornada);
                          }
                        }}
                        disabled={liquidada}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition active:scale-95 ${
                          liquidada
                            ? "cursor-not-allowed bg-slate-100 text-slate-400"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                        title={
                          liquidada
                            ? `Incluida en liquidación #${
                                jornada.liquidacion_id || ""
                              }`
                            : "Editar jornada completa"
                        }
                      >
                        <Edit3 size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!liquidada) {
                            onDelete(jornada);
                          }
                        }}
                        disabled={liquidada}
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
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Solo para NO taxistas: Información del conductor */}
                {!esTaxista && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <UserRound size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-900">
                        {jornada.conductor_nombre}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        ID: {jornada.conductor}
                      </p>
                    </div>
                  </div>
                )}

                {/* Información del vehículo */}
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFE7A3] text-slate-900">
                    <CarTaxiFront size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900">
                      {jornada.vehiculo_numero} - {jornada.vehiculo_placa}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {jornada.vehiculo_descripcion || "Vehículo"}
                    </p>
                  </div>
                </div>

                {/* Kilometraje */}
                <div className="mt-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 shadow-sm">
                      <Gauge size={14} />
                      {Number(jornada.kilometros_recorridos || 0).toLocaleString()} km
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {jornada.kilometraje_inicial} → {jornada.kilometraje_final ?? "Pendiente"}
                    </span>
                  </div>
                </div>

                {/* Información financiera simplificada para taxistas */}
                {esTaxista ? (
                  <div className="mt-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                      Ganancia del día
                    </p>
                    <p className="mt-1 text-2xl font-black text-blue-700">
                      {formatoDinero(jornada.pago_conductor)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-blue-600">
                      {liquidada ? "Liquidación completada" : "Pendiente de liquidación"}
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-green-50 p-3">
                      <p className="text-xs font-black uppercase tracking-wide text-green-600">
                        Ingresos
                      </p>
                      <p className="mt-1 text-lg font-black text-green-700">
                        {formatoDinero(jornada.ingreso_bruto)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
                        Ganancia dueño
                      </p>
                      <p className="mt-1 text-lg font-black text-emerald-700">
                       {formatoDinero(jornada.ganancia_real_dueno ?? jornada.ganancia_dueno)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-3">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Pago conductor
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {formatoDinero(jornada.pago_conductor)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-3">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Gastos
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {formatoDinero(jornada.total_gastos)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla original para desktop */}
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
              {jornadasFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan={esTaxista ? 5 : 7}
                    className="px-5 py-10 text-center"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                      <CalendarDays size={28} />
                    </div>

                    <p className="mt-4 text-sm font-black text-slate-900">
                      No hay jornadas en esta fecha.
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {esTaxista
                        ? "Selecciona otro día desde el botón Fecha."
                        : "Puedes seleccionar otro día desde el calendario."}
                    </p>
                  </td>
                </tr>
              )}

              {jornadasFiltradas.map((jornada) => {
                const liquidada = jornadaEstaLiquidada(jornada);

                return (
                  <tr
                    key={jornada.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                        <CalendarDays size={16} className="text-slate-400" />
                        {jornada.fecha}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {jornada.sucursal_nombre || "Panel superadmin"}
                      </p>
                    </td>

                    {!esTaxista && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <UserRound size={20} />
                          </div>

                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {jornada.conductor_nombre}
                            </p>

                            <p className="mt-1 text-xs font-medium text-slate-500">
                              ID: {jornada.conductor}
                            </p>
                          </div>
                        </div>
                      </td>
                    )}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE7A3] text-slate-900">
                          <CarTaxiFront size={20} />
                        </div>

                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {jornada.vehiculo_numero} -{" "}
                            {jornada.vehiculo_placa}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {jornada.vehiculo_descripcion || "Vehículo"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                        <Gauge size={14} />
                        {Number(
                          jornada.kilometros_recorridos || 0
                        ).toLocaleString()}{" "}
                        km
                      </span>

                      <p className="mt-2 text-xs font-medium text-slate-500">
                        {jornada.kilometraje_inicial} →{" "}
                        {jornada.kilometraje_final ?? "Pendiente"}
                      </p>
                    </td>

                    {esTaxista ? (
                      <td className="px-5 py-4">
                        <p className="flex items-center gap-2 text-sm font-black text-blue-600">
                          <Wallet size={16} />
                          {formatoDinero(jornada.pago_conductor)}
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
                            <Wallet size={16} className="text-green-500" />
                            {formatoDinero(jornada.ingreso_bruto)}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            Pago conductor:{" "}
                            {formatoDinero(jornada.pago_conductor)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-green-600">
                            {formatoDinero(jornada.ganancia_dueno)}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                           Gastos: {formatoDinero(jornada.gastos_operativos ?? jornada.total_gastos)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (!liquidada) {
                                  onEdit(jornada);
                                }
                              }}
                              disabled={liquidada}
                              className={`flex h-10 w-10 items-center justify-center rounded-xl transition active:scale-95 ${
                                liquidada
                                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                              }`}
                              title={
                                liquidada
                                  ? `Incluida en liquidación #${
                                      jornada.liquidacion_id || ""
                                    }`
                                  : "Editar jornada completa"
                              }
                            >
                              <Edit3 size={18} />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (!liquidada) {
                                  onDelete(jornada);
                                }
                              }}
                              disabled={liquidada}
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
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalCalendario && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={cerrarCalendario}
            className="absolute inset-0"
            aria-label="Cerrar calendario"
          />

          <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overflow-x-hidden rounded-[32px] border border-yellow-100 bg-white shadow-2xl">
            <div className="bg-gradient-to-br from-[#FFF7D6] via-[#FFE9A8] to-[#F8C84A] px-6 pb-5 pt-6 text-slate-900">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => cambiarMes(-1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-sm transition hover:bg-white"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-[#8A6500]">
                    {mesesTexto[mesActual]}
                  </p>

                  <p className="text-5xl font-black leading-none text-slate-950">
                    {anioActual}
                  </p>

                  <p className="mt-2 text-xs font-bold text-[#8A6500]">
                    {esTaxista
                      ? "Toca un día para filtrar tus jornadas."
                      : "Toca un día. Toca otro día para rango."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => cambiarMes(1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-sm transition hover:bg-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="bg-white p-6">
              <div className="mb-4 grid grid-cols-7 gap-2">
                {diasTexto.map((dia) => (
                  <div
                    key={dia}
                    className={`text-center text-xs font-black ${
                      dia === "DOM" ? "text-red-400" : "text-slate-400"
                    }`}
                  >
                    {dia}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {diasCalendario.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="h-11" />;
                  }

                  return (
                    <button
                      key={formatearFechaInput(date)}
                      type="button"
                      onClick={() => seleccionarDia(date)}
                      className={`flex h-11 items-center justify-center rounded-full text-sm font-black transition ${obtenerClaseDia(
                        date
                      )}`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
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
                  El día de hoy siempre aparece marcado en azul suave.
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