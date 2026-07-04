import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Menu,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";

const DESCARTADAS_KEY = "notif_descartadas";

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
  localStorage.setItem(
    DESCARTADAS_KEY,
    JSON.stringify(ids)
  );
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

  const rolNormalizado = obtenerRolNormalizado(
    rol,
    user
  );

  const esTaxista =
    rolNormalizado === "taxista";

  const [alertas, setAlertas] = useState([]);
  const [descartadas, setDescartadas] = useState(
    () => leerDescartadas()
  );
  const [panelOpen, setPanelOpen] = useState(false);

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
        const { data } = await api.get(
          "mantenimiento/alertas/"
        );

        if (!activo) return;

        const lista = Array.isArray(data)
          ? data
          : data?.results ?? [];

        const vencidas = lista.filter(
          (alerta) => {
            if (
              alerta?.estado === "vencido" ||
              alerta?.nivel === "danger"
            ) {
              return true;
            }

            if (
              alerta?.km_actual != null &&
              alerta?.km_proximo_mantenimiento != null
            ) {
              return (
                alerta.km_actual >=
                alerta.km_proximo_mantenimiento
              );
            }

            return true;
          }
        );

        setAlertas(vencidas);
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

    document.addEventListener(
      "mousedown",
      handleClickFuera
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickFuera
      );
    };
  }, [panelOpen]);

  const idAlerta = (alerta, index) =>
    String(alerta?.id ?? index);

  const alertasVisibles = alertas.filter(
    (alerta, index) =>
      !descartadas.includes(
        idAlerta(alerta, index)
      )
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
              "Usuario"}
            !
          </h2>

          <p className="mt-1 truncate text-sm font-medium text-slate-500 md:text-base">
            {esTaxista
              ? "Control de tu jornada diaria"
              : "Resumen general del sistema"}
          </p>
        </div>
      </div>

      {!esTaxista && (
        <div className="flex items-center gap-4">
          <div className="hidden h-12 items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm md:flex">
            <span>{obtenerFechaTexto()}</span>
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
                setPanelOpen((prev) => !prev)
              }
              className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label="Notificaciones"
            >
              <Bell size={21} />

              {notifCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white">
                  {notifCount > 9
                    ? "9+"
                    : notifCount}
                </span>
              )}
            </button>

            {panelOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 flex max-h-[70vh] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="bg-red-500 px-5 py-4 text-white">
                  <h3 className="text-base font-black">
                    Notificaciones pendientes
                  </h3>

                  <p className="mt-0.5 text-xs font-semibold text-red-50">
                    Mantenimientos vencidos —
                    Revisión requerida
                  </p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {alertasVisibles.length === 0 ? (
                    <p className="py-6 text-center text-sm font-semibold text-slate-400">
                      No hay notificaciones
                      pendientes
                    </p>
                  ) : (
                    alertasVisibles.map(
                      (alerta, index) => {
                        const id = idAlerta(
                          alerta,
                          index
                        );

                        const placa =
                          alerta.placa ||
                          alerta.vehiculo_placa ||
                          "—";

                        return (
                          <div
                            key={id}
                            className="rounded-2xl border border-red-200 bg-red-50 p-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                                <AlertTriangle
                                  size={20}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-black text-red-700">
                                    Mantenimiento
                                    vencido
                                  </p>

                                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-black text-red-700">
                                    Requiere atención
                                  </span>
                                </div>

                                <p className="mt-2 text-sm font-semibold text-slate-700">
                                  El vehículo "
                                  {placa}" tiene
                                  mantenimiento
                                  vencido.
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    descartar(id)
                                  }
                                  className="mt-3 w-full rounded-xl bg-red-500 px-4 py-2 text-xs font-black text-white transition hover:bg-red-600"
                                >
                                  Entendido
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )
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
