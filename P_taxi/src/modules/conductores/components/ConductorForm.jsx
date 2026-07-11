// src/modules/conductores/components/ConductorForm.jsx

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import {
  BadgeCheck,
  CalendarDays,
  IdCard,
  Loader2,
  MapPin,
  Percent,
  Phone,
  Save,
  UserRound,
} from "lucide-react";

import "sweetalert2/dist/sweetalert2.min.css";

const EMPTY_FORM = {
  nombre: "",
  apellido: "",
  cedula: "",
  telefono: "",
  direccion: "",
  numero_licencia: "",
  fecha_inicio_licencia: "",
  fecha_vencimiento_licencia: "",
  porcentaje_pago: "",
};

const obtenerFechaActual = () => {
  const fecha = new Date();

  const year = fecha.getFullYear();
  const month = String(
    fecha.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    fecha.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const obtenerFormularioInicial = (
  initialData
) => {
  if (!initialData) {
    return { ...EMPTY_FORM };
  }

  return {
    nombre: initialData.nombre || "",
    apellido: initialData.apellido || "",
    cedula: initialData.cedula || "",
    telefono: initialData.telefono || "",
    direccion: initialData.direccion || "",
    numero_licencia:
      initialData.numero_licencia || "",
    fecha_inicio_licencia:
      initialData.fecha_inicio_licencia || "",
    fecha_vencimiento_licencia:
      initialData.fecha_vencimiento_licencia ||
      "",
    porcentaje_pago:
      initialData.porcentaje_pago ?? "",
  };
};

const validarFormulario = (form) => {
  const errors = {};

  if (!form.nombre.trim()) {
    errors.nombre =
      "El nombre es obligatorio.";
  }

  if (!form.apellido.trim()) {
    errors.apellido =
      "El apellido es obligatorio.";
  }

  if (!form.cedula.trim()) {
    errors.cedula =
      "La cédula es obligatoria.";
  }

  if (!form.numero_licencia.trim()) {
    errors.numero_licencia =
      "La licencia es obligatoria.";
  }

  if (!form.fecha_inicio_licencia) {
    errors.fecha_inicio_licencia =
      "La fecha de emisión es obligatoria.";
  }

  if (!form.fecha_vencimiento_licencia) {
    errors.fecha_vencimiento_licencia =
      "La fecha de vencimiento es obligatoria.";
  }

  if (
    form.fecha_inicio_licencia &&
    form.fecha_vencimiento_licencia &&
    form.fecha_vencimiento_licencia <=
      form.fecha_inicio_licencia
  ) {
    errors.fecha_vencimiento_licencia =
      "El vencimiento debe ser posterior a la emisión.";
  }

  if (
    String(form.porcentaje_pago).trim() ===
    ""
  ) {
    errors.porcentaje_pago =
      "El porcentaje es obligatorio.";
  } else {
    const porcentaje = Number(
      form.porcentaje_pago
    );

    if (
      !Number.isFinite(porcentaje) ||
      porcentaje < 1 ||
      porcentaje > 100
    ) {
      errors.porcentaje_pago =
        "El porcentaje debe estar entre 1 y 100.";
    }
  }

  return errors;
};

const ErrorCampo = ({ mensaje }) => {
  if (!mensaje) {
    return null;
  }

  return (
    <p className="mt-1.5 text-xs font-semibold text-red-600">
      {mensaje}
    </p>
  );
};

const CampoIcono = ({
  icono: Icono,
  children,
}) => {
  return (
    <div className="relative">
      <Icono
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />

      {children}
    </div>
  );
};

const ConductorForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
  submitError = "",
}) => {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
  });

  const [errors, setErrors] = useState({});

  const hoy = obtenerFechaActual();
  const esEdicion = Boolean(initialData);

  useEffect(() => {
    setForm(
      obtenerFormularioInicial(initialData)
    );

    setErrors({});
  }, [initialData]);

  useEffect(() => {
    if (!submitError) {
      return;
    }

    void Swal.fire({
      title: "No se pudo guardar",
      text: submitError,
      icon: "error",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#eab308",
    });
  }, [submitError]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((formAnterior) => ({
      ...formAnterior,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((erroresAnteriores) => ({
        ...erroresAnteriores,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const nuevosErrores =
      validarFormulario(form);

    if (
      Object.keys(nuevosErrores).length > 0
    ) {
      setErrors(nuevosErrores);

      const primerError =
        Object.values(nuevosErrores)[0];

      void Swal.fire({
        title: "Revisa los datos",
        text: primerError,
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#eab308",
      });

      return;
    }

    const confirmacion = await Swal.fire({
      title: esEdicion
        ? "¿Actualizar conductor?"
        : "¿Registrar conductor?",
      text: esEdicion
        ? "Se guardarán los cambios realizados."
        : "El conductor será agregado al sistema.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: esEdicion
        ? "Actualizar"
        : "Registrar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#eab308",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      cedula: form.cedula.trim(),
      telefono:
        form.telefono.trim() || null,
      direccion:
        form.direccion.trim() || null,
      numero_licencia:
        form.numero_licencia.trim(),
      fecha_inicio_licencia:
        form.fecha_inicio_licencia,
      fecha_vencimiento_licencia:
        form.fecha_vencimiento_licencia,
      porcentaje_pago: Number(
        form.porcentaje_pago
      ),
      activo:
        initialData?.activo ?? true,
    };

    await onSubmit(payload);
  };

  const inputClass = (campo) => {
    return `w-full rounded-2xl border bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 ${
      errors[campo]
        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
        : "border-slate-300 hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
    }`;
  };

  const textareaClass = (campo) => {
    return `w-full resize-none rounded-2xl border bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 ${
      errors[campo]
        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
        : "border-slate-300 hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
    }`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 p-5 sm:p-6"
      noValidate
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <UserRound size={20} />
          </div>

          <h3 className="font-black text-slate-900">
            Datos personales
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Nombre *
            </label>

            <CampoIcono icono={UserRound}>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                disabled={submitting}
                autoComplete="given-name"
                className={inputClass("nombre")}
              />
            </CampoIcono>

            <ErrorCampo
              mensaje={errors.nombre}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Apellido *
            </label>

            <CampoIcono icono={UserRound}>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Apellido"
                disabled={submitting}
                autoComplete="family-name"
                className={inputClass(
                  "apellido"
                )}
              />
            </CampoIcono>

            <ErrorCampo
              mensaje={errors.apellido}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Cédula *
            </label>

            <CampoIcono icono={IdCard}>
              <input
                type="text"
                name="cedula"
                value={form.cedula}
                onChange={handleChange}
                placeholder="001-010190-0000A"
                disabled={submitting}
                className={inputClass("cedula")}
              />
            </CampoIcono>

            <ErrorCampo
              mensaje={errors.cedula}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Teléfono
            </label>

            <CampoIcono icono={Phone}>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="8888-8888"
                disabled={submitting}
                autoComplete="tel"
                className={inputClass(
                  "telefono"
                )}
              />
            </CampoIcono>

            <ErrorCampo
              mensaje={errors.telefono}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Dirección
            </label>

            <div className="relative">
              <MapPin
                size={18}
                className="pointer-events-none absolute left-4 top-4 text-slate-400"
              />

              <textarea
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Dirección"
                disabled={submitting}
                rows={2}
                className={`${textareaClass(
                  "direccion"
                )} pl-11`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
            <BadgeCheck size={20} />
          </div>

          <h3 className="font-black text-slate-900">
            Licencia
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Número *
            </label>

            <CampoIcono icono={BadgeCheck}>
              <input
                type="text"
                name="numero_licencia"
                value={form.numero_licencia}
                onChange={handleChange}
                placeholder="L-987654"
                disabled={submitting}
                className={inputClass(
                  "numero_licencia"
                )}
              />
            </CampoIcono>

            <ErrorCampo
              mensaje={
                errors.numero_licencia
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Emisión *
            </label>

            <CampoIcono icono={CalendarDays}>
              <input
                type="date"
                name="fecha_inicio_licencia"
                value={
                  form.fecha_inicio_licencia
                }
                onChange={handleChange}
                max={hoy}
                disabled={submitting}
                className={inputClass(
                  "fecha_inicio_licencia"
                )}
              />
            </CampoIcono>

            <ErrorCampo
              mensaje={
                errors.fecha_inicio_licencia
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Vencimiento *
            </label>

            <CampoIcono icono={CalendarDays}>
              <input
                type="date"
                name="fecha_vencimiento_licencia"
                value={
                  form.fecha_vencimiento_licencia
                }
                onChange={handleChange}
                min={
                  form.fecha_inicio_licencia ||
                  undefined
                }
                disabled={submitting}
                className={inputClass(
                  "fecha_vencimiento_licencia"
                )}
              />
            </CampoIcono>

            <ErrorCampo
              mensaje={
                errors.fecha_vencimiento_licencia
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Percent size={20} />
          </div>

          <h3 className="font-black text-slate-900">
            Porcentaje de pago
          </h3>
        </div>

        <div className="max-w-sm">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Porcentaje *
          </label>

          <CampoIcono icono={Percent}>
            <input
              type="number"
              name="porcentaje_pago"
              value={form.porcentaje_pago}
              onChange={handleChange}
              min={1}
              max={100}
              step={0.5}
              placeholder="30"
              disabled={submitting}
              className={inputClass(
                "porcentaje_pago"
              )}
            />
          </CampoIcono>

          <ErrorCampo
            mensaje={errors.porcentaje_pago}
          />
        </div>
      </section>

      <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-6 py-3 text-sm font-black text-slate-950 shadow-md shadow-yellow-100 transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <Save size={18} />
          )}

          {submitting
            ? "Guardando..."
            : esEdicion
              ? "Actualizar"
              : "Registrar"}
        </button>
      </div>
    </form>
  );
};

export default ConductorForm;