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

  if (data?.detail) return data.detail;

  if (data?.non_field_errors?.length) {
    return data.non_field_errors[0];
  }

  if (typeof data === "string") return data;

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

  const esSuperAdmin = rol === "superadmin" || rol === "super_admin";
  const esAdminSucursal = rol === "admin_sucursal";
  const esTaxista = rol === "taxista";

  const cargarJornadas = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getJornadas();
      setJornadas(normalizarLista(data));
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudieron cargar las jornadas."));
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      setError("");

      const [conductoresData, vehiculosData, asignacionesData] =
        await Promise.all([getConductores(), getVehiculos(), getAsignaciones()]);

      setConductores(normalizarLista(conductoresData));
      setVehiculos(normalizarLista(vehiculosData));
      setAsignaciones(normalizarLista(asignacionesData));
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
  }, [conductores, esTaxista]);

  const asignacionActivaTaxista = useMemo(() => {
    if (!esTaxista) return null;

    return (
      asignaciones.find((asignacion) => {
        const conductorId = obtenerId(asignacion.conductor);
        const conductorActualId = obtenerId(conductorTaxista?.id);

        return (
          asignacion.activa !== false &&
          (!conductorActualId || conductorId === conductorActualId)
        );
      }) || null
    );
  }, [asignaciones, conductorTaxista, esTaxista]);

  const vehiculoTaxista = useMemo(() => {
    if (!esTaxista) return null;

    const vehiculoAsignadoId = obtenerId(asignacionActivaTaxista?.vehiculo);

    if (vehiculoAsignadoId) {
      return (
        vehiculos.find((vehiculo) => obtenerId(vehiculo.id) === vehiculoAsignadoId) ||
        {
          id: vehiculoAsignadoId,
        }
      );
    }

    return vehiculos[0] || null;
  }, [vehiculos, asignacionActivaTaxista, esTaxista]);

  const abrirModalCrear = () => {
    setError("");

    if (esTaxista) {
      const jornadaAbierta = jornadas.find(
        (jornada) => jornada.fecha === hoy && !jornadaTieneKmFinal(jornada)
      );

      if (jornadaAbierta) {
        setJornadaEditando({
          ...jornadaAbierta,
          modoFormulario: "cerrar",
        });
        setModalOpen(true);
        return;
      }
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

    if (esTaxista && !jornadaTieneKmFinal(jornada)) {
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

  const buscarJornadaExistente = ({ fecha, conductor, vehiculo }) => {
    return jornadas.find((jornada) => {
      return (
        jornada.fecha === fecha &&
        obtenerId(jornada.conductor) === obtenerId(conductor) &&
        obtenerId(jornada.vehiculo) === obtenerId(vehiculo)
      );
    });
  };

  const guardarJornada = async (form) => {
    try {
      setSaving(true);
      setError("");

      const modoFormulario = jornadaEditando?.modoFormulario;

      if (modoFormulario === "cerrar") {
        if (
          form.kilometraje_final === "" ||
          form.kilometraje_final === null ||
          form.kilometraje_final === undefined
        ) {
          setError("Debes ingresar el kilometraje final.");
          return;
        }

        await cerrarJornada(jornadaEditando.id, {
          kilometraje_final: Number(form.kilometraje_final),
          observaciones: form.observaciones || "",
        });

        await cargarJornadas();
        await cargarCatalogos();
        cerrarModal();
        return;
      }

      if (jornadaEditando) {
        const tipoCobro = form.tipo_cobro || "porcentaje";

        if (tipoCobro === "alquiler") {
          await registrarIngresoJornada(jornadaEditando.id, {
            tipo_cobro: "alquiler",
            ingreso_bruto: 0,
            monto_alquiler: Number(form.monto_alquiler || form.ingreso_bruto || 0),
            porcentaje_pago_conductor: 0,
            observaciones: form.observaciones || "",
          });
        } else {
          await registrarIngresoJornada(jornadaEditando.id, {
            tipo_cobro: "porcentaje",
            ingreso_bruto: Number(form.ingreso_bruto || 0),
            monto_alquiler: 0,
            porcentaje_pago_conductor: Number(
              form.porcentaje_pago_conductor || 30
            ),
            observaciones: form.observaciones || "",
          });
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

      const fecha = form.fecha || hoy;

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
        setError("No se encontró el conductor asociado a tu usuario.");
        return;
      }

      if (!vehiculo) {
        setError("No tienes un vehículo activo asignado.");
        return;
      }

      const jornadaExistente = buscarJornadaExistente({
        fecha,
        conductor,
        vehiculo,
      });

      if (jornadaExistente) {
        if (jornadaTieneKmFinal(jornadaExistente)) {
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
          await cerrarJornada(jornadaExistente.id, {
            kilometraje_final: Number(form.kilometraje_final),
            observaciones: form.observaciones || "",
          });

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
        setError("Debes ingresar el kilometraje inicial.");
        return;
      }

      await createJornada({
        fecha,
        conductor: obtenerId(conductor),
        vehiculo: obtenerId(vehiculo),
        kilometraje_inicial: Number(form.kilometraje_inicial),
        observaciones: form.observaciones || "",
      });

      await cargarJornadas();
      await cargarCatalogos();
      cerrarModal();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo guardar la jornada."));
    } finally {
      setSaving(false);
    }
  };

  const eliminarJornada = async (jornada) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar la jornada de ${
        jornada.conductor_nombre || "este conductor"
      }?`
    );

    if (!confirmar) return;

    try {
      setSaving(true);
      setError("");

      await deleteJornada(jornada.id);
      await cargarJornadas();
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo eliminar la jornada."));
    } finally {
      setSaving(false);
    }
  };

  const jornadasFiltradas = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return jornadas;

    return jornadas.filter((jornada) => {
      const conductor = jornada.conductor_nombre?.toLowerCase() || "";
      const placa = jornada.vehiculo_placa?.toLowerCase() || "";
      const numero = jornada.vehiculo_numero?.toLowerCase() || "";
      const fecha = jornada.fecha?.toLowerCase() || "";

      return (
        conductor.includes(value) ||
        placa.includes(value) ||
        numero.includes(value) ||
        fecha.includes(value)
      );
    });
  }, [jornadas, search]);

  const jornadasHoyTaxista = useMemo(() => {
    if (!esTaxista) return [];
    return jornadas.filter((jornada) => jornada.fecha === hoy);
  }, [jornadas, esTaxista, hoy]);

  const jornadaAbiertaHoy = useMemo(() => {
    return (
      jornadasHoyTaxista.find((jornada) => !jornadaTieneKmFinal(jornada)) ||
      null
    );
  }, [jornadasHoyTaxista]);

  const jornadaCerradaHoy = useMemo(() => {
    return (
      jornadasHoyTaxista.find((jornada) => jornadaTieneKmFinal(jornada)) ||
      null
    );
  }, [jornadasHoyTaxista]);

  const totalJornadas = jornadas.length;

  const ingresoTotal = jornadas.reduce((total, jornada) => {
    return total + Number(jornada.ingreso_bruto || 0);
  }, 0);

  const pagoConductoresTotal = jornadas.reduce((total, jornada) => {
    return total + Number(jornada.pago_conductor || 0);
  }, 0);

  const gananciaTotal = jornadas.reduce((total, jornada) => {
    return total + Number(jornada.ganancia_real_dueno ?? jornada.ganancia_dueno ?? 0);
  }, 0);

  const kilometrosTotal = jornadas.reduce((total, jornada) => {
    return total + Number(jornada.kilometros_recorridos || 0);
  }, 0);

  useEffect(() => {
    cargarJornadas();
    cargarCatalogos();
  }, []);

  return {
    jornadas,
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