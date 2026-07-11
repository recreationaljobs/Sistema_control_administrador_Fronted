import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  IdCard,
  Menu,
  Wrench,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";

const DESCARTADAS_KEY = "notif_descartadas";
const LAST_COUNT_KEY = "taxiadmin_last_alert_count";

// Estilos por severidad de la alerta.
const SEVERIDAD = {
  info: {
    color: "#38BDF8",
    chip: "bg-sky-100 text-sky-700",
    label: "Info",
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

const iconoPorTipo = (tipo) => {
  if (tipo === "licencia_vencimiento") {
    return IdCard;
  }

  if (tipo === "mantenimiento_km") {
    return Wrench;
  }

  return AlertTriangle;
};

const leerDescartadas = () => {
  try {
    const raw = localStorage.getItem(DESCARTADAS_KEY);
    const lista = raw ? JSON.parse(raw) : [];

    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
};

const guardarDescartadas = (ids) => {
  localStorage.setItem(DESCARTADAS_KEY, JSON.stringify(ids));
};

const obtenerRolNormalizado = (rol, user) => {
  const valor = String(
    rol ||
      user?.rol_codigo ||
      user?.rol?.codigo ||
      user?.rol ||
      ""
  )
    .trim()
    .toLowerCase();

  if (
    valor === "admin" ||
    valor === "administrador" ||
    valor === "administrador de sucursal"
  ) {
    return "admin_sucursal";
  }

  if (valor === "super_admin") {
    return "superadmin";
  }

  return valor;
};

const obtenerFechaTexto = () => {
  return new Intl.DateTimeFormat("es-NI", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
};

const Navbar = ({ onOpenMobileMenu }) => {
  const { rol, user } = useAuth();
  const navigate = useNavigate();

  const rolNormalizado = obtenerRolNormalizado(rol, user);
  const esTaxista = rolNormalizado === "taxista";

  const [alertas, setAlertas] = useState([]);
  const [descartadas, setDescartadas] = useState(() => leerDescartadas());
  const [panelOpen, setPanelOpen] = useState(false);
  const [swinging, setSwinging] = useState(false);

  const panelRef = useRef(null);

  useEffect(() => {
    if (esTaxista) {
      setAlertas([]);
      setPanelOpen(false);
      return undefined;
    }

    let activo = true;

    const cargarAlertas = async () => {
      try {
        const { data } = await api.get("mantenimiento/alertas/");

        if (!activo) return;

        const lista = Array.isArray(data) ? data : data?.results ?? [];

        setAlertas(lista);

        // Dispara la animación cuando el total crece respecto al último visto.
        const previo = Number(
          localStorage.getItem(LAST_COUNT_KEY) || 0
        );

        if (lista.length > previo) {
          setSwinging(true);
          setTimeout(() => {
            if (activo) setSwinging(false);
          }, 1000);
        }

        localStorage.setItem(LAST_COUNT_KEY, String(lista.length));
      } catch {
        if (activo) {
          setAlertas([]);
        }
      }
    };

    cargarAlertas();

    return () => {
      activo = false;
    };
  }, [esTaxista]);

  useEffect(() => {
    if (!panelOpen) return undefined;

    const handleClickFuera = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target)
      ) {
        setPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickFuera);

    return () => {
      document.removeEventListener("mousedown", handleClickFuera);
    };
  }, [panelOpen]);

  const idAlerta = (alerta, index) => String(alerta?.id ?? index);

  const alertasVisibles = alertas.filter(
    (alerta, index) => !descartadas.includes(idAlerta(alerta, index))
  );

  const notifCount = alertasVisibles.length;

  const descartar = (id) => {
    setDescartadas((prev) => {
      if (prev.includes(id)) {
        return prev;
      }

      const actualizadas = [...prev, id];
      guardarDescartadas(actualizadas);

      return actualizadas;
    });
  };

  const irAAlerta = (alerta) => {
    const destino = String(alerta?.link || "")
      .split("/")
      .filter(Boolean)[0];

    setPanelOpen(false);

    if (destino) {
      navigate(`/${destino}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-[92px] items-center justify-between bg-[#F8FAFC] px-4 md:px-6 lg:px-7">
      <div className="flex min-w-0 items-center gap-3">
        

        <div className="min-w-0">
          <h2 className="truncate text-xl font-black text-slate-950 md:text-[28px]">
            ¡Bienvenido,{" "}
            {user?.first_name || user?.username || "Usuario"}!
          </h2>
          {/* <p className="mt-1 truncate text-sm font-medium text-slate-500 md:text-base">
            {esTaxista
              ? "Control de tu jornada diaria"
              : "Resumen general del sistema"}
          </p> */}
        </div>
      </div>

      {!esTaxista && (
        <div className="flex items-center gap-4">
          <div className="hidden h-12 items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm md:flex">
            <span>{obtenerFechaTexto()}</span>
            <CalendarDays size={18} className="text-slate-600" />
          </div>

          <div ref={panelRef} className="relative">
            <button
              type="button"
              onClick={() => setPanelOpen((prev) => !prev)}
              className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label="Notificaciones"
            >
              <Bell
                size={21}
                className={swinging ? "animate-swing" : ""}
              />

              {notifCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-6 min-w-6 animate-pulse items-center justify-center rounded-full px-1 text-xs font-black text-white"
                  style={{ backgroundColor: "#38BDF8" }}
                >
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </button>

            {panelOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 flex max-h-[70vh] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div
                  className="px-5 py-4 text-white"
                  style={{ backgroundColor: "#38BDF8" }}
                >
                  <h3 className="text-base font-black">
                    Notificaciones
                  </h3>

                  <p className="mt-0.5 text-xs font-semibold text-sky-50">
                    Mantenimiento y vencimiento de licencias
                  </p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {alertasVisibles.length === 0 ? (
                    <p className="py-6 text-center text-sm font-semibold text-slate-400">
                      No hay notificaciones pendientes
                    </p>
                  ) : (
                    alertasVisibles.map((alerta, index) => {
                      const id = idAlerta(alerta, index);
                      const estilo =
                        SEVERIDAD[alerta.severidad] || SEVERIDAD.info;
                      const Icono = iconoPorTipo(alerta.tipo);

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => irAAlerta(alerta)}
                          className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
                          style={{
                            borderLeft: `4px solid ${estilo.color}`,
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                              style={{
                                backgroundColor: `${estilo.color}22`,
                                color: estilo.color,
                              }}
                            >
                              <Icono size={20} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${estilo.chip}`}
                                >
                                  {estilo.label}
                                </span>

                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    descartar(id);
                                  }}
                                  onKeyDown={(event) => {
                                    if (
                                      event.key === "Enter" ||
                                      event.key === " "
                                    ) {
                                      event.stopPropagation();
                                      descartar(id);
                                    }
                                  }}
                                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                  aria-label="Descartar notificación"
                                >
                                  <X size={15} />
                                </span>
                              </div>

                              <p className="mt-2 text-sm font-semibold text-slate-700">
                                {alerta.mensaje ||
                                  "Tienes una notificación pendiente."}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
