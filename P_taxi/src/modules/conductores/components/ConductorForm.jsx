import { useEffect, useState } from "react";

const initialForm = {
  nombre: "",
  apellido: "",
  telefono: "",
  cedula: "",
  direccion: "",
  licencia: "",
  vencimiento_licencia: "",
  activo: true,
};

const ConductorForm = ({
  conductorEditando,
  onSave,
  onCancel,
  saving,
  esSuperAdmin,
  esAdminSucursal,
}) => {
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (conductorEditando) {
      setForm({
        nombre: conductorEditando.nombre || "",
        apellido: conductorEditando.apellido || "",
        telefono: conductorEditando.telefono || "",
        cedula: conductorEditando.cedula || "",
        direccion: conductorEditando.direccion || "",
        licencia: conductorEditando.licencia || "",
        vencimiento_licencia: conductorEditando.vencimiento_licencia || "",
        activo:
          typeof conductorEditando.activo === "boolean"
            ? conductorEditando.activo
            : true,
      });
    } else {
      setForm(initialForm);
    }

    setFormError("");
  }, [conductorEditando]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.nombre.trim()) {
      setFormError("El nombre del conductor es obligatorio.");
      return;
    }

    if (!form.apellido.trim()) {
      setFormError("El apellido del conductor es obligatorio.");
      return;
    }

    if (!form.cedula.trim()) {
      setFormError("La cédula del conductor es obligatoria.");
      return;
    }

    if (!form.licencia.trim()) {
      setFormError("La licencia del conductor es obligatoria.");
      return;
    }

    onSave({
      ...form,
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      telefono: form.telefono.trim(),
      cedula: form.cedula.trim(),
      direccion: form.direccion.trim(),
      licencia: form.licencia.trim(),
      vencimiento_licencia: form.vencimiento_licencia || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-6">
      {formError && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError}
        </div>
      )}

      {esSuperAdmin && (
        <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Este conductor será registrado en el panel general del superadministrador y no requiere sucursal.
        </div>
      )}

      {esAdminSucursal && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          Este conductor será registrado automáticamente en tu sucursal.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Nombre
          </label>

          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre del conductor"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Apellido
          </label>

          <input
            type="text"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            placeholder="Apellido del conductor"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Cédula
          </label>

          <input
            type="text"
            name="cedula"
            value={form.cedula}
            onChange={handleChange}
            placeholder="Número de cédula"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Teléfono
          </label>

          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Ejemplo: 8888 8888"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Licencia
          </label>

          <input
            type="text"
            name="licencia"
            value={form.licencia}
            onChange={handleChange}
            placeholder="Número de licencia"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Vencimiento de licencia
          </label>

          <input
            type="date"
            name="vencimiento_licencia"
            value={form.vencimiento_licencia}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Dirección
          </label>

          <textarea
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Dirección del conductor"
            rows="3"
            className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div>
              <p className="text-sm font-black text-slate-900">
                Conductor activo
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Si está activo, puede ser asignado a un vehículo.
              </p>
            </div>

            <input
              type="checkbox"
              name="activo"
              checked={form.activo}
              onChange={handleChange}
              className="h-5 w-5 rounded border-slate-300 text-[#F5B800] focus:ring-[#F5B800]"
            />
          </label>
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600] disabled:opacity-60"
        >
          {saving
            ? "Guardando..."
            : conductorEditando
            ? "Guardar cambios"
            : "Crear conductor"}
        </button>
      </div>
    </form>
  );
};

export default ConductorForm;