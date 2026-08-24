import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import { useAuth } from "../../../hooks/useAuth";

import {
  createAsignacion,
  deleteAsignacion,
  getAsignaciones,
  getConductoresDisponibles,
  getVehiculosDisponibles,
  updateAsignacion,
} from "../services/asignacionesService";

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

const normalizarRol = (valor) => {
  let rol = valor;

  if (rol && typeof rol === "object") {
    rol =
      rol.codigo ||
      rol.nombre ||
      "";
  }

  const codigo = String(rol || "")
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
    "Error de asignación:",
    data || error
  );

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (
    Array.isArray(data?.non_field_errors) &&
    data.non_field_errors.length
  ) {
    return data.non_field_errors[0];
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

    if (typeof primerValor === "string") {
      return `${primeraClave}: ${primerValor}`;
    }
  }

  return (
    error?.message ||
    mensajeDefault
  );
};

const obtenerEstadoActivo = (
  asignacion
) => {
  const valor =
    asignacion?.activa ??
    asignacion?.activo ??
    asignacion?.is_active;

  return (
    valor === true ||
    valor === 1 ||
    valor === "1" ||
    String(valor).toLowerCase() ===
      "true"
  );
};

const obtenerFechaActual = () => {
  const fecha = new Date();

  const diferenciaZona =
    fecha.getTimezoneOffset() * 60_000;

  return new Date(
    fecha.getTime() - diferenciaZona
  )
    .toISOString()
    .split("T")[0];
};

const mostrarValidacion = async (
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

export const useAsignaciones = () => {
  const { rol } = useAuth();

  const [
    asignaciones,
    setAsignaciones,
  ] = useState([]);

  const [
    conductores,
    setConductores,
  ] = useState([]);

  const [
    vehiculos,
    setVehiculos,
  ] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [
    loadingCatalogos,
    setLoadingCatalogos,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    asignacionEditando,
    setAsignacionEditando,
  ] = useState(null);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  const rolNormalizado =
    normalizarRol(rol);

  const esSuperAdmin =
    rolNormalizado === "superadmin";

  const esAdminSucursal =
    rolNormalizado === "admin_sucursal";

  const esTaxista =
    rolNormalizado === "taxista";

  const cargarAsignaciones =
    useCallback(
      async ({
        mostrarCarga = true,
      } = {}) => {
        try {
          if (mostrarCarga) {
            setLoading(true);
          }

          setError("");

          const data =
            await getAsignaciones();

          const lista =
            normalizarLista(data);

          setAsignaciones(lista);

          return lista;
        } catch (requestError) {
          const mensaje =
            obtenerMensajeError(
              requestError,
              "No se pudieron cargar las asignaciones."
            );

          setError(mensaje);
          setAsignaciones([]);

          return false;
        } finally {
          if (mostrarCarga) {
            setLoading(false);
          }
        }
      },
      []
    );

  const cargarCatalogos =
    useCallback(
      async (
        asignacionId = null
      ) => {
        try {
          setLoadingCatalogos(true);
          setError("");

          const [
            conductoresData,
            vehiculosData,
          ] = await Promise.all([
            getConductoresDisponibles(
              asignacionId
            ),
            getVehiculosDisponibles(
              asignacionId
            ),
          ]);

          setConductores(
            normalizarLista(
              conductoresData
            )
          );

          setVehiculos(
            normalizarLista(
              vehiculosData
            )
          );

          return true;
        } catch (requestError) {
          const mensaje =
            obtenerMensajeError(
              requestError,
              "No se pudieron cargar conductores y vehículos."
            );

          setConductores([]);
          setVehiculos([]);
          setError(mensaje);

          return false;
        } finally {
          setLoadingCatalogos(false);
        }
      },
      []
    );

  const abrirModalCrear =
    useCallback(async () => {
      setAsignacionEditando(null);
      setConductores([]);
      setVehiculos([]);
      setError("");
      setModalOpen(true);

      await cargarCatalogos();
    }, [cargarCatalogos]);

  const abrirModalEditar =
    useCallback(
      async (asignacion) => {
        if (!asignacion?.id) {
          return;
        }

        setAsignacionEditando(
          asignacion
        );

        setConductores([]);
        setVehiculos([]);
        setError("");
        setModalOpen(true);

        await cargarCatalogos(
          asignacion.id
        );
      },
      [cargarCatalogos]
    );

  const cerrarModal =
    useCallback(() => {
      if (saving) {
        return;
      }

      setModalOpen(false);
      setAsignacionEditando(null);
      setConductores([]);
      setVehiculos([]);
    }, [saving]);

  const guardarAsignacion =
    useCallback(
      async (form) => {
        if (!form) {
          return false;
        }

        const conductor = Number(
          form.conductor
        );

        const vehiculo = Number(
          form.vehiculo
        );

        const fechaInicio = String(
          form.fecha_inicio || ""
        ).trim();

        const fechaFin = String(
          form.fecha_fin || ""
        ).trim();

        const activa =
          form.activa !== false;

        if (
          !Number.isInteger(conductor) ||
          conductor <= 0
        ) {
          const mensaje =
            "Debes seleccionar un conductor.";

          setError(mensaje);
          await mostrarValidacion(mensaje);
          return false;
        }

        if (
          !Number.isInteger(vehiculo) ||
          vehiculo <= 0
        ) {
          const mensaje =
            "Debes seleccionar un vehículo.";

          setError(mensaje);
          await mostrarValidacion(mensaje);
          return false;
        }

        if (!fechaInicio) {
          const mensaje =
            "Debes indicar la fecha de inicio de la asignación.";

          setError(mensaje);
          await mostrarValidacion(mensaje);
          return false;
        }

        if (
          fechaFin &&
          fechaFin < fechaInicio
        ) {
          const mensaje =
            "La fecha final no puede ser anterior a la fecha de inicio.";

          setError(mensaje);
          await mostrarValidacion(mensaje);
          return false;
        }

        if (
          activa &&
          fechaFin
        ) {
          const mensaje =
            "Una asignación activa no debe tener fecha de finalización. Desactívala primero o deja la fecha final vacía.";

          setError(mensaje);
          await mostrarValidacion(mensaje);
          return false;
        }

        const payload = {
          conductor,
          vehiculo,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin || null,
          activa,
        };

        try {
          setSaving(true);
          setError("");

          if (
            asignacionEditando?.id
          ) {
            await updateAsignacion(
              asignacionEditando.id,
              payload
            );
          } else {
            await createAsignacion(
              payload
            );
          }

          await cargarAsignaciones({
            mostrarCarga: false,
          });

          cerrarModal();

          await Swal.fire({
            title: asignacionEditando
              ? "Asignación actualizada"
              : "Asignación registrada",

            text: asignacionEditando
              ? "Los datos de la asignación fueron actualizados correctamente."
              : "El conductor y el vehículo fueron asignados correctamente.",

            icon: "success",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#059669",
            timer: 1800,
            timerProgressBar: true,
          });

          return true;
        } catch (requestError) {
          const mensaje =
            obtenerMensajeError(
              requestError,
              "No se pudo guardar la asignación."
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
      },
      [
        asignacionEditando,
        cargarAsignaciones,
        cerrarModal,
      ]
    );

  const cambiarEstadoAsignacion =
    useCallback(
      async (asignacion) => {
        if (!asignacion?.id) {
          return false;
        }

        const estaActiva =
          obtenerEstadoActivo(
            asignacion
          );

        const accion = estaActiva
          ? "finalizar"
          : "reactivar";

        const resultado = await Swal.fire({
          title: estaActiva
            ? "¿Finalizar asignación?"
            : "¿Reactivar asignación?",

          text: estaActiva
            ? "El conductor dejará de estar asignado a este vehículo."
            : "El conductor volverá a estar asignado a este vehículo.",

          icon: "question",
          showCancelButton: true,
          confirmButtonText: estaActiva
            ? "Sí, finalizar"
            : "Sí, reactivar",

          cancelButtonText: "Cancelar",
          confirmButtonColor: estaActiva
            ? "#dc2626"
            : "#059669",

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

          const activar =
            !estaActiva;

          await updateAsignacion(
            asignacion.id,
            {
              activa: activar,
              fecha_fin: activar
                ? null
                : obtenerFechaActual(),
            }
          );

          await cargarAsignaciones({
            mostrarCarga: false,
          });

          await Swal.fire({
            title: activar
              ? "Asignación reactivada"
              : "Asignación finalizada",

            text: activar
              ? "La asignación está activa nuevamente."
              : "La asignación fue finalizada correctamente.",

            icon: "success",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#059669",
            timer: 1600,
            timerProgressBar: true,
          });

          return true;
        } catch (requestError) {
          const mensaje =
            obtenerMensajeError(
              requestError,
              "No se pudo cambiar el estado de la asignación."
            );

          setError(mensaje);

          await Swal.fire({
            title: "No se pudo actualizar",
            text: mensaje,
            icon: "error",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#dc2626",
          });

          return false;
        } finally {
          setSaving(false);
        }
      },
      [cargarAsignaciones]
    );

  const eliminarAsignacion =
    useCallback(
      async (asignacion) => {
        if (!asignacion?.id) {
          const mensaje =
            "No se encontró la asignación que deseas eliminar.";

          setError(mensaje);
          await mostrarValidacion(mensaje);
          return false;
        }

        if (obtenerEstadoActivo(asignacion)) {
          const mensaje =
            "No puedes eliminar una asignación activa. Primero debes finalizarla.";

          setError(mensaje);
          await mostrarValidacion(mensaje);
          return false;
        }

        const nombreConductor =
          String(
            asignacion?.conductor_nombre ||
              asignacion?.conductor
                ?.nombre_completo ||
              "este conductor"
          );

        const resultado = await Swal.fire({
          title: "¿Eliminar asignación?",
          html: `
            <p style="color:#475569;font-size:14px;line-height:1.5;">
              Eliminarás la asignación de
              <strong>${nombreConductor}</strong>.
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

          await deleteAsignacion(
            asignacion.id
          );

          await cargarAsignaciones({
            mostrarCarga: false,
          });

          await Swal.fire({
            title: "Asignación eliminada",
            text: "La asignación fue eliminada correctamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#059669",
            timer: 1800,
            timerProgressBar: true,
          });

          return true;
        } catch (requestError) {
          const mensaje =
            obtenerMensajeError(
              requestError,
              "No se pudo eliminar la asignación. Puede que tenga registros asociados."
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
      },
      [cargarAsignaciones]
    );

  const listaAsignaciones =
    useMemo(
      () =>
        normalizarLista(
          asignaciones
        ),
      [asignaciones]
    );

  const asignacionesFiltradas =
    useMemo(() => {
      const valorBusqueda = String(
        search || ""
      )
        .trim()
        .toLowerCase();

      if (!valorBusqueda) {
        return listaAsignaciones;
      }

      return listaAsignaciones.filter(
        (asignacion) => {
          const texto = [
            asignacion?.conductor_nombre,
            asignacion?.conductor_cedula,
            asignacion?.vehiculo_placa,
            asignacion?.vehiculo_numero,
            asignacion?.vehiculo_descripcion,
            asignacion?.sucursal_nombre,
            asignacion?.conductor
              ?.nombre_completo,
            asignacion?.conductor?.nombre,
            asignacion?.conductor?.apellido,
            asignacion?.vehiculo?.numero,
            asignacion?.vehiculo
              ?.numero_unidad,
            asignacion?.vehiculo?.placa,
            asignacion?.vehiculo?.marca,
            asignacion?.vehiculo?.modelo,
            asignacion?.sucursal?.nombre,
          ]
            .filter(
              (valor) =>
                valor !== null &&
                valor !== undefined
            )
            .map((valor) =>
              String(valor)
            )
            .join(" ")
            .toLowerCase();

          return texto.includes(
            valorBusqueda
          );
        }
      );
    }, [
      listaAsignaciones,
      search,
    ]);

  const totalAsignaciones =
    listaAsignaciones.length;

  const asignacionesActivas =
    listaAsignaciones.filter(
      obtenerEstadoActivo
    ).length;

  const asignacionesInactivas =
    totalAsignaciones -
    asignacionesActivas;

  useEffect(() => {
    void cargarAsignaciones();
  }, [cargarAsignaciones]);

  return {
    asignaciones:
      listaAsignaciones,

    asignacionesFiltradas,

    conductores,
    vehiculos,

    loading,
    loadingCatalogos,
    saving,
    error,

    search,
    setSearch,

    modalOpen,
    asignacionEditando,

    totalAsignaciones,
    asignacionesActivas,
    asignacionesInactivas,

    esSuperAdmin,
    esAdminSucursal,
    esTaxista,

    cargarAsignaciones,
    cargarCatalogos,

    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,

    guardarAsignacion,
    cambiarEstadoAsignacion,
    eliminarAsignacion,
  };
};