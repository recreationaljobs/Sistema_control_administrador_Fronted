// src/modules/conductores/pages/MiPerfilConductorPage.jsx

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

import {
  useEffect,
  useState,
} from "react";

import api from "../../../api/axios";

const normalizarLista = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return "No registrada";
  }

  const valor = String(fecha).slice(0, 10);
  const partes = valor.split("-");

  if (partes.length !== 3) {
    return valor;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const calcularDiasVencimiento = (
  fecha
) => {
  if (!fecha) {
    return null;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const vencimiento = new Date(
    `${String(fecha).slice(0, 10)}T00:00:00`
  );

  return Math.ceil(
    (vencimiento.getTime() -
      hoy.getTime()) /
      86_400_000
  );
};

const CampoPerfil = ({
  icono: Icono,
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icono size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
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
  const dias =
    calcularDiasVencimiento(fecha);

  if (dias === null) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
        Sin vencimiento registrado
      </div>
    );
  }

  if (dias < 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        <AlertTriangle size={21} />

        <div>
          <p className="font-black">
            Licencia vencida
          </p>

          <p className="text-xs font-semibold">
            Hace {Math.abs(dias)} días
          </p>
        </div>
      </div>
    );
  }

  if (dias <= 30) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
        <AlertTriangle size={21} />

        <div>
          <p className="font-black">
            Próxima a vencer
          </p>

          <p className="text-xs font-semibold">
            {dias === 0
              ? "Vence hoy"
              : `${dias} días restantes`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
      <BadgeCheck size={21} />

      <div>
        <p className="font-black">
          Licencia vigente
        </p>

        <p className="text-xs font-semibold">
          {dias} días restantes
        </p>
      </div>
    </div>
  );
};

const MiPerfilConductorPage = () => {
  const [conductor, setConductor] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let activo = true;

    const cargarPerfil = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/conductores/"
        );

        const lista = normalizarLista(
          response.data
        );

        if (!activo) {
          return;
        }

        if (!lista.length) {
          setError(
            "No tienes un perfil de conductor asociado."
          );

          return;
        }

        setConductor(lista[0]);
      } catch (requestError) {
        console.error(
          "Error al cargar perfil:",
          requestError
        );

        if (!activo) {
          return;
        }

        setError(
          requestError?.response?.data
            ?.detail ||
            "No se pudo cargar tu perfil."
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
            size={36}
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
      <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertTriangle
          size={34}
          className="mx-auto text-red-500"
        />

        <h1 className="mt-3 text-lg font-black text-red-800">
          Perfil no disponible
        </h1>

        <p className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      </div>
    );
  }

  const nombreCompleto =
    conductor.nombre_completo ||
    `${conductor.nombre || ""} ${
      conductor.apellido || ""
    }`.trim() ||
    "Conductor";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-[28px] bg-slate-950 shadow-lg">
        <div className="h-1.5 bg-yellow-400" />

        <div className="flex flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:px-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-yellow-400 text-slate-950">
            <UserRound size={38} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-400">
              Mi perfil
            </p>

            <h1 className="mt-1 truncate text-2xl font-black text-white sm:text-3xl">
              {nombreCompleto}
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-400">
              {conductor.sucursal_nombre ||
                "Sin sucursal"}
            </p>
          </div>

          <div className="sm:ml-auto">
            <span
              className={`inline-flex rounded-full border px-4 py-2 text-sm font-black ${
                conductor.activo !== false
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-red-400/30 bg-red-400/10 text-red-300"
              }`}
            >
              {conductor.activo !== false
                ? "Activo"
                : "Inactivo"}
            </span>
          </div>
        </div>
      </section>

      <EstadoLicencia
        fecha={
          conductor.fecha_vencimiento_licencia
        }
      />

      <section>
        <h2 className="mb-4 text-lg font-black text-slate-950">
          Datos personales
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <CampoPerfil
            icono={UserRound}
            label="Nombre"
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
              conductor.sucursal_nombre
            }
          />

          <CampoPerfil
            icono={UserRound}
            label="Usuario"
            value={
              conductor.usuario_username
            }
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-black text-slate-950">
          Licencia
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <CampoPerfil
            icono={CreditCard}
            label="Número"
            value={
              conductor.numero_licencia
            }
          />

          <CampoPerfil
            icono={CalendarDays}
            label="Emisión"
            value={formatearFecha(
              conductor.fecha_inicio_licencia
            )}
          />

          <CampoPerfil
            icono={CalendarDays}
            label="Vencimiento"
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