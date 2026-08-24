import {
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Search,
  Terminal,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getMovimientosAuditoria,
} from "../services/auditoriaService";

const REGISTROS_POR_PAGINA = 15;

const normalizarLista = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const formatoFechaHora = (fecha) => {
  if (!fecha) {
    return "-";
  }

  return new Date(fecha).toLocaleString(
    "es-NI",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const obtenerMensajeError = (error) => {
  const data = error?.response?.data;

  if (data?.detail) {
    return data.detail;
  }

  if (typeof data === "string") {
    return data;
  }

  return "No se pudieron cargar los movimientos.";
};

const CONFIG_ACCION = {
  crear: {
    etiqueta: "CREAR",
    color: "text-emerald-400",
  },

  editar: {
    etiqueta: "EDITAR",
    color: "text-sky-400",
  },

  eliminar: {
    etiqueta: "ELIMINAR",
    color: "text-rose-400",
  },

  acceso: {
    etiqueta: "ACCESO",
    color: "text-violet-400",
  },

  cierre_sesion: {
    etiqueta: "SALIR",
    color: "text-slate-300",
  },

  estado: {
    etiqueta: "ESTADO",
    color: "text-amber-400",
  },
};

const AuditoriaPage = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pagina, setPagina] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const [busqueda, setBusqueda] = useState("");
  const [accion, setAccion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [
    filtrosAplicados,
    setFiltrosAplicados,
  ] = useState({});

  const cargarMovimientos = useCallback(
    async (
      paginaSolicitada = 1,
      filtros = {}
    ) => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMovimientosAuditoria({
            page: paginaSolicitada,
            page_size: REGISTROS_POR_PAGINA,
            ...filtros,
          });

        const lista = normalizarLista(data);

        setMovimientos(lista);

        setTotalRegistros(
          Number(
            data?.count ?? lista.length
          )
        );

        setPagina(paginaSolicitada);
      } catch (err) {
        setMovimientos([]);
        setTotalRegistros(0);

        setError(
          obtenerMensajeError(err)
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    cargarMovimientos(1, {});
  }, [cargarMovimientos]);

  const totalPaginas = useMemo(() => {
    if (!totalRegistros) {
      return 1;
    }

    return Math.ceil(
      totalRegistros / REGISTROS_POR_PAGINA
    );
  }, [totalRegistros]);

  const ejecutarConsulta = () => {
    const filtros = {};

    if (busqueda.trim()) {
      filtros.buscar =
        busqueda.trim();
    }

    if (accion) {
      filtros.accion = accion;
    }

    if (fechaInicio) {
      filtros.fecha_inicio =
        fechaInicio;
    }

    if (fechaFin) {
      filtros.fecha_fin = fechaFin;
    }

    setFiltrosAplicados(filtros);

    cargarMovimientos(1, filtros);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setAccion("");
    setFechaInicio("");
    setFechaFin("");
    setFiltrosAplicados({});

    cargarMovimientos(1, {});
  };

  const irPaginaAnterior = () => {
    if (pagina <= 1 || loading) {
      return;
    }

    cargarMovimientos(
      pagina - 1,
      filtrosAplicados
    );
  };

  const irPaginaSiguiente = () => {
    if (
      pagina >= totalPaginas ||
      loading
    ) {
      return;
    }

    cargarMovimientos(
      pagina + 1,
      filtrosAplicados
    );
  };

  return (
    <div className="w-full">
      <section className="min-h-[650px] overflow-hidden rounded-xl border border-slate-700 bg-black shadow-2xl shadow-slate-950">
        <header className="flex h-12 items-center justify-between border-b border-slate-700 bg-[#151515] px-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#0C5A9E] text-white">
              <Terminal size={16} />
            </div>

            <span className="font-mono text-sm font-semibold text-white">
              Windows PowerShell
            </span>
          </div>

          <div className="flex items-center gap-5 text-sm text-slate-300">
            <span>—</span>
            <span>□</span>
            <span>×</span>
          </div>
        </header>

        <div className="bg-black p-4 font-mono sm:p-6">
          <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-bold text-sky-400">
              PS
            </span>

            <span className="text-slate-200">
              C:\TaxiAdmin\Auditoria&gt;
            </span>

            <span className="text-white">
              Get-Movimientos
            </span>

            <span className="text-slate-500">
              --todos
            </span>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 border-y border-slate-800 py-4 xl:grid-cols-[1.4fr_0.85fr_0.75fr_0.75fr_auto_auto]">
            <label className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                type="search"
                value={busqueda}
                onChange={(event) =>
                  setBusqueda(
                    event.target.value
                  )
                }
                placeholder="buscar usuario, módulo o descripción"
                className="h-10 w-full border border-slate-700 bg-[#111111] pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-sky-500"
              />
            </label>

            <select
              value={accion}
              onChange={(event) =>
                setAccion(
                  event.target.value
                )
              }
              className="h-10 cursor-pointer border border-slate-700 bg-[#111111] px-3 text-xs text-slate-200 outline-none focus:border-sky-500"
            >
              <option value="">
                Todas las acciones
              </option>

              <option value="crear">
                Crear
              </option>

              <option value="editar">
                Editar
              </option>

              <option value="eliminar">
                Eliminar
              </option>

              <option value="acceso">
                Inicio de sesión
              </option>

              <option value="cierre_sesion">
                Cierre de sesión
              </option>
            </select>

            <input
              type="date"
              value={fechaInicio}
              onChange={(event) =>
                setFechaInicio(
                  event.target.value
                )
              }
              className="h-10 cursor-pointer border border-slate-700 bg-[#111111] px-3 text-xs text-slate-200 outline-none [color-scheme:dark] focus:border-sky-500"
              aria-label="Fecha inicial"
            />

            <input
              type="date"
              value={fechaFin}
              onChange={(event) =>
                setFechaFin(
                  event.target.value
                )
              }
              className="h-10 cursor-pointer border border-slate-700 bg-[#111111] px-3 text-xs text-slate-200 outline-none [color-scheme:dark] focus:border-sky-500"
              aria-label="Fecha final"
            />

            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 border border-slate-700 bg-[#111111] px-4 text-xs font-bold text-slate-300 transition hover:border-slate-500 hover:bg-[#202020]"
            >
              <X size={15} />
              Limpiar
            </button>

            <button
              type="button"
              onClick={ejecutarConsulta}
              disabled={loading}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 bg-[#0C5A9E] px-4 text-xs font-bold text-white transition hover:bg-[#0E76C7] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Ejecutar
            </button>
          </div>

          <div className="mb-4 flex flex-wrap gap-x-2 gap-y-1 text-sm">
            <span className="font-bold text-sky-400">
              PS
            </span>

            <span className="text-slate-200">
              C:\TaxiAdmin\Auditoria&gt;
            </span>

            <span className="text-white">
              Resultado:
            </span>

            <span className="text-slate-500">
              {totalRegistros} registro(s)
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 py-8 text-sm text-sky-300">
              <RefreshCcw
                size={18}
                className="animate-spin"
              />
              Consultando movimientos...
            </div>
          ) : error ? (
            <div className="border-l-2 border-rose-500 bg-[#180C0F] px-4 py-3 text-xs text-rose-300">
              ERROR: {error}
            </div>
          ) : movimientos.length === 0 ? (
            <p className="py-8 text-sm text-amber-300">
              No se encontraron movimientos con los filtros actuales.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[850px]">
                <div className="grid grid-cols-[170px_140px_110px_160px_1fr] gap-4 border-b border-slate-700 pb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <span>Fecha y hora</span>
                  <span>Usuario</span>
                  <span>Acción</span>
                  <span>Módulo</span>
                  <span>Descripción</span>
                </div>

                <div className="divide-y divide-slate-900">
                  {movimientos.map(
                    (movimiento) => {
                      const configuracion =
                        CONFIG_ACCION[
                          movimiento.accion
                        ] ||
                        {
                          etiqueta: "EVENTO",
                          color: "text-slate-300",
                        };

                      return (
                        <article
                          key={movimiento.id}
                          className="grid grid-cols-[170px_140px_110px_160px_1fr] gap-4 py-4 text-xs transition hover:bg-[#111111]"
                        >
                          <span className="text-slate-500">
                            {formatoFechaHora(
                              movimiento.fecha
                            )}
                          </span>

                          <span className="font-bold text-amber-300">
                            {movimiento.usuario_nombre ||
                              "Sistema"}
                          </span>

                          <span className={`font-bold ${configuracion.color}`}>
                            [{configuracion.etiqueta}]
                          </span>

                          <span className="text-sky-300">
                            {movimiento.modulo || "-"}
                          </span>

                          <span className="break-words leading-5 text-slate-300">
                            {movimiento.descripcion ||
                              "Sin descripción disponible."}
                          </span>
                        </article>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-sky-400">
                  PS
                </span>

                <span className="text-slate-200">
                  C:\TaxiAdmin\Auditoria&gt;
                </span>

                <span className="h-5 w-2 animate-pulse bg-slate-200" />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={irPaginaAnterior}
                  disabled={
                    loading ||
                    pagina <= 1
                  }
                  title="Página anterior"
                  aria-label="Página anterior"
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center border border-slate-700 bg-[#111111] text-slate-200 transition hover:border-sky-500 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="min-w-20 text-center text-xs text-slate-400">
                  {pagina} / {totalPaginas}
                </span>

                <button
                  type="button"
                  onClick={irPaginaSiguiente}
                  disabled={
                    loading ||
                    pagina >= totalPaginas
                  }
                  title="Página siguiente"
                  aria-label="Página siguiente"
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center border border-slate-700 bg-[#111111] text-slate-200 transition hover:border-sky-500 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AuditoriaPage;