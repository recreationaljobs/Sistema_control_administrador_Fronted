import { useState, useEffect } from "react";

const EMPTY_FORM = {
  nombre: "",
  apellido: "",
  cedula: "",
  licencia: "",
  vencimiento_licencia: "",
  numero_licencia: "",
  fecha_inicio_licencia: "",
  fecha_vencimiento_licencia: "",
  porcentaje_pago: 30,
};

const FIELDS = [
  { name: "nombre",                     label: "Nombre",                          type: "text",   placeholder: "Ej. Carlos",      required: true  },
  { name: "apellido",                   label: "Apellido",                        type: "text",   placeholder: "Ej. Ramírez",     required: true  },
  { name: "cedula",                     label: "Cédula",                          type: "text",   placeholder: "Ej. 1234567890",  required: true  },
  { name: "licencia",                   label: "N° de licencia",                  type: "text",   placeholder: "Ej. A-12345",     required: true  },
  { name: "vencimiento_licencia",       label: "Vencimiento de licencia",         type: "date",   placeholder: "",                required: false },
  { name: "numero_licencia",            label: "Número de licencia",              type: "text",   placeholder: "Ej. L-987654",    required: false },
  { name: "fecha_inicio_licencia",      label: "Fecha de emisión de licencia",    type: "date",   placeholder: "",                required: false },
  { name: "fecha_vencimiento_licencia", label: "Fecha de vencimiento de licencia", type: "date",  placeholder: "",                required: false },
  { name: "porcentaje_pago",            label: "Porcentaje de pago (%)",          type: "number", placeholder: "30",              required: false },
];

const validate = (form) => {
  const errors = {};
  if (!form.nombre.trim())   errors.nombre   = "El nombre es requerido.";
  if (!form.apellido.trim()) errors.apellido = "El apellido es requerido.";
  if (!form.cedula.trim())   errors.cedula   = "La cédula es requerida.";
  if (!form.licencia.trim()) errors.licencia = "La licencia es requerida.";
  const pct = Number(form.porcentaje_pago);
  if (isNaN(pct) || pct < 0 || pct > 100) {
    errors.porcentaje_pago = "Debe ser un número entre 0 y 100.";
  }
  return errors;
};

const ConductorForm = ({ initialData, onSubmit, submitting, submitError }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre:                     initialData.nombre                     || "",
        apellido:                   initialData.apellido                   || "",
        cedula:                     initialData.cedula                     || "",
        licencia:                   initialData.licencia                   || "",
        vencimiento_licencia:       initialData.vencimiento_licencia       || "",
        numero_licencia:            initialData.numero_licencia            || "",
        fecha_inicio_licencia:      initialData.fecha_inicio_licencia      || "",
        fecha_vencimiento_licencia: initialData.fecha_vencimiento_licencia || "",
        porcentaje_pago:            initialData.porcentaje_pago            ?? 30,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({
      ...form,
      porcentaje_pago:            Number(form.porcentaje_pago),
      vencimiento_licencia:       form.vencimiento_licencia       || null,
      numero_licencia:            form.numero_licencia            || null,
      fecha_inicio_licencia:      form.fecha_inicio_licencia      || null,
      fecha_vencimiento_licencia: form.fecha_vencimiento_licencia || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {submitError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map(({ name, label, type, placeholder, required }) => (
          <div key={name}>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <input
              type={type}
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={placeholder}
              min={name === "porcentaje_pago" ? 0   : undefined}
              max={name === "porcentaje_pago" ? 100 : undefined}
              className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-4 ${
                errors[name]
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-slate-300 focus:border-yellow-400 focus:ring-yellow-100"
              }`}
            />
            {errors[name] && (
              <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-yellow-400 px-6 py-2.5 text-sm font-black text-slate-950 shadow-sm hover:bg-yellow-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Guardando..." : initialData ? "Actualizar" : "Crear conductor"}
        </button>
      </div>
    </form>
  );
};

export default ConductorForm;
