import {
  BadgePercent,
  CalendarDays,
  CreditCard,
  Home,
  IdCard,
  LoaderCircle,
  MapPin,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

const initialForm = {
  nombre: "",
  apellido: "",
  telefono: "",
  cedula: "",
  direccion: "",
  numero_licencia: "",
  fecha_inicio_licencia: "",
  fecha_vencimiento_licencia: "",
  porcentaje_pago: "30.00",
};

const normalizarFecha = (fecha) => {
  if (!fecha) {
    return "";
  }

  return String(fecha).slice(0, 10);
};

const normalizarValor = (valor) => {
  if (
    valor === null ||
    valor === undefined
  ) {
    return "";
  }

  return String(valor);
};

const ConductorForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
  submitError = "",
}) => {
  const [form, setForm] =
    useState(initialForm);

  const [formError, setFormError] =
    useState("");

  const esEdicion = Boolean(
    initialData?.id
  );

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre:
          normalizarValor(
            initialData.nombre
          ),

        apellido:
          normalizarValor(
            initialData.apellido
          ),

        telefono:
          normalizarValor(
            initialData.telefono
          ),

        cedula:
          normalizarValor(
            initialData.cedula
          ),

        direccion:
          normalizarValor(
            initialData.direccion
          ),

        numero_licencia:
          normalizarValor(
            initialData.numero_licencia ||
              initialData.licencia
          ),

        fecha_inicio_licencia:
          normalizarFecha(
            initialData.fecha_inicio_licencia
          ),

        fecha_vencimiento_licencia:
          normalizarFecha(
            initialData.fecha_vencimiento_licencia ||
              initialData.vencimiento_licencia
          ),

        porcentaje_pago:
          normalizarValor(
            initialData.porcentaje_pago ??
              "30.00"
          ),
      });
    } else {
      setForm(initialForm);
    }

    setFormError("");
  }, [initialData]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const validarFormulario = () => {
    if (!form.nombre.trim()) {
      setFormError(
        "El nombre del conductor es obligatorio."
      );

      return false;
    }

    if (!form.apellido.trim()) {
      setFormError(
        "El apellido del conductor es obligatorio."
      );

      return false;
    }

    if (!form.cedula.trim()) {
      setFormError(
        "La cédula del conductor es obligatoria."
      );

      return false;
    }

    if (!form.telefono.trim()) {
      setFormError(
        "El teléfono del conductor es obligatorio."
      );

      return false;
    }

    if (!form.direccion.trim()) {
      setFormError(
        "La dirección del conductor es obligatoria."
      );

      return false;
    }

    if (!form.numero_licencia.trim()) {
      setFormError(
        "El número de licencia es obligatorio."
      );

      return false;
    }

    if (!form.fecha_inicio_licencia) {
      setFormError(
        "La fecha de inicio de la licencia es obligatoria."
      );

      return false;
    }

    if (!form.fecha_vencimiento_licencia) {
      setFormError(
        "La fecha de vencimiento de la licencia es obligatoria."
      );

      return false;
    }

    if (
      form.fecha_vencimiento_licencia <
      form.fecha_inicio_licencia
    ) {
      setFormError(
        "La fecha de vencimiento no puede ser anterior a la fecha de inicio de la licencia."
      );

      return false;
    }

    const porcentaje = Number(
      form.porcentaje_pago
    );

    if (
      !Number.isFinite(porcentaje) ||
      porcentaje < 1 ||
      porcentaje > 100
    ) {
      setFormError(
        "El porcentaje de pago debe estar entre 1 y 100."
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (!validarFormulario()) {
      return;
    }

    if (
      typeof onSubmit !== "function"
    ) {
      setFormError(
        "No se encontró la función para guardar el conductor."
      );

      return;
    }

    const payload = {
      nombre:
        form.nombre.trim(),

      apellido:
        form.apellido.trim(),

      telefono:
        form.telefono.trim(),

      cedula:
        form.cedula.trim(),

      direccion:
        form.direccion.trim(),

      numero_licencia:
        form.numero_licencia
          .trim(),

      fecha_inicio_licencia:
        form.fecha_inicio_licencia,

      fecha_vencimiento_licencia:
        form.fecha_vencimiento_licencia,

      porcentaje_pago:
        Number(
          form.porcentaje_pago
        ).toFixed(2),
    };

    await onSubmit(payload);
  };

  const deshabilitado =
    submitting;

  return (
    <form
      onSubmit={handleSubmit}
      className="notranslate p-5 sm:p-6"
      noValidate
      translate="no"
      aria-busy={submitting}
    >
      {(formError ||
        submitError) && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-sm font-black text-red-700">
            Revisa la información
          </p>

          <p className="mt-1 text-sm font-medium text-red-600">
            {formError ||
              submitError}
          </p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
            <UserRound
              size={21}
              aria-hidden="true"
            />
          </div>

          <div>
            <h3 className="text-base font-black text-slate-950">
              Información personal
            </h3>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Datos generales del conductor.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="conductor-nombre"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Nombre
            </label>

            <div className="relative">
              <UserRound
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="conductor-nombre"
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                disabled={deshabilitado}
                placeholder="Nombre del conductor"
                autoComplete="given-name"
                className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="conductor-apellido"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Apellido
            </label>

            <div className="relative">
              <UserRound
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="conductor-apellido"
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                disabled={deshabilitado}
                placeholder="Apellido del conductor"
                autoComplete="family-name"
                className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="conductor-cedula"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Cédula
            </label>

            <div className="relative">
              <IdCard
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="conductor-cedula"
                type="text"
                name="cedula"
                value={form.cedula}
                onChange={handleChange}
                disabled={deshabilitado}
                placeholder="Número de cédula"
                className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="conductor-telefono"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Teléfono
            </label>

            <div className="relative">
              <Phone
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="conductor-telefono"
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                disabled={deshabilitado}
                placeholder="Número de teléfono"
                autoComplete="tel"
                className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="conductor-direccion"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Dirección
            </label>

            <div className="relative">
              <MapPin
                size={18}
                className="pointer-events-none absolute left-4 top-4 text-slate-400"
              />

              <textarea
                id="conductor-direccion"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                disabled={deshabilitado}
                rows={3}
                placeholder="Dirección del conductor"
                className="w-full resize-none rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <CreditCard
              size={21}
              aria-hidden="true"
            />
          </div>

          <div>
            <h3 className="text-base font-black text-slate-950">
              Licencia de conducir
            </h3>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Número, vigencia y vencimiento.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="conductor-licencia"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Número de licencia
            </label>

            <div className="relative">
              <IdCard
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="conductor-licencia"
                type="text"
                name="numero_licencia"
                value={
                  form.numero_licencia
                }
                onChange={handleChange}
                disabled={deshabilitado}
                placeholder="Número de licencia"
                className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="conductor-fecha-inicio-licencia"
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
                id="conductor-fecha-inicio-licencia"
                type="date"
                name="fecha_inicio_licencia"
                value={
                  form.fecha_inicio_licencia
                }
                onChange={handleChange}
                disabled={deshabilitado}
                className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="conductor-fecha-vencimiento-licencia"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Fecha de vencimiento
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="conductor-fecha-vencimiento-licencia"
                type="date"
                name="fecha_vencimiento_licencia"
                value={
                  form.fecha_vencimiento_licencia
                }
                min={
                  form.fecha_inicio_licencia ||
                  undefined
                }
                onChange={handleChange}
                disabled={deshabilitado}
                className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <BadgePercent
              size={21}
              aria-hidden="true"
            />
          </div>

          <div>
            <h3 className="text-base font-black text-slate-950">
              Pago del conductor
            </h3>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Porcentaje aplicado a sus jornadas.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="conductor-porcentaje"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Porcentaje de pago
          </label>

          <div className="relative max-w-md">
            <BadgePercent
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="conductor-porcentaje"
              type="number"
              name="porcentaje_pago"
              value={
                form.porcentaje_pago
              }
              onChange={handleChange}
              disabled={deshabilitado}
              min="1"
              max="100"
              step="0.01"
              placeholder="Ejemplo: 30"
              className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-14 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">
              %
            </span>
          </div>

          <p className="mt-2 text-xs font-medium text-slate-500">
            Debe ser un valor entre 1 y 100.
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={deshabilitado}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X size={18} />

          Cancelar
        </button>

        <button
          type="submit"
          disabled={deshabilitado}
          className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 shadow-md shadow-yellow-100 transition hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <LoaderCircle
                size={18}
                className="animate-spin"
              />

              {esEdicion
                ? "Actualizando..."
                : "Registrando..."}
            </>
          ) : (
            <>
              <Save size={18} />

              {esEdicion
                ? "Guardar cambios"
                : "Registrar conductor"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ConductorForm;