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
  tipo_gasto: "",
  estado: "",
  descripcion: "",
  monto: "",
  fecha: hoy,
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

const GastoForm = ({
  gastoEditando,
  vehiculos = [],
  tiposGasto = [],
  estadosGasto = [],
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
    if (gastoEditando) {
      setForm({
        vehiculo: obtenerId(gastoEditando.vehiculo),
        tipo_gasto: obtenerId(gastoEditando.tipo_gasto),
        estado: obtenerId(gastoEditando.estado),
        descripcion: gastoEditando.descripcion || "",
        monto: String(gastoEditando.monto ?? ""),
        fecha: gastoEditando.fecha || hoy,
      });
    } else {
      setForm(initialForm);
    }

    setFormError("");
  }, [gastoEditando]);

  const vehiculoSeleccionado = useMemo(() => {
    return vehiculos.find((item) => String(item.id) === String(form.vehiculo));
  }, [vehiculos, form.vehiculo]);

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

    if (!form.vehiculo) {
      setFormError("Debes seleccionar el vehículo.");
      return;
    }

    if (!form.tipo_gasto) {
      setFormError("Debes seleccionar el tipo de gasto.");
      return;
    }

    if (!form.estado) {
      setFormError("Debes seleccionar el estado del gasto.");
      return;
    }

    if (!form.fecha) {
      setFormError("La fecha es obligatoria.");
      return;
    }

    const monto = Number(form.monto);

    if (Number.isNaN(monto) || monto <= 0) {
      setFormError("El monto debe ser mayor que 0.");
      return;
    }

    onSave({
      ...form,
      jornada: "",
      conductor: "",
      monto,
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
          Este gasto quedará registrado en el panel general del superadministrador.
        </div>
      )}

      {esAdminSucursal && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          Este gasto quedará registrado automáticamente en tu sucursal.
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
            placeholder="Ejemplo: 1200.00"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Tipo de gasto
          </label>

          <select
            name="tipo_gasto"
            value={form.tipo_gasto}
            onChange={handleChange}
            disabled={saving || loadingCatalogos}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">Selecciona un tipo</option>

            {tiposGasto.map((tipo) => (
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

            {estadosGasto.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>
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
            placeholder="Ejemplo: Compra de neumático, batería, repuesto, lavado, reparación menor..."
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
            : gastoEditando
            ? "Guardar cambios"
            : "Crear gasto"}
        </button>
      </div>
    </form>
  );
};

export default GastoForm;