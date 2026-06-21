import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Wallet,
  Wrench,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import MantenimientoModal from "../components/MantenimientoModal";
import MantenimientoTable from "../components/MantenimientoTable";
import { useMantenimiento } from "../hooks/useMantenimiento";

const DIAS_SEMANA = [
  "DOM",
  "LUN",
  "MAR",
  "MIÉ",
  "JUE",
  "VIE",
  "SÁB",
];

const DIAS_SEMANA_LARGOS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const MESES = [
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

const MESES_LARGOS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const convertirFechaAISO = (fecha) => {
  if (!fecha) return "";

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const convertirISOAFecha = (valor) => {
  if (!valor) return null;

  const partes = String(valor).slice(0, 10).split("-").map(Number);

  if (partes.length !== 3) {
    return null;
  }

  const [year, month, day] = partes;

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day, 12, 0, 0);
};

const formatearFechaLarga = (valor) => {
  const fecha = convertirISOAFecha(valor);

  if (!fecha) return "";

  const diaSemana = DIAS_SEMANA_LARGOS[fecha.getDay()];
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = MESES_LARGOS[fecha.getMonth()];
  const year = fecha.getFullYear();

  return `${diaSemana}, ${dia} De ${mes} De ${year}`;
};

const formatearFechaCorta = (valor) => {
  const fecha = convertirISOAFecha(valor);

  if (!fecha) return "";

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = MESES_LARGOS[fecha.getMonth()];
  const year = fecha.getFullYear();

  return `${dia} De ${mes} De ${year}`;
};

const generarCeldasMes = (mesVisible) => {
  const year = mesVisible.getFullYear();
  const month = mesVisible.getMonth();

  const primerDiaSemana = new Date(
    year,
    month,
    1,
    12,
    0,
    0
  ).getDay();

  const cantidadDias = new Date(
    year,
    month + 1,
    0,
    12,
    0,
    0
  ).getDate();

  const celdas = [];

  for (let index = 0; index < primerDiaSemana; index += 1) {
    celdas.push(null);
  }

  for (let dia = 1; dia <= cantidadDias; dia += 1) {
    celdas.push(new Date(year, month, dia, 12, 0, 0));
  }

  while (celdas.length % 7 !== 0) {
    celdas.push(null);
  }

  return celdas;
};

const CalendarioMantenimiento = ({
  rango,
  onChange,
  disabled = false,
}) => {
  const [abierto, setAbierto] = useState(false);

  const [mesVisible, setMesVisible] = useState(() => {
    const hoy = new Date();

    return new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      1,
      12,
      0,
      0
    );
  });

  const celdasMes = useMemo(() => {
    return generarCeldasMes(mesVisible);
  }, [mesVisible]);

  const hoyISO = convertirFechaAISO(new Date());

  const nombreMes = MESES[mesVisible.getMonth()];
  const yearVisible = mesVisible.getFullYear();

  const textoSeleccionActual = useMemo(() => {
    if (!rango.inicio) {
      return "Todas las fechas";
    }

    if (!rango.fin) {
      return formatearFechaLarga(rango.inicio);
    }

    return `${formatearFechaLarga(
      rango.inicio
    )} - ${formatearFechaLarga(rango.fin)}`;
  }, [rango]);

  useEffect(() => {
    if (!abierto) return undefined;

    const cerrarConEscape = (event) => {
      if (event.key === "Escape") {
        setAbierto(false);
      }
    };

    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto || !rango.inicio) return;

    const fechaSeleccionada = convertirISOAFecha(rango.inicio);

    if (!fechaSeleccionada) return;

    setMesVisible(
      new Date(
        fechaSeleccionada.getFullYear(),
        fechaSeleccionada.getMonth(),
        1,
        12,
        0,
        0
      )
    );
  }, [abierto, rango.inicio]);

  const mostrarMesAnterior = () => {
    setMesVisible((mesActual) => {
      return new Date(
        mesActual.getFullYear(),
        mesActual.getMonth() - 1,
        1,
        12,
        0,
        0
      );
    });
  };

  const mostrarMesSiguiente = () => {
    setMesVisible((mesActual) => {
      return new Date(
        mesActual.getFullYear(),
        mesActual.getMonth() + 1,
        1,
        12,
        0,
        0
      );
    });
  };

  const seleccionarFecha = (fecha) => {
    const fechaSeleccionada = convertirFechaAISO(fecha);

    /*
     * Primera selección:
     * solamente se guarda el día inicial.
     *
     * Si ya existía un rango completo,
     * el siguiente clic comienza otro rango.
     */
    if (!rango.inicio || rango.fin) {
      onChange({
        inicio: fechaSeleccionada,
        fin: "",
      });

      return;
    }

    /*
     * Si se presiona nuevamente la misma fecha,
     * se elimina el filtro y vuelven a mostrarse
     * todos los mantenimientos.
     */
    if (fechaSeleccionada === rango.inicio) {
      onChange({
        inicio: "",
        fin: "",
      });

      return;
    }

    /*
     * Si el segundo día es anterior al primero,
     * se ordena automáticamente el rango.
     */
    if (fechaSeleccionada < rango.inicio) {
      onChange({
        inicio: fechaSeleccionada,
        fin: rango.inicio,
      });

      return;
    }

    /*
     * El segundo día completa el rango.
     */
    onChange({
      inicio: rango.inicio,
      fin: fechaSeleccionada,
    });
  };

  const modalCalendario = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-3 py-5">
      <button
        type="button"
        onClick={() => setAbierto(false)}
        className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-[3px]"
        aria-label="Cerrar calendario"
      />

      <div className="relative max-h-[95vh] w-full max-w-[404px] overflow-y-auto rounded-[30px] border border-white/80 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.40)]">
        <div className="relative overflow-hidden bg-gradient-to-b from-[#FFEAB0] via-[#FFE08A] to-[#FFD66A] px-6 pb-5 pt-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={mostrarMesAnterior}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-700 shadow-sm transition hover:scale-105 hover:bg-white"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="text-center">
              <p className="text-[11px] font-black tracking-[0.28em] text-amber-900">
                {nombreMes}
              </p>

              <h3 className="mt-1 text-[42px] font-black leading-none tracking-tight text-slate-950">
                {yearVisible}
              </h3>
            </div>

            <button
              type="button"
              onClick={mostrarMesSiguiente}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-700 shadow-sm transition hover:scale-105 hover:bg-white"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <p className="mt-2 text-center text-[11px] font-bold text-amber-900">
            Toca un día. Toca otro día para rango.
          </p>
        </div>

        <div className="bg-white px-5 pb-5 pt-4">
          <div className="grid grid-cols-7">
            {DIAS_SEMANA.map((dia, index) => (
              <div
                key={dia}
                className={`flex h-9 items-center justify-center text-[11px] font-black ${
                  index === 0 ? "text-red-500" : "text-slate-400"
                }`}
              >
                {dia}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {celdasMes.map((fecha, index) => {
              if (!fecha) {
                return (
                  <div
                    key={`vacio-${index}`}
                    className="h-[47px]"
                  />
                );
              }

              const fechaISO = convertirFechaAISO(fecha);

              const esHoy = fechaISO === hoyISO;
              const esInicio = fechaISO === rango.inicio;

              const esFin =
                Boolean(rango.fin) && fechaISO === rango.fin;

              const esExtremo = esInicio || esFin;

              const fechaFinal = rango.fin || rango.inicio;

              const estaEnRango =
                Boolean(rango.inicio && fechaFinal) &&
                fechaISO >= rango.inicio &&
                fechaISO <= fechaFinal;

              const esIntermedio = estaEnRango && !esExtremo;

              return (
                <button
                  key={fechaISO}
                  type="button"
                  onClick={() => seleccionarFecha(fecha)}
                  className="relative flex h-[47px] items-center justify-center"
                  title={formatearFechaLarga(fechaISO)}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition-all duration-200 ${
                      esExtremo
                        ? "scale-105 bg-[#FFB800] text-white shadow-md shadow-yellow-200"
                        : esIntermedio
                          ? "bg-[#FFF3B8] text-amber-800"
                          : esHoy
                            ? "bg-slate-100 text-slate-700 ring-1 ring-blue-100"
                            : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {fecha.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3.5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
              Selección actual
            </p>

            <p className="mt-1 text-[12px] font-black leading-5 text-slate-800">
              {textoSeleccionActual}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3">
            <span className="h-4 w-4 shrink-0 rounded-full bg-blue-100 ring-2 ring-blue-300" />

            <p className="text-[11px] font-bold text-blue-700">
              El día de hoy siempre aparece marcado en azul suave.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        disabled={disabled}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 text-sm font-black text-white shadow-lg shadow-yellow-200 transition hover:-translate-y-0.5 hover:bg-[#DFA600] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <CalendarDays size={18} />
        Elegir fecha
      </button>

      {abierto &&
        typeof document !== "undefined" &&
        createPortal(modalCalendario, document.body)}
    </>
  );
};

const MantenimientoPage = () => {
  const {
    mantenimientosFiltrados = [],
    vehiculosDisponibles = [],
    tiposMantenimiento = [],
    estadosMantenimiento = [],

    loading = false,
    loadingCatalogos = false,
    saving = false,
    error = "",

    search = "",
    setSearch,

    modalOpen = false,
    mantenimientoEditando,

    totalMantenimientos = 0,
    costoTotal = 0,
    mantenimientosHoy = [],
    costoHoy = 0,
    pendientes = 0,

    esSuperAdmin = false,
    esAdminSucursal = false,

    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarMantenimiento,
    eliminarMantenimiento,
  } = useMantenimiento();

  const [rangoFecha, setRangoFecha] = useState({
    inicio: "",
    fin: "",
  });

  /*
   * Aplica el filtro de fecha sobre la lista que ya
   * fue filtrada por el buscador del hook.
   */
  const mantenimientosMostrados = useMemo(() => {
    if (!rangoFecha.inicio) {
      return mantenimientosFiltrados;
    }

    const fechaFinal = rangoFecha.fin || rangoFecha.inicio;

    return mantenimientosFiltrados.filter((item) => {
      const fechaMantenimiento = String(item.fecha || "").slice(0, 10);

      return (
        fechaMantenimiento >= rangoFecha.inicio &&
        fechaMantenimiento <= fechaFinal
      );
    });
  }, [mantenimientosFiltrados, rangoFecha]);

  const textoResumenFecha = useMemo(() => {
    if (!rangoFecha.inicio) {
      return "Todas las fechas";
    }

    if (!rangoFecha.fin) {
      return formatearFechaLarga(rangoFecha.inicio);
    }

    return `${formatearFechaCorta(
      rangoFecha.inicio
    )} - ${formatearFechaCorta(rangoFecha.fin)}`;
  }, [rangoFecha]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
            Mantenimiento
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
            Registra y consulta los mantenimientos realizados a los vehículos.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModalCrear}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600]"
        >
          <Plus size={20} />
          Nuevo mantenimiento
        </button>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4CF] text-[#E7A900]">
              <Wrench size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Total mantenimientos
              </p>

              <h3 className="mt-1 text-3xl font-black text-slate-950">
                {totalMantenimientos}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Wallet size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Costo total
              </p>

              <h3 className="mt-1 text-xl font-black text-red-600">
                {formatoDinero(costoTotal)}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <CalendarDays size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Costo de hoy
              </p>

              <h3 className="mt-1 text-xl font-black text-blue-600">
                {formatoDinero(costoHoy)}
              </h3>

              <p className="mt-1 text-xs font-bold text-slate-500">
                {mantenimientosHoy.length} registro(s)
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertTriangle size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Pendientes
              </p>

              <h3 className="mt-1 text-3xl font-black text-amber-700">
                {pendientes}
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-dashed border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Listado de mantenimientos
            </h2>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              {textoResumenFecha}
            </p>

            <p className="mt-1 text-xs font-bold text-slate-400">
              {mantenimientosMostrados.length} registro(s) encontrado(s)
            </p>
          </div>

          <CalendarioMantenimiento
            rango={rangoFecha}
            onChange={setRangoFecha}
            disabled={loading}
          />
        </div>

        <div className="mt-5">
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por vehículo, placa, tipo o estado..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
            />
          </div>
        </div>

        <div className="mt-5">
          <MantenimientoTable
            mantenimientos={mantenimientosMostrados}
            loading={loading}
            onEdit={abrirModalEditar}
            onDelete={eliminarMantenimiento}
          />
        </div>
      </section>

      <MantenimientoModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarMantenimiento}
        saving={saving}
        loadingCatalogos={loadingCatalogos}
        mantenimientoEditando={mantenimientoEditando}
        vehiculos={vehiculosDisponibles}
        tiposMantenimiento={tiposMantenimiento}
        estadosMantenimiento={estadosMantenimiento}
        esSuperAdmin={esSuperAdmin}
        esAdminSucursal={esAdminSucursal}
      />
    </div>
  );
};

export default MantenimientoPage;