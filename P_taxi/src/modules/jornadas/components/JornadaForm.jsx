import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CarTaxiFront,
  Gauge,
  Search,
  UserRound,
  Wallet,
} from "lucide-react";
import CalculoJornada from "./CalculoJornada";

const obtenerFechaLocal = () => {
  const fecha = new Date();

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const hoy = obtenerFechaLocal();

const initialForm = {
  fecha: hoy,
  conductor: "",
  vehiculo: "",
  kilometraje_inicial: "",
  kilometraje_final: "",
  tipo_cobro: "porcentaje",
  ingreso_bruto: "",
  monto_alquiler: "",
  porcentaje_pago_conductor: "30",
  observaciones: "",
};

const obtenerNombreConductor = (conductor) => {
  if (!conductor) return "";

  return (
    conductor.nombre_completo ||
    `${conductor.nombre || ""} ${
      conductor.apellido || ""
    }`.trim()
  );
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
  const [busquedaConductor, setBusquedaConductor] =
    useState("");

  const puedeEditarIngreso =
    esSuperAdmin || esAdminSucursal;

  const modoCierre =
    jornadaEditando?.modoFormulario === "cerrar";

  const modoEdicion =
    Boolean(jornadaEditando) && !modoCierre;

  const mostrarLiquidacion =
    puedeEditarIngreso && modoEdicion;

  const mostrarBusquedaConductor =
    !esTaxista && !jornadaEditando;

  const mostrarKilometrajeInicial =
    !mostrarLiquidacion;

  const mostrarKilometrajeFinal =
    !mostrarLiquidacion &&
    (modoCierre || modoEdicion);

  const asignacionesActivas = useMemo(() => {
    return asignaciones.filter(
      (item) => item.activa
    );
  }, [asignaciones]);

  const conductoresConAsignacion = useMemo(() => {
    const idsConductoresAsignados =
      asignacionesActivas.map((item) =>
        String(item.conductor)
      );

    return conductores.filter((conductor) =>
      idsConductoresAsignados.includes(
        String(conductor.id)
      )
    );
  }, [
    conductores,
    asignacionesActivas,
  ]);

  const conductorSeleccionado = useMemo(() => {
    return conductores.find(
      (item) =>
        String(item.id) ===
        String(form.conductor)
    );
  }, [
    conductores,
    form.conductor,
  ]);

  const asignacionSeleccionada = useMemo(() => {
    if (esTaxista) {
      return asignacionesActivas[0] || null;
    }

    if (!form.conductor) {
      return null;
    }

    return (
      asignacionesActivas.find(
        (item) =>
          String(item.conductor) ===
          String(form.conductor)
      ) || null
    );
  }, [
    asignacionesActivas,
    esTaxista,
    form.conductor,
  ]);

  const vehiculoSeleccionado = useMemo(() => {
    const vehiculoId =
      form.vehiculo ||
      asignacionSeleccionada?.vehiculo;

    if (!vehiculoId) {
      return null;
    }

    return (
      vehiculos.find(
        (item) =>
          String(item.id) ===
          String(vehiculoId)
      ) || null
    );
  }, [
    vehiculos,
    form.vehiculo,
    asignacionSeleccionada,
  ]);

  const conductoresFiltrados = useMemo(() => {
    const value = busquedaConductor
      .trim()
      .toLowerCase();

    if (!value) {
      return conductoresConAsignacion.slice(
        0,
        8
      );
    }

    return conductoresConAsignacion
      .filter((conductor) => {
        const nombre =
          obtenerNombreConductor(
            conductor
          ).toLowerCase();

        const cedula =
          conductor.cedula?.toLowerCase() ||
          "";

        return (
          nombre.includes(value) ||
          cedula.includes(value)
        );
      })
      .slice(0, 8);
  }, [
    busquedaConductor,
    conductoresConAsignacion,
  ]);

  const diferenciaKm =
    form.kilometraje_inicial !== "" &&
    form.kilometraje_final !== ""
      ? Number(
          form.kilometraje_final || 0
        ) -
        Number(
          form.kilometraje_inicial || 0
        )
      : 0;

  const nombreConductorMostrado =
    conductorSeleccionado
      ? obtenerNombreConductor(
          conductorSeleccionado
        )
      : jornadaEditando?.conductor_nombre ||
        (esTaxista
          ? "Conductor autenticado"
          : "No seleccionado");

  const vehiculoTexto =
    vehiculoSeleccionado
      ? `${vehiculoSeleccionado.numero} - ${vehiculoSeleccionado.placa}`
      : jornadaEditando?.vehiculo_numero ||
        jornadaEditando?.vehiculo_placa
      ? `${
          jornadaEditando?.vehiculo_numero ||
          ""
        } - ${
          jornadaEditando?.vehiculo_placa ||
          ""
        }`
      : "Sin vehículo activo";

  useEffect(() => {
    if (jornadaEditando) {
      const conductor = conductores.find(
        (item) =>
          String(item.id) ===
          String(
            jornadaEditando.conductor
          )
      );

      const tipoCobroDetectado =
        jornadaEditando.tipo_cobro ||
        (Number(
          jornadaEditando.monto_alquiler ||
            0
        ) > 0
          ? "alquiler"
          : "porcentaje");

      setForm({
        fecha:
          jornadaEditando.fecha || hoy,

        conductor:
          jornadaEditando.conductor
            ? String(
                jornadaEditando.conductor
              )
            : "",

        vehiculo:
          jornadaEditando.vehiculo
            ? String(
                jornadaEditando.vehiculo
              )
            : "",

        kilometraje_inicial:
          String(
            jornadaEditando.kilometraje_inicial ??
              ""
          ),

        kilometraje_final:
          String(
            jornadaEditando.kilometraje_final ??
              ""
          ),

        tipo_cobro:
          tipoCobroDetectado,

        ingreso_bruto:
          jornadaEditando.modoFormulario ===
          "cerrar"
            ? ""
            : String(
                jornadaEditando.ingreso_bruto ??
                  ""
              ),

        monto_alquiler:
          jornadaEditando.modoFormulario ===
          "cerrar"
            ? ""
            : String(
                jornadaEditando.monto_alquiler ??
                  ""
              ),

        porcentaje_pago_conductor:
          String(
            jornadaEditando.porcentaje_pago_conductor ??
              "30"
          ),

        observaciones:
          jornadaEditando.observaciones ||
          "",
      });

      setBusquedaConductor(
        obtenerNombreConductor(conductor)
      );
    } else {
      setForm({
        ...initialForm,
        fecha: obtenerFechaLocal(),
      });

      setBusquedaConductor("");
    }

    setFormError("");
  }, [
    jornadaEditando,
    conductores,
  ]);

  useEffect(() => {
    if (
      esTaxista &&
      asignacionSeleccionada
    ) {
      setForm((prev) => ({
        ...prev,

        conductor:
          asignacionSeleccionada.conductor
            ? String(
                asignacionSeleccionada.conductor
              )
            : "",

        vehiculo:
          asignacionSeleccionada.vehiculo
            ? String(
                asignacionSeleccionada.vehiculo
              )
            : "",
      }));
    }
  }, [
    esTaxista,
    asignacionSeleccionada,
  ]);

  useEffect(() => {
    if (
      !esTaxista &&
      asignacionSeleccionada
    ) {
      setForm((prev) => ({
        ...prev,

        vehiculo:
          asignacionSeleccionada.vehiculo
            ? String(
                asignacionSeleccionada.vehiculo
              )
            : "",
      }));
    }
  }, [
    esTaxista,
    asignacionSeleccionada,
  ]);

  const seleccionarConductor = (
    conductor
  ) => {
    const asignacion =
      asignacionesActivas.find(
        (item) =>
          String(item.conductor) ===
          String(conductor.id)
      );

    setForm((prev) => ({
      ...prev,

      conductor:
        String(conductor.id),

      vehiculo:
        asignacion?.vehiculo
          ? String(
              asignacion.vehiculo
            )
          : "",
    }));

    setBusquedaConductor(
      obtenerNombreConductor(conductor)
    );

    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((prev) => {
      if (name === "tipo_cobro") {
        return {
          ...prev,

          tipo_cobro: value,

          ingreso_bruto:
            value === "alquiler"
              ? ""
              : prev.ingreso_bruto,

          monto_alquiler:
            value === "porcentaje"
              ? ""
              : prev.monto_alquiler,

          porcentaje_pago_conductor:
            value === "alquiler"
              ? "0"
              : prev
                  .porcentaje_pago_conductor ||
                "30",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });

    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !esTaxista &&
      !form.conductor
    ) {
      setFormError(
        "Debes buscar y seleccionar un conductor."
      );

      return;
    }

    if (!form.vehiculo) {
      setFormError(
        "El conductor seleccionado no tiene un vehículo asignado activo."
      );

      return;
    }

    const kmInicial = Number(
      form.kilometraje_inicial
    );

    const kmFinal =
      form.kilometraje_final !== "" &&
      form.kilometraje_final !== null
        ? Number(
            form.kilometraje_final
          )
        : null;

    const tipoCobro =
      esTaxista
        ? "porcentaje"
        : form.tipo_cobro || "porcentaje";

    const ingresoBruto = Number(
      form.ingreso_bruto || 0
    );

    const montoAlquiler = Number(
      form.monto_alquiler || 0
    );

    const porcentajePago =
      tipoCobro === "alquiler"
        ? 0
        : Number(
            form.porcentaje_pago_conductor ||
              30
          );

    if (!mostrarLiquidacion) {
      if (
        Number.isNaN(kmInicial) ||
        kmInicial < 0
      ) {
        setFormError(
          "El kilometraje inicial debe ser un número válido."
        );

        return;
      }

      if (
        modoCierre ||
        modoEdicion
      ) {
        if (
          kmFinal === null ||
          Number.isNaN(kmFinal) ||
          kmFinal < 0
        ) {
          setFormError(
            "Debes ingresar un kilometraje final válido."
          );

          return;
        }

        if (
          kmFinal < kmInicial
        ) {
          setFormError(
            "El kilometraje final no puede ser menor al inicial."
          );

          return;
        }
      }

      if (modoCierre) {
        if (tipoCobro === "porcentaje") {
          if (
            Number.isNaN(ingresoBruto) ||
            ingresoBruto < 0
          ) {
            setFormError(
              "El monto bruto no puede ser negativo."
            );

            return;
          }
        }

        if (tipoCobro === "alquiler") {
          if (
            Number.isNaN(montoAlquiler) ||
            montoAlquiler < 0
          ) {
            setFormError(
              "El monto de alquiler no puede ser negativo."
            );

            return;
          }
        }
      }
    }

    if (mostrarLiquidacion) {
      if (
        tipoCobro === "porcentaje"
      ) {
        if (
          Number.isNaN(
            ingresoBruto
          ) ||
          ingresoBruto < 0
        ) {
          setFormError(
            "El ingreso bruto debe ser un número válido."
          );

          return;
        }
      }

      if (
        tipoCobro === "alquiler"
      ) {
        if (
          Number.isNaN(
            montoAlquiler
          ) ||
          montoAlquiler < 0
        ) {
          setFormError(
            "El monto de alquiler debe ser un número válido."
          );

          return;
        }
      }

      onSave({
        ...form,

        fecha:
          form.fecha || hoy,

        conductor:
          form.conductor
            ? Number(
                form.conductor
              )
            : null,

        vehiculo:
          form.vehiculo
            ? Number(
                form.vehiculo
              )
            : null,

        kilometraje_inicial:
          Number(
            form.kilometraje_inicial ||
              0
          ),

        kilometraje_final:
          kmFinal,

        tipo_cobro:
          tipoCobro,

        ingreso_bruto:
          tipoCobro === "porcentaje"
            ? ingresoBruto
            : 0,

        monto_alquiler:
          tipoCobro === "alquiler"
            ? montoAlquiler
            : 0,

        porcentaje_pago_conductor:
          porcentajePago,

        observaciones:
          form.observaciones.trim(),
      });

      return;
    }

    onSave({
      ...form,

      fecha:
        form.fecha || hoy,

      conductor:
        form.conductor
          ? Number(
              form.conductor
            )
          : null,

      vehiculo:
        form.vehiculo
          ? Number(
              form.vehiculo
            )
          : null,

      kilometraje_inicial:
        kmInicial,

      kilometraje_final:
        kmFinal,

      tipo_cobro:
        tipoCobro,

      ingreso_bruto:
        tipoCobro === "porcentaje"
          ? ingresoBruto
          : 0,

      monto_alquiler:
        tipoCobro === "alquiler"
          ? montoAlquiler
          : 0,

      porcentaje_pago_conductor:
        porcentajePago,

      observaciones:
        form.observaciones.trim(),
    });
  };

  if (esTaxista) {
    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-5 px-5 py-6"
      >
        {formError && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>{formError}</span>
          </div>
        )}

        {!modoCierre && (
          <div>
            <label
              htmlFor="kilometraje_inicial"
              className="mb-2 block text-sm font-black text-slate-800"
            >
              Ingrese el kilometraje inicial
            </label>

            <input
              id="kilometraje_inicial"
              type="number"
              name="kilometraje_inicial"
              value={form.kilometraje_inicial}
              onChange={handleChange}
              min="0"
              placeholder="Ejemplo: 25000"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
            />
          </div>
        )}

        {modoCierre && (
          <>
            <div>
              <label
                htmlFor="kilometraje_final"
                className="mb-2 block text-sm font-black text-slate-800"
              >
                Ingrese el kilometraje final
              </label>

              <input
                id="kilometraje_final"
                type="number"
                name="kilometraje_final"
                value={form.kilometraje_final}
                onChange={handleChange}
                min="0"
                placeholder="Ejemplo: 25120"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
              />
            </div>

            <div>
              <label
                htmlFor="ingreso_bruto"
                className="mb-2 block text-sm font-black text-slate-800"
              >
                Ingrese el monto bruto
              </label>

              <input
                id="ingreso_bruto"
                type="number"
                name="ingreso_bruto"
                value={form.ingreso_bruto}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Ejemplo: 1500.00"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
              />
            </div>
          </>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-[#F5B800] px-5 py-3.5 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600] disabled:opacity-60"
          >
            {saving
              ? "Guardando..."
              : modoCierre
              ? "Cerrar jornada"
              : "Iniciar jornada"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="px-6 py-6"
    >
      {formError && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <span>
            {formError}
          </span>
        </div>
      )}

      {loadingCatalogos && (
        <div className="mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-700">
          Cargando asignaciones,
          conductores y vehículos...
        </div>
      )}

      <div className="mb-6 rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#DFA600]">
              Registro de jornada
            </p>

            <h3 className="mt-1 text-xl font-black text-slate-950">
              {modoCierre
                ? "Cerrar jornada diaria"
                : mostrarLiquidacion
                ? "Liquidar jornada"
                : "Datos operativos del día"}
            </h3>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {modoCierre
                ? "Ingresa el kilometraje final y selecciona si la jornada se cobrará por porcentaje o alquiler."
                : mostrarLiquidacion
                ? "Selecciona si la jornada se cobra por porcentaje o alquiler."
                : "La fecha y el vehículo se asignan automáticamente por el sistema."}
            </p>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-bold text-slate-500">
              Fecha interna
            </p>

            <p className="mt-1 text-sm font-black text-slate-900">
              {form.fecha || hoy}
            </p>
          </div>
        </div>
      </div>

      {esSuperAdmin && (
        <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Esta jornada quedará
          registrada en el panel
          general del
          superadministrador.
        </div>
      )}

      {esAdminSucursal && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          Esta jornada quedará
          registrada automáticamente
          en tu sucursal.
        </div>
      )}

      {esTaxista && (
        <div className="mb-5 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-700">
          {modoCierre
            ? "Ingresa el kilometraje final y selecciona el tipo de cobro de la jornada."
            : "Ingresa el kilometraje inicial para comenzar la jornada."}
        </div>
      )}

      <div className="space-y-6">
        {mostrarBusquedaConductor && (
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <UserRound
                  size={23}
                />
              </div>

              <div>
                <h4 className="text-base font-black text-slate-950">
                  Buscar conductor
                </h4>

                <p className="text-sm font-medium text-slate-500">
                  Selecciona el
                  conductor. El vehículo
                  activo se cargará solo.
                </p>
              </div>
            </div>

            <div className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={
                  busquedaConductor
                }
                onChange={(event) => {
                  setBusquedaConductor(
                    event.target.value
                  );

                  setForm((prev) => ({
                    ...prev,
                    conductor: "",
                    vehiculo: "",
                  }));
                }}
                placeholder="Buscar por nombre o cédula..."
                className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
              />
            </div>

            {busquedaConductor &&
              !form.conductor && (
                <div className="mt-3 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                  {conductoresFiltrados.length >
                  0 ? (
                    conductoresFiltrados.map(
                      (conductor) => {
                        const nombreCompleto =
                          obtenerNombreConductor(
                            conductor
                          );

                        return (
                          <button
                            key={
                              conductor.id
                            }
                            type="button"
                            onClick={() =>
                              seleccionarConductor(
                                conductor
                              )
                            }
                            className="flex w-full items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <UserRound
                                  size={
                                    20
                                  }
                                />
                              </div>

                              <div>
                                <p className="text-sm font-black text-slate-900">
                                  {
                                    nombreCompleto
                                  }
                                </p>

                                <p className="mt-1 text-xs font-medium text-slate-500">
                                  {conductor.cedula ||
                                    "Sin cédula"}
                                </p>
                              </div>
                            </div>

                            <span className="rounded-full bg-[#FFF4CF] px-3 py-1 text-xs font-black text-[#B98200]">
                              Seleccionar
                            </span>
                          </button>
                        );
                      }
                    )
                  ) : (
                    <div className="px-4 py-5 text-sm font-semibold text-red-500">
                      No hay conductores
                      con asignación
                      activa.
                    </div>
                  )}
                </div>
              )}

            {!conductoresConAsignacion.length &&
              !loadingCatalogos && (
                <p className="mt-3 text-sm font-semibold text-red-500">
                  No hay conductores con
                  asignación activa.
                  Primero crea una
                  asignación.
                </p>
              )}
          </section>
        )}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#DFA600]">
                <CarTaxiFront
                  size={24}
                />
              </div>

              <div>
                <h4 className="text-base font-black text-slate-950">
                  Asignación detectada
                </h4>

                <p className="text-sm font-medium text-slate-500">
                  El vehículo se obtiene
                  automáticamente de la
                  asignación activa.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Conductor
                </p>

                <p className="mt-2 text-sm font-black text-slate-950">
                  {
                    nombreConductorMostrado
                  }
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Vehículo
                </p>

                <p className="mt-2 text-sm font-black text-slate-950">
                  {vehiculoTexto}
                </p>
              </div>
            </div>
          </div>

          {mostrarKilometrajeInicial && (
            <div
              className={`rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm ${
                !mostrarKilometrajeFinal
                  ? "md:col-span-2"
                  : ""
              }`}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Gauge
                    size={23}
                  />
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-950">
                    Kilometraje inicial
                  </h4>

                  <p className="text-sm font-medium text-slate-500">
                    Valor al iniciar la
                    jornada.
                  </p>
                </div>
              </div>

              <input
                type="number"
                name="kilometraje_inicial"
                value={
                  form.kilometraje_inicial
                }
                onChange={handleChange}
                min="0"
                disabled={modoCierre}
                placeholder="Ejemplo: 25000"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          )}

          {mostrarKilometrajeFinal && (
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Gauge
                    size={23}
                  />
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-950">
                    Kilometraje final
                  </h4>

                  <p className="text-sm font-medium text-slate-500">
                    Valor al finalizar la
                    jornada.
                  </p>
                </div>
              </div>

              <input
                type="number"
                name="kilometraje_final"
                value={
                  form.kilometraje_final
                }
                onChange={handleChange}
                min="0"
                placeholder="Ejemplo: 25120"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
              />

              <p
                className={`mt-3 text-sm font-black ${
                  diferenciaKm < 0
                    ? "text-red-600"
                    : "text-slate-700"
                }`}
              >
                Diferencia:{" "}
                {Number.isNaN(
                  diferenciaKm
                )
                  ? 0
                  : diferenciaKm}{" "}
                km
              </p>
            </div>
          )}

          {modoCierre && (
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                  <Wallet
                    size={23}
                  />
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-950">
                    Tipo de cobro
                  </h4>

                  <p className="text-sm font-medium text-slate-500">
                    Selecciona si la
                    jornada se cobrará por
                    porcentaje o por
                    alquiler.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Modalidad
                  </label>

                  <select
                    name="tipo_cobro"
                    value={
                      form.tipo_cobro
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
                  >
                    <option value="porcentaje">
                      Porcentaje
                    </option>

                    <option value="alquiler">
                      Alquiler
                    </option>
                  </select>
                </div>

                {form.tipo_cobro ===
                  "porcentaje" && (
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Ingreso bruto del día
                    </label>

                    <input
                      type="number"
                      name="ingreso_bruto"
                      value={
                        form.ingreso_bruto
                      }
                      onChange={
                        handleChange
                      }
                      min="0"
                      step="0.01"
                      placeholder="Ejemplo: 1500.00"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
                    />

                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      El sistema calculará
                      el pago del
                      conductor según el
                      porcentaje
                      configurado.
                    </p>
                  </div>
                )}

                {form.tipo_cobro ===
                  "alquiler" && (
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Monto de alquiler
                    </label>

                    <input
                      type="number"
                      name="monto_alquiler"
                      value={
                        form.monto_alquiler
                      }
                      onChange={
                        handleChange
                      }
                      min="0"
                      step="0.01"
                      placeholder="Ejemplo: 800.00"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
                    />

                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      En alquiler no se
                      calcula porcentaje
                      para el conductor.
                      Se registrará
                      solamente el monto
                      acordado.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {mostrarLiquidacion && (
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                  <Wallet
                    size={23}
                  />
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-950">
                    Liquidación de jornada
                  </h4>

                  <p className="text-sm font-medium text-slate-500">
                    Selecciona el tipo de
                    cobro para calcular el
                    resultado.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Tipo de cobro
                  </label>

                  <select
                    name="tipo_cobro"
                    value={
                      form.tipo_cobro
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
                  >
                    <option value="porcentaje">
                      Porcentaje
                    </option>

                    <option value="alquiler">
                      Alquiler
                    </option>
                  </select>
                </div>

                {form.tipo_cobro ===
                  "porcentaje" && (
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Ingreso bruto
                    </label>

                    <input
                      type="number"
                      name="ingreso_bruto"
                      value={
                        form.ingreso_bruto
                      }
                      onChange={
                        handleChange
                      }
                      min="0"
                      step="0.01"
                      placeholder="Ejemplo: 1500.00"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
                    />

                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      El sistema calcula
                      el pago del
                      conductor según el
                      porcentaje
                      configurado.
                    </p>
                  </div>
                )}

                {form.tipo_cobro ===
                  "alquiler" && (
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Monto de alquiler
                    </label>

                    <input
                      type="number"
                      name="monto_alquiler"
                      value={
                        form.monto_alquiler
                      }
                      onChange={
                        handleChange
                      }
                      min="0"
                      step="0.01"
                      placeholder="Ejemplo: 800.00"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
                    />

                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      En alquiler no se
                      calcula pago al
                      conductor. La
                      ganancia del dueño
                      se calcula con el
                      monto de alquiler
                      menos gastos.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {mostrarLiquidacion && (
            <div className="md:col-span-2">
              <CalculoJornada
                tipoCobro={
                  form.tipo_cobro
                }
                kilometrajeInicial={
                  form.kilometraje_inicial
                }
                kilometrajeFinal={
                  form.kilometraje_final
                }
                ingresoBruto={
                  form.ingreso_bruto
                }
                porcentajePago={
                  form.porcentaje_pago_conductor
                }
                montoAlquiler={
                  form.monto_alquiler
                }
                totalGastos={
                  jornadaEditando?.total_gastos ||
                  0
                }
              />
            </div>
          )}

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Observaciones
            </label>

            <textarea
              name="observaciones"
              value={
                form.observaciones
              }
              onChange={handleChange}
              rows="3"
              placeholder="Observaciones de la jornada"
              className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100"
            />
          </div>
        </section>
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
            : modoCierre
            ? "Cerrar jornada"
            : mostrarLiquidacion
            ? "Guardar liquidación"
            : jornadaEditando
            ? "Guardar cambios"
            : "Iniciar jornada"}
        </button>
      </div>
    </form>
  );
};

export default JornadaForm;