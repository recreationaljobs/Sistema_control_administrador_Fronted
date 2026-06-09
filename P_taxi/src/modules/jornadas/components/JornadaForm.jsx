import { useEffect, useMemo, useState } from "react";
import CalculoJornada from "./CalculoJornada";

const hoy = new Date().toISOString().split("T")[0];

const initialForm = {
  fecha: hoy,
  conductor: "",
  vehiculo: "",
  kilometraje_inicial: "",
  kilometraje_final: "",
  ingreso_bruto: "",
  observaciones: "",
};

const JornadaForm = ({
  jornadaEditando,
  conductores = [],
  vehiculos = [],
  asignaciones = [],
  onSave,
  onCancel,
  saving,
  loadingCatalogos,
  esSuperAdmin = false,
  esAdminSucursal = false,
  esTaxista = false,
}) => {
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (jornadaEditando) {
      setForm({
        fecha: jornadaEditando.fecha || hoy,
        conductor: jornadaEditando.conductor
          ? String(jornadaEditando.conductor)
          : "",
        vehiculo: jornadaEditando.vehiculo
          ? String(jornadaEditando.vehiculo)
          : "",
        kilometraje_inicial: String(jornadaEditando.kilometraje_inicial ?? ""),
        kilometraje_final: String(jornadaEditando.kilometraje_final ?? ""),
        ingreso_bruto: String(jornadaEditando.ingreso_bruto ?? ""),
        observaciones: jornadaEditando.observaciones || "",
      });
    } else {
      setForm(initialForm);
    }

    setFormError("");
  }, [jornadaEditando]);

  const asignacionesActivas = useMemo(() => {
    return asignaciones.filter((item) => item.activa);
  }, [asignaciones]);

  const vehiculosDisponibles = useMemo(() => {
    if (esTaxista) {
      const idsVehiculosAsignados = asignacionesActivas.map((item) =>
        String(item.vehiculo)
      );

      if (!idsVehiculosAsignados.length) {
        return [];
      }

      return vehiculos.filter((vehiculo) =>
        idsVehiculosAsignados.includes(String(vehiculo.id))
      );
    }

    if (!form.conductor) {
      return [];
    }

    const idsVehiculosAsignados = asignacionesActivas
      .filter((item) => String(item.conductor) === String(form.conductor))
      .map((item) => String(item.vehiculo));

    if (!idsVehiculosAsignados.length) {
      return [];
    }

    return vehiculos.filter((vehiculo) =>
      idsVehiculosAsignados.includes(String(vehiculo.id))
    );
  }, [esTaxista, form.conductor, vehiculos, asignacionesActivas]);

  const conductorSeleccionado = useMemo(() => {
    return conductores.find((item) => String(item.id) === String(form.conductor));
  }, [conductores, form.conductor]);

  const vehiculoSeleccionado = useMemo(() => {
    return vehiculos.find((item) => String(item.id) === String(form.vehiculo));
  }, [vehiculos, form.vehiculo]);

  const diferenciaKm =
    form.kilometraje_inicial !== "" && form.kilometraje_final !== ""
      ? Number(form.kilometraje_final || 0) -
        Number(form.kilometraje_inicial || 0)
      : 0;

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "conductor") {
      setForm((prev) => ({
        ...prev,
        conductor: value,
        vehiculo: "",
      }));

      if (formError) {
        setFormError("");
      }

      return;
    }

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

    if (!form.fecha) {
      setFormError("La fecha es obligatoria.");
      return;
    }

    if (!esTaxista && !form.conductor) {
      setFormError("Debes seleccionar un conductor.");
      return;
    }

    if (!form.vehiculo) {
      setFormError("Debes seleccionar un vehículo.");
      return;
    }

    const kmInicial = Number(form.kilometraje_inicial);
    const kmFinal = Number(form.kilometraje_final);
    const ingresoBruto = Number(form.ingreso_bruto);

    if (Number.isNaN(kmInicial) || kmInicial < 0) {
      setFormError("El kilometraje inicial debe ser un número válido.");
      return;
    }

    if (Number.isNaN(kmFinal) || kmFinal < 0) {
      setFormError("El kilometraje final debe ser un número válido.");
      return;
    }

    if (kmFinal < kmInicial) {
      setFormError("El kilometraje final no puede ser menor al inicial.");
      return;
    }

    if (Number.isNaN(ingresoBruto) || ingresoBruto < 0) {
      setFormError("El ingreso bruto debe ser un número válido.");
      return;
    }

    onSave({
      ...form,
      conductor: form.conductor ? Number(form.conductor) : null,
      vehiculo: form.vehiculo ? Number(form.vehiculo) : null,
      kilometraje_inicial: kmInicial,
      kilometraje_final: kmFinal,
      ingreso_bruto: ingresoBruto,
      observaciones: form.observaciones.trim(),
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
          Cargando asignaciones, conductores y vehículos...
        </div>
      )}

      {esSuperAdmin && (
        <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Esta jornada quedará registrada en el panel general del superadministrador.
        </div>
      )}

      {esAdminSucursal && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          Esta jornada quedará registrada automáticamente en tu sucursal.
        </div>
      )}

      {esTaxista && (
        <div className="mb-5 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-700">
          Registrarás una jornada usando tu asignación activa.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Fecha
          </label>

          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        {!esTaxista && (
          <div>
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
                No hay conductores registrados para crear jornadas.
              </p>
            )}
          </div>
        )}

        <div className={esTaxista ? "md:col-span-2" : ""}>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Vehículo asignado
          </label>

          <select
            name="vehiculo"
            value={form.vehiculo}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          >
            <option value="">Selecciona un vehículo</option>

            {vehiculosDisponibles.map((vehiculo) => (
              <option key={vehiculo.id} value={vehiculo.id}>
                {vehiculo.numero} - {vehiculo.placa} - {vehiculo.marca}{" "}
                {vehiculo.modelo}
                {vehiculo.sucursal_nombre
                  ? ` - ${vehiculo.sucursal_nombre}`
                  : " - Panel superadmin"}
              </option>
            ))}
          </select>

          {!vehiculosDisponibles.length && !loadingCatalogos && (
            <p className="mt-2 text-xs font-semibold text-red-500">
              No hay vehículos asignados para este conductor. Primero crea una asignación activa.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Kilometraje inicial
          </label>

          <input
            type="number"
            name="kilometraje_inicial"
            value={form.kilometraje_inicial}
            onChange={handleChange}
            min="0"
            placeholder="Ejemplo: 25000"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Kilometraje final
          </label>

          <input
            type="number"
            name="kilometraje_final"
            value={form.kilometraje_final}
            onChange={handleChange}
            min="0"
            placeholder="Ejemplo: 25120"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />

          <p className="mt-2 text-xs font-semibold text-slate-500">
            Diferencia: {Number.isNaN(diferenciaKm) ? 0 : diferenciaKm} km
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Ingreso bruto del día
          </label>

          <input
            type="number"
            name="ingreso_bruto"
            value={form.ingreso_bruto}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="Ejemplo: 1500.00"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />

          <p className="mt-2 text-xs font-medium text-slate-500">
            El pago del conductor y la ganancia se calcularán automáticamente según la configuración del sistema.
          </p>
        </div>

        <div className="md:col-span-2">
          <CalculoJornada
            kilometrajeInicial={form.kilometraje_inicial}
            kilometrajeFinal={form.kilometraje_final}
            ingresoBruto={form.ingreso_bruto}
            porcentajePago={30}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Observaciones
          </label>

          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            rows="3"
            placeholder="Observaciones de la jornada"
            className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        {(conductorSeleccionado || vehiculoSeleccionado) && (
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-black text-slate-900">
              Resumen seleccionado
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-600">
              Conductor:{" "}
              {conductorSeleccionado
                ? `${conductorSeleccionado.nombre || ""} ${
                    conductorSeleccionado.apellido || ""
                  }`.trim()
                : "No seleccionado"}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-600">
              Vehículo:{" "}
              {vehiculoSeleccionado
                ? `${vehiculoSeleccionado.numero} - ${vehiculoSeleccionado.placa}`
                : "No seleccionado"}
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
          disabled={saving}
          className="rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600] disabled:opacity-60"
        >
          {saving
            ? "Guardando..."
            : jornadaEditando
            ? "Guardar cambios"
            : "Crear jornada"}
        </button>
      </div>
    </form>
  );
};

export default JornadaForm;