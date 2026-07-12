// src/modules/asignaciones/hooks/useAsignaciones.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  if (valor && typeof valor === "object") {
    return String(
      valor.codigo ||
        valor.nombre ||
        ""
    )
      .trim()
      .toLowerCase();
  }

  return String(valor || "")
    .trim()
    .toLowerCase();
};

const obtenerMensajeError = (
  error,
  mensajeDefault
) => {
  const data = error?.response?.data;

  if (typeof data?.detail === "string") {
    return data.detail;
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

  const esSuperAdmin = [
    "superadmin",
    "super_admin",
  ].includes(rolNormalizado);

  const esAdminSucursal =
    rolNormalizado ===
    "admin_sucursal";

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
      setModalOpen(false);
      setAsignacionEditando(null);
      setConductores([]);
      setVehiculos([]);
    }, []);

  const guardarAsignacion =
    useCallback(
      async (form) => {
        if (!form) {
          return false;
        }

        try {
          setSaving(true);
          setError("");

          const payload = {
            conductor: form.conductor
              ? Number(form.conductor)
              : null,

            vehiculo: form.vehiculo
              ? Number(form.vehiculo)
              : null,

            fecha_inicio:
              form.fecha_inicio,

            fecha_fin:
              form.fecha_fin || null,

            activa:
              form.activa !== false,
          };

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

          return true;
        } catch (requestError) {
          const mensaje =
            obtenerMensajeError(
              requestError,
              "No se pudo guardar la asignación."
            );

          setError(mensaje);

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

        try {
          setSaving(true);
          setError("");

          const estaActiva =
            obtenerEstadoActivo(
              asignacion
            );

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

          return true;
        } catch (requestError) {
          const mensaje =
            obtenerMensajeError(
              requestError,
              "No se pudo cambiar el estado de la asignación."
            );

          setError(mensaje);

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
          return false;
        }

        const nombreConductor =
          String(
            asignacion
              ?.conductor_nombre ||
              asignacion
                ?.conductor
                ?.nombre_completo ||
              "este conductor"
          );

        const confirmar =
          window.confirm(
            `¿Seguro que deseas eliminar la asignación de "${nombreConductor}"?`
          );

        if (!confirmar) {
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

          return true;
        } catch (requestError) {
          const mensaje =
            obtenerMensajeError(
              requestError,
              "No se pudo eliminar la asignación. Puede que tenga registros asociados."
            );

          setError(mensaje);

          return false;
        } finally {
          setSaving(false);
        }
      },
      [cargarAsignaciones]
    );

  /*
   * Lista segura de asignaciones.
   *
   * Aquí estaba el error porque se había
   * copiado código de Usuarios.
   */
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
      const valorBusqueda =
        String(search || "")
          .trim()
          .toLowerCase();

      if (!valorBusqueda) {
        return listaAsignaciones;
      }

      return listaAsignaciones.filter(
        (asignacion) => {
          const texto = [
            asignacion
              ?.conductor_nombre,

            asignacion
              ?.conductor_cedula,

            asignacion
              ?.vehiculo_placa,

            asignacion
              ?.vehiculo_numero,

            asignacion
              ?.vehiculo_descripcion,

            asignacion
              ?.sucursal_nombre,

            asignacion
              ?.conductor
              ?.nombre_completo,

            asignacion
              ?.conductor?.nombre,

            asignacion
              ?.conductor?.apellido,

            asignacion
              ?.vehiculo?.numero,

            asignacion
              ?.vehiculo
              ?.numero_unidad,

            asignacion
              ?.vehiculo?.placa,

            asignacion
              ?.vehiculo?.marca,

            asignacion
              ?.vehiculo?.modelo,

            asignacion
              ?.sucursal?.nombre,
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

  /*
   * Al abrir o recargar la página solo se
   * solicita el listado de asignaciones.
   *
   * Los catálogos se solicitan cuando se
   * abre el modal.
   */
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