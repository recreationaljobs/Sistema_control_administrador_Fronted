import { useEffect, useMemo, useState } from "react";

const construirFormInicial = (tipo = "ADELANTO") => ({
  conductor: "",
  sucursal: "",
  tipo,
  monto: "",
  estado: "",
  observacion: "",
});

const obtenerId = (valor) => {
  if (!valor) return "";

  if (typeof valor === "object") {
    return valor.id ? String(valor.id) : "";
  }

  return String(valor);
};

const nombreConductor = (conductor) => {
  if (!conductor) return "";
  const nombre = `${conductor.nombre || ""} ${conductor.apellido || ""}`.trim();
  return conductor.cedula ? `${nombre} - ${conductor.cedula}` : nombre;
};

const AdelantoForm = ({
  adelantoEditando,
  tipoInicial = "ADELANTO",
  conductores = [],
  sucursales = [],
  estadosAdelanto = [],
  onSave,
  onCancel,
  saving,
  loadingCatalogos,
}) => {
  const [form, setForm] = useState(construirFormInicial(tipoInicial));
  const [busquedaConductor, setBusquedaConductor] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (adelantoEditando) {
      setForm({
        conductor: obtenerId(adelantoEditando.conductor),
        sucursal: obtenerId(adelantoEditando.sucursal),
        tipo: adelantoEditando.tipo || "ADELANTO",
        monto: String(adelantoEditando.monto ?? ""),
        estado: obtenerId(adelantoEditando.estado),
        observacion: adelantoEditando.observacion || "",
      });
    } else {
      setForm(construirFormInicial(tipoInicial));
    }

    setBusquedaConductor("");
    setFormError("");
  }, [adelantoEditando, tipoInicial]);

  const conductoresFiltrados = useMemo(() => {
    const value = busquedaConductor.trim().toLowerCase();

    if (!value) return conductores;

    return conductores.filter((conductor) => {
      const texto = nombreConductor(conductor).toLowerCase();
      return texto.includes(value);
    });
  }, [conductores, busquedaConductor]);

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

    if (!form.conductor) {
      setFormError("Debes seleccionar el conductor.");
      return;
    }

    if (!form.sucursal) {
      setFormError("Debes seleccionar la sucursal.");
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

  const esAbono = form.tipo === "ABONO";

  return (
    <form onSubmit={handleSubmit} className="px-6 py-6">
      {formError && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError}
        </div>
      )}

      {loadingCatalogos && (
        <div className="mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-700">
          Cargando conductores y catálogos...
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Tipo de movimiento
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                !esAbono
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value="ADELANTO"
                checked={!esAbono}
                onChange={handleChange}
                disabled={saving}
                className="hidden"
              />
              Adelanto 💸
            </label>

            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                esAbono
                  ? "border-green-300 bg-green-50 text-green-700"
                  : "border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value="ABONO"
                checked={esAbono}
                onChange={handleChange}
                disabled={saving}
                className="hidden"
              />
              Abono ✅
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Conductor
          </label>

          <input
            type="text"
            value={busquedaConductor}
            onChange={(e) => setBusquedaConductor(e.target.value)}
            disabled={saving || loadingCatalogos}
            placeholder="Buscar conductor por nombre o cédula..."
            className="mb-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          />

          <select
            name="conductor"
            value={form.conductor}
            onChange={handleChange}
            disabled={saving || loadingCatalogos}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">Selecciona un conductor</option>

            {conductoresFiltrados.map((conductor) => (
              <option key={conductor.id} value={conductor.id}>
                {nombreConductor(conductor)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Sucursal
          </label>

          <select
            name="sucursal"
            value={form.sucursal}
            onChange={handleChange}
            disabled={saving || loadingCatalogos}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">Selecciona una sucursal</option>

            {sucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
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
            placeholder="Ejemplo: Adelanto para gasolina, abono de cuota semanal..."
            className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          />
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
          disabled={saving || loadingCatalogos}
          className="rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600] disabled:opacity-60"
        >
          {saving
            ? "Guardando..."
            : adelantoEditando
            ? "Guardar cambios"
            : esAbono
            ? "Registrar abono"
            : "Crear adelanto"}
        </button>
      </div>
    </form>
  );
};

export default AdelantoForm;
