import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import { useAuth } from "../../../hooks/useAuth";

import {
  cerrarJornada,
  createJornada,
  deleteJornada,
  getAsignaciones,
  getConductores,
  getJornadas,
  getVehiculos,
  updateJornada,
} from "../services/jornadasService";

const normalizarLista = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
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

const normalizarFecha = (fecha) => {
  if (!fecha) return "";
  return String(fecha).slice(0, 10);
};

const obtenerId = (valor) => {
  if (!valor) return null;

  if (typeof valor === "object") {
    return Number(valor.id);
  }

  return Number(valor);
};

const jornadaTieneKmFinal = (jornada) => {
  return (
    jornada?.kilometraje_final !== null &&
    jornada?.kilometraje_final !== undefined &&
    jornada?.kilometraje_final !== ""
  );
};

const obtenerCodigoRol = (auth) => {
  let rol =
    auth?.rol ||
    auth?.user?.rol_codigo ||
    auth?.user?.rol?.codigo ||
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
  error,
  mensajeDefault
) => {
  const data = error?.response?.data;

  console.error(
    "Error de jornada:",
    JSON.stringify(data || err, null, 2)
  );

  if (data?.detail) {
    return data.detail;
  }

  if (Array.isArray(data?.non_field_errors)) {
    return data.non_field_errors[0];
  }

  if (typeof data === "string") {
    return data;
  }

  if (
    typeof data === "object" &&
    data !== null
  ) {
    const clave = Object.keys(data)[0];
    const valor = data?.[clave];

    if (Array.isArray(valor)) {
      return `${clave}: ${valor[0]}`;
    }

    if (typeof valor === "string") {
      return `${clave}: ${valor}`;
    }
  }

  return mensajeDefault;
};

export const useJornadas = () => {
  const auth = useAuth();

  const rol = obtenerCodigoRol(auth);

  const [jornadas, setJornadas] =
    useState([]);

  const [conductores, setConductores] =
    useState([]);

  const [vehiculos, setVehiculos] =
    useState([]);

  const [asignaciones, setAsignaciones] =
    useState([]);

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
    jornadaEditando,
    setJornadaEditando,
  ] = useState(null);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  const hoy = obtenerFechaLocal();

  const esSuperAdmin =
    rol === "superadmin";

  const esAdminSucursal =
    rol === "admin_sucursal";

  const esTaxista =
    rol === "taxista";

  const cargarJornadas = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getJornadas();

      setJornadas(normalizarLista(data));
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
  }, [conductores, esTaxista]);

  const asignacionActivaTaxista = useMemo(() => {
    if (!esTaxista) return null;

    const conductorId = obtenerId(
      conductorTaxista?.id
    );

    return (
      asignaciones.find((asignacion) => {
        return (
          asignacion.activa !== false &&
          (
            !conductorId ||
            obtenerId(asignacion.conductor) ===
              conductorId
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

    const vehiculoId = obtenerId(
      asignacionActivaTaxista?.vehiculo
    );

    if (vehiculoId) {
      return (
        vehiculos.find(
          (vehiculo) =>
            obtenerId(vehiculo.id) ===
            vehiculoId
        ) || { id: vehiculoId }
      );
    }

    return vehiculos[0] || null;
  }, [
    vehiculos,
    asignacionActivaTaxista,
    esTaxista,
  ]);

  const jornadasHoy = useMemo(() => {
    return jornadas.filter(
      (jornada) =>
        normalizarFecha(jornada.fecha) === hoy
    );
  }, [jornadas, hoy]);

  const jornadaAbiertaHoy = useMemo(() => {
    return (
      jornadasHoy.find(
        (jornada) =>
          !jornadaTieneKmFinal(jornada)
      ) || null
    );
  }, [jornadasHoy]);

  const jornadaCerradaHoy = useMemo(() => {
    return (
      jornadasHoy.find((jornada) =>
        jornadaTieneKmFinal(jornada)
      ) || null
    );
  }, [jornadasHoy]);

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
      abrirModalCerrar(jornada);
      return;
    }

    if (esTaxista) return;

    if (jornada?.liquidada) {
      setError(
        `Esta jornada ya fue incluida en la liquidación #${
          jornada.liquidacion_id || ""
        } y no puede modificarse.`
      );
      return;
    }

    setJornadaEditando({
      ...jornada,
      modoFormulario: "editar",
    });

    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setJornadaEditando(null);
  };

  const mostrarExito = (titulo, mensaje) => {
    void Swal.fire({
      title: titulo,
      text: mensaje,
      icon: "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#F5B800",
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
  };

  const recargarDatos = () => {
    void Promise.allSettled([
      cargarJornadas(),
      cargarCatalogos(),
    ]);
  };

  const guardarJornada = async (form) => {
    try {
      setSaving(true);
      setError("");

      const modoFormulario =
        jornadaEditando?.modoFormulario;

      if (modoFormulario === "cerrar") {
        const kilometrajeFinal = Number(
          form.kilometraje_final
        );

        if (
          !Number.isFinite(kilometrajeFinal) ||
          kilometrajeFinal < 0
        ) {
          setError(
            "Debes ingresar un kilometraje final válido."
          );
          return false;
        }

        if (
          kilometrajeFinal <
          Number(
            jornadaEditando.kilometraje_inicial
          )
        ) {
          setError(
            "El kilometraje final no puede ser menor al inicial."
          );
          return false;
        }

        const datosCierre = {
          kilometraje_final: kilometrajeFinal,
          observaciones:
            form.observaciones || "",
        };

               const tipoCobro =
          form.tipo_cobro ||
          jornadaEditando?.tipo_cobro ||
          "porcentaje";

        datosCierre.tipo_cobro = tipoCobro;

        if (tipoCobro === "porcentaje") {
          const ingresoBruto = Number(
            form.ingreso_bruto || 0
          );

          if (
            !Number.isFinite(ingresoBruto) ||
            ingresoBruto < 0
          ) {
            setError(
              "El total producido del día debe ser válido."
            );
            return false;
          }

          datosCierre.ingreso_bruto =
            ingresoBruto;
        }

        if (
          tipoCobro === "alquiler" &&
          !esTaxista
        ) {
          const montoAlquiler = Number(
            form.monto_alquiler || 0
          );

          if (
            !Number.isFinite(montoAlquiler) ||
            montoAlquiler < 0
          ) {
            setError(
              "El monto de alquiler debe ser válido."
            );
            return false;
          }

          datosCierre.monto_alquiler =
            montoAlquiler;
        }

        await cerrarJornada(
          jornadaEditando.id,
          datosCierre
        );

        cerrarModal();

        mostrarExito(
          "Jornada cerrada",
          "El kilometraje final fue registrado correctamente."
        );

        recargarDatos();
        return true;
      }

      if (modoFormulario === "editar") {
        if (jornadaEditando?.liquidada) {
          setError(
            "Esta jornada ya fue incluida en una liquidación y no puede modificarse."
          );
          return false;
        }

        const kilometrajeInicial = Number(
          form.kilometraje_inicial
        );

        const kilometrajeFinal = Number(
          form.kilometraje_final
        );

        if (
          !Number.isFinite(kilometrajeInicial) ||
          kilometrajeInicial < 0
        ) {
          setError(
            "El kilometraje inicial debe ser válido."
          );
          return false;
        }

        if (
          !Number.isFinite(kilometrajeFinal) ||
          kilometrajeFinal < kilometrajeInicial
        ) {
          setError(
            "El kilometraje final debe ser mayor o igual que el inicial."
          );
          return false;
        }

        const tipoCobro =
          form.tipo_cobro || "porcentaje";

        const datos = {
          fecha:
            normalizarFecha(form.fecha) || hoy,
          kilometraje_inicial:
            kilometrajeInicial,
          kilometraje_final:
            kilometrajeFinal,
          tipo_cobro: tipoCobro,
          ingreso_bruto:
            tipoCobro === "porcentaje"
              ? Number(form.ingreso_bruto || 0)
              : 0,
          monto_alquiler:
            tipoCobro === "alquiler"
              ? Number(form.monto_alquiler || 0)
              : 0,
          observaciones:
            form.observaciones || "",
        };

        await updateJornada(
          jornadaEditando.id,
          datos
        );

        cerrarModal();

        mostrarExito(
          "Jornada actualizada",
          "Los cambios se guardaron correctamente."
        );

        recargarDatos();
        return true;
      }

      if (!esTaxista) {
        setError(
          "La administración debe editar una jornada existente para registrar datos económicos."
        );
        return false;
      }

      const conductor =
        conductorTaxista?.id ||
        asignacionActivaTaxista?.conductor;

      const vehiculo =
        vehiculoTaxista?.id ||
        asignacionActivaTaxista?.vehiculo;

      const kilometrajeInicial = Number(
        form.kilometraje_inicial
      );

      if (!conductor || !vehiculo) {
        setError(
          "No tienes un conductor o vehículo activo asignado."
        );
        return false;
      }

      if (
        !Number.isFinite(kilometrajeInicial) ||
        kilometrajeInicial < 0
      ) {
        setError(
          "Debes ingresar un kilometraje inicial válido."
        );
        return false;
      }

      await createJornada({
        fecha:
          normalizarFecha(form.fecha) || hoy,
        conductor: obtenerId(conductor),
        vehiculo: obtenerId(vehiculo),
        kilometraje_inicial:
          kilometrajeInicial,
        observaciones:
          form.observaciones || "",
      });

      cerrarModal();

      mostrarExito(
        "Jornada iniciada",
        "El kilometraje inicial fue registrado correctamente."
      );

      recargarDatos();
      return true;
    } catch (err) {
      const mensaje = obtenerMensajeError(
        err,
        "No se pudo guardar la jornada."
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

  const eliminarJornada = async (jornada) => {
  if (jornada?.liquidada) {
    const mensaje =
      `Esta jornada pertenece a la liquidación #${
        jornada.liquidacion_id || ""
      } y no puede eliminarse.`;

    setError(mensaje);

    await Swal.fire({
      title: "Jornada protegida",
      text: mensaje,
      icon: "warning",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#E7A900",
    });

    return false;
  }

  const nombreConductor =
    jornada?.conductor_nombre ||
    "este conductor";

  const resultado = await Swal.fire({
    title: "¿Eliminar jornada?",
    html: `
      <p style="color:#475569;font-size:14px;line-height:1.5;">
        Vas a eliminar la jornada de
        <strong>${nombreConductor}</strong>.
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

    await deleteJornada(jornada.id);

    await cargarJornadas();

    await Swal.fire({
      title: "Jornada eliminada",
      text: "La jornada fue eliminada correctamente.",
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
      "No se pudo eliminar la jornada."
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



  const jornadasFiltradas = useMemo(() => {
    const valor = search.trim().toLowerCase();

    if (!valor) return jornadas;

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

      const fecha = normalizarFecha(
        jornada.fecha
      ).toLowerCase();

      return (
        conductor.includes(valor) ||
        placa.includes(valor) ||
        numero.includes(valor) ||
        fecha.includes(valor)
      );
    });
  }, [jornadas, search]);

  const totalJornadas = jornadasHoy.length;

  const ingresoTotal = jornadasHoy.reduce(
    (total, jornada) =>
      total +
      Number(jornada.ingreso_bruto || 0),
    0
  );

  const pagoConductoresTotal =
    jornadasHoy.reduce(
      (total, jornada) =>
        total +
        Number(
          jornada.pago_conductor || 0
        ),
      0
    );

  const gananciaTotal = jornadasHoy.reduce(
    (total, jornada) =>
      total +
      Number(
        jornada.ganancia_real_dueno ??
          jornada.ganancia_dueno ??
          0
      ),
    0
  );

  const kilometrosTotal = jornadasHoy.reduce(
    (total, jornada) =>
      total +
      Number(
        jornada.kilometros_recorridos || 0
      ),
    0
  );

  useEffect(() => {
    void cargarJornadas();
    void cargarCatalogos();
  }, []);

  return {
    jornadas,
    jornadasHoy,
    jornadasFiltradas,
    conductorTaxista,

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
    abrirModalIngreso:
      abrirModalEditar,

    cerrarModal,
    guardarJornada,
    eliminarJornada,
  };
};