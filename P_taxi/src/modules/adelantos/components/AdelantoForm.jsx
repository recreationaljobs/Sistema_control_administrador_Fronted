import { useEffect, useMemo, useState } from "react";

const initialForm = {
  jornada: "",
  monto: "",
  estado: "",
  observacion: "",
};

const obtenerId = (valor) => {
  if (!valor) return "";

  if (typeof valor === "object") {
    return valor.id ? String(valor.id) : "";
  }

  return String(valor);
};

const obtenerNombreJornada = (jornada) => {
  if (!jornada) return "Jornada";

  const fecha = jornada.fecha || "";
  const conductor = jornada.conductor_nombre || "";
  const placa = jornada.vehiculo_placa || "";

  return `${fecha ? `${fecha}` : ""}${conductor ? ` - ${conductor}` : ""}${
    placa ? ` (${placa})` : ""
  }`;
};

const AdelantoForm = ({
  adelantoEditando,
  jornadas = [],
  estadosAdelanto = [],
  onSave,
  onCancel,
  saving,
  loadingCatalogos,
  esSuperAdmin = false,
  esAdminSucursal = false,
}) => {
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (adelantoEditando) {
      setForm({
        jornada: obtenerId(adelantoEditando.jornada),
        monto: String(adelantoEditando.monto ?? ""),
        estado: obtenerId(adelantoEditando.estado),
        observacion: adelantoEditando.observacion || "",
      });
    } else {
      setForm(initialForm);
    }

    setFormError("");
  }, [adelantoEditando]);

  const jornadaSeleccionada = useMemo(() => {
    return jornadas.find((item) => String(item.id) === String(form.jornada));
  }, [jornadas, form.jornada]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formError) setFormError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.jornada) {
      setFormError("Debes seleccionar la jornada.");
      return;
    }

    const monto = Number(form.monto);

    if (Number.isNaN(monto) || monto <= 0) {
      setFormError("El monto debe ser mayor que 0.");
      return;
    }

    onSave({
      ...form,
      monto,
      observacion: form.observacion.trim(),
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
          Cargando jornadas y catálogos...
        </div>
      )}

      {esSuperAdmin && (
        <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Este adelanto quedará registrado en el panel general del
          superadministrador.
        </div>
      )}

      {esAdminSucursal && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          Este adelanto quedará registrado automáticamente en tu sucursal.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Jornada
          </label>

          <select
            name="jornada"
            value={form.jornada}
            onChange={handleChange}
            disabled={saving || loadingCatalogos}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">Selecciona una jornada</option>

            {jornadas.map((jornada) => (
              <option key={jornada.id} value={jornada.id}>
                {obtenerNombreJornada(jornada)}
                {jornada.sucursal_nombre
                  ? ` - ${jornada.sucursal_nombre}`
                  : " - Panel superadmin"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Monto
          </label>

          <input
            type="number"
            name="monto"
            value={form.monto}
            onChange={handleChange}
            disabled={saving}
            min="0"
            step="0.01"
            placeholder="Ejemplo: 500.00"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Estado
          </label>

          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            disabled={saving || loadingCatalogos}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">Sin estado</option>

            {estadosAdelanto.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Observación
          </label>

          <textarea
            name="observacion"
            value={form.observacion}
            onChange={handleChange}
            disabled={saving}
            rows="3"
            placeholder="Ejemplo: Adelanto solicitado para gasolina, alimentación, emergencia familiar..."
            className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        {jornadaSeleccionada && (
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-black text-slate-900">
              Conductor de la jornada
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-600">
              {jornadaSeleccionada.conductor_nombre || "Sin conductor"}
              {jornadaSeleccionada.fecha
                ? ` — Jornada del ${jornadaSeleccionada.fecha}`
                : ""}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">
              El conductor y la sucursal se asignan automáticamente según la
              jornada seleccionada.
            </p>
          </div>
        )}
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
          disabled={saving || loadingCatalogos}
          className="rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600] disabled:opacity-60"
        >
          {saving
            ? "Guardando..."
            : adelantoEditando
            ? "Guardar cambios"
            : "Crear adelanto"}
        </button>
      </div>
    </form>
  );
};

export default AdelantoForm;
