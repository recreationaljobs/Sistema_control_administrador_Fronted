import {
  useCallback,
  useMemo,
  useState,
} from "react";

import Swal from "sweetalert2";

import {
  createDocumentoVehiculo,
  deleteDocumentoVehiculo,
  getDocumentosVehiculo,
  updateDocumentoVehiculo,
} from "../services/vehiculosService";

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

const obtenerMensajeError = (
  error,
  mensajeDefault
) => {
  const data = error?.response?.data;

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
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];

    if (Array.isArray(firstValue)) {
      return firstValue[0];
    }

    if (typeof firstValue === "string") {
      return firstValue;
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
  });
};

const mostrarError = (
  titulo,
  mensaje
) => {
  Swal.close();

  void Swal.fire({
    title: titulo,
    text: mensaje,
    icon: "error",
    confirmButtonText: "Entendido",
    confirmButtonColor: "#dc2626",
    allowOutsideClick: true,
    allowEscapeKey: true,
  });
};

export const TIPOS_DOCUMENTO_VEHICULO = [
  {
    codigo: "inspeccion_mecanica",
    nombre: "Inspección mecánica",
  },
  {
    codigo: "emision_gases",
    nombre: "Emisión de gases",
  },
  {
    codigo: "seguro_vehicular",
    nombre: "Seguro vehicular",
  },
  {
    codigo: "seguro_pasajero",
    nombre: "Seguro de pasajero",
  },
];

export const useDocumentosVehiculo = ({
  onDocumentoGuardado,
} = {}) => {
  const [modalOpen, setModalOpen] =
    useState(false);

  const [vehiculoSeleccionado, setVehiculoSeleccionado] =
    useState(null);

  const [documentos, setDocumentos] =
    useState([]);

  const [loadingDocumentos, setLoadingDocumentos] =
    useState(false);

  const [savingDocumento, setSavingDocumento] =
    useState(false);

  const [errorDocumentos, setErrorDocumentos] =
    useState("");

  const [tipoActivo, setTipoActivo] =
    useState(
      TIPOS_DOCUMENTO_VEHICULO[0].codigo
    );

  const [documentoEditando, setDocumentoEditando] =
    useState(null);

  const cargarDocumentos = useCallback(
    async (
      vehiculoId,
      {
        mostrarCarga = true,
      } = {}
    ) => {
      if (!vehiculoId) {
        setDocumentos([]);
        return [];
      }

      try {
        if (mostrarCarga) {
          setLoadingDocumentos(true);
        }

        setErrorDocumentos("");

        const data =
          await getDocumentosVehiculo({
            vehiculoId,
          });

        const lista =
          normalizarLista(data);

        setDocumentos(lista);

        return lista;
      } catch (requestError) {
        const mensaje =
          obtenerMensajeError(
            requestError,
            "No se pudieron cargar los documentos del vehículo."
          );

        setErrorDocumentos(mensaje);

        return false;
      } finally {
        if (mostrarCarga) {
          setLoadingDocumentos(false);
        }
      }
    },
    []
  );

  const abrirModalDocumentos =
    useCallback(
      async (vehiculo) => {
        if (!vehiculo?.id) {
          return;
        }

        setVehiculoSeleccionado(
          vehiculo
        );

        setTipoActivo(
          TIPOS_DOCUMENTO_VEHICULO[0]
            .codigo
        );

        setDocumentoEditando(null);
        setErrorDocumentos("");
        setModalOpen(true);

        await cargarDocumentos(
          vehiculo.id
        );
      },
      [cargarDocumentos]
    );

  const cerrarModalDocumentos =
    useCallback(() => {
      if (savingDocumento) {
        return;
      }

      setModalOpen(false);
      setVehiculoSeleccionado(null);
      setDocumentoEditando(null);
      setDocumentos([]);
      setErrorDocumentos("");
    }, [savingDocumento]);

  const seleccionarTipoDocumento =
    useCallback((codigo) => {
      const existe =
        TIPOS_DOCUMENTO_VEHICULO.some(
          (tipo) =>
            tipo.codigo === codigo
        );

      if (!existe) {
        return;
      }

      setTipoActivo(codigo);
      setDocumentoEditando(null);
      setErrorDocumentos("");
    }, []);

  const iniciarEdicionDocumento =
    useCallback((documento) => {
      if (!documento?.id) {
        return;
      }

      setTipoActivo(
        documento.tipo_documento
      );

      setDocumentoEditando(
        documento
      );

      setErrorDocumentos("");
    }, []);

  const cancelarEdicionDocumento =
    useCallback(() => {
      setDocumentoEditando(null);
      setErrorDocumentos("");
    }, []);

  const guardarDocumento =
    useCallback(
      async (form) => {
        if (
          !vehiculoSeleccionado?.id
        ) {
          mostrarError(
            "Vehículo no encontrado",
            "No se pudo identificar el vehículo seleccionado."
          );

          return false;
        }

        const esEdicion = Boolean(
          documentoEditando?.id
        );

        const tipoEncontrado =
          TIPOS_DOCUMENTO_VEHICULO.find(
            (tipo) =>
              tipo.codigo ===
              tipoActivo
          );

        const nombreTipo =
          tipoEncontrado?.nombre ||
          "documento";

        const confirmacion =
          await Swal.fire({
            title: esEdicion
              ? "¿Actualizar documento?"
              : "¿Registrar documento?",

            text: esEdicion
              ? `Se actualizará ${nombreTipo.toLowerCase()}.`
              : `Se registrará ${nombreTipo.toLowerCase()} para el vehículo ${vehiculoSeleccionado.numero} - ${vehiculoSeleccionado.placa}.`,

            icon: "question",
            showCancelButton: true,

            confirmButtonText:
              esEdicion
                ? "Actualizar"
                : "Registrar",

            cancelButtonText:
              "Cancelar",

            confirmButtonColor:
              "#eab308",

            cancelButtonColor:
              "#64748b",

            reverseButtons: true,
            allowOutsideClick: false,
            allowEscapeKey: true,
          });

        if (
          !confirmacion.isConfirmed
        ) {
          return false;
        }

        try {
          setSavingDocumento(true);
          setErrorDocumentos("");

          const payload = {
            vehiculo:
              vehiculoSeleccionado.id,

            tipo_documento:
              tipoActivo,

            fecha_inicio:
              form.fecha_inicio,

            fecha_vencimiento:
              form.fecha_vencimiento,

            observaciones:
              String(
                form.observaciones || ""
              ).trim(),
          };

          if (esEdicion) {
            await updateDocumentoVehiculo(
              documentoEditando.id,
              payload
            );
          } else {
            await createDocumentoVehiculo(
              payload
            );
          }

          setDocumentoEditando(null);

          await cargarDocumentos(
            vehiculoSeleccionado.id,
            {
              mostrarCarga: false,
            }
          );

          if (
            typeof onDocumentoGuardado ===
            "function"
          ) {
            await onDocumentoGuardado();
          }

          mostrarExito(
            esEdicion
              ? "Documento actualizado"
              : "Documento registrado",

            esEdicion
              ? "Los cambios se guardaron correctamente."
              : "El documento se registró correctamente."
          );

          return true;
        } catch (requestError) {
          const mensaje =
            obtenerMensajeError(
              requestError,
              esEdicion
                ? "No se pudo actualizar el documento."
                : "No se pudo registrar el documento."
            );

          setErrorDocumentos(
            mensaje
          );

          mostrarError(
            esEdicion
              ? "No se pudo actualizar"
              : "No se pudo registrar",
            mensaje
          );

          return false;
        } finally {
          setSavingDocumento(false);
        }
      },
      [
        vehiculoSeleccionado,
        documentoEditando,
        tipoActivo,
        cargarDocumentos,
        onDocumentoGuardado,
      ]
    );

  const eliminarDocumento =
    useCallback(
      async (documento) => {
        if (!documento?.id) {
          return false;
        }

        const confirmacion =
          await Swal.fire({
            title:
              "¿Eliminar documento?",

            text:
              "El documento será eliminado permanentemente.",

            icon: "warning",
            showCancelButton: true,
            confirmButtonText:
              "Eliminar",
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

        if (
          !confirmacion.isConfirmed
        ) {
          return false;
        }

        try {
          setSavingDocumento(true);
          setErrorDocumentos("");

          await deleteDocumentoVehiculo(
            documento.id
          );

          if (
            documentoEditando?.id ===
            documento.id
          ) {
            setDocumentoEditando(
              null
            );
          }

          await cargarDocumentos(
            vehiculoSeleccionado.id,
            {
              mostrarCarga: false,
            }
          );

          if (
            typeof onDocumentoGuardado ===
            "function"
          ) {
            await onDocumentoGuardado();
          }

          mostrarExito(
            "Documento eliminado",
            "El documento fue eliminado correctamente."
          );

          return true;
        } catch (requestError) {
          const mensaje =
            obtenerMensajeError(
              requestError,
              "No se pudo eliminar el documento."
            );

          setErrorDocumentos(
            mensaje
          );

          mostrarError(
            "No se pudo eliminar",
            mensaje
          );

          return false;
        } finally {
          setSavingDocumento(false);
        }
      },
      [
        documentoEditando,
        vehiculoSeleccionado,
        cargarDocumentos,
        onDocumentoGuardado,
      ]
    );

  const documentosTipoActivo =
    useMemo(() => {
      return documentos.filter(
        (documento) =>
          documento.tipo_documento ===
          tipoActivo
      );
    }, [
      documentos,
      tipoActivo,
    ]);

  const resumenDocumental =
    useMemo(() => {
      const resultado = {};

      TIPOS_DOCUMENTO_VEHICULO.forEach(
        (tipo) => {
          const documentosTipo =
            documentos
              .filter(
                (documento) =>
                  documento.tipo_documento ===
                  tipo.codigo
              )
              .sort(
                (a, b) =>
                  new Date(
                    b.fecha_vencimiento
                  ) -
                  new Date(
                    a.fecha_vencimiento
                  )
              );

          resultado[tipo.codigo] =
            documentosTipo[0] || null;
        }
      );

      return resultado;
    }, [documentos]);

  return {
    modalDocumentosOpen:
      modalOpen,

    vehiculoSeleccionado,
    documentos,
    documentosTipoActivo,
    resumenDocumental,

    loadingDocumentos,
    savingDocumento,
    errorDocumentos,

    tipoActivo,
    documentoEditando,

    abrirModalDocumentos,
    cerrarModalDocumentos,

    seleccionarTipoDocumento,

    iniciarEdicionDocumento,
    cancelarEdicionDocumento,

    guardarDocumento,
    eliminarDocumento,
  };
};