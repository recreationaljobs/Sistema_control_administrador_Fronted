import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CarTaxiFront,
  ChevronDown,
  Gauge,
  RefreshCcw,
  Wallet,
} from "lucide-react";

import { useJornadas } from "../hooks/useJornadas";

const obtenerFechaLocal = () => {
  const fecha = new Date();

  const year =
    fecha.getFullYear();

  const month = String(
    fecha.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    fecha.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizarFecha = (
  fecha
) => {
  if (!fecha) {
    return "";
  }

  return String(fecha).slice(
    0,
    10
  );
};

const crearFechaLocal = (
  fecha
) => {
  const fechaNormalizada =
    normalizarFecha(fecha);

  if (!fechaNormalizada) {
    return null;
  }

  return new Date(
    `${fechaNormalizada}T00:00:00`
  );
};

const formatoDinero = (
  valor
) => {
  return `C$ ${Number(
    valor || 0
  ).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatoNumero = (
  valor
) => {
  return Number(
    valor || 0
  ).toLocaleString("es-NI");
};

const formatoFechaTexto = (
  fecha
) => {
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

const obtenerSaldoPendiente = (
  jornada
) => {
  return Number(
    jornada
      ?.pago_pendiente_conductor ||
      0
  );
};

const obtenerGananciaHistorica = (
  jornada
) => {
  return Number(
    jornada?.pago_conductor ||
      0
  );
};

const obtenerVehiculoTexto = (
  jornada
) => {
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

  return (
    numero ||
    placa ||
    "No disponible"
  );
};

const useNumeroAnimado = (
  valorFinal,
  duracion = 800
) => {
  const [
    valorAnimado,
    setValorAnimado,
  ] = useState(0);

  useEffect(() => {
    const final =
      Number(valorFinal || 0);

    const inicio =
      performance.now();

    let animationFrameId;

    const animar = (
      tiempoActual
    ) => {
      const progreso = Math.min(
        (tiempoActual - inicio) /
          duracion,
        1
      );

      const progresoSuave =
        1 -
        Math.pow(
          1 - progreso,
          3
        );

      setValorAnimado(
        final * progresoSuave
      );

      if (progreso < 1) {
        animationFrameId =
          requestAnimationFrame(
            animar
          );
      }
    };

    animationFrameId =
      requestAnimationFrame(
        animar
      );

    return () => {
      cancelAnimationFrame(
        animationFrameId
      );
    };
  }, [
    valorFinal,
    duracion,
  ]);

  return valorAnimado;
};

const GananciasTaxistaPage =
  () => {
    const {
      jornadas,
      loading,
      error,
      cargarJornadas,
    } = useJornadas();

    const [
      fechaSeleccionada,
      setFechaSeleccionada,
    ] = useState(
      obtenerFechaLocal()
    );

    const [
      actualizando,
      setActualizando,
    ] = useState(false);

    const jornadasPendientes =
      useMemo(() => {
        return jornadas.filter(
          (jornada) =>
            obtenerSaldoPendiente(
              jornada
            ) > 0
        );
      }, [jornadas]);

    const jornadasFiltradas =
      useMemo(() => {
        if (!fechaSeleccionada) {
          return jornadasPendientes;
        }

        return jornadasPendientes.filter(
          (jornada) =>
            normalizarFecha(
              jornada.fecha
            ) ===
            normalizarFecha(
              fechaSeleccionada
            )
        );
      }, [
        jornadasPendientes,
        fechaSeleccionada,
      ]);

    const saldoPendienteGeneral =
      useMemo(() => {
        return jornadasPendientes.reduce(
          (
            total,
            jornada
          ) =>
            total +
            obtenerSaldoPendiente(
              jornada
            ),
          0
        );
      }, [
        jornadasPendientes,
      ]);

    const saldoPendienteFiltrado =
      useMemo(() => {
        return jornadasFiltradas.reduce(
          (
            total,
            jornada
          ) =>
            total +
            obtenerSaldoPendiente(
              jornada
            ),
          0
        );
      }, [
        jornadasFiltradas,
      ]);

    const kilometrosFiltrados =
      useMemo(() => {
        return jornadasFiltradas.reduce(
          (
            total,
            jornada
          ) =>
            total +
            Number(
              jornada
                .kilometros_recorridos ||
                0
            ),
          0
        );
      }, [
        jornadasFiltradas,
      ]);

    const saldoGeneralAnimado =
      useNumeroAnimado(
        saldoPendienteGeneral,
        1000
      );

    const saldoFiltradoAnimado =
      useNumeroAnimado(
        saldoPendienteFiltrado,
        700
      );

    const kilometrosAnimados =
      useNumeroAnimado(
        kilometrosFiltrados,
        700
      );

    const seleccionarHoy =
      () => {
        setFechaSeleccionada(
          obtenerFechaLocal()
        );
      };

    const limpiarFecha = () => {
      setFechaSeleccionada("");
    };

    const actualizarDatos =
      async () => {
        try {
          setActualizando(true);

          await cargarJornadas();
        } finally {
          setActualizando(false);
        }
      };

    return (
      <>
        <style>
          {`
            @keyframes entradaPagina {
              from {
                opacity: 0;
                transform:
                  translateY(22px)
                  scale(0.97);
              }

              to {
                opacity: 1;
                transform:
                  translateY(0)
                  scale(1);
              }
            }

            @keyframes entradaTarjeta {
              from {
                opacity: 0;
                transform:
                  translateX(-18px)
                  scale(0.96);
              }

              to {
                opacity: 1;
                transform:
                  translateX(0)
                  scale(1);
              }
            }

            @keyframes flotarBilletera {
              0%,
              100% {
                transform:
                  translateY(0)
                  rotate(-3deg);
              }

              50% {
                transform:
                  translateY(-8px)
                  rotate(4deg);
              }
            }

            @keyframes pulsoAnillo {
              0% {
                opacity: 0.65;
                transform: scale(0.8);
              }

              70% {
                opacity: 0;
                transform: scale(1.45);
              }

              100% {
                opacity: 0;
                transform: scale(1.45);
              }
            }

            @keyframes brilloTarjeta {
              0% {
                transform:
                  translateX(-180%)
                  rotate(12deg);
              }

              55%,
              100% {
                transform:
                  translateX(300%)
                  rotate(12deg);
              }
            }

            @keyframes particulaUno {
              0%,
              100% {
                transform:
                  translate(0, 0)
                  scale(1);
              }

              50% {
                transform:
                  translate(12px, -15px)
                  scale(1.2);
              }
            }

            @keyframes particulaDos {
              0%,
              100% {
                transform:
                  translate(0, 0)
                  scale(1);
              }

              50% {
                transform:
                  translate(-9px, 14px)
                  scale(0.8);
              }
            }

            @keyframes particulaTres {
              0%,
              100% {
                transform:
                  translateY(0);
              }

              50% {
                transform:
                  translateY(-12px);
              }
            }

            @keyframes aparecerNumero {
              0% {
                opacity: 0;
                transform:
                  translateY(10px)
                  scale(0.92);
              }

              100% {
                opacity: 1;
                transform:
                  translateY(0)
                  scale(1);
              }
            }

            @keyframes latidoSuave {
              0%,
              100% {
                transform: scale(1);
              }

              50% {
                transform: scale(1.035);
              }
            }

            @keyframes moverFondo {
              0% {
                background-position:
                  0% 50%;
              }

              50% {
                background-position:
                  100% 50%;
              }

              100% {
                background-position:
                  0% 50%;
              }
            }

            .animacion-pagina {
              animation:
                entradaPagina
                0.5s ease-out both;
            }

            .animacion-tarjeta {
              animation:
                entradaTarjeta
                0.45s ease-out both;
            }

            .animacion-numero {
              animation:
                aparecerNumero
                0.55s ease-out both;
            }

            .tarjeta-principal {
              position: relative;
              overflow: hidden;
              background-size:
                220% 220%;
              animation:
                moverFondo
                8s ease infinite;
            }

            .tarjeta-principal::after {
              content: "";
              position: absolute;
              top: -60%;
              bottom: -60%;
              width: 75px;
              background:
                linear-gradient(
                  90deg,
                  transparent,
                  rgba(
                    255,
                    255,
                    255,
                    0.65
                  ),
                  transparent
                );
              animation:
                brilloTarjeta
                4.2s ease-in-out
                infinite;
              pointer-events: none;
            }

            .billetera-flotante {
              animation:
                flotarBilletera
                2.6s ease-in-out
                infinite;
            }

            .anillo-pulso {
              position: absolute;
              inset: -6px;
              border-radius: 24px;
              border:
                2px solid
                rgba(
                  231,
                  169,
                  0,
                  0.45
                );
              animation:
                pulsoAnillo
                2s ease-out
                infinite;
            }

            .anillo-pulso-dos {
              animation-delay:
                1s;
            }

            .particula-uno {
              animation:
                particulaUno
                3.6s ease-in-out
                infinite;
            }

            .particula-dos {
              animation:
                particulaDos
                4.1s ease-in-out
                infinite;
            }

            .particula-tres {
              animation:
                particulaTres
                3s ease-in-out
                infinite;
            }

            .resumen-movimiento {
              transition:
                transform 0.25s ease,
                box-shadow 0.25s ease;
            }

            .resumen-movimiento:hover {
              transform:
                translateY(-4px);
              box-shadow:
                0 12px 24px
                rgba(
                  15,
                  23,
                  42,
                  0.08
                );
            }

            .tarjeta-jornada {
              transition:
                transform 0.22s ease,
                box-shadow 0.22s ease,
                border-color 0.22s ease;
            }

            .tarjeta-jornada:hover {
              transform:
                translateY(-4px)
                scale(1.01);
              border-color:
                rgba(
                  231,
                  169,
                  0,
                  0.4
                );
              box-shadow:
                0 14px 28px
                rgba(
                  15,
                  23,
                  42,
                  0.08
                );
            }

            .tarjeta-jornada:active {
              transform:
                scale(0.97);
            }

            .boton-animado {
              transition:
                transform 0.18s ease,
                box-shadow 0.18s ease;
            }

            .boton-animado:hover {
              transform:
                translateY(-2px);
              box-shadow:
                0 8px 16px
                rgba(
                  231,
                  169,
                  0,
                  0.2
                );
            }

            .boton-animado:active {
              transform:
                scale(0.94);
            }

            .detalle-animado {
              animation:
                entradaPagina
                0.3s ease-out both;
            }

            @media (
              prefers-reduced-motion:
              reduce
            ) {
              *,
              *::before,
              *::after {
                animation-duration:
                  0.01ms !important;
                animation-iteration-count:
                  1 !important;
                transition-duration:
                  0.01ms !important;
              }
            }
          `}
        </style>

        <div className="mx-auto max-w-md space-y-4 pb-28">
          <header className="animacion-pagina px-1">
            <h1 className="text-2xl font-black text-slate-950">
              Mis ganancias
            </h1>
          </header>

          {error ? (
            <div className="animacion-pagina rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
              {error}
            </div>
          ) : null}

          <section className="tarjeta-principal animacion-pagina rounded-[30px] border border-[#F3D26A] bg-gradient-to-br from-[#FFF5C4] via-white to-[#FFE58A] p-5 shadow-lg">
            <span className="particula-uno absolute left-5 top-5 h-3 w-3 rounded-full bg-[#F3C331]/50" />

            <span className="particula-dos absolute bottom-6 left-1/2 h-2 w-2 rounded-full bg-[#E7A900]/50" />

            <span className="particula-tres absolute right-6 top-5 h-4 w-4 rounded-full bg-white/70 shadow-sm" />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#A97900]">
                  Pendiente por cobrar
                </p>

                <h2 className="animacion-numero mt-2 break-words text-3xl font-black leading-none text-slate-950">
                  {formatoDinero(
                    saldoGeneralAnimado
                  )}
                </h2>

                <div className="mt-3 inline-flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm">
                  {
                    jornadasPendientes.length
                  }{" "}
                  jornada
                  {jornadasPendientes.length !==
                  1
                    ? "s"
                    : ""}
                </div>
              </div>

              <div className="relative shrink-0">
                <span className="anillo-pulso" />
                <span className="anillo-pulso anillo-pulso-dos" />

                <div className="billetera-flotante relative flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-[#E7A900] shadow-lg">
                  <Wallet
                    size={31}
                    strokeWidth={2.4}
                  />
                </div>
              </div>
            </div>
          </section>

          <section
            className="animacion-tarjeta rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
            style={{
              animationDelay:
                "80ms",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Fecha
                </p>

                <p className="mt-1 text-sm font-black capitalize text-slate-950">
                  {formatoFechaTexto(
                    fechaSeleccionada
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  actualizarDatos
                }
                disabled={
                  loading ||
                  actualizando
                }
                className="boton-animado flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 disabled:opacity-60"
                title="Actualizar"
              >
                <RefreshCcw
                  size={19}
                  strokeWidth={2.3}
                  className={
                    loading ||
                    actualizando
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>
            </div>

            <div className="relative mt-4">
              <input
                type="date"
                value={
                  fechaSeleccionada
                }
                onChange={(
                  event
                ) =>
                  setFechaSeleccionada(
                    event.target
                      .value
                  )
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-11 text-sm font-bold text-slate-700 outline-none transition focus:border-[#E7A900] focus:ring-4 focus:ring-[#FFF4CF]"
              />

              <CalendarDays
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={
                  seleccionarHoy
                }
                className="boton-animado h-11 rounded-2xl bg-[#E7A900] text-sm font-black text-white"
              >
                Hoy
              </button>

              <button
                type="button"
                onClick={
                  limpiarFecha
                }
                className="boton-animado h-11 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-600"
              >
                Ver todo
              </button>
            </div>
          </section>

          <section
            className="animacion-tarjeta grid grid-cols-3 gap-2"
            style={{
              animationDelay:
                "150ms",
            }}
          >
            {/* <div className="resumen-movimiento rounded-2xl border border-[#F3D26A] bg-[#FFF9E7] p-3 text-center shadow-sm">
              <p className="text-[10px] font-black uppercase text-[#A97900]">
                Ganancia
              </p>

              <p className="animacion-numero mt-1 text-sm font-black text-slate-950">
                {formatoDinero(
                  saldoFiltradoAnimado
                )}
              </p>
            </div> */}

            {/* <div className="resumen-movimiento rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400">
                Jornadas
              </p>

              <p className="animacion-numero mt-1 text-sm font-black text-slate-950">
                {
                  jornadasFiltradas.length
                }
              </p>
            </div> */}

            {/* <div className="resumen-movimiento rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400">
                Kilómetros
              </p>

              <p className="animacion-numero mt-1 text-sm font-black text-slate-950">
                {formatoNumero(
                  kilometrosAnimados
                )}
              </p>
            </div> */}
          </section>

          <section
            className="animacion-tarjeta rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
            style={{
              animationDelay:
                "220ms",
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-950">
                Jornadas pendientes
              </h2>

              <span className="rounded-full bg-[#FFF4CF] px-3 py-1 text-xs font-black text-[#A97900]">
                {
                  jornadasFiltradas.length
                }
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="rounded-3xl bg-slate-50 p-6 text-center">
                  <RefreshCcw
                    size={26}
                    className="mx-auto animate-spin text-[#E7A900]"
                  />

                  <p className="mt-3 text-sm font-bold text-slate-500">
                    Cargando...
                  </p>
                </div>
              ) : null}

              {!loading &&
              jornadasFiltradas.length ===
                0 ? (
                <div className="rounded-3xl bg-slate-50 p-6 text-center">
                  <div className="billetera-flotante mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                    <Wallet
                      size={25}
                    />
                  </div>

                  <h3 className="mt-3 text-sm font-black text-slate-950">
                    Sin saldo pendiente
                  </h3>
                </div>
              ) : null}

              {!loading &&
                jornadasFiltradas.map(
                  (
                    jornada,
                    index
                  ) => (
                    <article
                      key={
                        jornada.id
                      }
                      className="tarjeta-jornada animacion-tarjeta rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                      style={{
                        animationDelay: `${
                          280 +
                          index * 90
                        }ms`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                            {formatoFechaTexto(
                              jornada.fecha
                            )}
                          </p>

                          <h3 className="animacion-numero mt-1 text-xl font-black text-slate-950">
                            {formatoDinero(
                              obtenerSaldoPendiente(
                                jornada
                              )
                            )}
                          </h3>

                          <span className="mt-2 inline-flex rounded-full bg-[#FFF4CF] px-2.5 py-1 text-[10px] font-black uppercase text-[#A97900]">
                            Pendiente
                          </span>
                        </div>

                        <div className="billetera-flotante flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
                          <Wallet
                            size={21}
                          />
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="resumen-movimiento rounded-2xl bg-slate-50 p-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                            <CarTaxiFront
                              size={14}
                            />

                            Vehículo
                          </div>

                          <p className="mt-1 truncate text-xs font-black text-slate-700">
                            {obtenerVehiculoTexto(
                              jornada
                            )}
                          </p>
                        </div>

                        <div className="resumen-movimiento rounded-2xl bg-slate-50 p-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                            <Gauge
                              size={14}
                            />

                            Kilómetros
                          </div>

                          <p className="mt-1 text-xs font-black text-slate-700">
                            {formatoNumero(
                              jornada
                                .kilometros_recorridos
                            )}{" "}
                            km
                          </p>
                        </div>
                      </div>

                      <details className="group mt-3">
                        <summary className="boton-animado flex cursor-pointer list-none items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 text-xs font-black text-slate-600">
                          Ver detalle

                          <ChevronDown
                            size={17}
                            className="transition-transform duration-300 group-open:rotate-180"
                          />
                        </summary>

                        <div className="detalle-animado mt-2 space-y-2 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-500">
                          <div className="flex justify-between gap-3">
                            <span>
                              Ingreso bruto
                            </span>

                            <span className="text-slate-900">
                              {formatoDinero(
                                jornada
                                  .ingreso_bruto
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between gap-3">
                            <span>
                              Pago calculado
                            </span>

                            <span className="text-slate-900">
                              {formatoDinero(
                                obtenerGananciaHistorica(
                                  jornada
                                )
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between gap-3">
                            <span>
                              Porcentaje
                            </span>

                            <span className="text-slate-900">
                              {Number(
                                jornada
                                  .porcentaje_pago_conductor ||
                                  0
                              ).toLocaleString(
                                "es-NI"
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </details>
                    </article>
                  )
                )}
            </div>
          </section>
        </div>
      </>
    );
  };

export default GananciasTaxistaPage;