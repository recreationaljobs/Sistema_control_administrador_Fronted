import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getConfiguracionMantenimiento,
} from "../services/mantenimientoService";


const obtenerFechaLocal = () => {
  const fecha = new Date();

  const year =
    fecha.getFullYear();

  const month = String(
    fecha.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    fecha.getDate()
  ).padStart(2, "0");

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
  if (!valor) {
    return "";
  }

  if (
    typeof valor === "object"
  ) {
    return valor.id
      ? String(valor.id)
      : "";
  }

  return String(valor);
};


const obtenerNombreVehiculo = (
  vehiculo
) => {
  if (!vehiculo) {
    return "Vehículo";
  }

  const numero =
    vehiculo.numero || "";

  const placa =
    vehiculo.placa || "";

  const marca =
    vehiculo.marca || "";

  const modelo =
    vehiculo.modelo || "";

  return `${
    numero
      ? `${numero} - `
      : ""
  }${placa}${
    marca
      ? ` - ${marca}`
      : ""
  }${
    modelo
      ? ` ${modelo}`
      : ""
  }`;
};


const normalizarCodigo = (
  valor
) => {
  return String(
    valor || ""
  )
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/\s+/g, "_");
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
  const [
    form,
    setForm,
  ] = useState(initialForm);

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    configuracion,
    setConfiguracion,
  ] = useState(null);

  const [
    cargandoConfiguracion,
    setCargandoConfiguracion,
  ] = useState(false);

  const [
    errorConfiguracion,
    setErrorConfiguracion,
  ] = useState("");


  useEffect(() => {
    let activo = true;

    const cargarConfiguracion =
      async () => {
        try {
          setCargandoConfiguracion(
            true
          );

          setErrorConfiguracion("");

          const data =
            await getConfiguracionMantenimiento();

          if (activo) {
            setConfiguracion(
              data
            );
          }
        } catch (error) {
          console.error(
            "No se pudo cargar la configuración de mantenimiento:",
            error
          );

          if (activo) {
            setErrorConfiguracion(
              "No se pudo cargar la configuración de kilometraje."
            );
          }
        } finally {
          if (activo) {
            setCargandoConfiguracion(
              false
            );
          }
        }
      };

    void cargarConfiguracion();

    return () => {
      activo = false;
    };
  }, []);


  useEffect(() => {
    if (
      mantenimientoEditando
    ) {
      setForm({
        vehiculo:
          obtenerId(
            mantenimientoEditando
              .vehiculo
          ),

        tipo_mantenimiento:
          obtenerId(
            mantenimientoEditando
              .tipo_mantenimiento
          ),

        estado:
          obtenerId(
            mantenimientoEditando
              .estado
          ),

        descripcion:
          mantenimientoEditando
            .descripcion || "",

        costo: String(
          mantenimientoEditando
            .costo ?? ""
        ),

        fecha:
          mantenimientoEditando
            .fecha || hoy,

        kilometraje: String(
          mantenimientoEditando
            .kilometraje ?? ""
        ),

        proximo_km_sugerido:
          String(
            mantenimientoEditando
              .proximo_km_sugerido ??
              ""
          ),
      });
    } else {
      setForm(
        initialForm
      );
    }

    setFormError("");
  }, [
    mantenimientoEditando,
  ]);


  const vehiculoSeleccionado =
    useMemo(() => {
      return (
        vehiculos.find(
          (item) =>
            String(item.id) ===
            String(
              form.vehiculo
            )
        ) ||
        null
      );
    }, [
      vehiculos,
      form.vehiculo,
    ]);


  const tipoSeleccionado =
    useMemo(() => {
      return (
        tiposMantenimiento.find(
          (item) =>
            String(item.id) ===
            String(
              form.tipo_mantenimiento
            )
        ) ||
        null
      );
    }, [
      tiposMantenimiento,
      form.tipo_mantenimiento,
    ]);


  const esCambioAceite =
    useMemo(() => {
      const codigo =
        normalizarCodigo(
          tipoSeleccionado
            ?.codigo
        );

      const nombre =
        normalizarCodigo(
          tipoSeleccionado
            ?.nombre
        );

      return (
        codigo.includes(
          "aceite"
        ) ||
        nombre.includes(
          "aceite"
        )
      );
    }, [
      tipoSeleccionado,
    ]);


  const intervaloConfigurado =
    useMemo(() => {
      if (
        !tipoSeleccionado
      ) {
        return 0;
      }

      if (esCambioAceite) {
        return Number(
          configuracion
            ?.intervalo_cambio_aceite_km ||
          tipoSeleccionado
            ?.intervalo_km ||
          vehiculoSeleccionado
            ?.km_intervalo_cambio_aceite ||
          0
        );
      }

      return Number(
        configuracion
          ?.intervalo_mantenimiento_km ||
        tipoSeleccionado
          ?.intervalo_km ||
        vehiculoSeleccionado
          ?.km_intervalo_mantenimiento ||
        0
      );
    }, [
      configuracion,
      tipoSeleccionado,
      vehiculoSeleccionado,
      esCambioAceite,
    ]);


  const kilometrajeCalculado =
    useMemo(() => {
      if (
        mantenimientoEditando
      ) {
        return Number(
          form.kilometraje ||
          0
        );
      }

      return Number(
        vehiculoSeleccionado
          ?.kilometraje_actual ||
        0
      );
    }, [
      mantenimientoEditando,
      form.kilometraje,
      vehiculoSeleccionado,
    ]);


  const proximoKmCalculado =
    useMemo(() => {
      if (
        mantenimientoEditando
      ) {
        return Number(
          form.proximo_km_sugerido ||
          0
        );
      }

      if (
        !vehiculoSeleccionado ||
        !tipoSeleccionado ||
        intervaloConfigurado <= 0
      ) {
        return 0;
      }

      return (
        kilometrajeCalculado +
        intervaloConfigurado
      );
    }, [
      mantenimientoEditando,
      form.proximo_km_sugerido,
      vehiculoSeleccionado,
      tipoSeleccionado,
      kilometrajeCalculado,
      intervaloConfigurado,
    ]);


  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (
        formAnterior
      ) => ({
        ...formAnterior,
        [name]: value,
      })
    );

    if (formError) {
      setFormError("");
    }
  };


  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (
      !form.vehiculo
    ) {
      setFormError(
        "Debes seleccionar el vehículo."
      );

      return;
    }

    if (
      !form.tipo_mantenimiento
    ) {
      setFormError(
        "Debes seleccionar el tipo de mantenimiento."
      );

      return;
    }

    if (!form.estado) {
      setFormError(
        "Debes seleccionar el estado del mantenimiento."
      );

      return;
    }

    if (!form.fecha) {
      setFormError(
        "La fecha es obligatoria."
      );

      return;
    }

    const costo =
      Number(
        form.costo || 0
      );

    if (
      costo < 0 ||
      Number.isNaN(costo)
    ) {
      setFormError(
        "El costo no puede ser negativo."
      );

      return;
    }

    if (
      kilometrajeCalculado <= 0 ||
      Number.isNaN(
        kilometrajeCalculado
      )
    ) {
      setFormError(
        "El vehículo debe tener un kilometraje actual mayor que cero."
      );

      return;
    }

    if (
      proximoKmCalculado <=
      kilometrajeCalculado
    ) {
      setFormError(
        "No se pudo calcular el próximo kilometraje del mantenimiento."
      );

      return;
    }

    onSave({
      ...form,

      costo,

      kilometraje:
        kilometrajeCalculado,

      proximo_km_sugerido:
        proximoKmCalculado,

      descripcion:
        form.descripcion.trim(),
    });
  };


  const cargando =
    loadingCatalogos ||
    cargandoConfiguracion;


  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="px-6 py-6"
    >
      {formError && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError}
        </div>
      )}


      {errorConfiguracion && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {
            errorConfiguracion
          }
        </div>
      )}


      {cargando && (
        <div className="mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-700">
          Cargando vehículos,
          catálogos y configuración...
        </div>
      )}


      {esSuperAdmin && (
        <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Este mantenimiento
          quedará registrado en
          el panel general del
          superadministrador.
        </div>
      )}


      {esAdminSucursal && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          Este mantenimiento
          quedará registrado
          automáticamente en
          tu sucursal.
        </div>
      )}


      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Vehículo
          </label>

          <select
            name="vehiculo"
            value={
              form.vehiculo
            }
            onChange={
              handleChange
            }
            disabled={
              saving ||
              cargando ||
              Boolean(
                mantenimientoEditando
              )
            }
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">
              Selecciona un vehículo
            </option>

            {vehiculos.map(
              (
                vehiculo
              ) => (
                <option
                  key={
                    vehiculo.id
                  }
                  value={
                    vehiculo.id
                  }
                >
                  {
                    obtenerNombreVehiculo(
                      vehiculo
                    )
                  }

                  {vehiculo
                    .sucursal_nombre
                    ? ` - ${vehiculo.sucursal_nombre}`
                    : " - Panel superadmin"}
                </option>
              )
            )}
          </select>
        </div>


        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Tipo de mantenimiento
          </label>

          <select
            name="tipo_mantenimiento"
            value={
              form.tipo_mantenimiento
            }
            onChange={
              handleChange
            }
            disabled={
              saving ||
              cargando ||
              Boolean(
                mantenimientoEditando
              )
            }
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">
              Selecciona un tipo
            </option>

            {tiposMantenimiento.map(
              (
                tipo
              ) => (
                <option
                  key={
                    tipo.id
                  }
                  value={
                    tipo.id
                  }
                >
                  {tipo.nombre}
                </option>
              )
            )}
          </select>
        </div>


        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Estado
          </label>

          <select
            name="estado"
            value={
              form.estado
            }
            onChange={
              handleChange
            }
            disabled={
              saving ||
              cargando
            }
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">
              Selecciona un estado
            </option>

            {estadosMantenimiento.map(
              (
                estado
              ) => (
                <option
                  key={
                    estado.id
                  }
                  value={
                    estado.id
                  }
                >
                  {
                    estado.nombre
                  }
                </option>
              )
            )}
          </select>
        </div>


        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Fecha
          </label>

          <input
            type="date"
            name="fecha"
            value={
              form.fecha
            }
            onChange={
              handleChange
            }
            disabled={
              saving
            }
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
          />
        </div>


        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Kilometraje actual
          </label>

          <input
            type="number"
            value={
              kilometrajeCalculado ||
              ""
            }
            readOnly
            placeholder="Selecciona el vehículo"
            className="w-full cursor-not-allowed rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
          />

          <p className="mt-2 text-xs font-semibold text-slate-500">
            Se obtiene
            automáticamente del
            kilometraje actual del
            vehículo.
          </p>
        </div>


        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Costo
          </label>

          <input
            type="number"
            name="costo"
            value={
              form.costo
            }
            onChange={
              handleChange
            }
            disabled={
              saving
            }
            min="0"
            step="0.01"
            placeholder="Ejemplo: 850.00"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
          />
        </div>


        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Próximo km sugerido
          </label>

          <input
            type="number"
            value={
              proximoKmCalculado ||
              ""
            }
            readOnly
            placeholder="Se calculará automáticamente"
            className="w-full cursor-not-allowed rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
          />

          {tipoSeleccionado &&
            intervaloConfigurado >
              0 && (
              <p className="mt-2 text-xs font-semibold text-blue-600">
                Cálculo:{" "}
                {
                  kilometrajeCalculado
                }{" "}
                km +{" "}
                {
                  intervaloConfigurado
                }{" "}
                km ={" "}
                {
                  proximoKmCalculado
                }{" "}
                km
              </p>
            )}
        </div>


        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Descripción
          </label>

          <textarea
            name="descripcion"
            value={
              form.descripcion
            }
            onChange={
              handleChange
            }
            disabled={
              saving
            }
            rows="3"
            placeholder="Ejemplo: cambio de aceite, revisión general, reparación de frenos..."
            className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
          />
        </div>


        {vehiculoSeleccionado && (
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-black text-slate-900">
              Vehículo seleccionado
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-600">
              {
                obtenerNombreVehiculo(
                  vehiculoSeleccionado
                )
              }
            </p>

            <p className="mt-1 text-xs font-bold text-slate-500">
              Kilometraje
              actual:{" "}
              {
                kilometrajeCalculado
              }{" "}
              km
            </p>

            {tipoSeleccionado &&
              intervaloConfigurado >
                0 && (
                <>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Intervalo
                    configurado:{" "}
                    {
                      intervaloConfigurado
                    }{" "}
                    km
                  </p>

                  <p className="mt-1 text-xs font-black text-blue-700">
                    Próximo
                    mantenimiento:{" "}
                    {
                      proximoKmCalculado
                    }{" "}
                    km
                  </p>
                </>
              )}
          </div>
        )}
      </div>


      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={
            onCancel
          }
          disabled={
            saving
          }
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={
            saving ||
            cargando ||
            Boolean(
              errorConfiguracion
            )
          }
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
