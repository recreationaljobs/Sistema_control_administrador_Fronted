import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  cerrarJornada,
  createJornada,
  deleteJornada,
  getAsignaciones,
  getConductores,
  getJornadas,
  getVehiculos,
  registrarIngresoJornada,
} from "../services/jornadasService";

const normalizarLista = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const obtenerFechaLocal = () => {
  const fecha = new Date();

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const obtenerCodigoRol = (auth) => {
  return (
    auth?.rol ||
    auth?.user?.rol ||
    auth?.user?.rol_codigo ||
    auth?.user?.rol?.codigo ||
    ""
  );
};

const obtenerMensajeError = (err, mensajeDefault) => {
  const data = err?.response?.data;

  console.error("Error de jornada:", data || err);

  if (data?.detail) {
    return data.detail;
  }

  if (data?.non_field_errors?.length) {
    return data.non_field_errors[0];
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];

    if (Array.isArray(firstValue)) {
      return `${firstKey}: ${firstValue[0]}`;
    }

    if (typeof firstValue === "string") {
      return `${firstKey}: ${firstValue}`;
    }
  }

  return mensajeDefault;
};

const jornadaTieneKmFinal = (jornada) => {
  return (
    jornada?.kilometraje_final !== null &&
    jornada?.kilometraje_final !== undefined &&
    jornada?.kilometraje_final !== ""
  );
};

const obtenerId = (valor) => {
  if (!valor) return null;

  if (typeof valor === "object") {
    return Number(valor.id);
  }

  return Number(valor);
};

const normalizarFecha = (fecha) => {
  if (!fecha) return "";

  return String(fecha).slice(0, 10);
};

export const useJornadas = () => {
  const auth = useAuth();
  const rol = obtenerCodigoRol(auth);

  const [jornadas, setJornadas] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [jornadaEditando, setJornadaEditando] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const hoy = obtenerFechaLocal();

  const esSuperAdmin =
    rol === "superadmin" || rol === "super_admin";

  const esAdminSucursal =
    rol === "admin_sucursal";

  const esTaxista =
    rol === "taxista";

  const cargarJornadas = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getJornadas();

      setJornadas(
        normalizarLista(data)
      );
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudieron cargar las jornadas."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      setError("");

      const [
        conductoresData,
        vehiculosData,
        asignacionesData,
      ] = await Promise.all([
        getConductores(),
        getVehiculos(),
        getAsignaciones(),
      ]);

      setConductores(
        normalizarLista(conductoresData)
      );

      setVehiculos(
        normalizarLista(vehiculosData)
      );

      setAsignaciones(
        normalizarLista(asignacionesData)
      );
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudieron cargar conductores, vehículos y asignaciones."
        )
      );
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const conductorTaxista = useMemo(() => {
    if (!esTaxista) return null;

    return conductores[0] || null;
  }, [
    conductores,
    esTaxista,
  ]);

  const asignacionActivaTaxista = useMemo(() => {
    if (!esTaxista) return null;

    return (
      asignaciones.find((asignacion) => {
        const conductorId = obtenerId(
          asignacion.conductor
        );

        const conductorActualId = obtenerId(
          conductorTaxista?.id
        );

        return (
          asignacion.activa !== false &&
          (
            !conductorActualId ||
            conductorId === conductorActualId
          )
        );
      }) || null
    );
  }, [
    asignaciones,
    conductorTaxista,
    esTaxista,
  ]);

  const vehiculoTaxista = useMemo(() => {
    if (!esTaxista) return null;

    const vehiculoAsignadoId = obtenerId(
      asignacionActivaTaxista?.vehiculo
    );

    if (vehiculoAsignadoId) {
      return (
        vehiculos.find((vehiculo) => {
          return (
            obtenerId(vehiculo.id) ===
            vehiculoAsignadoId
          );
        }) || {
          id: vehiculoAsignadoId,
        }
      );
    }

    return vehiculos[0] || null;
  }, [
    vehiculos,
    asignacionActivaTaxista,
    esTaxista,
  ]);

  const jornadasHoy = useMemo(() => {
    return jornadas.filter((jornada) => {
      return (
        normalizarFecha(jornada.fecha) === hoy
      );
    });
  }, [
    jornadas,
    hoy,
  ]);

  const jornadaAbiertaHoy = useMemo(() => {
    return (
      jornadasHoy.find((jornada) => {
        return !jornadaTieneKmFinal(jornada);
      }) || null
    );
  }, [
    jornadasHoy,
  ]);

  const jornadaCerradaHoy = useMemo(() => {
    return (
      jornadasHoy.find((jornada) => {
        return jornadaTieneKmFinal(jornada);
      }) || null
    );
  }, [
    jornadasHoy,
  ]);

  const abrirModalCrear = () => {
    setError("");

    if (esTaxista && jornadaAbiertaHoy) {
      setJornadaEditando({
        ...jornadaAbiertaHoy,
        modoFormulario: "cerrar",
      });

      setModalOpen(true);
      return;
    }

    setJornadaEditando(null);
    setModalOpen(true);
  };

  const abrirModalCerrar = (jornada) => {
    setError("");

    setJornadaEditando({
      ...jornada,
      modoFormulario: "cerrar",
    });

    setModalOpen(true);
  };

  const abrirModalEditar = (jornada) => {
    setError("");

    if (
      esTaxista &&
      !jornadaTieneKmFinal(jornada)
    ) {
      setJornadaEditando({
        ...jornada,
        modoFormulario: "cerrar",
      });

      setModalOpen(true);
      return;
    }

    setJornadaEditando({
      ...jornada,
      modoFormulario: "ingreso",
    });

    setModalOpen(true);
  };

  const abrirModalIngreso = abrirModalEditar;

  const cerrarModal = () => {
    setModalOpen(false);
    setJornadaEditando(null);
  };

  const buscarJornadaExistente = ({
    fecha,
    conductor,
    vehiculo,
  }) => {
    return jornadas.find((jornada) => {
      return (
        normalizarFecha(jornada.fecha) ===
          normalizarFecha(fecha) &&
        obtenerId(jornada.conductor) ===
          obtenerId(conductor) &&
        obtenerId(jornada.vehiculo) ===
          obtenerId(vehiculo)
      );
    });
  };

  const guardarJornada = async (form) => {
    try {
      setSaving(true);
      setError("");

      const modoFormulario =
        jornadaEditando?.modoFormulario;

      if (modoFormulario === "cerrar") {
      if (
        form.kilometraje_final === "" ||
        form.kilometraje_final === null ||
        form.kilometraje_final === undefined
      ) {
        setError(
          "Debes ingresar el kilometraje final."
        );

        return;
      }

      const kilometrajeFinal = Number(
        form.kilometraje_final
      );

      const ingresoBruto = Number(
        form.ingreso_bruto || 0
      );

      if (
        Number.isNaN(kilometrajeFinal) ||
        kilometrajeFinal < 0
      ) {
        setError(
          "El kilometraje final debe ser un número válido."
        );

        return;
      }

      if (
        Number.isNaN(ingresoBruto) ||
        ingresoBruto < 0
      ) {
        setError(
          "El monto bruto no puede ser negativo."
        );

        return;
      }

      await cerrarJornada(
        jornadaEditando.id,
        {
          kilometraje_final: kilometrajeFinal,
          ingreso_bruto: ingresoBruto,
          observaciones:
            form.observaciones || "",
        }
      );

      await cargarJornadas();
      await cargarCatalogos();

      cerrarModal();
      return;
    }

      if (jornadaEditando) {
        const tipoCobro =
          form.tipo_cobro || "porcentaje";

        if (tipoCobro === "alquiler") {
          await registrarIngresoJornada(
            jornadaEditando.id,
            {
              tipo_cobro: "alquiler",

              ingreso_bruto: 0,

              monto_alquiler: Number(
                form.monto_alquiler ||
                  form.ingreso_bruto ||
                  0
              ),

              porcentaje_pago_conductor: 0,

              observaciones:
                form.observaciones || "",
            }
          );
        } else {
          await registrarIngresoJornada(
            jornadaEditando.id,
            {
              tipo_cobro: "porcentaje",

              ingreso_bruto: Number(
                form.ingreso_bruto || 0
              ),

              monto_alquiler: 0,

              porcentaje_pago_conductor:
                Number(
                  form.porcentaje_pago_conductor ||
                    30
                ),

              observaciones:
                form.observaciones || "",
            }
          );
        }

        await cargarJornadas();
        await cargarCatalogos();

        cerrarModal();
        return;
      }

      if (!esTaxista) {
        setError(
          "Administración no debe crear jornadas desde aquí. Debe seleccionar una jornada existente y registrar el ingreso."
        );

        return;
      }

      const fecha =
        normalizarFecha(form.fecha) || hoy;

      const conductor =
        form.conductor ||
        conductorTaxista?.id ||
        asignacionActivaTaxista?.conductor ||
        null;

      const vehiculo =
        form.vehiculo ||
        vehiculoTaxista?.id ||
        asignacionActivaTaxista?.vehiculo ||
        null;

      if (!conductor) {
        setError(
          "No se encontró el conductor asociado a tu usuario."
        );

        return;
      }

      if (!vehiculo) {
        setError(
          "No tienes un vehículo activo asignado."
        );

        return;
      }

      const jornadaExistente =
        buscarJornadaExistente({
          fecha,
          conductor,
          vehiculo,
        });

      if (jornadaExistente) {
        if (
          jornadaTieneKmFinal(
            jornadaExistente
          )
        ) {
          setError(
            "Ya existe una jornada cerrada para este conductor y vehículo en esta fecha."
          );

          return;
        }

        if (
          form.kilometraje_final !== "" &&
          form.kilometraje_final !== null &&
          form.kilometraje_final !== undefined
        ) {
          if (
            form.ingreso_bruto === "" ||
            form.ingreso_bruto === null ||
            form.ingreso_bruto === undefined
          ) {
            setError(
              "Debes ingresar el ingreso bruto generado durante la jornada."
            );

            return;
          }

          const kilometrajeFinal = Number(
            form.kilometraje_final
          );

          const ingresoBruto = Number(
            form.ingreso_bruto
          );

          if (
            Number.isNaN(kilometrajeFinal) ||
            kilometrajeFinal < 0
          ) {
            setError(
              "El kilometraje final debe ser un número válido."
            );

            return;
          }

          if (
            Number.isNaN(ingresoBruto) ||
            ingresoBruto < 0
          ) {
            setError(
              "El ingreso bruto debe ser un monto válido."
            );

            return;
          }

          await cerrarJornada(
            jornadaExistente.id,
            {
              kilometraje_final:
                kilometrajeFinal,

              ingreso_bruto:
                ingresoBruto,

              observaciones:
                form.observaciones || "",
            }
          );

          await cargarJornadas();
          await cargarCatalogos();

          cerrarModal();
          return;
        }

        setJornadaEditando({
          ...jornadaExistente,
          modoFormulario: "cerrar",
        });

        setModalOpen(true);
        return;
      }

      if (
        form.kilometraje_inicial === "" ||
        form.kilometraje_inicial === null ||
        form.kilometraje_inicial === undefined
      ) {
        setError(
          "Debes ingresar el kilometraje inicial."
        );

        return;
      }

      await createJornada({
        fecha,

        conductor:
          obtenerId(conductor),

        vehiculo:
          obtenerId(vehiculo),

        kilometraje_inicial:
          Number(
            form.kilometraje_inicial
          ),

        observaciones:
          form.observaciones || "",
      });

      await cargarJornadas();
      await cargarCatalogos();

      cerrarModal();
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudo guardar la jornada."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const eliminarJornada = async (jornada) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar la jornada de ${
        jornada.conductor_nombre ||
        "este conductor"
      }?`
    );

    if (!confirmar) return;

    try {
      setSaving(true);
      setError("");

      await deleteJornada(
        jornada.id
      );

      await cargarJornadas();
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudo eliminar la jornada."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const jornadasFiltradas = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return jornadas;
    }

    return jornadas.filter((jornada) => {
      const conductor =
        jornada.conductor_nombre
          ?.toLowerCase() || "";

      const placa =
        jornada.vehiculo_placa
          ?.toLowerCase() || "";

      const numero =
        jornada.vehiculo_numero
          ?.toLowerCase() || "";

      const fecha =
        normalizarFecha(
          jornada.fecha
        ).toLowerCase();

      return (
        conductor.includes(value) ||
        placa.includes(value) ||
        numero.includes(value) ||
        fecha.includes(value)
      );
    });
  }, [
    jornadas,
    search,
  ]);

  const totalJornadas =
    jornadasHoy.length;

  const ingresoTotal =
    jornadasHoy.reduce(
      (total, jornada) => {
        return (
          total +
          Number(
            jornada.ingreso_bruto || 0
          )
        );
      },
      0
    );

  const pagoConductoresTotal =
    jornadasHoy.reduce(
      (total, jornada) => {
        return (
          total +
          Number(
            jornada.pago_conductor || 0
          )
        );
      },
      0
    );

  const gananciaTotal =
    jornadasHoy.reduce(
      (total, jornada) => {
        return (
          total +
          Number(
            jornada.ganancia_real_dueno ??
              jornada.ganancia_dueno ??
              0
          )
        );
      },
      0
    );

  const kilometrosTotal =
    jornadasHoy.reduce(
      (total, jornada) => {
        return (
          total +
          Number(
            jornada.kilometros_recorridos ||
              0
          )
        );
      },
      0
    );

  useEffect(() => {
    cargarJornadas();
    cargarCatalogos();
  }, []);

  return {
    jornadas,
    jornadasHoy,
    jornadasFiltradas,

    conductores,
    vehiculos,
    asignaciones,

    loading,
    loadingCatalogos,
    saving,

    error,
    setError,

    search,
    setSearch,

    modalOpen,
    jornadaEditando,

    totalJornadas,
    ingresoTotal,
    pagoConductoresTotal,
    gananciaTotal,
    kilometrosTotal,

    jornadaAbiertaHoy,
    jornadaCerradaHoy,

    rol,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,

    cargarJornadas,
    cargarCatalogos,

    abrirModalCrear,
    abrirModalCerrar,
    abrirModalEditar,
    abrirModalIngreso,

    cerrarModal,
    guardarJornada,
    eliminarJornada,
  };
};