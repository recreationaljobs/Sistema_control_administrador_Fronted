import {
  CalendarDays,
  Gauge,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import JornadaModal from "../components/JornadaModal";
import JornadaTable from "../components/JornadaTable";
import { useJornadas } from "../hooks/useJornadas";

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const JornadasPage = () => {
  const {
    jornadasFiltradas,
    conductores,
    vehiculos,
    asignaciones,

    loading,
    loadingCatalogos,
    saving,

    error,
    modalOpen,
    jornadaEditando,

    totalJornadas,
    ingresoTotal,
    gananciaTotal,
    kilometrosTotal,

    jornadaAbiertaHoy,
    jornadaCerradaHoy,

    esSuperAdmin,
    esAdminSucursal,
    esTaxista,

    abrirModalCrear,
    abrirModalEditar,
    abrirModalCerrar,
    cerrarModal,
    guardarJornada,
    eliminarJornada,
  } = useJornadas();

  const handleBotonTaxista = () => {
    if (jornadaAbiertaHoy) {
      abrirModalCerrar(jornadaAbiertaHoy);
      return;
    }

    abrirModalCrear();
  };

  return (
    <div
      className={`w-full space-y-6 ${
        esTaxista
          ? "mx-auto max-w-md"
          : ""
      }`}
    >
      <section
        className={`flex flex-col gap-4 ${
          esTaxista
            ? ""
            : "lg:flex-row lg:items-center lg:justify-between"
        }`}
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
            Jornadas
          </h1>

          <p className="mt-1 break-words text-sm font-medium text-slate-500 md:text-base">
            {esTaxista
              ? "Registra el kilometraje inicial y cierra tu jornada al finalizar el día."
              : "Registra ingresos diarios, kilometraje recorrido y resultados financieros."}
          </p>
        </div>

        {esTaxista && (
          <div className="relative flex w-full min-w-0">
            {!jornadaCerradaHoy && (
              <>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1.5 rounded-[20px] border-2 border-dashed border-[#F5B800] opacity-80 motion-safe:animate-pulse"
                />

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1.5 rounded-[20px] border border-dashed border-[#F5B800]/50 motion-safe:animate-ping"
                />
              </>
            )}

            <button
              type="button"
              onClick={handleBotonTaxista}
              disabled={Boolean(jornadaCerradaHoy)}
              className={`group relative z-10 inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-2xl px-4 py-4 text-center text-xl font-black shadow-md transition-all duration-300 sm:text-2xl ${
                jornadaCerradaHoy
                  ? "cursor-not-allowed bg-slate-200 text-slate-500 shadow-none"
                  : "bg-[#F5B800] text-white shadow-yellow-100 hover:-translate-y-0.5 hover:bg-[#DFA600] hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
              }`}
            >
              <Plus
                size={30}
                className={
                  jornadaCerradaHoy
                    ? "shrink-0"
                    : "shrink-0 transition-transform duration-300 group-hover:rotate-90"
                }
              />

              <span className="min-w-0 break-words">
                {jornadaCerradaHoy
                  ? "Jornada cerrada hoy"
                  : jornadaAbiertaHoy
                  ? "Cerrar jornada"
                  : "Iniciar jornada"}
              </span>
            </button>
          </div>
        )}
      </section>

      {error && (
        <div className="break-words rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {!esTaxista && (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFF4CF] text-[#E7A900]">
                <CalendarDays size={28} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-500">
                  Total jornadas
                </p>

                <h3 className="mt-1 text-3xl font-black text-slate-950">
                  {totalJornadas}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Wallet size={28} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-500">
                  Ingreso bruto
                </p>

                <h3 className="mt-1 break-words text-xl font-black text-green-600">
                  {formatoDinero(ingresoTotal)}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFF4CF] text-[#B98200]">
                <TrendingUp size={28} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-500">
                  Ganancias del dueño
                </p>

                <h3 className="mt-1 break-words text-xl font-black text-[#B98200]">
                  {formatoDinero(gananciaTotal)}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <Gauge size={28} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-500">
                  Kilómetros
                </p>

                <h3 className="mt-1 break-words text-xl font-black text-slate-950">
                  {Number(
                    kilometrosTotal || 0
                  ).toLocaleString()}{" "}
                  km
                </h3>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        {esTaxista && (
          <div className="mb-5 min-w-0">
            <h2 className="text-lg font-black text-slate-950">
              Historial de jornadas
            </h2>

            <p className="mt-1 break-words text-sm font-medium text-slate-500">
              Consulta las jornadas que has registrado.
            </p>
          </div>
        )}

        <JornadaTable
          jornadas={jornadasFiltradas}
          loading={loading}
          onEdit={abrirModalEditar}
          onCloseJornada={abrirModalCerrar}
          onDelete={eliminarJornada}
          esTaxista={esTaxista}
        />
      </section>

      <JornadaModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarJornada}
        saving={saving}
        loadingCatalogos={loadingCatalogos}
        jornadaEditando={jornadaEditando}
        conductores={conductores}
        vehiculos={vehiculos}
        asignaciones={asignaciones}
        esSuperAdmin={esSuperAdmin}
        esAdminSucursal={esAdminSucursal}
        esTaxista={esTaxista}
      />
    </div>
  );
};

export default JornadasPage;