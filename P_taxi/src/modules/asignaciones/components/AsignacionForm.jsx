import { useEffect, useState } from "react";

const today = new Date().toISOString().split("T")[0];

const initialForm = {
  conductor: "",
  vehiculo: "",
  fecha_inicio: today,
  fecha_fin: "",
  activa: true,
};

const AsignacionForm = ({
  asignacionEditando,
  conductores = [],
  vehiculos = [],
  onSave,
  onCancel,
  saving,
  loadingCatalogos,
  esSuperAdmin,
  esAdminSucursal,
}) => {
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (asignacionEditando) {
      setForm({
        conductor: asignacionEditando.conductor
          ? String(asignacionEditando.conductor)
          : "",
        vehiculo: asignacionEditando.vehiculo
          ? String(asignacionEditando.vehiculo)
          : "",
        fecha_inicio: asignacionEditando.fecha_inicio || today,
        fecha_fin: asignacionEditando.fecha_fin || "",
        activa:
          typeof asignacionEditando.activa === "boolean"
            ? asignacionEditando.activa
            : true,
      });
    } else {
      setForm(initialForm);
    }

    setFormError("");
  }, [asignacionEditando]);

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

    if (!form.conductor) {
      setFormError("Debes seleccionar un conductor.");
      return;
    }

    if (!form.vehiculo) {
      setFormError("Debes seleccionar un vehículo.");
      return;
    }

    if (!form.fecha_inicio) {
      setFormError("La fecha de inicio es obligatoria.");
      return;
    }

    if (form.fecha_fin && form.fecha_fin < form.fecha_inicio) {
      setFormError("La fecha final no puede ser menor que la fecha de inicio.");
      return;
    }

    onSave({
      ...form,
      conductor: Number(form.conductor),
      vehiculo: Number(form.vehiculo),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-6">
      {formError && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError}
        </div>
      )}

      {loadingCatalogos && (
        <div className="mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-700">
          Cargando conductores y vehículos...
        </div>
      )}

      {esSuperAdmin && (
        <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Esta asignación quedará registrada en el panel general del superadministrador.
        </div>
      )}

      {esAdminSucursal && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          Esta asignación quedará registrada automáticamente en tu sucursal.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Conductor
          </label>

          <select
            name="conductor"
            value={form.conductor}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          >
            <option value="">Selecciona un conductor</option>

            {conductores.map((conductor) => {
              const nombreCompleto =
                conductor.nombre_completo ||
                `${conductor.nombre || ""} ${conductor.apellido || ""}`.trim();

              return (
                <option key={conductor.id} value={conductor.id}>
                  {nombreCompleto} - {conductor.cedula}
                  {conductor.sucursal_nombre
                    ? ` - ${conductor.sucursal_nombre}`
                    : " - Panel superadmin"}
                </option>
              );
            })}
          </select>

          {!conductores.length && !loadingCatalogos && (
            <p className="mt-2 text-xs font-semibold text-red-500">
              No hay conductores disponibles. Primero registra un conductor.
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Vehículo
          </label>

          <select
            name="vehiculo"
            value={form.vehiculo}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          >
            <option value="">Selecciona un vehículo</option>

            {vehiculos.map((vehiculo) => (
              <option key={vehiculo.id} value={vehiculo.id}>
                {vehiculo.numero} - {vehiculo.placa} - {vehiculo.marca}{" "}
                {vehiculo.modelo}
                {vehiculo.sucursal_nombre
                  ? ` - ${vehiculo.sucursal_nombre}`
                  : " - Panel superadmin"}
              </option>
            ))}
          </select>

          {!vehiculos.length && !loadingCatalogos && (
            <p className="mt-2 text-xs font-semibold text-red-500">
              No hay vehículos disponibles. Primero registra un vehículo.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Fecha de inicio
          </label>

          <input
            type="date"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Fecha final
          </label>

          <input
            type="date"
            name="fecha_fin"
            value={form.fecha_fin}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />

          <p className="mt-2 text-xs font-medium text-slate-500">
            Déjala vacía si la asignación sigue activa.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div>
              <p className="text-sm font-black text-slate-900">
                Asignación activa
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Si está activa, el conductor podrá trabajar con este vehículo.
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
            : asignacionEditando
            ? "Guardar cambios"
            : "Crear asignación"}
        </button>
      </div>
    </form>
  );
};

export default AsignacionForm;