// src/modules/auth/hooks/useLogin.js

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { loginRequest } from "../services/authService";

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = () => {
    if (!form.username.trim()) {
      setError("Ingresa tu usuario.");
      return false;
    }

    if (!form.password) {
      setError("Ingresa tu contraseña.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await loginRequest({
        username: form.username.trim(),
        password: form.password,
      });

      login(data);

      // Entra inmediatamente al dashboard.
      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "No se pudo iniciar sesión. Revisa el usuario y la contraseña.";

      setError(message);
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    error,
    showPassword,
    handleChange,
    handleSubmit,
    togglePassword,
  };
};