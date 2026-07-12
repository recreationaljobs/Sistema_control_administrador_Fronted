// src/components/layout/Navbar.jsx

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertTriangle,
  Bell,
  CalendarDays,
  IdCard,
  Menu,
  Wrench,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";

const DESCARTADAS_KEY =
  "notif_descartadas";

const LAST_COUNT_KEY =
  "taxiadmin_last_alert_count";

const SEVERIDAD = {
  info: {
    color: "#38BDF8",
    chip: "bg-sky-100 text-sky-700",
    label: "Información",
  },

  warning: {
    color: "#F5C518",
    chip: "bg-amber-100 text-amber-700",
    label: "Advertencia",
  },

  critical: {
    color: "#EF4444",
    chip: "bg-red-100 text-red-700",
    label: "Crítico",
  },
};

const normalizarLista = (data) => {
  if (Array.isArray(data)) {
    return data.filter(Boolean);
  }

  if (Array.isArray(data?.results)) {
    return data.results.filter(Boolean);
  }

  if (Array.isArray(data?.data)) {
    return data.data.filter(Boolean);
  }

  if (Array.isArray(data?.data?.results)) {
    return data.data.results.filter(
      Boolean
    );
  }

  return [];
};

const normalizarRol = (rol, user) => {
  let valorRol = rol;

  if (
    valorRol &&
    typeof valorRol === "object"
  ) {
    valorRol =
      valorRol.codigo ||
      valorRol.nombre ||
      "";
  }

  const valor = String(
    valorRol ||
      user?.rol_codigo ||
      user?.rol?.codigo ||
      user?.rol_nombre ||
      ""
  )
    .trim()
    .toLowerCase();

  if (
    [
      "admin",
      "administrador",
      "administrador de sucursal",
    ].includes(valor)
  ) {
    return "admin_sucursal";
  }

  if (valor === "super_admin") {
    return "superadmin";
  }

  return valor;
};

const iconoPorTipo = (tipo) => {
  if (tipo === "licencia_vencimiento") {
    return IdCard;
  }

  if (tipo === "mantenimiento_km") {
    return Wrench;
  }

  return AlertTriangle;
};

const leerLocalStorage = (
  key,
  valorDefault
) => {
  try {
    const raw =
      window.localStorage.getItem(key);

    if (!raw) {
      return valorDefault;
    }

    return JSON.parse(raw);
  } catch {
    return valorDefault;
  }
};

const guardarLocalStorage = (
  key,
  value
) => {
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch (error) {
    console.warn(
      "No se pudo guardar en localStorage:",
      error
    );
  }
};

const leerDescartadas = () => {
  const resultado = leerLocalStorage(
    DESCARTADAS_KEY,
    []
  );

  return Array.isArray(resultado)
    ? resultado.map(String)
    : [];
};

const obtenerUltimoConteo = () => {
  try {
    const valor =
      window.localStorage.getItem(
        LAST_COUNT_KEY
      );

    const numero = Number(valor);

    return Number.isFinite(numero)
      ? numero
      : 0;
  } catch {
    return 0;
  }
};

const guardarUltimoConteo = (
  cantidad
) => {
  try {
    window.localStorage.setItem(
      LAST_COUNT_KEY,
      String(cantidad)
    );
  } catch (error) {
    console.warn(
      "No se pudo guardar el conteo:",
      error
    );
  }
};

const obtenerFechaTexto = () => {
  try {
    return new Intl.DateTimeFormat(
      "es-NI",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ).format(new Date());
  } catch {
    return new Date().toLocaleDateString();
  }
};

const Navbar = ({
  onOpenMobileMenu,
}) => {
  const { rol, user } = useAuth();
  const navigate = useNavigate();

  const rolNormalizado = useMemo(
    () => normalizarRol(rol, user),
    [rol, user]
  );

  const esTaxista =
    rolNormalizado === "taxista";

  const fechaActual = useMemo(
    () => obtenerFechaTexto(),
    []
  );

  const [alertas, setAlertas] =
    useState([]);

  const [
    descartadas,
    setDescartadas,
  ] = useState(leerDescartadas);

  const [panelOpen, setPanelOpen] =
    useState(false);

  const [swinging, setSwinging] =
    useState(false);

  const panelRef = useRef(null);
  const timerAnimacionRef =
    useRef(null);

  useEffect(() => {
    if (esTaxista) {
      setAlertas([]);
      setPanelOpen(false);

      return undefined;
    }

    let componenteActivo = true;

    const cargarAlertas = async () => {
      try {
        const response = await api.get(
          "/mantenimiento/alertas/"
        );

        if (!componenteActivo) {
          return;
        }

        const lista = normalizarLista(
          response?.data
        );

        setAlertas(lista);

        const conteoAnterior =
          obtenerUltimoConteo();

        if (
          lista.length >
          conteoAnterior
        ) {
          setSwinging(true);

          if (
            timerAnimacionRef.current
          ) {
            window.clearTimeout(
              timerAnimacionRef.current
            );
          }

          timerAnimacionRef.current =
            window.setTimeout(() => {
              if (componenteActivo) {
                setSwinging(false);
              }
            }, 1000);
        }

        guardarUltimoConteo(
          lista.length
        );
      } catch (error) {
        console.error(
          "Error al cargar alertas:",
          error
        );

        if (componenteActivo) {
          setAlertas([]);
        }
      }
    };

    void cargarAlertas();

    return () => {
      componenteActivo = false;

      if (timerAnimacionRef.current) {
        window.clearTimeout(
          timerAnimacionRef.current
        );
      }
    };
  }, [esTaxista]);

  useEffect(() => {
    if (!panelOpen) {
      return undefined;
    }

    const handleClickFuera = (
      event
    ) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(
          event.target
        )
      ) {
        setPanelOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setPanelOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickFuera
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickFuera
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [panelOpen]);

  const listaAlertas = Array.isArray(
    alertas
  )
    ? alertas
    : [];

  const idAlerta = (
    alerta,
    index
  ) => {
    return String(
      alerta?.id ??
        alerta?.codigo ??
        `${alerta?.tipo || "alerta"}-${index}`
    );
  };

  const alertasVisibles =
    listaAlertas.filter(
      (alerta, index) => {
        const id = idAlerta(
          alerta,
          index
        );

        return !descartadas.includes(id);
      }
    );

  const notifCount =
    alertasVisibles.length;

  const descartar = (id) => {
    const idNormalizado = String(id);

    setDescartadas(
      (descartadasAnteriores) => {
        if (
          descartadasAnteriores.includes(
            idNormalizado
          )
        ) {
          return descartadasAnteriores;
        }

        const actualizadas = [
          ...descartadasAnteriores,
          idNormalizado,
        ];

        guardarLocalStorage(
          DESCARTADAS_KEY,
          actualizadas
        );

        return actualizadas;
      }
    );
  };

  const irAAlerta = (alerta) => {
    const link = String(
      alerta?.link || ""
    ).trim();

    setPanelOpen(false);

    if (!link) {
      return;
    }

    if (link.startsWith("/")) {
      navigate(link);
      return;
    }

    navigate(`/${link}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-[92px] items-center justify-between bg-[#F8FAFC] px-4 md:px-6 lg:px-7">
      <div className="flex min-w-0 items-center gap-3">
        {!esTaxista && (
          <button
            type="button"
            onClick={
              onOpenMobileMenu
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={23} />
          </button>
        )}

        <div className="min-w-0">
          <h2 className="truncate text-xl font-black text-slate-950 md:text-[28px]">
            ¡Bienvenido,{" "}
            {user?.first_name ||
              user?.username ||
              "Usuario"}
            !
          </h2>
        </div>
      </div>

      {!esTaxista && (
        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          <div className="hidden h-12 items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm md:flex">
            <span>{fechaActual}</span>

            <CalendarDays
              size={18}
              className="text-slate-600"
            />
          </div>

          <div
            ref={panelRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setPanelOpen(
                  (estado) => !estado
                )
              }
              className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label="Notificaciones"
              aria-expanded={panelOpen}
            >
              <Bell
                size={21}
                className={
                  swinging
                    ? "animate-swing"
                    : ""
                }
              />

              {notifCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-sky-500 px-1 text-xs font-black text-white">
                  {notifCount > 9
                    ? "9+"
                    : notifCount}
                </span>
              )}
            </button>

            {panelOpen && (
              <section className="absolute right-0 top-[calc(100%+0.5rem)] z-50 flex max-h-[70vh] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <header className="bg-sky-500 px-5 py-4 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-black">
                        Notificaciones
                      </h3>

                      <p className="mt-0.5 text-xs font-semibold text-sky-50">
                        Alertas pendientes
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPanelOpen(false)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
                      aria-label="Cerrar notificaciones"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </header>

                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {!alertasVisibles.length ? (
                    <p className="py-6 text-center text-sm font-semibold text-slate-400">
                      No hay notificaciones
                    </p>
                  ) : (
                    alertasVisibles.map(
                      (alerta, index) => {
                        const id =
                          idAlerta(
                            alerta,
                            index
                          );

                        const estilo =
                          SEVERIDAD[
                            alerta?.severidad
                          ] ||
                          SEVERIDAD.info;

                        const Icono =
                          iconoPorTipo(
                            alerta?.tipo
                          );

                        return (
                          <article
                            key={id}
                            className="rounded-2xl border border-slate-200 bg-white p-4"
                            style={{
                              borderLeft: `4px solid ${estilo.color}`,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                                style={{
                                  backgroundColor: `${estilo.color}22`,
                                  color:
                                    estilo.color,
                                }}
                              >
                                <Icono
                                  size={20}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${estilo.chip}`}
                                  >
                                    {
                                      estilo.label
                                    }
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      descartar(
                                        id
                                      )
                                    }
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                    aria-label="Descartar notificación"
                                  >
                                    <X
                                      size={15}
                                    />
                                  </button>
                                </div>

                                <p className="mt-2 text-sm font-semibold text-slate-700">
                                  {alerta?.mensaje ||
                                    "Notificación pendiente."}
                                </p>

                                {alerta?.link && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      irAAlerta(
                                        alerta
                                      )
                                    }
                                    className="mt-3 text-xs font-black text-sky-600 transition hover:text-sky-700"
                                  >
                                    Ver detalle
                                  </button>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      }
                    )
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;