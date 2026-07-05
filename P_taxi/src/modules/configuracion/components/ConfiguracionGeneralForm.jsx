import { useEffect, useState } from "react";
import { Save } from "lucide-react";

const initialForm = {
  moneda: "C$",
  porcentaje_pago_conductor: "30.00",
  intervalo_cambio_aceite_km: "5000",
  intervalo_mantenimiento_km: "10000",
  alerta_previa_km: "300",
};

const ConfiguracionGeneralForm = ({
  configuracion,
  onSave,
  saving,
  puedeEditar,
}) => {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (configuracion) {
      setForm({
        moneda: configuracion.moneda ?? "C$",
        porcentaje_pago_conductor: String(
          configuracion.porcentaje_pago_conductor ?? "30.00"
        ),
        intervalo_cambio_aceite_km: String(
          configuracion.intervalo_cambio_aceite_km ?? "5000"
        ),
        intervalo_mantenimiento_km: String(
          configuracion.intervalo_mantenimiento_km ?? "10000"
        ),
        alerta_previa_km: String(configuracion.alerta_previa_km ?? "300"),
      });
    }
  }, [configuracion]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-lg font-black text-slate-950">
          Configuración general
        </h2>

        <p className="mt-1 text-sm font-medium text-slate-500">
          Parámetros principales para pagos, moneda y alertas de mantenimiento.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Moneda
          </label>

          <input
            type="text"
            name="moneda"
            value={form.moneda}
            onChange={handleChange}
            disabled={!puedeEditar || saving}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
            placeholder="C$"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            % por defecto para conductores nuevos
          </label>

          <input
            type="number"
            name="porcentaje_pago_conductor"
            value={form.porcentaje_pago_conductor}
            onChange={handleChange}
            disabled={!puedeEditar || saving}
            min="0"
            max="100"
            step="0.01"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          />

          <p className="mt-1.5 text-xs font-medium text-slate-500">
            Este valor se aplica solo a conductores nuevos si no se les asigna un % propio.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Intervalo cambio de aceite (km)
          </label>

          <input
            type="number"
            name="intervalo_cambio_aceite_km"
            value={form.intervalo_cambio_aceite_km}
            onChange={handleChange}
            disabled={!puedeEditar || saving}
            min="1"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Intervalo mantenimiento general (km)
          </label>

          <input
            type="number"
            name="intervalo_mantenimiento_km"
            value={form.intervalo_mantenimiento_km}
            onChange={handleChange}
            disabled={!puedeEditar || saving}
            min="1"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Alerta previa (km)
          </label>

          <input
            type="number"
            name="alerta_previa_km"
            value={form.alerta_previa_km}
            onChange={handleChange}
            disabled={!puedeEditar || saving}
            min="0"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>
      </div>

      <div className="mt-7 flex justify-end border-t border-slate-100 pt-5">
        <button
          type="submit"
          disabled={!puedeEditar || saving}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </form>
  );
};

export default ConfiguracionGeneralForm;