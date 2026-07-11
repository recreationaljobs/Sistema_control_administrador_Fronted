import { useMemo, useState } from "react";
import {
  CalendarDays,
  CarTaxiFront,
  Gauge,
  RefreshCcw,
  Wallet,
} from "lucide-react";
import { useJornadas } from "../hooks/useJornadas";

const obtenerFechaLocal = () => {
  const fecha = new Date();

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizarFecha = (fecha) => {
  if (!fecha) return "";

  return String(fecha).slice(0, 10);
};

const crearFechaLocal = (fecha) => {
  const fechaNormalizada = normalizarFecha(fecha);

  if (!fechaNormalizada) return null;

  return new Date(`${fechaNormalizada}T00:00:00`);
};

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatoNumero = (valor) => {
  return Number(valor || 0).toLocaleString("es-NI");
};

const formatoFechaTexto = (fecha) => {
  const date = crearFechaLocal(fecha);

  if (!date) return "Todas las fechas";

  return date.toLocaleDateString("es-NI", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const obtenerSaldoPendiente = (jornada) => {
  return Number(jornada?.pago_pendiente_conductor || 0);
};

const obtenerGananciaHistorica = (jornada) => {
  return Number(jornada?.pago_conductor || 0);
};

const obtenerVehiculoTexto = (jornada) => {
  const numero =
    jornada?.vehiculo_numero ||
    jornada?.vehiculo?.numero ||
    "";

  const placa =
    jornada?.vehiculo_placa ||
    jornada?.vehiculo?.placa ||
    "";

  if (numero && placa) {
    return `${numero} - ${placa}`;
  }

  return numero || placa || "Vehículo no disponible";
};

const GananciasTaxistaPage = () => {
  const {
    jornadas,
    loading,
    error,
    cargarJornadas,
  } = useJornadas();

  const [fechaSeleccionada, setFechaSeleccionada] =
    useState(obtenerFechaLocal());

  const jornadasPendientes = useMemo(() => {
    return jornadas.filter((jornada) => {
      return obtenerSaldoPendiente(jornada) > 0;
    });
  }, [jornadas]);

  const jornadasFiltradas = useMemo(() => {
    if (!fechaSeleccionada) {
      return jornadasPendientes;
    }

    return jornadasPendientes.filter((jornada) => {
      return (
        normalizarFecha(jornada.fecha) ===
        normalizarFecha(fechaSeleccionada)
      );
    });
  }, [jornadasPendientes, fechaSeleccionada]);

  const saldoPendienteGeneral = useMemo(() => {
    return jornadasPendientes.reduce((total, jornada) => {
      return total + obtenerSaldoPendiente(jornada);
    }, 0);
  }, [jornadasPendientes]);

  const saldoPendienteFiltrado = useMemo(() => {
    return jornadasFiltradas.reduce((total, jornada) => {
      return total + obtenerSaldoPendiente(jornada);
    }, 0);
  }, [jornadasFiltradas]);

  const kilometrosFiltrados = useMemo(() => {
    return jornadasFiltradas.reduce((total, jornada) => {
      return total + Number(jornada.kilometros_recorridos || 0);
    }, 0);
  }, [jornadasFiltradas]);

  const promedioPorJornada = useMemo(() => {
    if (!jornadasFiltradas.length) return 0;

    return saldoPendienteFiltrado / jornadasFiltradas.length;
  }, [jornadasFiltradas, saldoPendienteFiltrado]);

  const limpiarFecha = () => {
    setFechaSeleccionada("");
  };

  const seleccionarHoy = () => {
    setFechaSeleccionada(obtenerFechaLocal());
  };

  return (
    <div className="mx-auto max-w-md space-y-2 pb-28">
      <section>
        <h1 className="mt-1 text-2xl font-black text-slate-950">
          Mis ganancias
        </h1>
      </section>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
          {error}
        </div>
      ) : null}

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
            <Wallet size={25} strokeWidth={2.3} />
          </div>

          <div>
           

            <h2 className="text-2xl font-black text-slate-950">
              {formatoDinero(saldoPendienteGeneral)}
            </h2>
          </div>
        </div>

        
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Fecha consultada
            </p>

            <h2 className="mt-1 text-base font-black capitalize text-slate-950">
              {formatoFechaTexto(fechaSeleccionada)}
            </h2>
          </div>

          <button
            type="button"
            onClick={cargarJornadas}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            title="Actualizar"
          >
            <RefreshCcw size={19} strokeWidth={2.3} />
          </button>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">
            Elegir fecha
          </label>

          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(event) =>
              setFechaSeleccionada(event.target.value)
            }
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#E7A900] focus:ring-4 focus:ring-[#FFF4CF]"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={seleccionarHoy}
            className="h-11 rounded-2xl bg-[#E7A900] px-4 text-sm font-black text-white transition hover:bg-[#d49a00]"
          >
            Hoy
          </button>

          <button
            type="button"
            onClick={limpiarFecha}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50"
          >
            Ver todo
          </button>
        </div>
      </section>

      {/* <section className="grid grid-cols-2 gap-3">
        <article className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
            <Wallet size={20} strokeWidth={2.3} />
          </div>

          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Pendiente
          </p>

          <h3 className="mt-1 text-xl font-black text-slate-950">
            {formatoDinero(saldoPendienteFiltrado)}
          </h3>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <CalendarDays size={20} strokeWidth={2.3} />
          </div>

          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Jornadas
          </p>

          <h3 className="mt-1 text-xl font-black text-slate-950">
            {formatoNumero(jornadasFiltradas.length)}
          </h3>
        </article>

        
        
      </section> */}

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">
          Jornadas pendientes
        </h2>

        <p className="mt-1 text-sm font-medium text-slate-500">
          Aquí solo aparecen las jornadas que todavía no han sido liquidadas.
        </p>

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
              Cargando ganancias...
            </div>
          ) : null}

          {!loading && jornadasFiltradas.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <Wallet size={26} strokeWidth={2.3} />
              </div>

              <h3 className="mt-4 text-sm font-black text-slate-950">
                No hay saldo pendiente.
              </h3>

              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                No tienes jornadas pendientes de cobrar en esta fecha.
              </p>
            </div>
          ) : null}

          {!loading &&
            jornadasFiltradas.map((jornada) => (
              <article
                key={jornada.id}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      {formatoFechaTexto(jornada.fecha)}
                    </p>

                    <h3 className="mt-1 text-base font-black text-slate-950">
                      {formatoDinero(
                        obtenerSaldoPendiente(jornada)
                      )}
                    </h3>

                    <p className="mt-1 text-xs font-bold text-slate-400">
                      Pendiente de cobrar
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
                    <Wallet size={22} strokeWidth={2.3} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold text-slate-500">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-slate-400">
                      <CarTaxiFront size={15} />
                      <span>Vehículo</span>
                    </div>

                    <p className="text-slate-700">
                      {obtenerVehiculoTexto(jornada)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-slate-400">
                      <Gauge size={15} />
                      <span>Kilómetros</span>
                    </div>

                    <p className="text-slate-700">
                      {formatoNumero(
                        jornada.kilometros_recorridos
                      )}{" "}
                      km
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-500">
                  <div className="flex justify-between gap-3">
                    <span>Ingreso bruto</span>
                    <span className="text-slate-800">
                      {formatoDinero(jornada.ingreso_bruto)}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between gap-3">
                    <span>Pago calculado</span>
                    <span className="text-slate-800">
                      {formatoDinero(
                        obtenerGananciaHistorica(jornada)
                      )}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between gap-3">
                    <span>Saldo pendiente</span>
                    <span className="text-slate-800">
                      {formatoDinero(
                        obtenerSaldoPendiente(jornada)
                      )}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between gap-3">
                    <span>Porcentaje</span>
                    <span className="text-slate-800">
                      {Number(
                        jornada.porcentaje_pago_conductor || 0
                      ).toLocaleString("es-NI")}
                      %
                    </span>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
};

export default GananciasTaxistaPage;