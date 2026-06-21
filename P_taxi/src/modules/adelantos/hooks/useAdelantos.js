
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../../hooks/useAuth";
import {
  createAdelanto,
  deleteAdelanto,
  getAdelantos,
  getConductores,
  getEstadosAdelanto,
  getRecibo,
  getSucursales,
  updateAdelanto,
} from "../services/adelantosService";

const normalizarLista = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const normalizarRol = (auth) => {
  let codigo =
    auth?.rol ||
    auth?.user?.rol_codigo ||
    auth?.user?.rol?.codigo ||
    auth?.user?.rol ||
    "";

  codigo = String(codigo).trim().toLowerCase();

  const equivalencias = {
    super_admin: "superadmin",
    admin: "admin_sucursal",
    administrador: "admin_sucursal",
    "administrador de sucursal": "admin_sucursal",
  };

  return equivalencias[codigo] || codigo;
};

const obtenerFechaMovimiento = (movimiento) => {
  const fecha =
    movimiento?.fecha ||
    movimiento?.fecha_registro ||
    movimiento?.created_at ||
    "";

  return String(fecha).slice(0, 10);
};

const obtenerTimestamp = (movimiento) => {
  const fecha = obtenerFechaMovimiento(movimiento);

  if (!fecha) return 0;

  const timestamp = new Date(`${fecha}T00:00:00`).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const obtenerConductorId = (movimiento) => {
  const conductor = movimiento?.conductor;

  if (conductor && typeof conductor === "object") {
    return conductor.id || "";
  }

  return conductor || "";
};

const obtenerTipoMovimiento = (movimiento) => {
  const tipoDirecto = String(movimiento?.tipo || "")
    .trim()
    .toUpperCase();

  if (tipoDirecto === "ADELANTO" || tipoDirecto === "ABONO") {
    return tipoDirecto;
  }

  const codigoEstado = String(
    movimiento?.estado_codigo ||
      movimiento?.estado?.codigo ||
      ""
  )
    .trim()
    .toLowerCase();

  if (
    codigoEstado === "abono" ||
    codigoEstado === "abonado"
  ) {
    return "ABONO";
  }

  if (
    codigoEstado === "adelanto" ||
    codigoEstado === "anticipo"
  ) {
    return "ADELANTO";
  }

  const nombreEstado = String(
    movimiento?.estado_nombre ||
      movimiento?.estado?.nombre ||
      movimiento?.tipo_display ||
      ""
  )
    .trim()
    .toLowerCase();

  if (
    nombreEstado.includes("abono") ||
    nombreEstado.includes("abonado")
  ) {
    return "ABONO";
  }

  return "ADELANTO";
};

const obtenerMensajeError = (err, mensajeDefault) => {
  const data = err?.response?.data;

  console.error("Error de adelanto:", data || err);

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

export const useAdelantos = () => {
  const auth = useAuth();
  const rol = normalizarRol(auth);

  const esSuperAdmin = rol === "superadmin";
  const esAdminSucursal = rol === "admin_sucursal";
  const esTaxista = rol === "taxista";

  const esAdminOSuperAdmin =
    esSuperAdmin || esAdminSucursal;

  const [adelantos, setAdelantos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [estadosAdelanto, setEstadosAdelanto] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [adelantoEditando, setAdelantoEditando] = useState(null);
  const [tipoInicial, setTipoInicial] = useState("ADELANTO");

  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [filtroConductor, setFiltroConductor] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");

  const [error, setError] = useState("");

  const cargarAdelantos = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdelantos();

      setAdelantos(normalizarLista(data));
    } catch (err) {
      setAdelantos([]);

      setError(
        obtenerMensajeError(
          err,
          "No se pudieron cargar los adelantos y abonos."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    /*
     * El taxista solo consulta sus propios movimientos.
     * No necesita cargar conductores, sucursales ni estados.
     */
    if (!esAdminOSuperAdmin) {
      setConductores([]);
      setSucursales([]);
      setEstadosAdelanto([]);
      setLoadingCatalogos(false);
      return;
    }

    try {
      setLoadingCatalogos(true);
      setError("");

      const [conductoresData, estadosData] = await Promise.all([
        getConductores(),
        getEstadosAdelanto(),
      ]);

      setConductores(normalizarLista(conductoresData));
      setEstadosAdelanto(normalizarLista(estadosData));

      try {
        const sucursalesData = await getSucursales();

        setSucursales(normalizarLista(sucursalesData));
      } catch (err) {
        console.warn(
          "No se pudieron cargar las sucursales:",
          err?.response?.data || err
        );

        setSucursales([]);
      }
    } catch (err) {
      setConductores([]);
      setSucursales([]);
      setEstadosAdelanto([]);

      setError(
        obtenerMensajeError(
          err,
          "No se pudieron cargar los catálogos de adelantos."
        )
      );
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const abrirModalCrear = (tipo = "ADELANTO") => {
    if (!esAdminOSuperAdmin) {
      setError(
        "Solo un administrador puede registrar adelantos o abonos."
      );
      return;
    }

    const tipoNormalizado =
      String(tipo).trim().toUpperCase() === "ABONO"
        ? "ABONO"
        : "ADELANTO";

    setError("");
    setAdelantoEditando(null);
    setTipoInicial(tipoNormalizado);
    setModalOpen(true);
  };

  const abrirModalEditar = (adelanto) => {
    if (!esAdminOSuperAdmin) {
      setError(
        "No tienes permiso para modificar este registro."
      );
      return;
    }

    const tipoMovimiento = obtenerTipoMovimiento(adelanto);

    setError("");

    setAdelantoEditando({
      ...adelanto,
      tipo: tipoMovimiento,
    });

    setTipoInicial(tipoMovimiento);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    if (saving) return;

    setModalOpen(false);
    setAdelantoEditando(null);
    setTipoInicial("ADELANTO");
  };

  const guardarAdelanto = async (form) => {
    if (!esAdminOSuperAdmin) {
      setError(
        "No tienes permiso para guardar adelantos o abonos."
      );
      return;
    }

    const estabaEditando = Boolean(adelantoEditando);

    const tipoNormalizado =
      String(
        form.tipo ||
          tipoInicial ||
          "ADELANTO"
      )
        .trim()
        .toUpperCase() === "ABONO"
        ? "ABONO"
        : "ADELANTO";

    const payload = {
      conductor: form.conductor
        ? Number(form.conductor)
        : null,

      tipo: tipoNormalizado,

      monto: form.monto
        ? Number(form.monto)
        : 0,

      observacion:
        form.observacion?.trim() || "",
    };

    if (!payload.conductor) {
      setError("Debes seleccionar el conductor.");
      return;
    }

    if (
      Number.isNaN(payload.monto) ||
      payload.monto <= 0
    ) {
      setError("El monto debe ser mayor que cero.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      /*
       * No se envía el estado.
       * Django debe asignarlo automáticamente según:
       *
       * ADELANTO → estado adelanto
       * ABONO → estado abono
       */
      if (estabaEditando) {
        await updateAdelanto(
          adelantoEditando.id,
          payload
        );
      } else {
        await createAdelanto(payload);
      }

      await cargarAdelantos();

      setModalOpen(false);
      setAdelantoEditando(null);
      setTipoInicial("ADELANTO");

      await Swal.fire({
        title: estabaEditando
          ? "Registro actualizado"
          : tipoNormalizado === "ABONO"
            ? "Abono registrado"
            : "Adelanto registrado",

        text:
          tipoNormalizado === "ABONO"
            ? "El abono fue restado del saldo pendiente del conductor."
            : "El adelanto fue registrado correctamente.",

        icon: "success",
        confirmButtonColor: "#F5B800",
        confirmButtonText: "Aceptar",
      });
    } catch (err) {
      const mensaje = obtenerMensajeError(
        err,
        "No se pudo guardar el registro."
      );

      setError(mensaje);

      await Swal.fire({
        title: "No se pudo guardar",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Entendido",
      });
    } finally {
      setSaving(false);
    }
  };

  const eliminarAdelanto = async (adelanto) => {
    if (!esAdminOSuperAdmin) {
      setError(
        "No tienes permiso para eliminar registros."
      );
      return;
    }

    const tipoMovimiento =
      obtenerTipoMovimiento(adelanto);

    const etiqueta =
      tipoMovimiento === "ABONO"
        ? "abono"
        : "adelanto";

    const resultado = await Swal.fire({
      title: `¿Eliminar ${etiqueta}?`,

      text: `Se eliminará el registro de C$ ${Number(
        adelanto.monto || 0
      ).toFixed(2)}.`,

      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteAdelanto(adelanto.id);
      await cargarAdelantos();

      await Swal.fire({
        title: "Registro eliminado",
        text: `El ${etiqueta} fue eliminado correctamente.`,
        icon: "success",
        confirmButtonColor: "#F5B800",
        confirmButtonText: "Aceptar",
      });
    } catch (err) {
      const mensaje = obtenerMensajeError(
        err,
        "No se pudo eliminar el registro."
      );

      setError(mensaje);

      await Swal.fire({
        title: "No se pudo eliminar",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Entendido",
      });
    } finally {
      setSaving(false);
    }
  };

  const verRecibo = async (adelanto) => {
    try {
      setError("");

      return await getRecibo(adelanto.id);
    } catch (err) {
      const mensaje = obtenerMensajeError(
        err,
        "No se pudo abrir el recibo."
      );

      setError(mensaje);

      await Swal.fire({
        title: "No se pudo abrir el recibo",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Entendido",
      });

      return null;
    }
  };

  /*
   * Calcula el saldo histórico por conductor.
   *
   * ADELANTO suma.
   * ABONO resta.
   */
  const adelantosConSaldo = useMemo(() => {
    const movimientosOrdenados = [...adelantos].sort((a, b) => {
      const diferenciaFecha =
        obtenerTimestamp(a) - obtenerTimestamp(b);

      if (diferenciaFecha !== 0) {
        return diferenciaFecha;
      }

      return Number(a.id || 0) - Number(b.id || 0);
    });

    const saldosPorConductor = new Map();
    const saldosPorMovimiento = new Map();

    movimientosOrdenados.forEach((movimiento) => {
      const conductorId =
        obtenerConductorId(movimiento);

      const claveConductor = String(
        conductorId || "sin-conductor"
      );

      const saldoAnterior =
        saldosPorConductor.get(claveConductor) || 0;

      const monto = Number(movimiento.monto || 0);

      const tipo =
        obtenerTipoMovimiento(movimiento);

      const nuevoSaldo =
        tipo === "ABONO"
          ? Math.max(saldoAnterior - monto, 0)
          : saldoAnterior + monto;

      saldosPorConductor.set(
        claveConductor,
        nuevoSaldo
      );

      saldosPorMovimiento.set(
        String(movimiento.id),
        nuevoSaldo
      );
    });

    return adelantos.map((movimiento) => ({
      ...movimiento,

      tipo:
        obtenerTipoMovimiento(movimiento),

      fecha_movimiento:
        obtenerFechaMovimiento(movimiento),

      saldo_movimiento:
        saldosPorMovimiento.get(
          String(movimiento.id)
        ) ?? 0,
    }));
  }, [adelantos]);

  const adelantosFiltrados = useMemo(() => {
    return adelantosConSaldo.filter((adelanto) => {
      if (
        filtroTipo !== "TODOS" &&
        adelanto.tipo !== filtroTipo
      ) {
        return false;
      }

      if (
        esAdminOSuperAdmin &&
        filtroConductor &&
        String(obtenerConductorId(adelanto)) !==
          String(filtroConductor)
      ) {
        return false;
      }

      const fecha = adelanto.fecha_movimiento;

      if (
        filtroFechaInicio &&
        fecha &&
        fecha < filtroFechaInicio
      ) {
        return false;
      }

      if (
        filtroFechaFin &&
        fecha &&
        fecha > filtroFechaFin
      ) {
        return false;
      }

      return true;
    });
  }, [
    adelantosConSaldo,
    filtroTipo,
    filtroConductor,
    filtroFechaInicio,
    filtroFechaFin,
    esAdminOSuperAdmin,
  ]);

  const resumen = useMemo(() => {
    let totalAdelantos = 0;
    let totalAbonos = 0;
    let montoAdelantos = 0;
    let montoAbonos = 0;

    const saldosFinales = new Map();

    const movimientosOrdenados =
      [...adelantosConSaldo].sort((a, b) => {
        const diferenciaFecha =
          obtenerTimestamp(a) - obtenerTimestamp(b);

        if (diferenciaFecha !== 0) {
          return diferenciaFecha;
        }

        return Number(a.id || 0) - Number(b.id || 0);
      });

    movimientosOrdenados.forEach((movimiento) => {
      const monto = Number(movimiento.monto || 0);
      const tipo = obtenerTipoMovimiento(movimiento);

      const conductorId =
        obtenerConductorId(movimiento);

      const claveConductor = String(
        conductorId || "sin-conductor"
      );

      const saldoAnterior =
        saldosFinales.get(claveConductor) || 0;

      if (tipo === "ABONO") {
        totalAbonos += 1;
        montoAbonos += monto;

        saldosFinales.set(
          claveConductor,
          Math.max(saldoAnterior - monto, 0)
        );
      } else {
        totalAdelantos += 1;
        montoAdelantos += monto;

        saldosFinales.set(
          claveConductor,
          saldoAnterior + monto
        );
      }
    });

    const saldo = Array.from(
      saldosFinales.values()
    ).reduce(
      (total, valor) =>
        total + Number(valor || 0),
      0
    );

    return {
      totalAdelantos,
      totalAbonos,
      montoAdelantos,
      montoAbonos,
      saldo,
    };
  }, [adelantosConSaldo]);

  const ultimoMovimiento = useMemo(() => {
    if (!adelantosConSaldo.length) {
      return null;
    }

    return [...adelantosConSaldo].sort((a, b) => {
      const diferenciaFecha =
        obtenerTimestamp(b) - obtenerTimestamp(a);

      if (diferenciaFecha !== 0) {
        return diferenciaFecha;
      }

      return Number(b.id || 0) - Number(a.id || 0);
    })[0];
  }, [adelantosConSaldo]);

  const limpiarFiltros = () => {
    setFiltroTipo("TODOS");
    setFiltroConductor("");
    setFiltroFechaInicio("");
    setFiltroFechaFin("");
  };

  useEffect(() => {
    cargarAdelantos();

    if (esAdminOSuperAdmin) {
      cargarCatalogos();
    } else {
      setConductores([]);
      setSucursales([]);
      setEstadosAdelanto([]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rol]);

  return {
    adelantos,
    adelantosFiltrados,

    conductores,
    sucursales,
    estadosAdelanto,

    loading,
    loadingCatalogos,
    saving,

    error,
    setError,

    filtroTipo,
    setFiltroTipo,

    filtroConductor,
    setFiltroConductor,

    filtroFechaInicio,
    setFiltroFechaInicio,

    filtroFechaFin,
    setFiltroFechaFin,

    limpiarFiltros,

    modalOpen,
    adelantoEditando,
    tipoInicial,

    totalAdelantos:
      resumen.totalAdelantos,

    totalAbonos:
      resumen.totalAbonos,

    montoAdelantos:
      resumen.montoAdelantos,

    montoAbonos:
      resumen.montoAbonos,

    saldo:
      resumen.saldo,

    ultimoMovimiento,

    rol,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,
    esAdminOSuperAdmin,

    cargarAdelantos,
    cargarCatalogos,

    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,

    guardarAdelanto,
    eliminarAdelanto,
    verRecibo,
  };
};

