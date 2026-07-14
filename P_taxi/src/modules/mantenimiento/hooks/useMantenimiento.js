import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Swal from "sweetalert2";

import {
  useAuth,
} from "../../../hooks/useAuth";

import {
  createMantenimiento,
  deleteMantenimiento,
  getEstadosMantenimiento,
  getMantenimientos,
  getTiposMantenimiento,
  getVehiculos,
  updateMantenimiento,
} from "../services/mantenimientoService";


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


const obtenerCodigoRol = (auth) => {
  const posibleRol =
    auth?.rol ||
    auth?.user?.rol_codigo ||
    auth?.user?.rol?.codigo ||
    auth?.usuario?.rol_codigo ||
    auth?.usuario?.rol?.codigo ||
    auth?.user?.rol ||
    "";

  if (
    typeof posibleRol === "object" &&
    posibleRol !== null
  ) {
    return String(
      posibleRol.codigo || ""
    )
      .trim()
      .toLowerCase();
  }

  return String(
    posibleRol || ""
  )
    .trim()
    .toLowerCase();
};


const obtenerMensajeError = (
  err,
  mensajeDefault
) => {
  const data =
    err?.response?.data;

  if (data?.detail) {
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

  if (
    typeof data === "string"
  ) {
    const contenido =
      data.trim();

    const contenidoMinuscula =
      contenido.toLowerCase();

    const esHtml =
      contenidoMinuscula.startsWith(
        "<!doctype html"
      ) ||
      contenidoMinuscula.startsWith(
        "<html"
      ) ||
      contenidoMinuscula.includes(
        "<title>server error"
      ) ||
      contenidoMinuscula.includes(
        "<h1>server error"
      );

    if (esHtml) {
      return mensajeDefault;
    }

    return contenido || mensajeDefault;
  }

  if (
    typeof data === "object" &&
    data !== null
  ) {
    const claves =
      Object.keys(data);

    if (claves.length > 0) {
      const firstKey =
        claves[0];

      const firstValue =
        data[firstKey];

      if (
        Array.isArray(firstValue) &&
        firstValue.length > 0
      ) {
        return `${firstKey}: ${firstValue[0]}`;
      }

      if (
        typeof firstValue === "string"
      ) {
        return `${firstKey}: ${firstValue}`;
      }

      if (
        typeof firstValue === "object" &&
        firstValue !== null
      ) {
        return `${firstKey}: ${JSON.stringify(
          firstValue
        )}`;
      }
    }
  }

  if (err?.message) {
    return err.message;
  }

  return mensajeDefault;
};


export const useMantenimiento = () => {
  const auth =
    useAuth();

  const rol =
    obtenerCodigoRol(auth);

  const hoy =
    obtenerFechaLocal();


  const [
    mantenimientos,
    setMantenimientos,
  ] = useState([]);

  const [
    vehiculos,
    setVehiculos,
  ] = useState([]);

  const [
    tiposMantenimiento,
    setTiposMantenimiento,
  ] = useState([]);

  const [
    estadosMantenimiento,
    setEstadosMantenimiento,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingCatalogos,
    setLoadingCatalogos,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    mantenimientoEditando,
    setMantenimientoEditando,
  ] = useState(null);


  const [
    search,
    setSearch,
  ] = useState("");

  const [
    fechaSeleccionada,
    setFechaSeleccionada,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");


  const esSuperAdmin =
    rol === "superadmin" ||
    rol === "super_admin";

  const esAdminSucursal =
    rol === "admin_sucursal";

  const esTaxista =
    rol === "taxista";


  const cargarMantenimientos =
    async (
      filtros = {}
    ) => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        const fecha =
          filtros.fecha ??
          fechaSeleccionada;

        if (fecha) {
          params.fecha = fecha;
        }

        const data =
          await getMantenimientos(
            params
          );

        setMantenimientos(
          normalizarLista(data)
        );

        return true;
      } catch (err) {
        console.error(
          "Error cargando mantenimientos:",
          err
        );

        const mensaje =
          obtenerMensajeError(
            err,
            "No se pudieron cargar los mantenimientos."
          );

        setError(mensaje);

        return false;
      } finally {
        setLoading(false);
      }
    };


  const cargarCatalogos =
    async () => {
      try {
        setLoadingCatalogos(true);
        setError("");

        const [
          vehiculosData,
          tiposData,
          estadosData,
        ] = await Promise.all([
          getVehiculos(),
          getTiposMantenimiento(),
          getEstadosMantenimiento(),
        ]);

        setVehiculos(
          normalizarLista(
            vehiculosData
          )
        );

        setTiposMantenimiento(
          normalizarLista(
            tiposData
          )
        );

        setEstadosMantenimiento(
          normalizarLista(
            estadosData
          )
        );

        return true;
      } catch (err) {
        console.error(
          "Error cargando catálogos de mantenimiento:",
          err
        );

        const mensaje =
          obtenerMensajeError(
            err,
            "No se pudieron cargar los vehículos y catálogos de mantenimiento."
          );

        setError(mensaje);

        return false;
      } finally {
        setLoadingCatalogos(false);
      }
    };


  const abrirModalCrear = () => {
    if (esTaxista) {
      setError(
        "No tienes permiso para registrar mantenimientos."
      );

      return;
    }

    setError("");
    setMantenimientoEditando(
      null
    );
    setModalOpen(true);
  };


  const abrirModalEditar = (
    mantenimiento
  ) => {
    if (esTaxista) {
      setError(
        "No tienes permiso para editar mantenimientos."
      );

      return;
    }

    setError("");
    setMantenimientoEditando(
      mantenimiento
    );
    setModalOpen(true);
  };


  const cerrarModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setMantenimientoEditando(
      null
    );
  };


  const guardarMantenimiento =
    async (form) => {
      if (saving) {
        return false;
      }

      try {
        setSaving(true);
        setError("");

        if (esTaxista) {
          const mensaje =
            "No tienes permiso para registrar mantenimientos.";

          setError(mensaje);

          await Swal.fire({
            title:
              "Acceso denegado",

            text: mensaje,

            icon: "error",

            confirmButtonText:
              "Aceptar",
          });

          return false;
        }


        const payload = {
          vehiculo:
            form.vehiculo
              ? Number(
                  form.vehiculo
                )
              : null,

          tipo_mantenimiento:
            form.tipo_mantenimiento
              ? Number(
                  form.tipo_mantenimiento
                )
              : null,

          estado:
            form.estado
              ? Number(
                  form.estado
                )
              : null,

          descripcion:
            String(
              form.descripcion || ""
            ).trim(),

          costo:
            Number(
              form.costo || 0
            ),

          fecha:
            form.fecha || hoy,

          kilometraje:
            Number(
              form.kilometraje || 0
            ),

          proximo_km_sugerido:
            Number(
              form.proximo_km_sugerido ||
              0
            ),
        };


        if (!payload.vehiculo) {
          setError(
            "Debes seleccionar el vehículo."
          );

          return false;
        }


        if (
          !payload.tipo_mantenimiento
        ) {
          setError(
            "Debes seleccionar el tipo de mantenimiento."
          );

          return false;
        }


        if (!payload.estado) {
          setError(
            "Debes seleccionar el estado del mantenimiento."
          );

          return false;
        }


        if (!payload.fecha) {
          setError(
            "La fecha es obligatoria."
          );

          return false;
        }


        if (
          Number.isNaN(
            payload.kilometraje
          ) ||
          payload.kilometraje <= 0
        ) {
          setError(
            "El kilometraje debe ser mayor que cero."
          );

          return false;
        }


        if (
          Number.isNaN(
            payload.proximo_km_sugerido
          ) ||
          payload.proximo_km_sugerido <=
            payload.kilometraje
        ) {
          setError(
            "El próximo kilometraje debe ser mayor que el kilometraje actual."
          );

          return false;
        }


        if (
          Number.isNaN(
            payload.costo
          ) ||
          payload.costo < 0
        ) {
          setError(
            "El costo no puede ser negativo."
          );

          return false;
        }


        const estabaEditando =
          Boolean(
            mantenimientoEditando
          );


        if (estabaEditando) {
          await updateMantenimiento(
            mantenimientoEditando.id,
            payload
          );
        } else {
          await createMantenimiento(
            payload
          );
        }


        setModalOpen(false);
        setMantenimientoEditando(
          null
        );


        await Promise.all([
          cargarMantenimientos(),
          cargarCatalogos(),
        ]);


        await Swal.fire({
          title:
            estabaEditando
              ? "Mantenimiento actualizado"
              : "Mantenimiento registrado",

          text:
            estabaEditando
              ? "Los cambios fueron guardados correctamente."
              : "El mantenimiento fue registrado correctamente.",

          icon: "success",

          showConfirmButton: false,
          showCancelButton: false,

          timer: 2200,
          timerProgressBar: true,
        });


        return true;
      } catch (err) {
        console.error(
          "Error guardando mantenimiento:",
          err
        );

        const mensaje =
          obtenerMensajeError(
            err,
            "No se pudo guardar el mantenimiento."
          );

        setError(mensaje);

        await Swal.fire({
          title:
            "No se pudo guardar",

          text: mensaje,

          icon: "error",

          confirmButtonText:
            "Aceptar",
        });

        return false;
      } finally {
        setSaving(false);
      }
    };


  const eliminarMantenimiento =
    async (
      mantenimiento
    ) => {
      if (saving) {
        return false;
      }

      if (esTaxista) {
        const mensaje =
          "No tienes permiso para eliminar mantenimientos.";

        setError(mensaje);

        await Swal.fire({
          title:
            "Acceso denegado",

          text: mensaje,

          icon: "error",

          confirmButtonText:
            "Aceptar",
        });

        return false;
      }


      const costo =
        Number(
          mantenimiento?.costo || 0
        ).toLocaleString(
          "es-NI",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        );


      const placa =
        mantenimiento
          ?.vehiculo_placa ||
        "seleccionado";


      const confirmacion =
        await Swal.fire({
          title:
            "¿Eliminar mantenimiento?",

          html: `
            <p style="margin:0;color:#475569;line-height:1.6">
              Se eliminará el mantenimiento del vehículo
              <strong>${placa}</strong>,
              con un costo de
              <strong>C$ ${costo}</strong>.
            </p>
          `,

          icon: "warning",

          showCancelButton: true,

          confirmButtonText:
            "Sí, eliminar",

          cancelButtonText:
            "Conservar",

          confirmButtonColor:
            "#dc2626",

          cancelButtonColor:
            "#64748b",

          reverseButtons: true,
        });


      if (
        !confirmacion.isConfirmed
      ) {
        return false;
      }


      try {
        setSaving(true);
        setError("");

        await deleteMantenimiento(
          mantenimiento.id
        );


        await Promise.all([
          cargarMantenimientos(),
          cargarCatalogos(),
        ]);


        await Swal.fire({
          title:
            "Mantenimiento eliminado",

          text:
            "El registro fue eliminado correctamente.",

          icon: "success",

          showConfirmButton: false,
          showCancelButton: false,

          timer: 2000,
          timerProgressBar: true,
        });


        return true;
      } catch (err) {
        console.error(
          "Error eliminando mantenimiento:",
          err
        );

        const mensaje =
          obtenerMensajeError(
            err,
            "No se pudo eliminar el mantenimiento."
          );

        setError(mensaje);

        await Swal.fire({
          title:
            "No se pudo eliminar",

          text: mensaje,

          icon: "error",

          confirmButtonText:
            "Aceptar",
        });

        return false;
      } finally {
        setSaving(false);
      }
    };


  const elegirFecha =
    async () => {
      const fecha =
        window.prompt(
          "Escribe la fecha que deseas consultar en formato YYYY-MM-DD",
          fechaSeleccionada ||
            hoy
        );

      if (!fecha) {
        return;
      }

      const fechaLimpia =
        fecha.trim();

      const formatoValido =
        /^\d{4}-\d{2}-\d{2}$/.test(
          fechaLimpia
        );

      if (!formatoValido) {
        await Swal.fire({
          title:
            "Fecha inválida",

          text:
            "Debes escribir la fecha en formato YYYY-MM-DD.",

          icon: "warning",

          confirmButtonText:
            "Aceptar",
        });

        return;
      }

      setFechaSeleccionada(
        fechaLimpia
      );

      await cargarMantenimientos({
        fecha: fechaLimpia,
      });
    };


  const limpiarFecha =
    async () => {
      setFechaSeleccionada("");

      await cargarMantenimientos({
        fecha: "",
      });
    };


  const mantenimientosFiltrados =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return mantenimientos;
      }

      return mantenimientos.filter(
        (item) => {
          const tipo =
            item
              .tipo_mantenimiento_nombre
              ?.toLowerCase() ||
            "";

          const estado =
            item
              .estado_nombre
              ?.toLowerCase() ||
            "";

          const vehiculo =
            item
              .vehiculo_descripcion
              ?.toLowerCase() ||
            "";

          const placa =
            item
              .vehiculo_placa
              ?.toLowerCase() ||
            "";

          const numero =
            String(
              item
                .vehiculo_numero ||
              ""
            ).toLowerCase();

          const descripcion =
            item
              .descripcion
              ?.toLowerCase() ||
            "";

          const sucursal =
            item
              .sucursal_nombre
              ?.toLowerCase() ||
            "";

          const fecha =
            item
              .fecha
              ?.toLowerCase() ||
            "";

          const kilometraje =
            String(
              item.kilometraje ||
              ""
            );

          const proximoKm =
            String(
              item
                .proximo_km_sugerido ||
              ""
            );

          return (
            tipo.includes(value) ||
            estado.includes(value) ||
            vehiculo.includes(value) ||
            placa.includes(value) ||
            numero.includes(value) ||
            descripcion.includes(value) ||
            sucursal.includes(value) ||
            fecha.includes(value) ||
            kilometraje.includes(value) ||
            proximoKm.includes(value)
          );
        }
      );
    }, [
      mantenimientos,
      search,
    ]);


  const vehiculosDisponibles =
    useMemo(() => {
      return vehiculos.filter(
        (vehiculo) =>
          Boolean(
            vehiculo.id
          )
      );
    }, [vehiculos]);


  const totalMantenimientos =
    mantenimientos.length;


  const costoTotal =
    mantenimientos.reduce(
      (
        total,
        item
      ) => {
        return (
          total +
          Number(
            item.costo || 0
          )
        );
      },
      0
    );


  const mantenimientosHoy =
    mantenimientos.filter(
      (item) =>
        item.fecha === hoy
    );


  const costoHoy =
    mantenimientosHoy.reduce(
      (
        total,
        item
      ) => {
        return (
          total +
          Number(
            item.costo || 0
          )
        );
      },
      0
    );


  const pendientes =
    mantenimientos.filter(
      (item) => {
        const codigo =
          String(
            item.estado_codigo ||
            ""
          ).toLowerCase();

        const nombre =
          String(
            item.estado_nombre ||
            ""
          ).toLowerCase();

        return (
          codigo.includes(
            "pendiente"
          ) ||
          nombre.includes(
            "pendiente"
          )
        );
      }
    ).length;


  useEffect(() => {
    const cargarDatosIniciales =
      async () => {
        await Promise.all([
          cargarMantenimientos(),
          cargarCatalogos(),
        ]);
      };

    void cargarDatosIniciales();
  }, []);


  return {
    mantenimientos,
    mantenimientosFiltrados,

    vehiculos,
    vehiculosDisponibles,

    tiposMantenimiento,
    estadosMantenimiento,

    loading,
    loadingCatalogos,
    saving,

    error,
    setError,

    search,
    setSearch,

    fechaSeleccionada,
    setFechaSeleccionada,

    modalOpen,
    mantenimientoEditando,

    totalMantenimientos,
    costoTotal,
    mantenimientosHoy,
    costoHoy,
    pendientes,

    rol,
    esSuperAdmin,
    esAdminSucursal,
    esTaxista,

    cargarMantenimientos,
    cargarCatalogos,

    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,

    guardarMantenimiento,
    eliminarMantenimiento,

    elegirFecha,
    limpiarFecha,
  };
};
