// src/modules/jornadas/pages/JornadasPage.jsx

import {
  CalendarDays,
  CarFront,
  Gauge,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";

import JornadaModal from "../components/JornadaModal";
import JornadaTable from "../components/JornadaTable";
import ActivarNotificaciones from "../components/ActivarNotificaciones";
import { useJornadas } from "../hooks/useJornadas";

const formatoDinero = (valor) => {
  return `C$ ${Number(
    valor || 0
  ).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatoFecha = (fecha) => {
  if (!fecha) {
    return "Sin fecha";
  }

  const fechaNormalizada = String(
    fecha
  ).slice(0, 10);

  const date = new Date(
    `${fechaNormalizada}T00:00:00`
  );

  return date.toLocaleDateString(
    "es-NI",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  );
};

const obtenerVehiculoTexto = (
  jornada
) => {
  const numero =
    jornada?.vehiculo_numero ||
    jornada?.vehiculo?.numero ||
    jornada?.vehiculo_codigo ||
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
    "Vehículo no disponible"
  );
};

const obtenerKilometrosRecorridos = (
  jornada
) => {
  if (
    jornada?.kilometros_recorridos !==
      null &&
    jornada?.kilometros_recorridos !==
      undefined &&
    jornada?.kilometros_recorridos !==
      ""
  ) {
    return Number(
      jornada.kilometros_recorridos ||
        0
    );
  }

  const kilometrajeInicial =
    Number(
      jornada?.kilometraje_inicial ||
        0
    );

  const kilometrajeFinal =
    Number(
      jornada?.kilometraje_final ||
        0
    );

  if (
    kilometrajeFinal >=
    kilometrajeInicial
  ) {
    return (
      kilometrajeFinal -
      kilometrajeInicial
    );
  }

  return 0;
};

const obtenerGananciaConductor = (
  jornada
) => {
  return Number(
    jornada
      ?.pago_pendiente_conductor ??
      jornada?.pago_conductor ??
      jornada?.ganancia_conductor ??
      0
  );
};

const obtenerEstadoJornada = (
  jornada
) => {
  if (jornada?.liquidada) {
    return {
      texto: "Liquidada",
      clases:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  const tieneKilometrajeFinal =
    jornada?.kilometraje_final !==
      null &&
    jornada?.kilometraje_final !==
      undefined &&
    jornada?.kilometraje_final !==
      "";

  if (tieneKilometrajeFinal) {
    return {
      texto: "Pendiente",
      clases:
        "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    texto: "Jornada abierta",
    clases:
      "border-blue-200 bg-blue-50 text-blue-700",
  };
};

const TarjetaJornadaConductor = ({
  jornada,
}) => {
  const estado =
    obtenerEstadoJornada(jornada);

  const kilometros =
    obtenerKilometrosRecorridos(
      jornada
    );

  const ganancia =
    obtenerGananciaConductor(
      jornada
    );

  const vehiculoTexto =
    obtenerVehiculoTexto(jornada);

  const tieneKilometrajeFinal =
    jornada?.kilometraje_final !==
      null &&
    jornada?.kilometraje_final !==
      undefined &&
    jornada?.kilometraje_final !==
      "";

  const kilometrajeInicialTexto = Number(
    jornada?.kilometraje_inicial || 0
  ).toLocaleString("es-NI");

  const kilometrajeFinalTexto =
    tieneKilometrajeFinal
      ? Number(
          jornada?.kilometraje_final || 0
        ).toLocaleString("es-NI")
      : "Pendiente";

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#F5B800] via-[#FFD659] to-[#F5B800]" />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#D79A00]">
              <CalendarDays
                size={22}
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-950">
                {formatoFecha(
                  jornada.fecha
                )}
              </h3>

             
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-black ${estado.clases}`}
          >
            {estado.texto}
          </span>
        </div>

        <div className="mt-4 rounded-3xl bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4CF] text-slate-700">
              <CarFront
                size={20}
              />
            </div>

            <div className="min-w-0">
              <h4 className="break-words text-sm font-black text-slate-950">
                {vehiculoTexto}
              </h4>

              <p className="mt-1 break-words text-xs text-slate-500">
                {vehiculoTexto}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
              <Gauge size={15} />
              <span>Km</span>
            </div>

            <p className="mt-2 text-sm font-black text-slate-950">
              {Number(
                kilometros || 0
              ).toLocaleString("es-NI")}{" "}
              km
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
              <Gauge size={15} />
              <span>Trayecto</span>
            </div>

            <p className="mt-2 text-xs font-bold text-slate-600">
              {kilometrajeInicialTexto} →{" "}
              {kilometrajeFinalTexto}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[22px] bg-gradient-to-br from-[#DCEBFF] to-[#CFE2FF] p-4">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D4ED8]">
            Acumulado del dia
          </p>

          <h4 className="mt-2 break-words text-3xl font-black leading-none text-[#0F3FAF]">
            {formatoDinero(ganancia)}
          </h4>

          {/* <p className="mt-2 text-xs font-semibold text-[#2563EB]">
            {jornada?.liquidada
              ? "Jornada liquidada"
              : "Pendiente de liquidación"}
          </p> */}
        </div>
      </div>
    </article>
  );
};

const JornadaHoyConductor = ({
  jornadas = [],
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#E7A900] shadow-sm">
          <CalendarDays size={26} />
        </div>

        <p className="mt-3 text-sm font-bold text-slate-500">
          Cargando jornada...
        </p>
      </div>
    );
  }

  if (!jornadas.length) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
          <CalendarDays size={26} />
        </div>

        <h3 className="mt-4 text-base font-black text-slate-900">
          No hay jornada registrada hoy
        </h3>

        <p className="mt-2 text-sm font-medium text-slate-500">
          Presiona Iniciar jornada
          para registrar el
          kilometraje inicial.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jornadas.map(
        (jornada) => (
          <TarjetaJornadaConductor
            key={jornada.id}
            jornada={jornada}
          />
        )
      )}
    </div>
  );
};

const JornadasPage = () => {
  const {
    jornadasFiltradas,
    jornadasHoy,

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
      abrirModalCerrar(
        jornadaAbiertaHoy
      );
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
              ? "Registra el kilometraje inicial y final."
              : "Registra ingresos diarios, kilometraje recorrido y resultados financieros."}
          </p>
        </div>

        {esTaxista && (
          <div className="w-full min-w-0 space-y-3">
            <button
              type="button"
              onClick={handleBotonTaxista}
              disabled={Boolean(
                jornadaCerradaHoy
              )}
              className={`group relative inline-flex w-full min-w-0 items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 px-4 py-4 text-center text-xl font-black shadow-md transition-all duration-300 sm:text-2xl ${
                jornadaCerradaHoy
                  ? "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500 shadow-none"
                  : "border-dashed border-[#FFE080] bg-[#F5B800] text-white shadow-yellow-100 hover:bg-[#DFA600] hover:shadow-lg active:scale-[0.98]"
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

            <ActivarNotificaciones />
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
                  {formatoDinero(
                    ingresoTotal
                  )}
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
                  {formatoDinero(
                    gananciaTotal
                  )}
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
                  ).toLocaleString(
                    "es-NI"
                  )}{" "}
                  km
                </h3>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="w-full min-w-0 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        {esTaxista && (
          <div className="mb-5 min-w-0">
            <h2 className="text-lg font-black text-slate-950">
              Historial de jornadas
            </h2>

            <p className="mt-1 break-words text-sm font-medium text-slate-500">
              Consulta la jornada de hoy.
            </p>
          </div>
        )}

        {esTaxista ? (
          <JornadaHoyConductor
            jornadas={jornadasHoy}
            loading={loading}
          />
        ) : (
          <JornadaTable
            jornadas={jornadasFiltradas}
            loading={loading}
            onEdit={abrirModalEditar}
            onDelete={eliminarJornada}
            esTaxista={esTaxista}
          />
        )}
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