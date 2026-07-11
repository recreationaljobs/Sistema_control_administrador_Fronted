// src/modules/adelantos/components/AdelantoForm.jsx

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Loader2,
  Search,
  UserRound,
  WalletCards,
} from "lucide-react";

const normalizarTipo = (tipo) => {
  return String(tipo || "")
    .trim()
    .toUpperCase() === "ABONO"
    ? "ABONO"
    : "ADELANTO";
};

const construirFormInicial = (tipo = "ADELANTO") => ({
  conductor: "",
  tipo: normalizarTipo(tipo),
  monto: "",
  observacion: "",
});

const obtenerId = (valor) => {
  if (!valor) {
    return "";
  }

  if (typeof valor === "object") {
    return valor.id
      ? String(valor.id)
      : "";
  }

  return String(valor);
};

const nombreConductor = (conductor) => {
  if (!conductor) {
    return "";
  }

  const nombreCompleto = `${conductor.nombre || ""} ${
    conductor.apellido || ""
  }`.trim();

  if (conductor.cedula) {
    return `${nombreCompleto} - ${conductor.cedula}`;
  }

  return nombreCompleto;
};

const buscarConductorPorId = (
  conductores,
  conductorId
) => {
  if (!conductorId) {
    return null;
  }

  return (
    conductores.find(
      (conductor) =>
        String(conductor.id) ===
        String(conductorId)
    ) || null
  );
};

const conductorEstaActivo = (conductor) => {
  const estado = String(
    conductor.estado_codigo ||
      conductor.estado ||
      ""
  )
    .trim()
    .toUpperCase();

  return (
    conductor.activo !== false &&
    conductor.activo !== 0 &&
    estado !== "DESPEDIDO" &&
    estado !== "INACTIVO"
  );
};

const AdelantoForm = ({
  adelantoEditando = null,
  tipoInicial = "ADELANTO",
  conductores = [],
  onSave,
  onCancel,
  saving = false,
  loadingCatalogos = false,
}) => {
  const [form, setForm] = useState(() =>
    construirFormInicial(tipoInicial)
  );

  const [
    busquedaConductor,
    setBusquedaConductor,
  ] = useState("");

  const [
    mostrarResultados,
    setMostrarResultados,
  ] = useState(false);

  const [formError, setFormError] =
    useState("");

  const busquedaDiferida =
    useDeferredValue(busquedaConductor);

  const esAbono =
    normalizarTipo(form.tipo) === "ABONO";

  useEffect(() => {
    if (adelantoEditando) {
      const conductorId = obtenerId(
        adelantoEditando.conductor
      );

      const tipoMovimiento = normalizarTipo(
        adelantoEditando.tipo || tipoInicial
      );

      setForm({
        conductor: conductorId,
        tipo: tipoMovimiento,
        monto: String(
          adelantoEditando.monto ?? ""
        ),
        observacion:
          adelantoEditando.observacion || "",
      });

      setBusquedaConductor(
        adelantoEditando.conductor_nombre || ""
      );
    } else {
      setForm(
        construirFormInicial(tipoInicial)
      );

      setBusquedaConductor("");
    }

    setMostrarResultados(false);
    setFormError("");
  }, [adelantoEditando, tipoInicial]);

  useEffect(() => {
    if (!form.conductor) {
      return;
    }

    const conductorEncontrado =
      buscarConductorPorId(
        conductores,
        form.conductor
      );

    if (!conductorEncontrado) {
      return;
    }

    setBusquedaConductor((valorActual) => {
      if (valorActual.trim()) {
        return valorActual;
      }

      return nombreConductor(
        conductorEncontrado
      );
    });
  }, [conductores, form.conductor]);

  const conductoresFiltrados = useMemo(() => {
    const valorBusqueda =
      busquedaDiferida
        .trim()
        .toLowerCase();

    const conductoresActivos =
      conductores.filter(
        conductorEstaActivo
      );

    if (!valorBusqueda) {
      return conductoresActivos.slice(0, 8);
    }

    return conductoresActivos
      .filter((conductor) => {
        const nombre = nombreConductor(
          conductor
        ).toLowerCase();

        const cedula = String(
          conductor.cedula || ""
        ).toLowerCase();

        const sucursal = String(
          conductor.sucursal_nombre || ""
        ).toLowerCase();

        return (
          nombre.includes(valorBusqueda) ||
          cedula.includes(valorBusqueda) ||
          sucursal.includes(valorBusqueda)
        );
      })
      .slice(0, 10);
  }, [conductores, busquedaDiferida]);

  const conductorSeleccionado =
    useMemo(() => {
      return buscarConductorPorId(
        conductores,
        form.conductor
      );
    }, [conductores, form.conductor]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((formAnterior) => ({
      ...formAnterior,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleBusquedaConductor = (
    event
  ) => {
    const value = event.target.value;

    setBusquedaConductor(value);
    setMostrarResultados(true);

    setForm((formAnterior) => ({
      ...formAnterior,
      conductor: "",
    }));

    if (formError) {
      setFormError("");
    }
  };

  const seleccionarConductor = (
    conductor
  ) => {
    setForm((formAnterior) => ({
      ...formAnterior,
      conductor: String(conductor.id),
    }));

    setBusquedaConductor(
      nombreConductor(conductor)
    );

    setMostrarResultados(false);
    setFormError("");
  };

  const limpiarConductor = () => {
    setForm((formAnterior) => ({
      ...formAnterior,
      conductor: "",
    }));

    setBusquedaConductor("");
    setMostrarResultados(true);
    setFormError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (saving || loadingCatalogos) {
      return;
    }

    if (!form.conductor) {
      setFormError(
        "Debes seleccionar el conductor."
      );
      return;
    }

    const monto = Number(form.monto);

    if (
      !Number.isFinite(monto) ||
      monto <= 0
    ) {
      setFormError(
        "El monto debe ser mayor que 0."
      );
      return;
    }

    if (typeof onSave !== "function") {
      setFormError(
        "No se pudo procesar el formulario."
      );
      return;
    }

    onSave({
      conductor: form.conductor,
      tipo: normalizarTipo(
        form.tipo || tipoInicial
      ),
      monto,
      observacion:
        form.observacion?.trim() || "",
    });
  };

  const tituloTipo = esAbono
    ? "Abono"
    : "Adelanto";

  const descripcionTipo = esAbono
    ? "Este movimiento reduce el saldo pendiente del conductor."
    : "Este movimiento registra dinero entregado al conductor.";

  const estiloTipo = esAbono
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-yellow-200 bg-yellow-50 text-yellow-700";

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 sm:p-6"
      noValidate
    >
      {formError && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-sm font-bold text-red-700">
            Revisa la información
          </p>

          <p className="mt-1 text-sm font-medium text-red-600">
            {formError}
          </p>
        </div>
      )}

      <div
        className={`mb-5 rounded-2xl border px-4 py-4 ${estiloTipo}`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
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

      <div className="grid grid-cols-1 gap-5">
        <div className="relative">
          <label
            htmlFor="buscar-conductor"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Buscar conductor
          </label>

          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="buscar-conductor"
              type="text"
              value={busquedaConductor}
              onChange={
                handleBusquedaConductor
              }
              onFocus={() =>
                setMostrarResultados(true)
              }
              disabled={
                saving || loadingCatalogos
              }
              autoComplete="off"
              autoFocus
              placeholder={
                loadingCatalogos
                  ? "Cargando conductores..."
                  : "Escribe el nombre o cédula del conductor..."
              }
              aria-expanded={
                mostrarResultados
              }
              className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          {mostrarResultados &&
            !saving &&
            !loadingCatalogos && (
              <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-300/40">
                {conductoresFiltrados.length >
                0 ? (
                  conductoresFiltrados.map(
                    (conductor) => (
                      <button
                        key={conductor.id}
                        type="button"
                        onMouseDown={(event) =>
                          event.preventDefault()
                        }
                        onClick={() =>
                          seleccionarConductor(
                            conductor
                          )
                        }
                        className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-yellow-50 focus:bg-yellow-50 focus:outline-none cursor-pointer"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                          <UserRound size={20} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-800">
                            {conductor.nombre}{" "}
                            {conductor.apellido}
                          </p>

                          <p className="mt-0.5 text-xs font-semibold text-slate-500">
                            Cédula:{" "}
                            {conductor.cedula ||
                              "Sin cédula"}
                          </p>

                          {conductor.sucursal_nombre && (
                            <p className="mt-0.5 text-xs font-semibold text-slate-400">
                              Sucursal:{" "}
                              {
                                conductor.sucursal_nombre
                              }
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  )
                ) : (
                  <div className="px-4 py-5 text-center">
                    <UserRound
                      size={28}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-sm font-bold text-slate-600">
                      No se encontraron conductores
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Intenta buscar por nombre,
                      cédula o sucursal.
                    </p>
                  </div>
                )}
              </div>
            )}

          {conductorSeleccionado && (
            <div className="mt-3 flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex min-w-0 items-start gap-3">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-emerald-800">
                    {
                      conductorSeleccionado.nombre
                    }{" "}
                    {
                      conductorSeleccionado.apellido
                    }
                  </p>

                  <p className="text-xs font-semibold text-emerald-700">
                    Cédula:{" "}
                    {conductorSeleccionado.cedula ||
                      "Sin cédula"}
                  </p>

                  {conductorSeleccionado.sucursal_nombre && (
                    <p className="text-xs font-semibold text-emerald-700">
                      Sucursal:{" "}
                      {
                        conductorSeleccionado.sucursal_nombre
                      }
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={limpiarConductor}
                disabled={saving}
                className="shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cambiar
              </button>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="monto"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Monto
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">
              C$
            </span>

            <input
              id="monto"
              type="number"
              name="monto"
              value={form.monto}
              onChange={handleChange}
              disabled={
                saving || loadingCatalogos
              }
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="500.00"
              className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="observacion"
              className="block text-sm font-bold text-slate-700"
            >
              Observación
            </label>

            <span className="text-xs font-medium text-slate-400">
              Opcional
            </span>
          </div>

          <textarea
            id="observacion"
            name="observacion"
            value={form.observacion}
            onChange={handleChange}
            disabled={
              saving || loadingCatalogos
            }
            rows={4}
            maxLength={500}
            placeholder={
              esAbono
                ? "Ejemplo: Abono semanal al saldo pendiente..."
                : "Ejemplo: Adelanto entregado antes de iniciar la jornada..."
            }
            className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          />

          <p className="mt-1.5 text-right text-xs font-medium text-slate-400">
            {form.observacion.length}/500
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={
            saving || loadingCatalogos
          }
          className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 shadow-md shadow-yellow-100 transition hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-200 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {saving && (
            <Loader2
              size={18}
              className="animate-spin"
            />
          )}

          {saving
            ? "Guardando..."
            : adelantoEditando
              ? "Guardar cambios"
              : esAbono
                ? "Registrar abono"
                : "Registrar adelanto"}
        </button>
      </div>
    </form>
  );
};

export default AdelantoForm;