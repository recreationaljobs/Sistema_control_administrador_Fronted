import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import { useAuth } from "../../../hooks/useAuth";

import {
  createGasto,
  deleteGasto,
  getEstadosGasto,
  getGastos,
  getJornadas,
  getTiposGasto,
  getVehiculos,
  updateGasto,
} from "../services/gastosService";

const normalizarLista = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const obtenerFechaLocal = () => {
  const fecha = new Date();

  const year = fecha.getFullYear();
  const month = String(
    fecha.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    fecha.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const obtenerCodigoRol = (auth) => {
  let rol =
    auth?.rol ||
    auth?.user?.rol_codigo ||
    auth?.user?.rol ||
    "";

  if (typeof rol === "object") {
    rol = rol.codigo || rol.nombre || "";
  }

  const codigo = String(rol)
    .trim()
    .toLowerCase();

  if (codigo === "super_admin") {
    return "superadmin";
  }

  if (
    [
      "admin",
      "administrador",
      "administrador de sucursal",
    ].includes(codigo)
  ) {
    return "admin_sucursal";
  }

  return codigo;
};

const obtenerMensajeError = (
  err,
  mensajeDefault
) => {
  const data = err?.response?.data;

  console.error("Error de gasto:", data || err);

  if (data?.detail) {
    return data.detail;
  }

  if (data?.non_field_errors?.length) {
    return data.non_field_errors[0];
  }

  if (typeof data === "string") {
    return data;
  }

  if (
    typeof data === "object" &&
    data !== null
  ) {
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

const mostrarErrorValidacion = async (
  mensaje
) => {
  await Swal.fire({
    title: "Revisa los datos",
    text: mensaje,
    icon: "warning",
    confirmButtonText: "Entendido",
    confirmButtonColor: "#E7A900",
  });
};

export const useGastos = () => {
  const auth = useAuth();
  const rol = obtenerCodigoRol(auth);

  const [gastos, setGastos] = useState([]);
  const [jornadas, setJornadas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tiposGasto, setTiposGasto] = useState([]);
  const [estadosGasto, setEstadosGasto] = useState([]);

  const [loading, setLoading] = useState(false);
  const [
    loadingCatalogos,
    setLoadingCatalogos,
  ] = useState(false);

  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [
    gastoEditando,
    setGastoEditando,
  ] = useState(null);

  const [search, setSearch] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [error, setError] = useState("");

  const hoy = obtenerFechaLocal();

  const esSuperAdmin =
    rol === "superadmin";

  const esAdminSucursal =
    rol === "admin_sucursal";

  const esTaxista =
    rol === "taxista";

  const cargarGastos = async (
    filtros = {}
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      const inicio =
        filtros.fecha_inicio ??
        fechaInicio;

      const fin =
        filtros.fecha_fin ??
        fechaFin;

      if (inicio) {
        params.fecha_inicio = inicio;
      }

      if (fin) {
        params.fecha_fin = fin;
      }

      const data = await getGastos(params);

      setGastos(
        normalizarLista(data)
      );
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudieron cargar los gastos."
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
        jornadasData,
        vehiculosData,
        tiposData,
        estadosData,
      ] = await Promise.all([
        getJornadas(),
        getVehiculos(),
        getTiposGasto(),
        getEstadosGasto(),
      ]);

      setJornadas(
        normalizarLista(jornadasData)
      );

      setVehiculos(
        normalizarLista(vehiculosData)
      );

      setTiposGasto(
        normalizarLista(tiposData)
      );

      setEstadosGasto(
        normalizarLista(estadosData)
      );
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudieron cargar los catálogos de gastos."
        )
      );
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const abrirModalCrear = () => {
    setError("");
    setGastoEditando(null);
    setModalOpen(true);
  };

  const abrirModalEditar = (gasto) => {
    setError("");
    setGastoEditando(gasto);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setGastoEditando(null);
  };

  const guardarGasto = async (form) => {
    const monto = Number(form.monto);
    const fecha = form.fecha || hoy;

    const payload = {
      jornada: form.jornada
        ? Number(form.jornada)
        : null,

      vehiculo: form.vehiculo
        ? Number(form.vehiculo)
        : null,

      tipo_gasto: form.tipo_gasto
        ? Number(form.tipo_gasto)
        : null,

      estado: form.estado
        ? Number(form.estado)
        : null,

      descripcion: String(
        form.descripcion || ""
      ).trim(),

      monto,
      fecha,
    };

    if (
      !payload.vehiculo ||
      !Number.isInteger(payload.vehiculo)
    ) {
      const mensaje =
        "Debes seleccionar el vehículo al que corresponde el gasto.";

      setError(mensaje);
      await mostrarErrorValidacion(mensaje);
      return false;
    }

    if (
      !payload.tipo_gasto ||
      !Number.isInteger(payload.tipo_gasto)
    ) {
      const mensaje =
        "Debes seleccionar el tipo de gasto.";

      setError(mensaje);
      await mostrarErrorValidacion(mensaje);
      return false;
    }

    if (
      !payload.estado ||
      !Number.isInteger(payload.estado)
    ) {
      const mensaje =
        "Debes seleccionar el estado del gasto.";

      setError(mensaje);
      await mostrarErrorValidacion(mensaje);
      return false;
    }

    if (!fecha) {
      const mensaje =
        "Debes indicar la fecha del gasto.";

      setError(mensaje);
      await mostrarErrorValidacion(mensaje);
      return false;
    }

    if (fecha > hoy) {
      const mensaje =
        "No puedes registrar gastos con una fecha futura.";

      setError(mensaje);
      await mostrarErrorValidacion(mensaje);
      return false;
    }

    if (
      !Number.isFinite(monto) ||
      monto <= 0
    ) {
      const mensaje =
        "El monto del gasto debe ser mayor que cero.";

      setError(mensaje);
      await mostrarErrorValidacion(mensaje);
      return false;
    }

    if (monto > 10000000) {
      const mensaje =
        "El monto ingresado parece demasiado alto. Revísalo antes de guardar.";

      setError(mensaje);
      await mostrarErrorValidacion(mensaje);
      return false;
    }

    if (payload.descripcion.length > 500) {
      const mensaje =
        "La descripción no puede tener más de 500 caracteres.";

      setError(mensaje);
      await mostrarErrorValidacion(mensaje);
      return false;
    }

    if (
      !esTaxista &&
      form.conductor
    ) {
      payload.conductor = Number(
        form.conductor
      );
    }

    try {
      setSaving(true);
      setError("");

      if (gastoEditando?.id) {
        await updateGasto(
          gastoEditando.id,
          payload
        );
      } else {
        await createGasto(payload);
      }

      await Promise.all([
        cargarGastos(),
        cargarCatalogos(),
      ]);

      cerrarModal();

      await Swal.fire({
        title: gastoEditando
          ? "Gasto actualizado"
          : "Gasto registrado",

        text: gastoEditando
          ? "Los datos del gasto fueron actualizados correctamente."
          : "El gasto fue registrado correctamente.",

        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#059669",
        timer: 1800,
        timerProgressBar: true,
      });

      return true;
    } catch (err) {
      const mensaje = obtenerMensajeError(
        err,
        "No se pudo guardar el gasto."
      );

      setError(mensaje);

      await Swal.fire({
        title: "No se pudo guardar",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#dc2626",
      });

      return false;
    } finally {
      setSaving(false);
    }
  };

  const eliminarGasto = async (gasto) => {
    if (esTaxista) {
      const mensaje =
        "No tienes permiso para eliminar gastos.";

      setError(mensaje);

      await Swal.fire({
        title: "Acceso no permitido",
        text: mensaje,
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#E7A900",
      });

      return false;
    }

    if (!gasto?.id) {
      const mensaje =
        "No se encontró el gasto que deseas eliminar.";

      setError(mensaje);
      await mostrarErrorValidacion(mensaje);
      return false;
    }

    const monto = Number(
      gasto.monto || 0
    ).toLocaleString("es-NI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const resultado = await Swal.fire({
      title: "¿Eliminar gasto?",
      html: `
        <p style="color:#475569;font-size:14px;line-height:1.5;">
          Eliminarás un gasto por
          <strong>C$ ${monto}</strong>.
        </p>
        <p style="color:#dc2626;font-size:13px;margin-top:10px;">
          Esta acción no se puede deshacer.
        </p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!resultado.isConfirmed) {
      return false;
    }

    try {
      setSaving(true);
      setError("");

      await deleteGasto(gasto.id);

      await Promise.all([
        cargarGastos(),
        cargarCatalogos(),
      ]);

      await Swal.fire({
        title: "Gasto eliminado",
        text: "El gasto fue eliminado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#059669",
        timer: 1800,
        timerProgressBar: true,
      });

      return true;
    } catch (err) {
      const mensaje = obtenerMensajeError(
        err,
        "No se pudo eliminar el gasto."
      );

      setError(mensaje);

      await Swal.fire({
        title: "No se pudo eliminar",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#dc2626",
      });

      return false;
    } finally {
      setSaving(false);
    }
  };

  const aplicarFiltros = async () => {
    if (
      fechaInicio &&
      fechaFin &&
      fechaInicio > fechaFin
    ) {
      const mensaje =
        "La fecha inicial no puede ser mayor que la fecha final.";

      setError(mensaje);
      await mostrarErrorValidacion(mensaje);
      return;
    }

    await cargarGastos({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    });
  };

  const limpiarFiltros = async () => {
    setFechaInicio("");
    setFechaFin("");

    await cargarGastos({
      fecha_inicio: "",
      fecha_fin: "",
    });
  };

  const gastosFiltrados = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return gastos;
    }

    return gastos.filter((gasto) => {
      const tipo =
        gasto.tipo_gasto_nombre
          ?.toLowerCase() || "";

      const estado =
        gasto.estado_nombre
          ?.toLowerCase() || "";

      const vehiculo =
        gasto.vehiculo_descripcion
          ?.toLowerCase() || "";

      const placa =
        gasto.vehiculo_placa
          ?.toLowerCase() || "";

      const conductor =
        gasto.conductor_nombre
          ?.toLowerCase() || "";

      const descripcion =
        gasto.descripcion
          ?.toLowerCase() || "";

      const sucursal =
        gasto.sucursal_nombre
          ?.toLowerCase() || "";

      const fecha =
        gasto.fecha?.toLowerCase() || "";

      return (
        tipo.includes(value) ||
        estado.includes(value) ||
        vehiculo.includes(value) ||
        placa.includes(value) ||
        conductor.includes(value) ||
        descripcion.includes(value) ||
        sucursal.includes(value) ||
        fecha.includes(value)
      );
    });
  }, [gastos, search]);

  const jornadasDisponibles = useMemo(() => {
    return jornadas.filter((jornada) =>
      Boolean(jornada?.id)
    );
  }, [jornadas]);

  const vehiculosDisponibles = useMemo(() => {
    return vehiculos.filter((vehiculo) =>
      Boolean(vehiculo?.id)
    );
  }, [vehiculos]);

  const totalGastos = gastos.length;

  const montoTotal = gastos.reduce(
    (total, gasto) =>
      total + Number(gasto.monto || 0),
    0
  );

  const gastosConJornada = gastos.filter(
    (gasto) => gasto.jornada
  ).length;

  const gastosSinJornada = gastos.filter(
    (gasto) => !gasto.jornada
  ).length;

  const gastosHoy = gastos.filter(
    (gasto) => gasto.fecha === hoy
  );

  const montoHoy = gastosHoy.reduce(
    (total, gasto) =>
      total + Number(gasto.monto || 0),
    0
  );

  useEffect(() => {
    cargarGastos();
    cargarCatalogos();
  }, []);

  return {
    gastos,
    gastosFiltrados,

    jornadas,
    jornadasDisponibles,
    vehiculos,
    vehiculosDisponibles,
    tiposGasto,
    estadosGasto,

    loading,
    loadingCatalogos,
    saving,

    error,
    setError,

    search,
    setSearch,

    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,

    modalOpen,
    gastoEditando,

    totalGastos,
    montoTotal,
    gastosConJornada,
    gastosSinJornada,
    gastosHoy,
    montoHoy,

    rol,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,

    cargarGastos,
    cargarCatalogos,

    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,

    guardarGasto,
    eliminarGasto,

    aplicarFiltros,
    limpiarFiltros,
  };
};