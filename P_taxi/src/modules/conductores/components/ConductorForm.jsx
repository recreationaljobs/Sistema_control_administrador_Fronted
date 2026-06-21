
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
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
    return {
      ...EMPTY_FORM,
    };
  }

  return {
    nombre:
      initialData.nombre || "",

    apellido:
      initialData.apellido || "",

    cedula:
      initialData.cedula || "",

    telefono:
      initialData.telefono || "",

    direccion:
      initialData.direccion || "",

    numero_licencia:
      initialData.numero_licencia || "",

    fecha_inicio_licencia:
      initialData.fecha_inicio_licencia || "",

    fecha_vencimiento_licencia:
      initialData.fecha_vencimiento_licencia || "",
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
      "El número de licencia es obligatorio.";
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
      "La fecha de vencimiento debe ser posterior a la fecha de emisión.";
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

const ConductorForm = ({
  initialData,
  onSubmit,
  submitting = false,
  submitError = "",
}) => {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
  });

  const [errors, setErrors] =
    useState({});

  const hoy = obtenerFechaActual();

  useEffect(() => {
    setForm(
      obtenerFormularioInicial(
        initialData
      )
    );

    setErrors({});
  }, [initialData]);

  useEffect(() => {
    if (!submitError) {
      return;
    }

    Swal.fire({
      title: "No se pudo guardar",
      text: submitError,
      icon: "error",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
    });
  }, [submitError]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const nuevosErrores =
      validarFormulario(form);

    if (
      Object.keys(
        nuevosErrores
      ).length > 0
    ) {
      setErrors(
        nuevosErrores
      );

      const primerError =
        Object.values(
          nuevosErrores
        )[0];

      await Swal.fire({
        title: "Revisa los datos",
        text: primerError,
        icon: "warning",
        confirmButtonColor:
          "#3085d6",
        confirmButtonText:
          "Entendido",
      });

      return;
    }

    const resultado =
      await Swal.fire({
        title: initialData
          ? "¿Actualizar conductor?"
          : "¿Registrar conductor?",

        text: initialData
          ? "Se guardarán los cambios realizados."
          : "El nuevo conductor será registrado en el sistema.",

        icon: "warning",

        showCancelButton: true,

        confirmButtonColor:
          "#3085d6",

        cancelButtonColor:
          "#d33",

        confirmButtonText:
          initialData
            ? "Sí, actualizar"
            : "Sí, registrar",

        cancelButtonText:
          "Cancelar",
      });

    if (!resultado.isConfirmed) {
      return;
    }

    await onSubmit({
      nombre:
        form.nombre.trim(),

      apellido:
        form.apellido.trim(),

      cedula:
        form.cedula.trim(),

      telefono:
        form.telefono.trim() ||
        null,

      direccion:
        form.direccion.trim() ||
        null,

      numero_licencia:
        form.numero_licencia.trim(),

      fecha_inicio_licencia:
        form.fecha_inicio_licencia,

      fecha_vencimiento_licencia:
        form.fecha_vencimiento_licencia,

      /*
       * No enviamos porcentaje_pago.
       * Se obtiene desde ConfiguracionSistema.
       */

      /*
       * Conserva el estado actual al editar.
       * Los conductores nuevos se crean activos.
       */
      activo:
        initialData?.activo ??
        true,
    });
  };

  const inputClass = (campo) => {
    return `
      w-full
      rounded-xl
      border
      bg-white
      px-4
      py-3
      text-sm
      font-semibold
      text-slate-800
      outline-none
      transition
      placeholder:text-slate-400
      disabled:cursor-not-allowed
      disabled:bg-slate-100
      disabled:text-slate-500
      ${
        errors[campo]
          ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
          : "border-slate-300 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
      }
    `;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
    >
      <section className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-black text-slate-900">
            Datos personales
          </h3>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Información general del conductor.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Nombre

              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={
                handleChange
              }
              placeholder="Ej. Carlos"
              disabled={
                submitting
              }
              autoComplete="given-name"
              className={inputClass(
                "nombre"
              )}
            />

            <ErrorCampo
              mensaje={
                errors.nombre
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Apellido

              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={
                handleChange
              }
              placeholder="Ej. Ramírez"
              disabled={
                submitting
              }
              autoComplete="family-name"
              className={inputClass(
                "apellido"
              )}
            />

            <ErrorCampo
              mensaje={
                errors.apellido
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Cédula

              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              name="cedula"
              value={form.cedula}
              onChange={
                handleChange
              }
              placeholder="Ej. 001-010190-0000A"
              disabled={
                submitting
              }
              className={inputClass(
                "cedula"
              )}
            />

            <ErrorCampo
              mensaje={
                errors.cedula
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Teléfono
            </label>

            <input
              type="tel"
              name="telefono"
              value={
                form.telefono
              }
              onChange={
                handleChange
              }
              placeholder="Ej. 8888-8888"
              disabled={
                submitting
              }
              autoComplete="tel"
              className={inputClass(
                "telefono"
              )}
            />

            <ErrorCampo
              mensaje={
                errors.telefono
              }
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Dirección
            </label>

            <textarea
              name="direccion"
              value={
                form.direccion
              }
              onChange={
                handleChange
              }
              placeholder="Dirección del conductor"
              disabled={
                submitting
              }
              rows={3}
              className={`${inputClass(
                "direccion"
              )} resize-none`}
            />

            <ErrorCampo
              mensaje={
                errors.direccion
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-black text-slate-900">
            Licencia de conducir
          </h3>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Número, fecha de emisión y fecha de vencimiento.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Número de licencia

              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              name="numero_licencia"
              value={
                form.numero_licencia
              }
              onChange={
                handleChange
              }
              placeholder="Ej. L-987654"
              disabled={
                submitting
              }
              className={inputClass(
                "numero_licencia"
              )}
            />

            <ErrorCampo
              mensaje={
                errors.numero_licencia
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Fecha de emisión

              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              type="date"
              name="fecha_inicio_licencia"
              value={
                form.fecha_inicio_licencia
              }
              onChange={
                handleChange
              }
              max={hoy}
              disabled={
                submitting
              }
              className={inputClass(
                "fecha_inicio_licencia"
              )}
            />

            <ErrorCampo
              mensaje={
                errors.fecha_inicio_licencia
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Fecha de vencimiento

              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              type="date"
              name="fecha_vencimiento_licencia"
              value={
                form.fecha_vencimiento_licencia
              }
              onChange={
                handleChange
              }
              min={
                form.fecha_inicio_licencia ||
                undefined
              }
              disabled={
                submitting
              }
              className={inputClass(
                "fecha_vencimiento_licencia"
              )}
            />

            <ErrorCampo
              mensaje={
                errors.fecha_vencimiento_licencia
              }
            />
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white py-4 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-yellow-400 px-7 py-3 text-sm font-black text-slate-950 shadow-sm transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting
            ? "Guardando..."
            : initialData
              ? "Actualizar conductor"
              : "Crear conductor"}
        </button>
      </div>
    </form>
  );
};

export default ConductorForm;

