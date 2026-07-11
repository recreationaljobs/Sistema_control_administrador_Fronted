// src/modules/asignaciones/components/AsignacionForm.jsx

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  CarTaxiFront,
  CheckCircle2,
  Loader2,
  Route,
  UserRound,
} from "lucide-react";

const obtenerFechaLocal = () => {
  const ahora = new Date();
  const diferenciaZona = ahora.getTimezoneOffset() * 60_000;

  return new Date(ahora.getTime() - diferenciaZona)
    .toISOString()
    .split("T")[0];
};

const crearFormularioInicial = () => ({
  conductor: "",
  vehiculo: "",
  fecha_inicio: obtenerFechaLocal(),
  fecha_fin: "",
  activa: true,
});

const obtenerId = (valor) => {
  if (!valor) {
    return "";
  }

  if (typeof valor === "object") {
    return valor.id ? String(valor.id) : "";
  }

  return String(valor);
};

const obtenerNombreConductor = (conductor) => {
  if (!conductor) {
    return "Conductor sin nombre";
  }

  return (
    conductor.nombre_completo ||
    `${conductor.nombre || ""} ${conductor.apellido || ""}`.trim() ||
    "Conductor sin nombre"
  );
};

const obtenerNombreVehiculo = (vehiculo) => {
  if (!vehiculo) {
    return "Vehículo sin información";
  }

  const identificacion = [
    vehiculo.numero,
    vehiculo.placa,
  ]
    .filter(Boolean)
    .join(" - ");

  const descripcion = [
    vehiculo.marca,
    vehiculo.modelo,
  ]
    .filter(Boolean)
    .join(" ");

  return [identificacion, descripcion]
    .filter(Boolean)
    .join(" - ");
};

const estaDisponible = (registro) => {
  const estado = String(
    registro.estado_codigo ||
      registro.estado ||
      ""
  )
    .trim()
    .toUpperCase();

  return (
    registro.activo !== false &&
    registro.activa !== false &&
    estado !== "INACTIVO" &&
    estado !== "DESPEDIDO" &&
    estado !== "FUERA_SERVICIO"
  );
};

const AsignacionForm = ({
  asignacionEditando = null,
  conductores = [],
  vehiculos = [],
  onSave,
  onCancel,
  saving = false,
  loadingCatalogos = false,
  esSuperAdmin = false,
  esAdminSucursal = false,
}) => {
  const [form, setForm] = useState(
    crearFormularioInicial
  );

  const [formError, setFormError] =
    useState("");

  const esEdicion = Boolean(asignacionEditando);

  useEffect(() => {
    if (asignacionEditando) {
      setForm({
        conductor: obtenerId(
          asignacionEditando.conductor
        ),
        vehiculo: obtenerId(
          asignacionEditando.vehiculo
        ),
        fecha_inicio:
          asignacionEditando.fecha_inicio ||
          obtenerFechaLocal(),
        fecha_fin:
          asignacionEditando.fecha_fin || "",
        activa:
          typeof asignacionEditando.activa ===
          "boolean"
            ? asignacionEditando.activa
            : true,
      });
    } else {
      setForm(crearFormularioInicial());
    }

    setFormError("");
  }, [asignacionEditando]);

  const conductoresDisponibles = useMemo(() => {
    return conductores.filter((conductor) => {
      const esSeleccionado =
        String(conductor.id) ===
        String(form.conductor);

      return (
        esSeleccionado ||
        estaDisponible(conductor)
      );
    });
  }, [conductores, form.conductor]);

  const vehiculosDisponibles = useMemo(() => {
    return vehiculos.filter((vehiculo) => {
      const esSeleccionado =
        String(vehiculo.id) ===
        String(form.vehiculo);

      return (
        esSeleccionado ||
        estaDisponible(vehiculo)
      );
    });
  }, [vehiculos, form.vehiculo]);

  const conductorSeleccionado = useMemo(() => {
    return (
      conductores.find(
        (conductor) =>
          String(conductor.id) ===
          String(form.conductor)
      ) || null
    );
  }, [conductores, form.conductor]);

  const vehiculoSeleccionado = useMemo(() => {
    return (
      vehiculos.find(
        (vehiculo) =>
          String(vehiculo.id) ===
          String(form.vehiculo)
      ) || null
    );
  }, [vehiculos, form.vehiculo]);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((formAnterior) => ({
      ...formAnterior,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving || loadingCatalogos) {
      return;
    }

    if (!form.conductor) {
      setFormError(
        "Debes seleccionar un conductor."
      );
      return;
    }

    if (!form.vehiculo) {
      setFormError(
        "Debes seleccionar un vehículo."
      );
      return;
    }

    if (!form.fecha_inicio) {
      setFormError(
        "La fecha de inicio es obligatoria."
      );
      return;
    }

    if (
      form.fecha_fin &&
      form.fecha_fin < form.fecha_inicio
    ) {
      setFormError(
        "La fecha final no puede ser menor que la fecha de inicio."
      );
      return;
    }

    if (
      form.activa &&
      form.fecha_fin &&
      form.fecha_fin < obtenerFechaLocal()
    ) {
      setFormError(
        "Una asignación activa no puede tener una fecha final anterior a la fecha actual."
      );
      return;
    }

    if (typeof onSave !== "function") {
      setFormError(
        "No se encontró la función para guardar la asignación."
      );
      return;
    }

    await onSave({
      conductor: Number(form.conductor),
      vehiculo: Number(form.vehiculo),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin || null,
      activa: Boolean(form.activa),
    });
  };

  const deshabilitado =
    saving || loadingCatalogos;

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 sm:p-6"
      noValidate
    >
      {formError && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-sm font-black text-red-700">
            Revisa la información
          </p>

          <p className="mt-1 text-sm font-medium text-red-600">
            {formError}
          </p>
        </div>
      )}

      {esSuperAdmin && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <Building2
            size={20}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <div>
            <p className="text-sm font-black text-blue-800">
              Panel general
            </p>

            <p className="mt-1 text-sm font-medium text-blue-700">
              La asignación quedará registrada
              desde el panel del
              superadministrador.
            </p>
          </div>
        </div>
      )}

      {esAdminSucursal && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div>
            <p className="text-sm font-black text-emerald-800">
              Sucursal asignada
            </p>

            <p className="mt-1 text-sm font-medium text-emerald-700">
              La asignación quedará asociada
              automáticamente a tu sucursal.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor="asignacion-conductor"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Conductor
          </label>

          <div className="relative">
            <UserRound
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="asignacion-conductor"
              name="conductor"
              value={form.conductor}
              onChange={handleChange}
              disabled={deshabilitado}
              className="w-full appearance-none rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-10 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="">
                {loadingCatalogos
                  ? "Cargando conductores..."
                  : "Selecciona un conductor"}
              </option>

              {conductoresDisponibles.map(
                (conductor) => (
                  <option
                    key={conductor.id}
                    value={conductor.id}
                  >
                    {obtenerNombreConductor(
                      conductor
                    )}
                    {conductor.cedula
                      ? ` - ${conductor.cedula}`
                      : ""}
                    {conductor.sucursal_nombre
                      ? ` - ${conductor.sucursal_nombre}`
                      : esSuperAdmin
                        ? " - Panel general"
                        : ""}
                  </option>
                )
              )}
            </select>

            {loadingCatalogos && (
              <Loader2
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-yellow-600"
              />
            )}
          </div>

          {!conductoresDisponibles.length &&
            !loadingCatalogos && (
              <p className="mt-2 text-xs font-semibold text-red-600">
                No hay conductores activos
                disponibles. Primero registra o
                reactiva un conductor.
              </p>
            )}

          {conductorSeleccionado && (
            <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-sm font-black text-blue-800">
                {obtenerNombreConductor(
                  conductorSeleccionado
                )}
              </p>

              <p className="mt-1 text-xs font-semibold text-blue-700">
                {conductorSeleccionado.cedula
                  ? `Cédula: ${conductorSeleccionado.cedula}`
                  : "Conductor sin cédula registrada"}
              </p>

              {conductorSeleccionado.sucursal_nombre && (
                <p className="mt-1 text-xs font-semibold text-blue-700">
                  Sucursal:{" "}
                  {
                    conductorSeleccionado.sucursal_nombre
                  }
                </p>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="asignacion-vehiculo"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Vehículo
          </label>

          <div className="relative">
            <CarTaxiFront
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="asignacion-vehiculo"
              name="vehiculo"
              value={form.vehiculo}
              onChange={handleChange}
              disabled={deshabilitado}
              className="w-full appearance-none rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-10 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="">
                {loadingCatalogos
                  ? "Cargando vehículos..."
                  : "Selecciona un vehículo"}
              </option>

              {vehiculosDisponibles.map(
                (vehiculo) => (
                  <option
                    key={vehiculo.id}
                    value={vehiculo.id}
                  >
                    {obtenerNombreVehiculo(
                      vehiculo
                    )}
                    {vehiculo.sucursal_nombre
                      ? ` - ${vehiculo.sucursal_nombre}`
                      : esSuperAdmin
                        ? " - Panel general"
                        : ""}
                  </option>
                )
              )}
            </select>

            {loadingCatalogos && (
              <Loader2
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-yellow-600"
              />
            )}
          </div>

          {!vehiculosDisponibles.length &&
            !loadingCatalogos && (
              <p className="mt-2 text-xs font-semibold text-red-600">
                No hay vehículos activos
                disponibles. Primero registra o
                habilita un vehículo.
              </p>
            )}

          {vehiculoSeleccionado && (
            <div className="mt-3 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3">
              <p className="text-sm font-black text-yellow-800">
                {obtenerNombreVehiculo(
                  vehiculoSeleccionado
                )}
              </p>

              {vehiculoSeleccionado.sucursal_nombre && (
                <p className="mt-1 text-xs font-semibold text-yellow-700">
                  Sucursal:{" "}
                  {
                    vehiculoSeleccionado.sucursal_nombre
                  }
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="asignacion-fecha-inicio"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Fecha de inicio
          </label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="asignacion-fecha-inicio"
              type="date"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={handleChange}
              disabled={deshabilitado}
              className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="asignacion-fecha-fin"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Fecha final
          </label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="asignacion-fecha-fin"
              type="date"
              name="fecha_fin"
              value={form.fecha_fin}
              min={form.fecha_inicio || undefined}
              onChange={handleChange}
              disabled={deshabilitado}
              className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <p className="mt-2 text-xs font-medium text-slate-500">
            Déjala vacía mientras la
            asignación continúe vigente.
          </p>
        </div>

        <div className="md:col-span-2">
          <label
            className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition ${
              form.activa
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-200 bg-slate-50"
            } ${
              deshabilitado
                ? "cursor-not-allowed opacity-70"
                : "cursor-pointer"
            }`}
          >
            <div className="flex items-start gap-3">
              <Route
                size={21}
                className={
                  form.activa
                    ? "mt-0.5 shrink-0 text-emerald-600"
                    : "mt-0.5 shrink-0 text-slate-500"
                }
              />

              <div>
                <p
                  className={`text-sm font-black ${
                    form.activa
                      ? "text-emerald-800"
                      : "text-slate-800"
                  }`}
                >
                  Asignación activa
                </p>

                <p
                  className={`mt-1 text-xs font-medium ${
                    form.activa
                      ? "text-emerald-700"
                      : "text-slate-500"
                  }`}
                >
                  El conductor podrá registrar
                  jornadas con el vehículo
                  seleccionado.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              name="activa"
              checked={form.activa}
              onChange={handleChange}
              disabled={deshabilitado}
              className="h-5 w-5 shrink-0 rounded border-slate-300 text-yellow-500 focus:ring-yellow-400 disabled:cursor-not-allowed"
            />
          </label>
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={
            deshabilitado ||
            !conductoresDisponibles.length ||
            !vehiculosDisponibles.length
          }
          className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 shadow-md shadow-yellow-100 transition hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && (
            <Loader2
              size={18}
              className="animate-spin"
            />
          )}

          {saving
            ? "Guardando..."
            : esEdicion
              ? "Guardar cambios"
              : "Crear asignación"}
        </button>
      </div>
    </form>
  );
};

export default AsignacionForm;