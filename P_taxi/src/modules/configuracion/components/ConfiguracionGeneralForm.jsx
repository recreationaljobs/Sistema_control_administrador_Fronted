// src/modules/configuracion/components/ConfiguracionGeneralForm.jsx

import {
  BellRing,
  CircleDollarSign,
  Droplets,
  Gauge,
  Loader2,
  LockKeyhole,
  Percent,
  Save,
  Settings2,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

const initialForm = {
  moneda: "C$",
  porcentaje_pago_conductor: "30.00",
  intervalo_cambio_aceite_km: "5000",
  intervalo_mantenimiento_km: "10000",
  alerta_previa_km: "300",
  km_aviso_mantenimiento: "30",
};

const normalizarConfiguracion = (configuracion) => {
  return {
    moneda: configuracion?.moneda ?? "C$",
    porcentaje_pago_conductor: String(
      configuracion?.porcentaje_pago_conductor ?? "30.00"
    ),
    intervalo_cambio_aceite_km: String(
      configuracion?.intervalo_cambio_aceite_km ?? "5000"
    ),
    intervalo_mantenimiento_km: String(
      configuracion?.intervalo_mantenimiento_km ?? "10000"
    ),
    alerta_previa_km: String(
      configuracion?.alerta_previa_km ?? "300"
    ),
    km_aviso_mantenimiento: String(
      configuracion?.km_aviso_mantenimiento ?? "30"
    ),
  };
};

const validarFormulario = (form) => {
  if (!form.moneda.trim()) {
    return "Debes ingresar la moneda.";
  }

  const porcentaje = Number(form.porcentaje_pago_conductor);

  if (
    !Number.isFinite(porcentaje) ||
    porcentaje < 0 ||
    porcentaje > 100
  ) {
    return "El porcentaje debe estar entre 0 y 100.";
  }

  const cambioAceite = Number(form.intervalo_cambio_aceite_km);
  const mantenimiento = Number(form.intervalo_mantenimiento_km);
  const alertaPrevia = Number(form.alerta_previa_km);
  const avisoMantenimiento = Number(form.km_aviso_mantenimiento);

  if (!Number.isFinite(cambioAceite) || cambioAceite <= 0) {
    return "El intervalo de aceite debe ser mayor que 0.";
  }

  if (!Number.isFinite(mantenimiento) || mantenimiento <= 0) {
    return "El intervalo de mantenimiento debe ser mayor que 0.";
  }

  if (!Number.isFinite(alertaPrevia) || alertaPrevia < 0) {
    return "La alerta previa no puede ser negativa.";
  }

  if (
    !Number.isFinite(avisoMantenimiento) ||
    avisoMantenimiento < 0
  ) {
    return "El aviso de mantenimiento no puede ser negativo.";
  }

  return "";
};

const SeccionConfiguracion = ({
  icono: Icono,
  titulo,
  descripcion,
  tono,
  children,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tono}`}
        >
          <Icono size={21} />
        </div>

        <div>
          <h3 className="font-black text-slate-900">
            {titulo}
          </h3>

          {descripcion && (
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {descripcion}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
};

const CampoNumero = ({
  id,
  label,
  name,
  value,
  onChange,
  disabled,
  min = 0,
  step = 1,
  icono: Icono = Gauge,
  suffix = "km",
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <Icono
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id={id}
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          min={min}
          step={step}
          className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-14 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        />

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
          {suffix}
        </span>
      </div>
    </div>
  );
};

const ConfiguracionGeneralForm = ({
  configuracion,
  onSave,
  saving = false,
  puedeEditar = false,
}) => {
  const [form, setForm] = useState(initialForm);
  const [formOriginal, setFormOriginal] = useState(initialForm);

  useEffect(() => {
    const datos = normalizarConfiguracion(configuracion);

    setForm(datos);
    setFormOriginal(datos);
  }, [configuracion]);

  const cambiosPendientes = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(formOriginal);
  }, [form, formOriginal]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((formAnterior) => ({
      ...formAnterior,
      [name]: value,
    }));
  };

  const seleccionarPorcentaje = (porcentaje) => {
    if (!puedeEditar || saving) {
      return;
    }

    setForm((formAnterior) => ({
      ...formAnterior,
      porcentaje_pago_conductor: String(porcentaje),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!puedeEditar || saving || !cambiosPendientes) {
      return;
    }

    const errorValidacion = validarFormulario(form);

    if (errorValidacion) {
      await Swal.fire({
        title: "Revisa la configuración",
        text: errorValidacion,
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#eab308",
      });

      return;
    }

    const confirmacion = await Swal.fire({
      title: "¿Guardar configuración?",
      text: "Los nuevos parámetros se aplicarán al sistema.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Guardar cambios",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#eab308",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    const payload = {
      moneda: form.moneda.trim(),
      porcentaje_pago_conductor: Number(
        form.porcentaje_pago_conductor
      ),
      intervalo_cambio_aceite_km: Number(
        form.intervalo_cambio_aceite_km
      ),
      intervalo_mantenimiento_km: Number(
        form.intervalo_mantenimiento_km
      ),
      alerta_previa_km: Number(form.alerta_previa_km),
      km_aviso_mantenimiento: Number(
        form.km_aviso_mantenimiento
      ),
    };

    const resultado = await onSave(payload);

    if (resultado !== false) {
      setFormOriginal(form);
    }
  };

  const disabled = !puedeEditar || saving;

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-sm"
    >
      <header className="border-b border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
              <Settings2 size={24} />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-950">
                Configuración general
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Pagos, servicios y alertas.
              </p>
            </div>
          </div>

          {puedeEditar && (
            <span
              className={`inline-flex self-start rounded-full px-3 py-1.5 text-xs font-black sm:self-auto ${
                cambiosPendientes
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {cambiosPendientes
                ? "Cambios sin guardar"
                : "Configuración guardada"}
            </span>
          )}
        </div>

        {!puedeEditar && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <LockKeyhole
              size={18}
              className="text-slate-500"
            />

            <p className="text-sm font-bold text-slate-600">
              Modo de consulta
            </p>
          </div>
        )}
      </header>

      <main className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2 sm:p-6">
        <SeccionConfiguracion
          icono={CircleDollarSign}
          titulo="Pagos"
          descripcion="Moneda y porcentaje por defecto"
          tono="bg-emerald-100 text-emerald-700"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="config-moneda"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Moneda
              </label>

              <div className="relative">
                <CircleDollarSign
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="config-moneda"
                  type="text"
                  name="moneda"
                  value={form.moneda}
                  onChange={handleChange}
                  disabled={disabled}
                  maxLength={10}
                  placeholder="C$"
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="config-porcentaje"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Pago por defecto
              </label>

              <div className="relative">
                <Percent
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="config-porcentaje"
                  type="number"
                  name="porcentaje_pago_conductor"
                  value={form.porcentaje_pago_conductor}
                  onChange={handleChange}
                  disabled={disabled}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-12 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                  %
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {[30, 40, 50].map((porcentaje) => (
                  <button
                    key={porcentaje}
                    type="button"
                    onClick={() =>
                      seleccionarPorcentaje(porcentaje)
                    }
                    disabled={disabled}
                    className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                      Number(form.porcentaje_pago_conductor) ===
                      porcentaje
                        ? "bg-yellow-400 text-slate-950"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {porcentaje}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SeccionConfiguracion>

        <SeccionConfiguracion
          icono={Droplets}
          titulo="Cambio de aceite"
          descripcion="Intervalo y aviso preventivo"
          tono="bg-blue-100 text-blue-700"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <CampoNumero
              id="config-aceite"
              label="Intervalo"
              name="intervalo_cambio_aceite_km"
              value={form.intervalo_cambio_aceite_km}
              onChange={handleChange}
              disabled={disabled}
              min={1}
              icono={Droplets}
            />

            <CampoNumero
              id="config-aviso"
              label="Avisar antes"
              name="km_aviso_mantenimiento"
              value={form.km_aviso_mantenimiento}
              onChange={handleChange}
              disabled={disabled}
              min={0}
              icono={BellRing}
            />
          </div>
        </SeccionConfiguracion>

        <SeccionConfiguracion
          icono={Wrench}
          titulo="Mantenimiento"
          descripcion="Control preventivo general"
          tono="bg-violet-100 text-violet-700"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <CampoNumero
              id="config-mantenimiento"
              label="Intervalo general"
              name="intervalo_mantenimiento_km"
              value={form.intervalo_mantenimiento_km}
              onChange={handleChange}
              disabled={disabled}
              min={1}
              icono={Wrench}
            />

            <CampoNumero
              id="config-alerta"
              label="Alerta previa"
              name="alerta_previa_km"
              value={form.alerta_previa_km}
              onChange={handleChange}
              disabled={disabled}
              min={0}
              icono={BellRing}
            />
          </div>
        </SeccionConfiguracion>

        <section className="rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-black uppercase tracking-widest text-yellow-400">
            Resumen
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs font-medium text-slate-400">
                Pago
              </p>

              <p className="mt-1 text-xl font-black">
                {form.porcentaje_pago_conductor || 0}%
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs font-medium text-slate-400">
                Moneda
              </p>

              <p className="mt-1 text-xl font-black">
                {form.moneda || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs font-medium text-slate-400">
                Aceite
              </p>

              <p className="mt-1 text-lg font-black">
                {form.intervalo_cambio_aceite_km || 0} km
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs font-medium text-slate-400">
                Mantenimiento
              </p>

              <p className="mt-1 text-lg font-black">
                {form.intervalo_mantenimiento_km || 0} km
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex justify-end border-t border-slate-200 bg-white p-5 sm:px-6">
        <button
          type="submit"
          disabled={
            !puedeEditar ||
            saving ||
            !cambiosPendientes
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 shadow-md shadow-yellow-100 transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}

          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </footer>
    </form>
  );
};

export default ConfiguracionGeneralForm;