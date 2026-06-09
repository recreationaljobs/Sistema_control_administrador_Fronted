import { useEffect, useState } from "react";

const initialForm = {
  numero: "",
  placa: "",
  marca: "",
  modelo: "",
  anio: "",
  color: "",
  numero_motor: "",
  numero_chasis: "",
  kilometraje_actual: "0",
};

const VehiculoForm = ({
  vehiculoEditando,
  onSave,
  onCancel,
  saving,
  esSuperAdmin,
  esAdminSucursal,
}) => {
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (vehiculoEditando) {
      setForm({
        numero: vehiculoEditando.numero || "",
        placa: vehiculoEditando.placa || "",
        marca: vehiculoEditando.marca || "",
        modelo: vehiculoEditando.modelo || "",
        anio: vehiculoEditando.anio ? String(vehiculoEditando.anio) : "",
        color: vehiculoEditando.color || "",
        numero_motor: vehiculoEditando.numero_motor || "",
        numero_chasis: vehiculoEditando.numero_chasis || "",
        kilometraje_actual: String(vehiculoEditando.kilometraje_actual ?? 0),
      });
    } else {
      setForm(initialForm);
    }

    setFormError("");
  }, [vehiculoEditando]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.numero.trim()) {
      setFormError("El número del vehículo es obligatorio.");
      return;
    }

    if (!form.placa.trim()) {
      setFormError("La placa del vehículo es obligatoria.");
      return;
    }

    if (!form.marca.trim()) {
      setFormError("La marca del vehículo es obligatoria.");
      return;
    }

    if (!form.modelo.trim()) {
      setFormError("El modelo del vehículo es obligatorio.");
      return;
    }

    if (!form.anio) {
      setFormError("El año del vehículo es obligatorio.");
      return;
    }

    const anio = Number(form.anio);

    if (Number.isNaN(anio) || anio < 1900 || anio > 2100) {
      setFormError("El año del vehículo no es válido.");
      return;
    }

    const kilometrajeActual = Number(form.kilometraje_actual);

    if (Number.isNaN(kilometrajeActual) || kilometrajeActual < 0) {
      setFormError("El kilometraje actual debe ser un número válido mayor o igual a 0.");
      return;
    }

    onSave({
      ...form,
      numero: form.numero.trim(),
      placa: form.placa.trim().toUpperCase(),
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      color: form.color.trim(),
      numero_motor: form.numero_motor.trim(),
      numero_chasis: form.numero_chasis.trim(),
      anio,
      kilometraje_actual: kilometrajeActual,
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
          Este vehículo será registrado en el panel general del superadministrador y no requiere sucursal.
        </div>
      )}

      {esAdminSucursal && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          Este vehículo será registrado automáticamente en tu sucursal.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Número del vehículo
          </label>

          <input
            type="text"
            name="numero"
            value={form.numero}
            onChange={handleChange}
            placeholder="Ejemplo: TX-01"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Placa
          </label>

          <input
            type="text"
            name="placa"
            value={form.placa}
            onChange={handleChange}
            placeholder="Ejemplo: M123456"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold uppercase text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Marca
          </label>

          <input
            type="text"
            name="marca"
            value={form.marca}
            onChange={handleChange}
            placeholder="Ejemplo: Toyota"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Modelo
          </label>

          <input
            type="text"
            name="modelo"
            value={form.modelo}
            onChange={handleChange}
            placeholder="Ejemplo: Yaris"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Año
          </label>

          <input
            type="number"
            name="anio"
            value={form.anio}
            onChange={handleChange}
            placeholder="Ejemplo: 2020"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Color
          </label>

          <input
            type="text"
            name="color"
            value={form.color}
            onChange={handleChange}
            placeholder="Ejemplo: Blanco"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Número de motor
          </label>

          <input
            type="text"
            name="numero_motor"
            value={form.numero_motor}
            onChange={handleChange}
            placeholder="Número de motor"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Número de chasis
          </label>

          <input
            type="text"
            name="numero_chasis"
            value={form.numero_chasis}
            onChange={handleChange}
            placeholder="Número de chasis"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Kilometraje actual
          </label>

          <input
            type="number"
            name="kilometraje_actual"
            value={form.kilometraje_actual}
            onChange={handleChange}
            min="0"
            placeholder="Ejemplo: 25000"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />

          <p className="mt-2 text-xs font-medium text-slate-500">
            Este kilometraje sirve como referencia inicial. Después se actualizará con las jornadas o mantenimientos.
          </p>
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
            : vehiculoEditando
            ? "Guardar cambios"
            : "Crear vehículo"}
        </button>
      </div>
    </form>
  );
};

export default VehiculoForm;