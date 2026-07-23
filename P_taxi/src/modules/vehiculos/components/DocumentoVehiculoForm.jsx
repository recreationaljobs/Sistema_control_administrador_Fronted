import {
  CalendarDays,
  FileText,
  Save,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

const initialForm = {
  fecha_inicio: "",
  fecha_vencimiento: "",
  observaciones: "",
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

const DocumentoVehiculoForm = ({
  tipoDocumento,
  documentoEditando,
  onSave,
  onCancel,
  saving = false,
  soloLectura = false,
}) => {
  const [form, setForm] =
    useState(initialForm);

  const [formError, setFormError] =
    useState("");

  const esEdicion = Boolean(
    documentoEditando?.id
  );

  useEffect(() => {
    if (documentoEditando) {
      setForm({
        fecha_inicio:
          documentoEditando.fecha_inicio ||
          "",

        fecha_vencimiento:
          documentoEditando
            .fecha_vencimiento || "",

        observaciones:
          documentoEditando.observaciones ||
          "",
      });
    } else {
      setForm({
        ...initialForm,
        fecha_inicio:
          obtenerFechaActual(),
      });
    }

    setFormError("");
  }, [
    documentoEditando,
    tipoDocumento?.codigo,
  ]);

  const tituloFormulario =
    useMemo(() => {
      if (soloLectura) {
        return "Consulta del documento";
      }

      if (esEdicion) {
        return "Editar documento";
      }

      return "Agregar documento";
    }, [
      esEdicion,
      soloLectura,
    ]);

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
    if (!form.fecha_inicio) {
      setFormError(
        "Debes seleccionar la fecha de inicio."
      );

      return false;
    }

    if (!form.fecha_vencimiento) {
      setFormError(
        "Debes seleccionar la fecha de vencimiento."
      );

      return false;
    }

    const fechaInicio = new Date(
      `${form.fecha_inicio}T00:00:00`
    );

    const fechaVencimiento = new Date(
      `${form.fecha_vencimiento}T00:00:00`
    );

    if (
      Number.isNaN(
        fechaInicio.getTime()
      ) ||
      Number.isNaN(
        fechaVencimiento.getTime()
      )
    ) {
      setFormError(
        "Las fechas seleccionadas no son válidas."
      );

      return false;
    }

    if (
      fechaVencimiento <
      fechaInicio
    ) {
      setFormError(
        "La fecha de vencimiento no puede ser anterior a la fecha de inicio."
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      saving ||
      soloLectura
    ) {
      return;
    }

    if (!validarFormulario()) {
      return;
    }

    const guardado = await onSave({
      fecha_inicio:
        form.fecha_inicio,

      fecha_vencimiento:
        form.fecha_vencimiento,

      observaciones:
        form.observaciones.trim(),
    });

    if (
      guardado &&
      !esEdicion
    ) {
      setForm({
        ...initialForm,
        fecha_inicio:
          obtenerFechaActual(),
      });

      setFormError("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#D89C00] shadow-sm">
            <FileText size={22} />
          </div>

          <div>
            <h3 className="text-base font-black text-slate-950">
              {tituloFormulario}
            </h3>

            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              {tipoDocumento?.nombre ||
                "Documento del vehículo"}
            </p>
          </div>
        </div>

        {esEdicion &&
          !soloLectura && (
            <span className="inline-flex w-fit items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
              Editando registro
            </span>
          )}
      </div>

      {formError && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {formError}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="fecha_inicio_documento"
            className="mb-2 block text-sm font-black text-slate-700"
          >
            Fecha de inicio
          </label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="fecha_inicio_documento"
              type="date"
              name="fecha_inicio"
              value={
                form.fecha_inicio
              }
              onChange={
                handleChange
              }
              disabled={
                saving ||
                soloLectura
              }
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="fecha_vencimiento_documento"
            className="mb-2 block text-sm font-black text-slate-700"
          >
            Fecha de vencimiento
          </label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="fecha_vencimiento_documento"
              type="date"
              name="fecha_vencimiento"
              value={
                form.fecha_vencimiento
              }
              onChange={
                handleChange
              }
              min={
                form.fecha_inicio ||
                undefined
              }
              disabled={
                saving ||
                soloLectura
              }
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="observaciones_documento"
            className="mb-2 block text-sm font-black text-slate-700"
          >
            Observaciones
          </label>

          <textarea
            id="observaciones_documento"
            name="observaciones"
            value={
              form.observaciones
            }
            onChange={
              handleChange
            }
            rows={3}
            maxLength={500}
            disabled={
              saving ||
              soloLectura
            }
            placeholder="Agrega una observación opcional sobre este documento..."
            className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-slate-500">
              Este campo es opcional.
            </p>

            <p className="text-xs font-bold text-slate-400">
              {
                form.observaciones
                  .length
              }
              /500
            </p>
          </div>
        </div>
      </div>

      {!soloLectura && (
        <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          {esEdicion && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={18} />

              Cancelar 
            </button>
          )}

          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:-translate-y-0.5 hover:bg-[#DFA600] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
          >
            <Save size={18} />

            {saving
              ? "Guardando..."
              : esEdicion
                ? "Guardar cambios"
                : "Agregar documento"}
          </button>
        </div>
      )}
    </form>
  );
};

export default DocumentoVehiculoForm;