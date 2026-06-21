import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export const mostrarBienvenida = ({
  nombre = "Usuario",
  rol = "",
  duracion = 2200,
} = {}) => {
  return Swal.fire({
    title: `¡Bienvenido, ${nombre}!`,
    text: rol
      ? `Has iniciado sesión como ${rol}.`
      : "Has iniciado sesión correctamente.",
    icon: "success",

    showConfirmButton: false,
    showCancelButton: false,

    timer: duracion,
    timerProgressBar: true,

    allowOutsideClick: false,
    allowEscapeKey: false,
  });
};

export const confirmarCierreSesion = () => {
  return Swal.fire({
    title: "¿Cerrar sesión?",
    text: "Se cerrará tu sesión actual y volverás al inicio de sesión.",
    icon: "warning",

    showCancelButton: true,

    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",

    confirmButtonText: "Sí, salir",
    cancelButtonText: "Cancelar",
  });
};

export const mostrarError = ({
  titulo = "Error",
  mensaje = "No se pudo completar la operación.",
} = {}) => {
  return Swal.fire({
    title: titulo,
    text: mensaje,
    icon: "error",
    confirmButtonColor: "#3085d6",
  });
};

export const confirmarEliminacion = ({
  titulo = "¿Estás seguro?",
  mensaje = "No podrás revertir esta acción.",
  textoConfirmar = "Sí, eliminar",
  textoCancelar = "Cancelar",
} = {}) => {
  return Swal.fire({
    title: titulo,
    text: mensaje,
    icon: "warning",

    showCancelButton: true,

    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",

    confirmButtonText: textoConfirmar,
    cancelButtonText: textoCancelar,
  });
};

export const mostrarExito = ({
  titulo = "¡Completado!",
  mensaje = "La operación se realizó correctamente.",
} = {}) => {
  return Swal.fire({
    title: titulo,
    text: mensaje,
    icon: "success",
    confirmButtonColor: "#3085d6",
  });
};