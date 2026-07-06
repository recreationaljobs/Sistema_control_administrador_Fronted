import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import {
  getConductores,
  createConductor,
  updateConductor,
  deleteConductor,
  despedirConductor,
  reactivarConductor,
} from "../services/conductoresService";
import { mostrarError, mostrarExito } from "../../../utils/sweetAlert";

export const useConductores = () => {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConductor, setSelectedConductor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [conductorToDelete, setConductorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchConductores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConductores();
      setConductores(data);
    } catch {
      setError("No se pudieron cargar los conductores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConductores();
  }, [fetchConductores]);

  const openCreate = () => {
    setSelectedConductor(null);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const openEdit = (conductor) => {
    setSelectedConductor(conductor);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedConductor(null);
    setSubmitError(null);
  };

  const openDelete = (conductor) => {
    setConductorToDelete(conductor);
  };

  const closeDelete = () => {
    setConductorToDelete(null);
  };

  const handleCreate = async (data) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      const created = await createConductor(data);
      setConductores((prev) => [...prev, created]);
      closeModal();
    } catch (err) {
      const msg =
        err.response?.data?.cedula?.[0] ||
        err.response?.data?.detail ||
        "No se pudo crear el conductor.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      const updated = await updateConductor(selectedConductor.id, data);
      setConductores((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      closeModal();
    } catch (err) {
      const msg =
        err.response?.data?.cedula?.[0] ||
        err.response?.data?.detail ||
        "No se pudo actualizar el conductor.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!conductorToDelete) return;
    try {
      setDeleting(true);
      await deleteConductor(conductorToDelete.id);
      setConductores((prev) => prev.filter((c) => c.id !== conductorToDelete.id));
      closeDelete();
    } catch {
      closeDelete();
    } finally {
      setDeleting(false);
    }
  };

  const handleDespedir = async (conductor) => {
    const result = await Swal.fire({
      title: `¿Despedir a ${conductor.nombre} ${conductor.apellido}?`,
      text: "Su vehículo quedará libre. Esta acción puede revertirse.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, despedir",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const updated = await despedirConductor(conductor.id);
      setConductores((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      mostrarExito({
        titulo: "Conductor despedido",
        mensaje: `${conductor.nombre} quedó inactivo y su vehículo fue liberado.`,
      });
    } catch (err) {
      mostrarError({
        mensaje:
          err.response?.data?.detail || "No se pudo despedir al conductor.",
      });
    }
  };

  const handleReactivar = async (conductor) => {
    const result = await Swal.fire({
      title: `¿Reactivar a ${conductor.nombre} ${conductor.apellido}?`,
      text: "Volverá a estar disponible para asignaciones y jornadas.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, reactivar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const updated = await reactivarConductor(conductor.id);
      setConductores((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      mostrarExito({
        titulo: "Conductor reactivado",
        mensaje: `${conductor.nombre} vuelve a estar activo.`,
      });
    } catch (err) {
      mostrarError({
        mensaje:
          err.response?.data?.detail || "No se pudo reactivar al conductor.",
      });
    }
  };

  return {
    conductores,
    loading,
    error,
    isModalOpen,
    selectedConductor,
    submitting,
    submitError,
    conductorToDelete,
    deleting,
    openCreate,
    openEdit,
    closeModal,
    openDelete,
    closeDelete,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleDespedir,
    handleReactivar,
    refetch: fetchConductores,
  };
};
