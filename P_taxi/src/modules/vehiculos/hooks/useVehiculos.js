import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import { useAuth } from "../../../hooks/useAuth";

import {
  createVehiculo,
  deleteVehiculo,
  getVehiculos,
  updateVehiculo,
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

const normalizarRol = (rol) => {
  const valor =
    typeof rol === "object"
      ? rol?.codigo || rol?.nombre || ""
      : rol;

  const codigo = String(valor || "")
    .trim()
    .toLowerCase();

  return codigo === "super_admin"
    ? "superadmin"
    : codigo;
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

  return error?.message || mensajeDefault;
};

const mostrarExito = (titulo, texto) => {
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

const mostrarError = (titulo, mensaje) => {
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

export const useVehiculos = () => {
  const { rol } = useAuth();

  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] =
    useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const rolNormalizado = normalizarRol(rol);

  const esSuperAdmin =
    rolNormalizado === "superadmin";

  const esAdminSucursal =
    rolNormalizado === "admin_sucursal";

  const esTaxista =
    rolNormalizado === "taxista";

  const cargarVehiculos = async ({
    mostrarCarga = true,
  } = {}) => {
    try {
      if (mostrarCarga) {
        setLoading(true);
      }

      setError("");

      const data = await getVehiculos();
      const lista = normalizarLista(data);

      setVehiculos(lista);

      return lista;
    } catch (requestError) {
      const mensaje = obtenerMensajeError(
        requestError,
        "No se pudieron cargar los vehículos."
      );

      setError(mensaje);

      return false;
    } finally {
      if (mostrarCarga) {
        setLoading(false);
      }
    }
  };

  const abrirModalCrear = () => {
    setVehiculoEditando(null);
    setError("");
    setModalOpen(true);
  };

  const abrirModalEditar = (vehiculo) => {
    if (!vehiculo?.id) {
      return;
    }

    setVehiculoEditando(vehiculo);
    setError("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setVehiculoEditando(null);
  };

  const guardarVehiculo = async (form) => {
    const esEdicion = Boolean(
      vehiculoEditando?.id
    );

    const identificacion = [
      form?.numero,
      form?.placa,
    ]
      .filter(Boolean)
      .join(" - ");

    const confirmacion = await Swal.fire({
      title: esEdicion
        ? "¿Actualizar vehículo?"
        : "¿Registrar vehículo?",

      text: esEdicion
        ? `Se guardarán los cambios de ${
            identificacion || "este vehículo"
          }.`
        : `Se registrará ${
            identificacion || "el nuevo vehículo"
          }.`,

      icon: "question",

      showCancelButton: true,

      confirmButtonText: esEdicion
        ? "Actualizar"
        : "Registrar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#eab308",
      cancelButtonColor: "#64748b",

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

      const payload = {
        numero: String(form?.numero || "").trim(),
        placa: String(form?.placa || "").trim(),
        marca: String(form?.marca || "").trim(),
        modelo: String(form?.modelo || "").trim(),

        anio:
          form?.anio !== "" &&
          form?.anio !== null &&
          form?.anio !== undefined
            ? Number(form.anio)
            : null,

        color: String(form?.color || "").trim(),

        numero_motor: String(
          form?.numero_motor || ""
        ).trim(),

        numero_chasis: String(
          form?.numero_chasis || ""
        ).trim(),

        kilometraje_actual:
          form?.kilometraje_actual !== "" &&
          form?.kilometraje_actual !== null &&
          form?.kilometraje_actual !== undefined
            ? Number(form.kilometraje_actual)
            : 0,
      };

      if (esEdicion) {
        await updateVehiculo(
          vehiculoEditando.id,
          payload
        );
      } else {
        await createVehiculo(payload);
      }

      await cargarVehiculos({
        mostrarCarga: false,
      });

      cerrarModal();

      mostrarExito(
        esEdicion
          ? "Vehículo actualizado"
          : "Vehículo registrado",
        esEdicion
          ? "Los cambios se guardaron correctamente."
          : "El vehículo se registró correctamente."
      );

      return true;
    } catch (requestError) {
      const mensaje = obtenerMensajeError(
        requestError,
        esEdicion
          ? "No se pudo actualizar el vehículo."
          : "No se pudo registrar el vehículo."
      );

      setError(mensaje);

      mostrarError(
        esEdicion
          ? "No se pudo actualizar"
          : "No se pudo registrar",
        mensaje
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  const eliminarVehiculo = async (vehiculo) => {
    if (!vehiculo?.id) {
      return false;
    }

    const identificacion = [
      vehiculo.numero,
      vehiculo.placa,
    ]
      .filter(Boolean)
      .join(" - ");

    const confirmacion = await Swal.fire({
      title: "¿Eliminar vehículo?",

      text: `${
        identificacion || "El vehículo"
      } será eliminado permanentemente.`,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",

      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",

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

      await deleteVehiculo(vehiculo.id);

      await cargarVehiculos({
        mostrarCarga: false,
      });

      mostrarExito(
        "Vehículo eliminado",
        "El vehículo fue eliminado correctamente."
      );

      return true;
    } catch (requestError) {
      const mensaje = obtenerMensajeError(
        requestError,
        "No se pudo eliminar el vehículo. Puede tener asignaciones o registros asociados."
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

  const vehiculosFiltrados = useMemo(() => {
    const lista = Array.isArray(vehiculos)
      ? vehiculos.filter(Boolean)
      : [];

    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return lista;
    }

    return lista.filter((vehiculo) => {
      const texto = [
        vehiculo?.numero,
        vehiculo?.placa,
        vehiculo?.marca,
        vehiculo?.modelo,
        vehiculo?.color,
        vehiculo?.sucursal_nombre,
        vehiculo?.estado_nombre,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(value);
    });
  }, [vehiculos, search]);

  const totalVehiculos = vehiculos.length;

  const vehiculosAlertaAceite =
    vehiculos.filter(
      (item) =>
        item?.alerta_cambio_aceite ||
        item?.necesita_cambio_aceite
    ).length;

  const vehiculosAlertaMantenimiento =
    vehiculos.filter(
      (item) =>
        item?.alerta_mantenimiento ||
        item?.necesita_mantenimiento
    ).length;

  const kilometrajeTotal = vehiculos.reduce(
    (total, item) => {
      const kilometraje = Number(
        item?.kilometraje_actual || 0
      );

      return (
        total +
        (Number.isFinite(kilometraje)
          ? kilometraje
          : 0)
      );
    },
    0
  );

  useEffect(() => {
    void cargarVehiculos();
  }, []);

  return {
    vehiculos,
    vehiculosFiltrados,

    loading,
    saving,
    error,

    search,
    setSearch,

    modalOpen,
    vehiculoEditando,

    totalVehiculos,
    vehiculosAlertaAceite,
    vehiculosAlertaMantenimiento,
    kilometrajeTotal,

    esSuperAdmin,
    esAdminSucursal,
    esTaxista,

    cargarVehiculos,

    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,

    guardarVehiculo,
    eliminarVehiculo,
  };
};