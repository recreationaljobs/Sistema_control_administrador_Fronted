import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  ReceiptText,
  Wallet,
} from "lucide-react";
import GastoModal from "../components/GastoModal";
import GastoTable from "../components/GastoTable";
import { useGastos } from "../hooks/useGastos";

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
  return new Date(`${fecha}T00:00:00`);
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

const GastosPage = () => {
  const {
    gastosFiltrados,
    jornadasDisponibles,
    vehiculosDisponibles,
    tiposGasto,
    estadosGasto,
    loading,
    loadingCatalogos,
    saving,
    error,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    modalOpen,
    gastoEditando,
    totalGastos,
    montoTotal,
    gastosConJornada,
    gastosSinJornada,
    gastosHoy,
    montoHoy,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarGasto,
    eliminarGasto,
    aplicarFiltros,
  } = useGastos();

  const hoy = new Date();
  const fechaHoy = formatearFechaInput(hoy);

  const [modalCalendario, setModalCalendario] = useState(false);
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());
  const [primerClickRango, setPrimerClickRango] = useState("");

  const diasCalendario = useMemo(() => {
    return construirDiasMes(anioActual, mesActual);
  }, [anioActual, mesActual]);

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

  useEffect(() => {
    aplicarFiltros();
  }, [fechaInicio, fechaFin]);

  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(anioActual, mesActual + direccion, 1);
    setMesActual(nuevaFecha.getMonth());
    setAnioActual(nuevaFecha.getFullYear());
  };

  const seleccionarDia = (date) => {
    const fecha = formatearFechaInput(date);

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
      setModalCalendario(false);
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
    setModalCalendario(false);
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

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
              <ReceiptText size={29} />
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
                {esTaxista ? "Mis gastos" : "Gastos"}
              </h1>

              <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500 md:text-base">
                {esTaxista
                  ? "Registra y consulta los gastos asociados a tus jornadas o vehículo asignado."
                  : "Registra y controla los gastos operativos asociados a jornadas o vehículos."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirModalCrear}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600]"
          >
            <Plus size={20} />
            {esTaxista ? "Registrar gasto" : "Nuevo gasto"}
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section
        className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${
          esTaxista ? "xl:grid-cols-3" : "xl:grid-cols-4"
        }`}
      >
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
              <ReceiptText size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                {esTaxista ? "Mis gastos" : "Total gastos"}
              </p>

              <h3 className="mt-1 text-3xl font-black text-slate-950">
                {totalGastos}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Wallet size={28} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                {esTaxista ? "Monto gastado" : "Monto total"}
              </p>

              <h3 className="mt-1 text-xl font-black text-red-600">
                {formatoDinero(montoTotal)}
              </h3>
            </div>
          </div>
        </div>

        {esTaxista ? (
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CalendarDays size={28} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-500">
                  Gastos de hoy
                </p>

                <h3 className="mt-1 text-xl font-black text-blue-600">
                  {formatoDinero(montoHoy)}
                </h3>

                <p className="mt-1 text-xs font-bold text-slate-500">
                  {gastosHoy.length} registro(s)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <CalendarDays size={28} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Con jornada
                  </p>

                  <h3 className="mt-1 text-3xl font-black text-blue-600">
                    {gastosConJornada}
                  </h3>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <ReceiptText size={28} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Sin jornada
                  </p>

                  <h3 className="mt-1 text-3xl font-black text-slate-950">
                    {gastosSinJornada}
                  </h3>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              {esTaxista ? "Listado de mis gastos" : "Listado de gastos"}
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {resumenFiltro}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setPrimerClickRango("");
              setModalCalendario(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600]"
          >
            <CalendarDays size={20} />
            Elegir fecha
          </button>
        </div>

        <div className="mt-5">
          <GastoTable
            gastos={gastosFiltrados}
            loading={loading}
            onEdit={abrirModalEditar}
            onDelete={eliminarGasto}
            esTaxista={esTaxista}
          />
        </div>
      </section>

      <GastoModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarGasto}
        saving={saving}
        loadingCatalogos={loadingCatalogos}
        gastoEditando={gastoEditando}
        jornadas={jornadasDisponibles}
        vehiculos={vehiculosDisponibles}
        tiposGasto={tiposGasto}
        estadosGasto={estadosGasto}
        esSuperAdmin={esSuperAdmin}
        esAdminSucursal={esAdminSucursal}
        esTaxista={esTaxista}
      />

      {modalCalendario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setModalCalendario(false)}
            className="absolute inset-0"
            aria-label="Cerrar calendario"
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-yellow-100 bg-white shadow-2xl">
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
                    Toca un día. Toca otro día para rango.
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

export default GastosPage;