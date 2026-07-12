import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  if (Array.isArray(data)) {
    return data.filter(Boolean);
  }

  if (Array.isArray(data?.results)) {
    return data.results.filter(Boolean);
  }

  if (Array.isArray(data?.data)) {
    return data.data.filter(Boolean);
  }

  if (Array.isArray(data?.data?.results)) {
    return data.data.results.filter(Boolean);
  }

  return [];
};

const normalizarRol = (auth) => {
  let codigo = auth?.rol;

  if (
    codigo &&
    typeof codigo === "object"
  ) {
    codigo =
      codigo.codigo ||
      codigo.nombre ||
      "";
  }

  codigo =
    codigo ||
    auth?.user?.rol_codigo ||
    auth?.user?.rol?.codigo ||
    auth?.user?.rol_nombre ||
    "";

  codigo = String(codigo)
    .trim()
    .toLowerCase();

  const equivalencias = {
    super_admin: "superadmin",
    admin: "admin_sucursal",
    administrador: "admin_sucursal",
    "administrador de sucursal":
      "admin_sucursal",
  };

  return equivalencias[codigo] || codigo;
};

const obtenerFechaMovimiento = (
  movimiento
) => {
  const fecha =
    movimiento?.fecha ||
    movimiento?.fecha_registro ||
    movimiento?.created_at ||
    "";

  return String(fecha).slice(0, 10);
};

const obtenerTimestamp = (
  movimiento
) => {
  const fecha =
    obtenerFechaMovimiento(movimiento);

  if (!fecha) {
    return 0;
  }

  const timestamp = new Date(
    `${fecha}T00:00:00`
  ).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
};

const obtenerConductorId = (
  movimiento
) => {
  const conductor =
    movimiento?.conductor;

  if (
    conductor &&
    typeof conductor === "object"
  ) {
    return conductor.id || "";
  }

  return conductor || "";
};

const obtenerTipoMovimiento = (
  movimiento
) => {
  const tipoDirecto = String(
    movimiento?.tipo || ""
  )
    .trim()
    .toUpperCase();

  if (
    tipoDirecto === "ADELANTO" ||
    tipoDirecto === "ABONO"
  ) {
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

const obtenerMensajeError = (
  error,
  mensajeDefault
) => {
  const data = error?.response?.data;

  console.error(
    "Error en adelantos:",
    data || error
  );

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (
    Array.isArray(
      data?.non_field_errors
    ) &&
    data.non_field_errors.length
  ) {
    return data.non_field_errors[0];
  }

  if (typeof data === "string") {
    return data;
  }

  if (
    typeof data === "object" &&
    data !== null
  ) {
    const primeraClave =
      Object.keys(data)[0];

    const primerValor =
      data[primeraClave];

    if (Array.isArray(primerValor)) {
      return `${primeraClave}: ${primerValor[0]}`;
    }

    if (
      typeof primerValor === "string"
    ) {
      return `${primeraClave}: ${primerValor}`;
    }
  }

  return (
    error?.message ||
    mensajeDefault
  );
};

const mostrarExito = (
  titulo,
  texto
) => {
  Swal.close();

  void Swal.fire({
    title: titulo,
    text: texto,
    icon: "success",

    showConfirmButton: false,
    showCancelButton: false,

    timer: 1800,
    timerProgressBar: true,

    allowOutsideClick: true,
    allowEscapeKey: true,
    allowEnterKey: true,
  });
};

const mostrarError = (
  titulo,
  texto
) => {
  Swal.close();

  void Swal.fire({
    title: titulo,
    text: texto,
    icon: "error",

    confirmButtonText: "Entendido",
    confirmButtonColor: "#dc2626",

    allowOutsideClick: true,
    allowEscapeKey: true,
  });
};

export const useAdelantos = () => {
  const auth = useAuth();
  const rol = normalizarRol(auth);

  const esSuperAdmin =
    rol === "superadmin";

  const esAdminSucursal =
    rol === "admin_sucursal";

  const esTaxista =
    rol === "taxista";

  const esAdminOSuperAdmin =
    esSuperAdmin ||
    esAdminSucursal;

  const [adelantos, setAdelantos] =
    useState([]);

  const [conductores, setConductores] =
    useState([]);

  const [sucursales, setSucursales] =
    useState([]);

  const [
    estadosAdelanto,
    setEstadosAdelanto,
  ] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [
    loadingCatalogos,
    setLoadingCatalogos,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    adelantoEditando,
    setAdelantoEditando,
  ] = useState(null);

  const [
    tipoInicial,
    setTipoInicial,
  ] = useState("ADELANTO");

  const [
    filtroTipo,
    setFiltroTipo,
  ] = useState("TODOS");

  const [
    filtroConductor,
    setFiltroConductor,
  ] = useState("");

  const [
    filtroFechaInicio,
    setFiltroFechaInicio,
  ] = useState("");

  const [
    filtroFechaFin,
    setFiltroFechaFin,
  ] = useState("");

  const [error, setError] =
    useState("");

  /*
   * mostrarCarga=false evita que la tabla
   * desaparezca después de guardar o eliminar.
   */
  const cargarAdelantos = async ({
    mostrarCarga = true,
  } = {}) => {
    try {
      if (mostrarCarga) {
        setLoading(true);
      }

      setError("");

      const data =
        await getAdelantos();

      const lista =
        normalizarLista(data);

      setAdelantos(lista);

      return lista;
    } catch (requestError) {
      const mensaje =
        obtenerMensajeError(
          requestError,
          "No se pudieron cargar los adelantos y abonos."
        );

      setError(mensaje);

      if (mostrarCarga) {
        setAdelantos([]);
      }

      return false;
    } finally {
      if (mostrarCarga) {
        setLoading(false);
      }
    }
  };

  const cargarCatalogos = async () => {
    if (!esAdminOSuperAdmin) {
      setConductores([]);
      setSucursales([]);
      setEstadosAdelanto([]);
      setLoadingCatalogos(false);

      return true;
    }

    try {
      setLoadingCatalogos(true);
      setError("");

      const [
        conductoresData,
        estadosData,
      ] = await Promise.all([
        getConductores(),
        getEstadosAdelanto(),
      ]);

      setConductores(
        normalizarLista(
          conductoresData
        )
      );

      setEstadosAdelanto(
        normalizarLista(estadosData)
      );

      try {
        const sucursalesData =
          await getSucursales();

        setSucursales(
          normalizarLista(
            sucursalesData
          )
        );
      } catch (requestError) {
        console.warn(
          "No se pudieron cargar las sucursales:",
          requestError?.response
            ?.data || requestError
        );

        setSucursales([]);
      }

      return true;
    } catch (requestError) {
      setConductores([]);
      setSucursales([]);
      setEstadosAdelanto([]);

      const mensaje =
        obtenerMensajeError(
          requestError,
          "No se pudieron cargar los catálogos de adelantos."
        );

      setError(mensaje);

      return false;
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const abrirModalCrear = (
    tipo = "ADELANTO"
  ) => {
    if (!esAdminOSuperAdmin) {
      setError(
        "Solo un administrador puede registrar adelantos o abonos."
      );

      return;
    }

    const tipoNormalizado =
      String(tipo)
        .trim()
        .toUpperCase() === "ABONO"
        ? "ABONO"
        : "ADELANTO";

    setError("");
    setAdelantoEditando(null);
    setTipoInicial(tipoNormalizado);
    setModalOpen(true);
  };

  const abrirModalEditar = (
    adelanto
  ) => {
    if (!esAdminOSuperAdmin) {
      setError(
        "No tienes permiso para modificar este registro."
      );

      return;
    }

    if (!adelanto?.id) {
      setError(
        "No se encontró el registro que deseas editar."
      );

      return;
    }

    const tipoMovimiento =
      obtenerTipoMovimiento(adelanto);

    setError("");

    setAdelantoEditando({
      ...adelanto,
      tipo: tipoMovimiento,
    });

    setTipoInicial(tipoMovimiento);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setAdelantoEditando(null);
    setTipoInicial("ADELANTO");
  };

  const guardarAdelanto = async (
    form
  ) => {
    if (!esAdminOSuperAdmin) {
      const mensaje =
        "No tienes permiso para guardar adelantos o abonos.";

      setError(mensaje);

      mostrarError(
        "Acceso no permitido",
        mensaje
      );

      return false;
    }

    const estabaEditando =
      Boolean(adelantoEditando?.id);

    const tipoNormalizado =
      String(
        form?.tipo ||
          tipoInicial ||
          "ADELANTO"
      )
        .trim()
        .toUpperCase() === "ABONO"
        ? "ABONO"
        : "ADELANTO";

    const payload = {
      conductor: form?.conductor
        ? Number(form.conductor)
        : null,

      tipo: tipoNormalizado,

      monto:
        form?.monto !== "" &&
        form?.monto !== null &&
        form?.monto !== undefined
          ? Number(form.monto)
          : 0,

      observacion: String(
        form?.observacion || ""
      ).trim(),
    };

    if (!payload.conductor) {
      const mensaje =
        "Debes seleccionar el conductor.";

      setError(mensaje);

      void Swal.fire({
        title: "Revisa los datos",
        text: mensaje,
        icon: "warning",
        confirmButtonText:
          "Entendido",
        confirmButtonColor:
          "#F5B800",
      });

      return false;
    }

    if (
      !Number.isFinite(
        payload.monto
      ) ||
      payload.monto <= 0
    ) {
      const mensaje =
        "El monto debe ser mayor que cero.";

      setError(mensaje);

      void Swal.fire({
        title: "Revisa el monto",
        text: mensaje,
        icon: "warning",
        confirmButtonText:
          "Entendido",
        confirmButtonColor:
          "#F5B800",
      });

      return false;
    }

    const etiqueta =
      tipoNormalizado === "ABONO"
        ? "abono"
        : "adelanto";

    const confirmacion =
      await Swal.fire({
        title: estabaEditando
          ? `¿Actualizar ${etiqueta}?`
          : `¿Registrar ${etiqueta}?`,

        text: estabaEditando
          ? "Se guardarán los cambios realizados."
          : `Se registrará un monto de C$ ${payload.monto.toFixed(
              2
            )}.`,

        icon: "question",

        showCancelButton: true,

        confirmButtonText:
          estabaEditando
            ? "Actualizar"
            : "Registrar",

        cancelButtonText:
          "Cancelar",

        confirmButtonColor:
          "#F5B800",

        cancelButtonColor:
          "#64748b",

        reverseButtons: true,

        allowOutsideClick: false,
        allowEscapeKey: true,
      });

    if (!confirmacion.isConfirmed) {
      return false;
    }

    try {
      setSaving(true);
      setError("");

      if (estabaEditando) {
        await updateAdelanto(
          adelantoEditando.id,
          payload
        );
      } else {
        await createAdelanto(
          payload
        );
      }

      /*
       * No activa loading general.
       * La tabla se mantiene visible.
       */
      await cargarAdelantos({
        mostrarCarga: false,
      });

      setModalOpen(false);
      setAdelantoEditando(null);
      setTipoInicial("ADELANTO");

      /*
       * No se usa await.
       * El mensaje se cierra automáticamente.
       */
      mostrarExito(
        estabaEditando
          ? "Registro actualizado"
          : tipoNormalizado === "ABONO"
            ? "Abono registrado"
            : "Adelanto registrado",

        estabaEditando
          ? "Los cambios se guardaron correctamente."
          : tipoNormalizado === "ABONO"
            ? "El abono fue registrado correctamente."
            : "El adelanto fue registrado correctamente."
      );

      return true;
    } catch (requestError) {
      const mensaje =
        obtenerMensajeError(
          requestError,
          estabaEditando
            ? "No se pudo actualizar el registro."
            : "No se pudo guardar el registro."
        );

      setError(mensaje);

      mostrarError(
        estabaEditando
          ? "No se pudo actualizar"
          : "No se pudo guardar",
        mensaje
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  const eliminarAdelanto = async (
    adelanto
  ) => {
    if (!esAdminOSuperAdmin) {
      const mensaje =
        "No tienes permiso para eliminar registros.";

      setError(mensaje);

      mostrarError(
        "Acceso no permitido",
        mensaje
      );

      return false;
    }

    if (!adelanto?.id) {
      return false;
    }

    const tipoMovimiento =
      obtenerTipoMovimiento(adelanto);

    const etiqueta =
      tipoMovimiento === "ABONO"
        ? "abono"
        : "adelanto";

    const monto = Number(
      adelanto?.monto || 0
    );

    const resultado =
      await Swal.fire({
        title: `¿Eliminar ${etiqueta}?`,

        text: `Se eliminará el registro de C$ ${
          Number.isFinite(monto)
            ? monto.toFixed(2)
            : "0.00"
        }.`,

        icon: "warning",

        showCancelButton: true,

        confirmButtonText:
          "Sí, eliminar",

        cancelButtonText:
          "Cancelar",

        confirmButtonColor:
          "#dc2626",

        cancelButtonColor:
          "#64748b",

        reverseButtons: true,

        allowOutsideClick: false,
        allowEscapeKey: true,
      });

    if (!resultado.isConfirmed) {
      return false;
    }

    try {
      setSaving(true);
      setError("");

      await deleteAdelanto(
        adelanto.id
      );

      await cargarAdelantos({
        mostrarCarga: false,
      });

      mostrarExito(
        "Registro eliminado",
        `El ${etiqueta} fue eliminado correctamente.`
      );

      return true;
    } catch (requestError) {
      const mensaje =
        obtenerMensajeError(
          requestError,
          "No se pudo eliminar el registro."
        );

      setError(mensaje);

      mostrarError(
        "No se pudo eliminar",
        mensaje
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  const verRecibo = async (
    adelanto
  ) => {
    if (!adelanto?.id) {
      return null;
    }

    try {
      setError("");

      return await getRecibo(
        adelanto.id
      );
    } catch (requestError) {
      const mensaje =
        obtenerMensajeError(
          requestError,
          "No se pudo abrir el recibo."
        );

      setError(mensaje);

      mostrarError(
        "No se pudo abrir el recibo",
        mensaje
      );

      return null;
    }
  };

  const adelantosConSaldo =
    useMemo(() => {
      const listaAdelantos =
        Array.isArray(adelantos)
          ? adelantos.filter(Boolean)
          : [];

      const movimientosOrdenados = [
        ...listaAdelantos,
      ].sort((a, b) => {
        const diferenciaFecha =
          obtenerTimestamp(a) -
          obtenerTimestamp(b);

        if (
          diferenciaFecha !== 0
        ) {
          return diferenciaFecha;
        }

        return (
          Number(a?.id || 0) -
          Number(b?.id || 0)
        );
      });

      const saldosPorConductor =
        new Map();

      const saldosPorMovimiento =
        new Map();

      movimientosOrdenados.forEach(
        (movimiento) => {
          const conductorId =
            obtenerConductorId(
              movimiento
            );

          const claveConductor =
            String(
              conductorId ||
                "sin-conductor"
            );

          const saldoAnterior =
            saldosPorConductor.get(
              claveConductor
            ) || 0;

          const monto = Number(
            movimiento?.monto || 0
          );

          const montoSeguro =
            Number.isFinite(monto)
              ? monto
              : 0;

          const tipo =
            obtenerTipoMovimiento(
              movimiento
            );

          const nuevoSaldo =
            tipo === "ABONO"
              ? Math.max(
                  saldoAnterior -
                    montoSeguro,
                  0
                )
              : saldoAnterior +
                montoSeguro;

          saldosPorConductor.set(
            claveConductor,
            nuevoSaldo
          );

          saldosPorMovimiento.set(
            String(movimiento?.id),
            nuevoSaldo
          );
        }
      );

      return listaAdelantos.map(
        (movimiento) => ({
          ...movimiento,

          tipo:
            obtenerTipoMovimiento(
              movimiento
            ),

          fecha_movimiento:
            obtenerFechaMovimiento(
              movimiento
            ),

          saldo_movimiento:
            saldosPorMovimiento.get(
              String(movimiento?.id)
            ) ?? 0,
        })
      );
    }, [adelantos]);

  const adelantosFiltrados =
    useMemo(() => {
      return adelantosConSaldo.filter(
        (adelanto) => {
          if (
            filtroTipo !== "TODOS" &&
            adelanto.tipo !==
              filtroTipo
          ) {
            return false;
          }

          if (
            esAdminOSuperAdmin &&
            filtroConductor &&
            String(
              obtenerConductorId(
                adelanto
              )
            ) !==
              String(
                filtroConductor
              )
          ) {
            return false;
          }

          const fecha =
            adelanto.fecha_movimiento;

          if (
            filtroFechaInicio &&
            fecha &&
            fecha <
              filtroFechaInicio
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
        }
      );
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

    const saldosFinales =
      new Map();

    const movimientosOrdenados = [
      ...adelantosConSaldo,
    ].sort((a, b) => {
      const diferenciaFecha =
        obtenerTimestamp(a) -
        obtenerTimestamp(b);

      if (diferenciaFecha !== 0) {
        return diferenciaFecha;
      }

      return (
        Number(a?.id || 0) -
        Number(b?.id || 0)
      );
    });

    movimientosOrdenados.forEach(
      (movimiento) => {
        const monto = Number(
          movimiento?.monto || 0
        );

        const montoSeguro =
          Number.isFinite(monto)
            ? monto
            : 0;

        const tipo =
          obtenerTipoMovimiento(
            movimiento
          );

        const conductorId =
          obtenerConductorId(
            movimiento
          );

        const claveConductor =
          String(
            conductorId ||
              "sin-conductor"
          );

        const saldoAnterior =
          saldosFinales.get(
            claveConductor
          ) || 0;

        if (tipo === "ABONO") {
          totalAbonos += 1;
          montoAbonos += montoSeguro;

          saldosFinales.set(
            claveConductor,
            Math.max(
              saldoAnterior -
                montoSeguro,
              0
            )
          );
        } else {
          totalAdelantos += 1;
          montoAdelantos += montoSeguro;

          saldosFinales.set(
            claveConductor,
            saldoAnterior +
              montoSeguro
          );
        }
      }
    );

    const saldo = Array.from(
      saldosFinales.values()
    ).reduce(
      (total, valor) =>
        total +
        Number(valor || 0),
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

  const ultimoMovimiento =
    useMemo(() => {
      if (
        !adelantosConSaldo.length
      ) {
        return null;
      }

      return [
        ...adelantosConSaldo,
      ].sort((a, b) => {
        const diferenciaFecha =
          obtenerTimestamp(b) -
          obtenerTimestamp(a);

        if (
          diferenciaFecha !== 0
        ) {
          return diferenciaFecha;
        }

        return (
          Number(b?.id || 0) -
          Number(a?.id || 0)
        );
      })[0];
    }, [adelantosConSaldo]);

  const limpiarFiltros = () => {
    setFiltroTipo("TODOS");
    setFiltroConductor("");
    setFiltroFechaInicio("");
    setFiltroFechaFin("");
  };

  useEffect(() => {
    void cargarAdelantos();

    if (esAdminOSuperAdmin) {
      void cargarCatalogos();
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

    saldo: resumen.saldo,

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