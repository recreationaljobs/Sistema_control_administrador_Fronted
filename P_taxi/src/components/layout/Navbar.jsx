import {
  AlertTriangle,
  Bell,
  Check,
  Gauge,
  Menu,
  RefreshCw,
  Wrench,
  X,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";

const CLAVE_ABRIR_ALERTAS = "abrir_alertas_despues_login";
const CLAVE_ALERTAS_CONFIRMADAS = "alertas_confirmadas_sesion";

const normalizarLista = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.alertas)) {
    return data.alertas;
  }

  return [];
};

const leerAlertasConfirmadas = () => {
  try {
    const valorGuardado = sessionStorage.getItem(
      CLAVE_ALERTAS_CONFIRMADAS
    );

    if (!valorGuardado) {
      return [];
    }

    const resultado = JSON.parse(valorGuardado);

    return Array.isArray(resultado) ? resultado : [];
  } catch {
    return [];
  }
};

const crearClaveAlerta = (alerta, index) => {
  if (alerta?.clave) {
    return String(alerta.clave);
  }

  if (alerta?.id) {
    return String(alerta.id);
  }

  const vehiculoId =
    alerta?.vehiculo_id ??
    alerta?.vehiculo?.id ??
    alerta?.vehiculo ??
    "vehiculo";

  const tipo =
    alerta?.tipo ??
    alerta?.categoria ??
    alerta?.titulo ??
    "alerta";

  const kilometrajeObjetivo =
    alerta?.kilometraje_objetivo ??
    alerta?.km_proximo_mantenimiento ??
    alerta?.proximo_mantenimiento ??
    alerta?.proximo_cambio_aceite ??
    alerta?.km_objetivo ??
    "sin-kilometraje";

  const nivel =
    alerta?.nivel ??
    alerta?.estado ??
    "pendiente";

  return [
    vehiculoId,
    tipo,
    kilometrajeObjetivo,
    nivel,
    index,
  ].join("-");
};

const esAlertaVencida = (alerta) => {
  const estado = String(alerta?.estado || "").toLowerCase();
  const nivel = String(alerta?.nivel || "").toLowerCase();

  if (
    estado === "vencido" ||
    estado === "vencida" ||
    nivel === "vencido" ||
    nivel === "vencida" ||
    nivel === "danger" ||
    nivel === "critico" ||
    nivel === "crítico"
  ) {
    return true;
  }

  const faltanKm =
    alerta?.faltan_km ??
    alerta?.km_faltantes;

  if (faltanKm !== undefined && faltanKm !== null) {
    return Number(faltanKm) <= 0;
  }

  const kilometrajeActual =
    alerta?.kilometraje_actual ??
    alerta?.km_actual;

  const kilometrajeObjetivo =
    alerta?.kilometraje_objetivo ??
    alerta?.km_proximo_mantenimiento ??
    alerta?.km_objetivo;

  if (
    kilometrajeActual !== undefined &&
    kilometrajeActual !== null &&
    kilometrajeObjetivo !== undefined &&
    kilometrajeObjetivo !== null
  ) {
    return (
      Number(kilometrajeActual) >= Number(kilometrajeObjetivo)
    );
  }

  return false;
};

const obtenerTitulo = (alerta) => {
  if (alerta?.titulo) {
    return alerta.titulo;
  }

  const tipo = String(
    alerta?.tipo ??
      alerta?.categoria ??
      ""
  ).toLowerCase();

  const vencida = esAlertaVencida(alerta);

  if (tipo.includes("aceite")) {
    return vencida
      ? "Cambio de aceite vencido"
      : "Próximo cambio de aceite";
  }

  if (tipo.includes("mantenimiento")) {
    return vencida
      ? "Mantenimiento vencido"
      : "Próximo mantenimiento";
  }

  if (tipo.includes("licencia")) {
    return vencida
      ? "Licencia vencida"
      : "Licencia próxima a vencer";
  }

  return "Alerta del sistema";
};

const obtenerMensaje = (alerta) => {
  if (alerta?.mensaje) {
    return alerta.mensaje;
  }

  if (alerta?.descripcion) {
    return alerta.descripcion;
  }

  const faltanKm =
    alerta?.faltan_km ??
    alerta?.km_faltantes;

  if (faltanKm !== undefined && faltanKm !== null) {
    const kilometros = Number(faltanKm);

    if (kilometros <= 0) {
      return `El servicio superó por ${Math.abs(
        kilometros
      )} km el kilometraje programado.`;
    }

    return `Faltan ${kilometros} km para alcanzar el kilometraje programado.`;
  }

  return "Esta alerta requiere revisión.";
};

const obtenerNumeroVehiculo = (alerta) => {
  return (
    alerta?.vehiculo_numero ??
    alerta?.numero_vehiculo ??
    alerta?.numero ??
    alerta?.vehiculo?.numero ??
    ""
  );
};

const obtenerPlacaVehiculo = (alerta) => {
  return (
    alerta?.vehiculo_placa ??
    alerta?.placa ??
    alerta?.vehiculo?.placa ??
    ""
  );
};

const obtenerDescripcionVehiculo = (alerta) => {
  if (alerta?.vehiculo_descripcion) {
    return alerta.vehiculo_descripcion;
  }

  const marca =
    alerta?.marca ??
    alerta?.vehiculo?.marca ??
    "";

  const modelo =
    alerta?.modelo ??
    alerta?.vehiculo?.modelo ??
    "";

  return `${marca} ${modelo}`.trim();
};

const Navbar = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();

  const contenedorRef = useRef(null);

  const [alertas, setAlertas] = useState([]);
  const [confirmadas, setConfirmadas] = useState([]);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const alertasPendientes = useMemo(() => {
    return alertas.filter((alerta) => {
      return !confirmadas.includes(alerta._claveFrontend);
    });
  }, [alertas, confirmadas]);

  const notifCount = alertasPendientes.length;

  const cargarAlertas = async ({
    abrirAutomaticamente = false,
    confirmadasActuales = null,
  } = {}) => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(
        "mantenimiento/alertas/"
      );

      const lista = normalizarLista(data).map(
        (alerta, index) => ({
          ...alerta,
          _claveFrontend: crearClaveAlerta(
            alerta,
            index
          ),
        })
      );

      setAlertas(lista);

      const clavesConfirmadas =
        confirmadasActuales ?? leerAlertasConfirmadas();

      const pendientes = lista.filter((alerta) => {
        return !clavesConfirmadas.includes(
          alerta._claveFrontend
        );
      });

      if (
        abrirAutomaticamente &&
        pendientes.length > 0
      ) {
        setPanelAbierto(true);
      }
    } catch (err) {
      console.error("Error cargando alertas:", err);

      setError(
        err?.response?.data?.detail ||
          "No se pudieron cargar las alertas del sistema."
      );

      setAlertas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const confirmadasGuardadas =
      leerAlertasConfirmadas();

    setConfirmadas(confirmadasGuardadas);

    const debeAbrirAutomaticamente =
      sessionStorage.getItem(CLAVE_ABRIR_ALERTAS) ===
      "1";

    /*
     * Se elimina inmediatamente para que el panel
     * no vuelva a abrirse al recargar la página.
     */
    sessionStorage.removeItem(CLAVE_ABRIR_ALERTAS);

    cargarAlertas({
      abrirAutomaticamente:
        debeAbrirAutomaticamente,
      confirmadasActuales: confirmadasGuardadas,
    });
  }, [user?.id]);

  useEffect(() => {
    const cerrarAlHacerClickFuera = (event) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target)
      ) {
        setPanelAbierto(false);
      }
    };

    document.addEventListener(
      "mousedown",
      cerrarAlHacerClickFuera
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        cerrarAlHacerClickFuera
      );
    };
  }, []);

  const abrirOCerrarPanel = async () => {
    const nuevoEstado = !panelAbierto;

    setPanelAbierto(nuevoEstado);

    if (nuevoEstado) {
      await cargarAlertas();
    }
  };

  const confirmarAlerta = (alerta) => {
    const clave = alerta?._claveFrontend;

    if (!clave) {
      setError(
        "No se pudo identificar la alerta seleccionada."
      );
      return;
    }

    /*
     * Solamente se agrega la clave de la alerta
     * seleccionada. Las demás continúan visibles.
     */
    const nuevasConfirmadas = Array.from(
      new Set([...confirmadas, clave])
    );

    setConfirmadas(nuevasConfirmadas);

    sessionStorage.setItem(
      CLAVE_ALERTAS_CONFIRMADAS,
      JSON.stringify(nuevasConfirmadas)
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-[92px] items-center justify-between bg-[#F8FAFC] px-4 md:px-6 lg:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={23} />
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-xl font-black text-slate-950 md:text-[28px]">
            ¡Bienvenido,{" "}
            {user?.first_name ||
              user?.username ||
              "Administrador"}
            !
          </h2>

          <p className="mt-1 hidden text-sm font-medium text-slate-500 sm:block md:text-base">
            Resumen general del sistema
          </p>
        </div>
      </div>

      <div
        ref={contenedorRef}
        className="relative ml-3 flex shrink-0 items-center gap-4"
      >
        <button
          type="button"
          onClick={abrirOCerrarPanel}
          className="relative flex h-12 w-12 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          aria-label="Ver alertas"
          title="Alertas del sistema"
        >
          <Bell size={21} />

          {notifCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white">
              {notifCount > 99 ? "99+" : notifCount}
            </span>
          )}
        </button>

        {panelAbierto && (
          <div className="absolute right-0 top-16 z-50 w-[calc(100vw-32px)] max-w-[430px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-base font-black text-slate-950">
                  Alertas del sistema
                </h3>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {notifCount} alerta
                  {notifCount === 1 ? "" : "s"}{" "}
                  pendiente
                  {notifCount === 1 ? "" : "s"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => cargarAlertas()}
                  disabled={loading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Actualizar alertas"
                  aria-label="Actualizar alertas"
                >
                  <RefreshCw
                    size={17}
                    className={
                      loading ? "animate-spin" : ""
                    }
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setPanelAbierto(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                  title="Cerrar"
                  aria-label="Cerrar alertas"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {error && (
              <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            <div className="max-h-[65vh] overflow-y-auto">
              {loading && alertas.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <RefreshCw
                    size={28}
                    className="mx-auto animate-spin text-slate-400"
                  />

                  <p className="mt-3 text-sm font-bold text-slate-500">
                    Cargando alertas...
                  </p>
                </div>
              )}

              {!loading && notifCount === 0 && (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Check size={28} />
                  </div>

                  <h3 className="mt-4 text-base font-black text-slate-900">
                    No hay alertas pendientes
                  </h3>

                  <p className="mt-2 text-sm font-medium text-slate-500">
                    No existen alertas activas para
                    mostrar.
                  </p>
                </div>
              )}

              {alertasPendientes.map((alerta) => {
                const vencida =
                  esAlertaVencida(alerta);

                const numero =
                  obtenerNumeroVehiculo(alerta);

                const placa =
                  obtenerPlacaVehiculo(alerta);

                const descripcionVehiculo =
                  obtenerDescripcionVehiculo(alerta);

                const kilometrajeActual =
                  alerta?.kilometraje_actual ??
                  alerta?.km_actual;

                const kilometrajeObjetivo =
                  alerta?.kilometraje_objetivo ??
                  alerta?.km_proximo_mantenimiento ??
                  alerta?.km_objetivo;

                const faltanKm =
                  alerta?.faltan_km ??
                  alerta?.km_faltantes;

                const tipo = String(
                  alerta?.tipo ?? ""
                ).toLowerCase();

                return (
                  <article
                    key={alerta._claveFrontend}
                    className="border-b border-slate-100 px-5 py-5 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                          vencida
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {tipo.includes("aceite") ? (
                          <Wrench size={21} />
                        ) : (
                          <AlertTriangle size={21} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h4 className="text-sm font-black text-slate-950">
                            {obtenerTitulo(alerta)}
                          </h4>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                              vencida
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {vencida
                              ? "Vencida"
                              : "Próxima"}
                          </span>
                        </div>

                        <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
                          {obtenerMensaje(alerta)}
                        </p>

                        {(numero ||
                          placa ||
                          descripcionVehiculo) && (
                          <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-3">
                            {(numero || placa) && (
                              <p className="text-xs font-black text-slate-800">
                                {numero}
                                {numero && placa
                                  ? " - "
                                  : ""}
                                {placa}
                              </p>
                            )}

                            {descripcionVehiculo && (
                              <p className="mt-1 text-xs font-medium text-slate-500">
                                {descripcionVehiculo}
                              </p>
                            )}

                            {kilometrajeActual !==
                              undefined &&
                              kilometrajeActual !==
                                null && (
                                <p className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-600">
                                  <Gauge size={14} />
                                  Actual:{" "}
                                  {kilometrajeActual} km
                                </p>
                              )}

                            {kilometrajeObjetivo !==
                              undefined &&
                              kilometrajeObjetivo !==
                                null && (
                                <p className="mt-1 text-xs font-bold text-slate-500">
                                  Programado:{" "}
                                  {kilometrajeObjetivo} km
                                </p>
                              )}

                            {faltanKm !== undefined &&
                              faltanKm !== null && (
                                <p
                                  className={`mt-1 text-xs font-black ${
                                    Number(faltanKm) <= 0
                                      ? "text-red-600"
                                      : "text-amber-700"
                                  }`}
                                >
                                  {Number(faltanKm) <= 0
                                    ? `Vencido por ${Math.abs(
                                        Number(faltanKm)
                                      )} km`
                                    : `Faltan ${faltanKm} km`}
                                </p>
                              )}

                            {alerta?.sucursal_nombre && (
                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                {alerta.sucursal_nombre}
                              </p>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            confirmarAlerta(alerta)
                          }
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800"
                        >
                          <Check size={16} />
                          Confirmar esta alerta
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;