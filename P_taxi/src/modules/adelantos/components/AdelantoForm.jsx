import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Search,
  UserRound,
  WalletCards,
} from "lucide-react";

const construirFormInicial = (tipo = "ADELANTO") => ({
  conductor: "",
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

  if (conductor.cedula) {
    return `${nombre} - ${conductor.cedula}`;
  }

  return nombre;
};

const buscarConductorPorId = (conductores, id) => {
  if (!id) return null;

  return conductores.find((conductor) => {
    return String(conductor.id) === String(id);
  });
};

const AdelantoForm = ({
  adelantoEditando,
  tipoInicial = "ADELANTO",
  conductores = [],
  estadosAdelanto = [],
  onSave,
  onCancel,
  saving,
  loadingCatalogos,
}) => {
  const [form, setForm] = useState(construirFormInicial(tipoInicial));
  const [busquedaConductor, setBusquedaConductor] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [formError, setFormError] = useState("");

  const esAbono = form.tipo === "ABONO";

  useEffect(() => {
    if (adelantoEditando) {
      const conductorId = obtenerId(adelantoEditando.conductor);
      const conductorEncontrado = buscarConductorPorId(conductores, conductorId);

      setForm({
        conductor: conductorId,
        tipo: adelantoEditando.tipo || tipoInicial || "ADELANTO",
        monto: String(adelantoEditando.monto ?? ""),
        estado: obtenerId(adelantoEditando.estado),
        observacion: adelantoEditando.observacion || "",
      });

      setBusquedaConductor(
        conductorEncontrado
          ? nombreConductor(conductorEncontrado)
          : adelantoEditando.conductor_nombre || ""
      );
    } else {
      setForm(construirFormInicial(tipoInicial));
      setBusquedaConductor("");
    }

    setMostrarResultados(false);
    setFormError("");
  }, [adelantoEditando, tipoInicial, conductores]);

  const conductoresFiltrados = useMemo(() => {
    const value = busquedaConductor.trim().toLowerCase();

    if (!value) {
      return conductores.slice(0, 8);
    }

    return conductores
      .filter((conductor) => {
        const texto = nombreConductor(conductor).toLowerCase();
        const sucursal = `${conductor.sucursal_nombre || ""}`.toLowerCase();

        return texto.includes(value) || sucursal.includes(value);
      })
      .slice(0, 10);
  }, [conductores, busquedaConductor]);

  const conductorSeleccionado = useMemo(() => {
    return buscarConductorPorId(conductores, form.conductor);
  }, [conductores, form.conductor]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formError) setFormError("");
  };

  const seleccionarConductor = (conductor) => {
    setForm((prev) => ({
      ...prev,
      conductor: String(conductor.id),
    }));

    setBusquedaConductor(nombreConductor(conductor));
    setMostrarResultados(false);

    if (formError) setFormError("");
  };

  const limpiarConductor = () => {
    setForm((prev) => ({
      ...prev,
      conductor: "",
    }));

    setBusquedaConductor("");
    setMostrarResultados(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.conductor) {
      setFormError("Debes seleccionar el conductor.");
      return;
    }

    const monto = Number(form.monto);

    if (Number.isNaN(monto) || monto <= 0) {
      setFormError("El monto debe ser mayor que 0.");
      return;
    }

    onSave({
      ...form,
      tipo: form.tipo || tipoInicial || "ADELANTO",
      monto,
      observacion: form.observacion.trim(),
    });
  };

  const tituloTipo = esAbono ? "Abono" : "Adelanto";

  const descripcionTipo = esAbono
    ? "Este movimiento reduce el saldo pendiente del conductor."
    : "Este movimiento registra dinero entregado al conductor.";

  const estiloTipo = esAbono
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-yellow-200 bg-yellow-50 text-yellow-700";

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

      <div className={`mb-5 rounded-2xl border px-4 py-4 ${estiloTipo}`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <WalletCards size={22} />
          </div>

          <div>
            <p className="text-sm font-black">
              Tipo de movimiento: {tituloTipo}
            </p>
            <p className="mt-1 text-sm font-semibold opacity-80">
              {descripcionTipo}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="relative md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Buscar conductor
          </label>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={busquedaConductor}
              onChange={(event) => {
                setBusquedaConductor(event.target.value);
                setMostrarResultados(true);

                setForm((prev) => ({
                  ...prev,
                  conductor: "",
                }));
              }}
              onFocus={() => setMostrarResultados(true)}
              disabled={saving || loadingCatalogos}
              placeholder="Escribe el nombre o cédula del conductor..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          {mostrarResultados && !saving && !loadingCatalogos && (
            <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
              {conductoresFiltrados.length > 0 ? (
                conductoresFiltrados.map((conductor) => (
                  <button
                    key={conductor.id}
                    type="button"
                    onClick={() => seleccionarConductor(conductor)}
                    className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-yellow-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <UserRound size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-800">
                        {conductor.nombre} {conductor.apellido}
                      </p>

                      <p className="text-xs font-semibold text-slate-500">
                        Cédula: {conductor.cedula || "Sin cédula"}
                      </p>

                      {conductor.sucursal_nombre && (
                        <p className="text-xs font-semibold text-slate-400">
                          Sucursal: {conductor.sucursal_nombre}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-sm font-semibold text-slate-500">
                  No se encontraron conductores.
                </div>
              )}
            </div>
          )}

          {conductorSeleccionado && (
            <div className="mt-3 flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-black text-emerald-800">
                    {conductorSeleccionado.nombre} {conductorSeleccionado.apellido}
                  </p>

                  <p className="text-xs font-semibold text-emerald-700">
                    Cédula: {conductorSeleccionado.cedula || "Sin cédula"}
                  </p>

                  {conductorSeleccionado.sucursal_nombre && (
                    <p className="text-xs font-semibold text-emerald-700">
                      Sucursal detectada: {conductorSeleccionado.sucursal_nombre}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={limpiarConductor}
                disabled={saving}
                className="rounded-xl bg-white px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
              >
                Cambiar
              </button>
            </div>
          )}
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
            placeholder={
              esAbono
                ? "Ejemplo: Abono semanal al saldo pendiente..."
                : "Ejemplo: Adelanto antes de iniciar jornada..."
            }
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