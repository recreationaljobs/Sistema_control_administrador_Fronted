import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BellRing,
  CarTaxiFront,
  CheckCircle2,
  Clock3,
  Droplets,
  Gauge,
  History,
  RefreshCcw,
  TriangleAlert,
  Wrench,
} from "lucide-react";

import ActivarNotificaciones from "../../jornadas/components/ActivarNotificaciones";

import {
  getAlertasMiVehiculo,
  getMiVehiculo,
} from "../services/miVehiculoService";

const numeroSeguro = (
  valor
) => {
  const numero = Number(
    valor ?? 0
  );

  return Number.isFinite(numero)
    ? numero
    : 0;
};

const formatoKilometros = (
  valor
) => {
  return `${numeroSeguro(
    valor
  ).toLocaleString("es-NI")} km`;
};

const obtenerMensajeError = (
  error
) => {
  const data =
    error?.response?.data;

  if (
    typeof data?.detail ===
    "string"
  ) {
    return data.detail;
  }

  if (
    typeof data === "string"
  ) {
    return data;
  }

  return (
    error?.message ||
    "No se pudo cargar la información del vehículo."
  );
};

const calcularPorcentaje = ({
  kilometrajeActual,
  kilometrajeBase,
  kilometrajeObjetivo,
}) => {
  const actual =
    numeroSeguro(
      kilometrajeActual
    );

  const base =
    numeroSeguro(
      kilometrajeBase
    );

  const objetivo =
    numeroSeguro(
      kilometrajeObjetivo
    );

  const intervalo =
    objetivo - base;

  if (
    intervalo <= 0 ||
    objetivo <= 0
  ) {
    return 0;
  }

  const recorrido =
    actual - base;

  const porcentaje =
    (
      recorrido /
      intervalo
    ) * 100;

  return Math.min(
    Math.max(
      porcentaje,
      0
    ),
    100
  );
};

const obtenerEstadoAceite = (
  vehiculo
) => {
  const faltanKm =
    vehiculo
      ?.faltan_km_cambio_aceite;

  if (
    vehiculo
      ?.necesita_cambio_aceite ||
    (
      faltanKm !== null &&
      faltanKm !== undefined &&
      numeroSeguro(
        faltanKm
      ) <= 0
    )
  ) {
    return {
      codigo: "vencido",
      nombre:
        "Cambio de aceite pendiente",
      descripcion:
        "El vehículo alcanzó o superó el kilometraje programado.",
      fondo:
        "bg-red-50",
      borde:
        "border-red-200",
      texto:
        "text-red-700",
      iconoFondo:
        "bg-red-100",
      barra:
        "bg-red-500",
      Icono:
        TriangleAlert,
    };
  }

  if (
    vehiculo
      ?.alerta_cambio_aceite
  ) {
    return {
      codigo: "proximo",
      nombre:
        "Próximo cambio de aceite",
      descripcion:
        "El vehículo se encuentra dentro del rango de aviso preventivo.",
      fondo:
        "bg-amber-50",
      borde:
        "border-amber-200",
      texto:
        "text-amber-700",
      iconoFondo:
        "bg-amber-100",
      barra:
        "bg-amber-500",
      Icono:
        Clock3,
    };
  }

  if (
    vehiculo
      ?.proximo_cambio_aceite ===
      null ||
    vehiculo
      ?.proximo_cambio_aceite ===
      undefined
  ) {
    return {
      codigo:
        "sin_historial",
      nombre:
        "Sin historial suficiente",
      descripcion:
        "Todavía no existe un cambio de aceite finalizado para calcular el próximo servicio.",
      fondo:
        "bg-slate-50",
      borde:
        "border-slate-200",
      texto:
        "text-slate-700",
      iconoFondo:
        "bg-slate-200",
      barra:
        "bg-slate-400",
      Icono:
        History,
    };
  }

  return {
    codigo: "bueno",
    nombre:
      "Estado del aceite",
    // descripcion:
    //   "El vehículo todavía se encuentra fuera del rango de alerta.",
    fondo:
      "bg-emerald-50",
    borde:
      "border-emerald-200",
    texto:
      "text-emerald-700",
    iconoFondo:
      "bg-emerald-100",
    barra:
      "bg-emerald-500",
    Icono:
      CheckCircle2,
  };
};

const obtenerEstadoMantenimiento = (
  vehiculo
) => {
  const faltanKm =
    vehiculo
      ?.faltan_km_mantenimiento;

  if (
    vehiculo
      ?.necesita_mantenimiento ||
    (
      faltanKm !== null &&
      faltanKm !== undefined &&
      numeroSeguro(
        faltanKm
      ) <= 0
    )
  ) {
    return {
      nombre:
        "Mantenimiento vencido",
      clase:
        "bg-red-100 text-red-700",
    };
  }

  if (
    vehiculo
      ?.alerta_mantenimiento
  ) {
    return {
      nombre:
        "Próximo mantenimiento",
      clase:
        "bg-amber-100 text-amber-700",
    };
  }

  if (
    vehiculo
      ?.proximo_mantenimiento ===
      null ||
    vehiculo
      ?.proximo_mantenimiento ===
      undefined
  ) {
    return {
      nombre:
        "Sin historial",
      clase:
        "bg-slate-100 text-slate-600",
    };
  }

  return {
    nombre:
      "En buen estado",
    clase:
      "bg-emerald-100 text-emerald-700",
  };
};

const TarjetaDato = ({
  icono: Icono,
  titulo,
  valor,
  descripcion,
  tono,
}) => {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tono}`}
        >
          <Icono
            size={21}
            strokeWidth={2.3}
          />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            {titulo}
          </p>

          <p className="mt-1 break-words text-xl font-black text-slate-950">
            {valor}
          </p>

          {descripcion && (
            <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
              {descripcion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const MiVehiculoTaxistaPage =
  () => {
    const [
      vehiculo,
      setVehiculo,
    ] = useState(null);

    const [
      alertas,
      setAlertas,
    ] = useState([]);

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      actualizando,
      setActualizando,
    ] = useState(false);

    const [
      error,
      setError,
    ] = useState("");

    const cargarInformacion =
      useCallback(
        async ({
          mostrarCargaInicial =
            false,
        } = {}) => {
          try {
            if (
              mostrarCargaInicial
            ) {
              setLoading(true);
            } else {
              setActualizando(
                true
              );
            }

            setError("");

            const [
              vehiculoData,
              alertasData,
            ] =
              await Promise.all([
                getMiVehiculo(),
                getAlertasMiVehiculo(),
              ]);

            setVehiculo(
              vehiculoData
            );

            setAlertas(
              Array.isArray(
                alertasData
              )
                ? alertasData
                : []
            );
          } catch (err) {
            console.error(
              "Error cargando el vehículo del taxista:",
              err?.response?.data ||
                err
            );

            setError(
              obtenerMensajeError(
                err
              )
            );

            setVehiculo(null);
            setAlertas([]);
          } finally {
            setLoading(false);
            setActualizando(false);
          }
        },
        []
      );

    useEffect(() => {
      void cargarInformacion({
        mostrarCargaInicial:
          true,
      });
    }, [
      cargarInformacion,
    ]);

    const estadoAceite =
      useMemo(
        () =>
          obtenerEstadoAceite(
            vehiculo
          ),
        [vehiculo]
      );

    const estadoMantenimiento =
      useMemo(
        () =>
          obtenerEstadoMantenimiento(
            vehiculo
          ),
        [vehiculo]
      );

    const porcentajeAceite =
      useMemo(() => {
        if (!vehiculo) {
          return 0;
        }

        return calcularPorcentaje({
          kilometrajeActual:
            vehiculo
              .kilometraje_actual,

          kilometrajeBase:
            vehiculo
              .km_ultimo_cambio_aceite,

          kilometrajeObjetivo:
            vehiculo
              .proximo_cambio_aceite,
        });
      }, [vehiculo]);

    const alertasAceite =
      useMemo(() => {
        if (!vehiculo) {
          return [];
        }

        return alertas.filter(
          (alerta) => {
            const vehiculoId =
              Number(
                alerta
                  ?.vehiculo_id ||
                  0
              );

            const tipoCodigo =
              String(
                alerta
                  ?.tipo_codigo ||
                  alerta?.tipo ||
                  ""
              )
                .trim()
                .toLowerCase();

            return (
              (
                !vehiculoId ||
                vehiculoId ===
                  Number(
                    vehiculo.id
                  )
              ) &&
              (
                tipoCodigo.includes(
                  "aceite"
                ) ||
                tipoCodigo.includes(
                  "mantenimiento"
                )
              )
            );
          }
        );
      }, [
        alertas,
        vehiculo,
      ]);

    const faltanAceite =
      vehiculo
        ?.faltan_km_cambio_aceite;

    const textoKilometrosAceite =
      useMemo(() => {
        if (
          faltanAceite === null ||
          faltanAceite ===
            undefined
        ) {
          return "No disponible";
        }

        const valor =
          numeroSeguro(
            faltanAceite
          );

        if (valor < 0) {
          return `${Math.abs(
            valor
          ).toLocaleString(
            "es-NI"
          )} km excedidos`;
        }

        if (valor === 0) {
          return "Debe realizarse ahora";
        }

        return formatoKilometros(
          valor
        );
      }, [faltanAceite]);

    if (loading) {
      return (
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200" />

            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[#E7A900] border-t-[#E7A900]" />

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4CF] text-[#C48C00]">
              <CarTaxiFront
                size={28}
              />
            </div>
          </div>

          <p className="mt-5 text-lg font-black text-slate-950">
            Cargando tu vehículo
          </p>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Estamos consultando el
            kilometraje y los próximos
            servicios.
          </p>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-md space-y-4 pb-8">
        <header className="flex items-center justify-between gap-4 px-1">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B98200]">
              Control preventivo
            </p>

            <h1 className="mt-1 text-2xl font-black text-slate-950">
              Mi vehículo
            </h1>
          </div>

          <button
            type="button"
            onClick={() =>
              cargarInformacion()
            }
            disabled={
              actualizando
            }
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            title="Actualizar información"
          >
            <RefreshCcw
              size={20}
              className={
                actualizando
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </header>

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <TriangleAlert
                size={21}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-black text-red-700">
                  No se pudo cargar
                </p>

                <p className="mt-1 text-sm font-medium text-red-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {!vehiculo ? (
          <section className="rounded-[30px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#FFF4CF] text-[#C48C00]">
              <CarTaxiFront
                size={31}
              />
            </div>

            <h2 className="mt-4 text-lg font-black text-slate-950">
              No tienes un vehículo
              asignado
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              Cuando el administrador
              realice una asignación activa,
              aquí aparecerán el kilometraje
              y los próximos servicios.
            </p>
          </section>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-[30px] bg-slate-950 p-5 text-white shadow-lg">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-yellow-400/15 blur-2xl" />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-yellow-400">
                      Vehículo asignado
                    </p>

                    <h2 className="mt-2 truncate text-2xl font-black">
                      {vehiculo.numero ||
                        "Sin número"}{" "}
                      -{" "}
                      {vehiculo.placa ||
                        "Sin placa"}
                    </h2>

                    <p className="mt-1 text-sm font-semibold text-slate-400">
                      {vehiculo.marca ||
                        ""}{" "}
                      {vehiculo.modelo ||
                        ""}{" "}
                      {vehiculo.anio
                        ? `· ${vehiculo.anio}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20">
                    <CarTaxiFront
                      size={28}
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-white/10 p-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        Kilometraje actual
                      </p>

                      <p className="mt-1 text-3xl font-black">
                        {numeroSeguro(
                          vehiculo
                            .kilometraje_actual
                        ).toLocaleString(
                          "es-NI"
                        )}
                      </p>
                    </div>

                    <span className="pb-1 text-sm font-black text-yellow-400">
                      km
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section
              className={`rounded-[28px] border p-5 shadow-sm ${estadoAceite.fondo} ${estadoAceite.borde}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${estadoAceite.iconoFondo} ${estadoAceite.texto}`}
                >
                  <estadoAceite.Icono
                    size={24}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-black uppercase tracking-wide ${estadoAceite.texto}`}
                  >
                    Estado del aceite
                  </p>

                  <h2 className="mt-1 text-lg font-black text-slate-950">
                    {estadoAceite.nombre}
                  </h2>

                  <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                    {
                      estadoAceite.descripcion
                    }
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-slate-500">
                    Progreso del cambio de aceite
                  </span>

                  <span className="text-xs font-black text-slate-700">
                    {porcentajeAceite.toFixed(
                      0
                    )}
                    %
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${estadoAceite.barra}`}
                    style={{
                      width: `${porcentajeAceite}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/80 p-3">
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    Próximo cambio
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-950">
                    {vehiculo
                      .proximo_cambio_aceite !==
                      null &&
                    vehiculo
                      .proximo_cambio_aceite !==
                      undefined
                      ? formatoKilometros(
                          vehiculo
                            .proximo_cambio_aceite
                        )
                      : "No disponible"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-3">
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    Restante
                  </p>

                  <p
                    className={`mt-1 text-sm font-black ${
                      numeroSeguro(
                        faltanAceite
                      ) <= 0 &&
                      faltanAceite !==
                        null &&
                      faltanAceite !==
                        undefined
                        ? "text-red-600"
                        : "text-slate-950"
                    }`}
                  >
                    {
                      textoKilometrosAceite
                    }
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <TarjetaDato
                icono={Droplets}
                titulo="Último aceite"
                valor={
                  vehiculo
                    .km_ultimo_cambio_aceite
                    ? formatoKilometros(
                        vehiculo
                          .km_ultimo_cambio_aceite
                      )
                    : "Sin registro"
                }
                descripcion="Kilometraje del último servicio finalizado."
                tono="bg-blue-100 text-blue-700"
              />

              <TarjetaDato
                icono={Gauge}
                titulo="Intervalo"
                valor={formatoKilometros(
                  vehiculo
                    .km_intervalo_cambio_aceite
                )}
                descripcion="Distancia configurada entre cambios."
                tono="bg-amber-100 text-amber-700"
              />
            </section>

            {/* <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <Wrench
                      size={21}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Mantenimiento general
                    </p>

                    <p className="mt-1 text-lg font-black text-slate-950">
                      {vehiculo
                        .proximo_mantenimiento !==
                        null &&
                      vehiculo
                        .proximo_mantenimiento !==
                        undefined
                        ? formatoKilometros(
                            vehiculo
                              .proximo_mantenimiento
                          )
                        : "No disponible"}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ${estadoMantenimiento.clase}`}
                >
                  {
                    estadoMantenimiento.nombre
                  }
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Último mantenimiento
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-800">
                    {vehiculo
                      .km_ultimo_mantenimiento
                      ? formatoKilometros(
                          vehiculo
                            .km_ultimo_mantenimiento
                        )
                      : "Sin registro"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Kilómetros restantes
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-800">
                    {vehiculo
                      .faltan_km_mantenimiento !==
                      null &&
                    vehiculo
                      .faltan_km_mantenimiento !==
                      undefined
                      ? formatoKilometros(
                          vehiculo
                            .faltan_km_mantenimiento
                        )
                      : "No disponible"}
                  </p>
                </div>
              </div>
            </section>

            {alertasAceite.length >
              0 && (
              <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <BellRing
                    size={23}
                    className="mt-0.5 shrink-0 text-amber-700"
                  />

                  <div>
                    <h2 className="font-black text-amber-900">
                      Aviso activo
                    </h2>

                    <p className="mt-1 text-sm font-medium leading-6 text-amber-800">
                      {alertasAceite[0]
                        ?.mensaje ||
                        "Tu vehículo se encuentra próximo a un servicio de mantenimiento."}
                    </p>
                  </div>
                </div>
              </section>
            )} */}

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <BellRing
                    size={21}
                  />
                </div>

                <div>
                  <h2 className="font-black text-slate-950">
                    Alertas del vehículo
                  </h2>

                  <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                    Activa las notificaciones
                    para recibir el aviso antes
                    del próximo cambio de aceite.
                  </p>
                </div>
              </div>

              <ActivarNotificaciones />
            </section>
          </>
        )}
      </div>
    );
  };

export default MiVehiculoTaxistaPage;