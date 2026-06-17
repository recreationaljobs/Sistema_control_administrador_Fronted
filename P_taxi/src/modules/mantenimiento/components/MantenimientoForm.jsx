import { useEffect, useMemo, useState } from "react";

const obtenerFechaLocal = () => {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const hoy = obtenerFechaLocal();

const initialForm = {
  vehiculo: "",
  tipo_mantenimiento: "",
  estado: "",
  descripcion: "",
  costo: "",
  fecha: hoy,
  kilometraje: "",
  proximo_km_sugerido: "",
};

const obtenerId = (valor) => {
  if (!valor) return "";

  if (typeof valor === "object") {
    return valor.id ? String(valor.id) : "";
  }

  return String(valor);
};

const obtenerNombreVehiculo = (vehiculo) => {
  if (!vehiculo) return "Vehículo";

  const numero = vehiculo.numero || "";
  const placa = vehiculo.placa || "";
  const marca = vehiculo.marca || "";
  const modelo = vehiculo.modelo || "";

  return `${numero ? `${numero} - ` : ""}${placa}${marca ? ` - ${marca}` : ""}${
    modelo ? ` ${modelo}` : ""
  }`;
};

const MantenimientoForm = ({
  mantenimientoEditando,
  vehiculos = [],
  tiposMantenimiento = [],
  estadosMantenimiento = [],
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
    if (mantenimientoEditando) {
      setForm({
        vehiculo: obtenerId(mantenimientoEditando.vehiculo),
        tipo_mantenimiento: obtenerId(
          mantenimientoEditando.tipo_mantenimiento
        ),
        estado: obtenerId(mantenimientoEditando.estado),
        descripcion: mantenimientoEditando.descripcion || "",
        costo: String(mantenimientoEditando.costo ?? ""),
        fecha: mantenimientoEditando.fecha || hoy,
        kilometraje: String(mantenimientoEditando.kilometraje ?? ""),
        proximo_km_sugerido: String(
          mantenimientoEditando.proximo_km_sugerido ?? ""
        ),
      });
    } else {
      setForm(initialForm);
    }

    setFormError("");
  }, [mantenimientoEditando]);

  const vehiculoSeleccionado = useMemo(() => {
    return vehiculos.find((item) => String(item.id) === String(form.vehiculo));
  }, [vehiculos, form.vehiculo]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "vehiculo") {
      const vehiculo = vehiculos.find(
        (item) => String(item.id) === String(value)
      );

      setForm((prev) => ({
        ...prev,
        vehiculo: value,
        kilometraje: vehiculo?.kilometraje_actual
          ? String(vehiculo.kilometraje_actual)
          : prev.kilometraje,
      }));

      if (formError) setFormError("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formError) setFormError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.vehiculo) {
      setFormError("Debes seleccionar el vehículo.");
      return;
    }

    if (!form.tipo_mantenimiento) {
      setFormError("Debes seleccionar el tipo de mantenimiento.");
      return;
    }

    if (!form.estado) {
      setFormError("Debes seleccionar el estado del mantenimiento.");
      return;
    }

    if (!form.fecha) {
      setFormError("La fecha es obligatoria.");
      return;
    }

    const costo = Number(form.costo || 0);
    const kilometraje = Number(form.kilometraje || 0);

    if (costo < 0 || Number.isNaN(costo)) {
      setFormError("El costo no puede ser negativo.");
      return;
    }

    if (kilometraje <= 0 || Number.isNaN(kilometraje)) {
      setFormError("El kilometraje debe ser mayor que cero.");
      return;
    }

    onSave({
      ...form,
      costo,
      kilometraje,
      descripcion: form.descripcion.trim(),
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
          Cargando vehículos y catálogos...
        </div>
      )}

      {esSuperAdmin && (
        <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Este mantenimiento quedará registrado en el panel general del
          superadministrador.
        </div>
      )}

      {esAdminSucursal && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          Este mantenimiento quedará registrado automáticamente en tu sucursal.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Vehículo
          </label>

          <select
            name="vehiculo"
            value={form.vehiculo}
            onChange={handleChange}
            disabled={saving || loadingCatalogos}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">Selecciona un vehículo</option>

            {vehiculos.map((vehiculo) => (
              <option key={vehiculo.id} value={vehiculo.id}>
                {obtenerNombreVehiculo(vehiculo)}
                {vehiculo.sucursal_nombre
                  ? ` - ${vehiculo.sucursal_nombre}`
                  : " - Panel superadmin"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Tipo de mantenimiento
          </label>

          <select
            name="tipo_mantenimiento"
            value={form.tipo_mantenimiento}
            onChange={handleChange}
            disabled={saving || loadingCatalogos}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">Selecciona un tipo</option>

            {tiposMantenimiento.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
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
            <option value="">Selecciona un estado</option>

            {estadosMantenimiento.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Fecha
          </label>

          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            disabled={saving}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Kilometraje
          </label>

          <input
            type="number"
            name="kilometraje"
            value={form.kilometraje}
            onChange={handleChange}
            disabled={saving}
            min="0"
            placeholder="Kilometraje actual"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Costo
          </label>

          <input
            type="number"
            name="costo"
            value={form.costo}
            onChange={handleChange}
            disabled={saving}
            min="0"
            step="0.01"
            placeholder="Ejemplo: 850.00"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Próximo km sugerido
          </label>

          <input
            type="number"
            name="proximo_km_sugerido"
            value={form.proximo_km_sugerido}
            onChange={handleChange}
            disabled={saving}
            min="0"
            placeholder="Opcional"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Descripción
          </label>

          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            disabled={saving}
            rows="3"
            placeholder="Ejemplo: cambio de aceite, revisión general, reparación de frenos..."
            className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        {vehiculoSeleccionado && (
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-black text-slate-900">
              Vehículo seleccionado
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-600">
              {obtenerNombreVehiculo(vehiculoSeleccionado)}
            </p>

            <p className="mt-1 text-xs font-bold text-slate-500">
              Kilometraje actual: {vehiculoSeleccionado.kilometraje_actual || 0}{" "}
              km
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
            : mantenimientoEditando
            ? "Guardar cambios"
            : "Crear mantenimiento"}
        </button>
      </div>
    </form>
  );
};

export default MantenimientoForm;