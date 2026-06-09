import { useEffect, useState } from "react";

const initialForm = {
  nombre: "",
  propietario: "",
  telefono: "",
  direccion: "",
  activa: true,
};

const SucursalForm = ({
  sucursalEditando,
  onSave,
  onCancel,
  saving,
}) => {
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (sucursalEditando) {
      setForm({
        nombre: sucursalEditando.nombre || "",
        propietario: sucursalEditando.propietario || "",
        telefono: sucursalEditando.telefono || "",
        direccion: sucursalEditando.direccion || "",
        activa:
          typeof sucursalEditando.activa === "boolean"
            ? sucursalEditando.activa
            : true,
      });
    } else {
      setForm(initialForm);
    }

    setFormError("");
  }, [sucursalEditando]);

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
      setFormError("El nombre de la sucursal es obligatorio.");
      return;
    }

    onSave({
      ...form,
      nombre: form.nombre.trim(),
      propietario: form.propietario.trim(),
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-6">
      {formError && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Nombre de la sucursal
          </label>

          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ejemplo: Sucursal León"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Propietario
          </label>

          <input
            type="text"
            name="propietario"
            value={form.propietario}
            onChange={handleChange}
            placeholder="Nombre del dueño"
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

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Dirección
          </label>

          <textarea
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Dirección de la sucursal"
            rows="3"
            className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div>
              <p className="text-sm font-black text-slate-900">
                Sucursal activa
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Si está activa, puede tener usuarios y registros operativos.
              </p>
            </div>

            <input
              type="checkbox"
              name="activa"
              checked={form.activa}
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
            : sucursalEditando
            ? "Guardar cambios"
            : "Crear sucursal"}
        </button>
      </div>
    </form>
  );
};

export default SucursalForm;