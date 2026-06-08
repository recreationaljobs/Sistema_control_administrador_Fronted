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

    if (!form.password.trim()) {
      setError("Ingresa tu contraseña.");
      return false;
    }

    return true;
  };

  const redirectByRole = (rol) => {
    if (rol === "superadmin") {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (rol === "admin_sucursal") {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (rol === "taxista") {
      navigate("/dashboard", { replace: true });
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await loginRequest({
        username: form.username.trim(),
        password: form.password,
      });

      login(data);

      const rol = data?.rol || data?.user?.rol_codigo;
      redirectByRole(rol);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "No se pudo iniciar sesión. Revisa el usuario y la contraseña.";

      setError(message);
    } finally {
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