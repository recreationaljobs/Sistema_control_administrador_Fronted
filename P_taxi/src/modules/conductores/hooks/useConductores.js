import { useState, useEffect, useCallback } from "react";
import {
  getConductores,
  createConductor,
  updateConductor,
  deleteConductor,
} from "../services/conductoresService";

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
    refetch: fetchConductores,
  };
};
