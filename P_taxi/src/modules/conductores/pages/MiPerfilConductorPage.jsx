import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CalendarDays,
  CreditCard,
  IdCard,
  LoaderCircle,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import api from "../../../api/axios";

const normalizarLista = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const formatearFecha = (fecha) => {
  if (!fecha) return "No registrada";

  const [year, month, day] = String(fecha).split("T")[0].split("-");

  if (!year || !month || !day) return fecha;

  return `${day}/${month}/${year}`;
};

const calcularDiasVencimiento = (fecha) => {
  if (!fecha) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const vencimiento = new Date(`${fecha}T00:00:00`);

  return Math.ceil(
    (vencimiento.getTime() - hoy.getTime()) /
      (1000 * 60 * 60 * 24)
  );
};

const CampoPerfil = ({ icono: Icono, label, value }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icono size={19} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-bold text-slate-900">
            {value || "No registrado"}
          </p>
        </div>
      </div>
    </div>
  );
};

const EstadoLicencia = ({ fecha }) => {
  const dias = calcularDiasVencimiento(fecha);

  if (dias === null) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-bold text-slate-500">
          No hay fecha de vencimiento registrada.
        </p>
      </div>
    );
  }

  if (dias < 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
        <AlertTriangle size={22} />

        <div>
          <p className="font-black">Licencia vencida</p>
          <p className="text-sm font-semibold">
            Venció hace {Math.abs(dias)} días.
          </p>
        </div>
      </div>
    );
  }

  if (dias === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
        <AlertTriangle size={22} />

        <div>
          <p className="font-black">La licencia vence hoy</p>
          <p className="text-sm font-semibold">
            Debes renovarla lo antes posible.
          </p>
        </div>
      </div>
    );
  }

  if (dias <= 30) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
        <AlertTriangle size={22} />

        <div>
          <p className="font-black">Licencia próxima a vencer</p>
          <p className="text-sm font-semibold">
            Faltan {dias} días para su vencimiento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
      <BadgeCheck size={22} />

      <div>
        <p className="font-black">Licencia vigente</p>
        <p className="text-sm font-semibold">
          Faltan {dias} días para su vencimiento.
        </p>
      </div>
    </div>
  );
};

const MiPerfilConductorPage = () => {
  const [conductor, setConductor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarPerfil = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/conductores/");
        const conductores = normalizarLista(response.data);
        const perfil = conductores[0] || null;

        if (!activo) return;

        if (!perfil) {
          setError(
            "Tu cuenta no tiene un perfil de conductor asociado."
          );
          return;
        }

        setConductor(perfil);
      } catch (err) {
        console.error(
          "Error al cargar el perfil del conductor:",
          err?.response?.data || err
        );

        if (!activo) return;

        setError(
          err?.response?.data?.detail ||
            "No se pudo cargar la información de tu perfil."
        );
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargarPerfil();

    return () => {
      activo = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={38}
            className="mx-auto animate-spin text-yellow-500"
          />

          <p className="mt-3 text-sm font-bold text-slate-500">
            Cargando perfil...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertTriangle
          size={36}
          className="mx-auto text-red-500"
        />

        <h1 className="mt-4 text-xl font-black text-red-800">
          No se pudo mostrar el perfil
        </h1>

        <p className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      </div>
    );
  }

  const nombreCompleto =
    conductor.nombre_completo ||
    `${conductor.nombre || ""} ${conductor.apellido || ""}`.trim() ||
    "Conductor";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-950 shadow-lg">
        <div className="relative px-5 py-7 sm:px-8 sm:py-9">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-yellow-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-yellow-400 text-slate-950 shadow-lg">
              <UserRound size={38} />
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-widest text-yellow-400">
                Mi perfil
              </p>

              <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                {nombreCompleto}
              </h1>

              <p className="mt-2 text-sm font-semibold text-slate-300">
                Información personal y datos de licencia.
              </p>
            </div>

            <div className="sm:ml-auto">
              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-black ${
                  conductor.activo
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-red-400/15 text-red-300"
                }`}
              >
                {conductor.activo
                  ? "Conductor activo"
                  : "Conductor inactivo"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <EstadoLicencia
        fecha={conductor.fecha_vencimiento_licencia}
      />

      <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-950">
            Datos personales
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Información registrada por el administrador.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <CampoPerfil
            icono={UserRound}
            label="Nombre completo"
            value={nombreCompleto}
          />

          <CampoPerfil
            icono={IdCard}
            label="Cédula"
            value={conductor.cedula}
          />

          <CampoPerfil
            icono={Phone}
            label="Teléfono"
            value={conductor.telefono}
          />

          <CampoPerfil
            icono={MapPin}
            label="Dirección"
            value={conductor.direccion}
          />

          <CampoPerfil
            icono={Building2}
            label="Sucursal"
            value={
              conductor.sucursal_nombre ||
              "Sin sucursal asignada"
            }
          />

          <CampoPerfil
            icono={UserRound}
            label="Usuario"
            value={
              conductor.usuario_username ||
              "Sin usuario asociado"
            }
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-950">
            Licencia de conducir
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Información vigente de la licencia.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <CampoPerfil
            icono={CreditCard}
            label="Número de licencia"
            value={conductor.numero_licencia}
          />

          <CampoPerfil
            icono={CalendarDays}
            label="Fecha de emisión"
            value={formatearFecha(
              conductor.fecha_inicio_licencia
            )}
          />

          <CampoPerfil
            icono={CalendarDays}
            label="Fecha de vencimiento"
            value={formatearFecha(
              conductor.fecha_vencimiento_licencia
            )}
          />
        </div>
      </section>
    </div>
  );
};

export default MiPerfilConductorPage;