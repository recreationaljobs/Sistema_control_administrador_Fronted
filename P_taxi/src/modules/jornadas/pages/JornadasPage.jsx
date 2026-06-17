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
    pagoConductoresTotal,
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
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 md:text-[28px]">
            Jornadas
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
            {esTaxista
              ? "Registra tu kilometraje diario y consulta tus jornadas, kilómetros recorridos y ganancias."
              : "Registra ingresos diarios, kilometraje recorrido y resultados financieros."}
          </p>
        </div>

        {esTaxista && (
            <button
              type="button"
              onClick={handleBotonTaxista}
              disabled={Boolean(jornadaCerradaHoy)}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black shadow-md transition ${
                jornadaCerradaHoy
                  ? "cursor-not-allowed bg-slate-200 text-slate-500 shadow-none"
                  : "bg-[#F5B800] text-white shadow-yellow-100 hover:bg-[#DFA600]"
              }`}
            >
              <Plus size={20} />
              {jornadaCerradaHoy
                ? "Jornada cerrada hoy"
                : jornadaAbiertaHoy
                ? "Cerrar jornada"
                : "Registrar kilometraje"}
            </button>
          )}
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {esTaxista ? (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4CF] text-[#E7A900]">
                <CalendarDays size={28} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-500">
                  Mis jornadas
                </p>

                <h3 className="mt-1 text-3xl font-black text-slate-950">
                  {totalJornadas}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <Gauge size={28} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-500">
                  Kilómetros recorridos
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-950">
                  {Number(kilometrosTotal || 0).toLocaleString()} km
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Wallet size={28} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-500">
                  Mis ganancias
                </p>

                <h3 className="mt-1 text-xl font-black text-blue-600">
                  {formatoDinero(pagoConductoresTotal)}
                </h3>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4CF] text-[#E7A900]">
                <CalendarDays size={28} />
              </div>

              <div>
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
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Wallet size={28} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-500">
                  Ingreso bruto
                </p>

                <h3 className="mt-1 text-xl font-black text-green-600">
                  {formatoDinero(ingresoTotal)}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4CF] text-[#B98200]">
                <TrendingUp size={28} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-500">
                  Ganancias del Dueño
                </p>

                <h3 className="mt-1 text-xl font-black text-[#B98200]">
                  {formatoDinero(gananciaTotal)}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <Gauge size={28} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-500">
                  Kilómetros
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-950">
                  {Number(kilometrosTotal || 0).toLocaleString()} km
                </h3>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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