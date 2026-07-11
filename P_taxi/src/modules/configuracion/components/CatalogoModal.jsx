// src/modules/configuracion/components/CatalogoModal.jsx

import { useEffect, useState } from "react";
import {
  Code2,
  Loader2,
  Save,
  Settings2,
  Sparkles,
  Type,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

const initialForm = {
  nombre: "",
  codigo: "",
};

const normalizarCodigo = (valor = "") => {
  return String(valor)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
};

const CatalogoModal = ({
  open,
  onClose,
  onSave,
  catalogoActivo,
  registroEditando,
  saving = false,
}) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [codigoManual, setCodigoManual] = useState(false);

  const esEdicion = Boolean(registroEditando);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (registroEditando) {
      setForm({
        nombre: registroEditando.nombre || "",
        codigo: registroEditando.codigo || "",
      });

      setCodigoManual(true);
    } else {
      setForm(initialForm);
      setCodigoManual(false);
    }

    setError("");
  }, [registroEditando, open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const overflowAnterior = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflowAnterior;
    };
  }, [open, saving, onClose]);

  if (!open) {
    return null;
  }

  const cerrarModal = () => {
    if (saving) {
      return;
    }

    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "nombre") {
      setForm((formAnterior) => ({
        ...formAnterior,
        nombre: value,
        codigo:
          !esEdicion && !codigoManual
            ? normalizarCodigo(value)
            : formAnterior.codigo,
      }));
    } else {
      setForm((formAnterior) => ({
        ...formAnterior,
        [name]: value,
      }));

      if (name === "codigo") {
        setCodigoManual(true);
      }
    }

    if (error) {
      setError("");
    }
  };

  const generarCodigo = () => {
    const codigoGenerado = normalizarCodigo(form.nombre);

    setForm((formAnterior) => ({
      ...formAnterior,
      codigo: codigoGenerado,
    }));

    setCodigoManual(false);
    setError("");
  };

  const handleCodigoBlur = () => {
    setForm((formAnterior) => ({
      ...formAnterior,
      codigo: normalizarCodigo(formAnterior.codigo),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const nombre = form.nombre.trim();
    const codigo = normalizarCodigo(form.codigo);

    if (!nombre) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!codigo) {
      setError("El código es obligatorio.");
      return;
    }

    const confirmacion = await Swal.fire({
      title: esEdicion
        ? "¿Actualizar registro?"
        : "¿Crear registro?",
      text: esEdicion
        ? "Se guardarán los cambios realizados."
        : `Se agregará “${nombre}” al catálogo.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: esEdicion ? "Actualizar" : "Crear",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#eab308",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    if (typeof onSave !== "function") {
      setError("No se encontró la función para guardar.");
      return;
    }

    const resultado = await onSave({
      nombre,
      codigo,
    });

    if (resultado === false) {
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:px-5">
      <button
        type="button"
        onClick={cerrarModal}
        disabled={saving}
        className="absolute inset-0 cursor-default bg-slate-950/60"
        aria-label="Cerrar ventana"
      />

      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalogo-modal-title"
        aria-busy={saving}
        className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className="h-1.5 w-full bg-yellow-400" />

        <header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                <Settings2 size={25} />
              </div>

              <div className="min-w-0">
                <h2
                  id="catalogo-modal-title"
                  className="text-xl font-black tracking-tight text-slate-950"
                >
                  {esEdicion ? "Editar registro" : "Nuevo registro"}
                </h2>

                <p className="mt-1 truncate text-sm font-medium text-slate-500">
                  {catalogoActivo?.titulo || "Catálogo del sistema"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={cerrarModal}
              disabled={saving}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Cerrar"
            >
              <X size={21} />
            </button>
          </div>

          {saving && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Loader2
                size={18}
                className="animate-spin text-yellow-600"
              />

              <p className="text-sm font-bold text-slate-600">
                {esEdicion
                  ? "Actualizando registro..."
                  : "Creando registro..."}
              </p>
            </div>
          )}
        </header>

        <main className="space-y-5 bg-slate-50 p-5 sm:p-6">
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
            >
              <p className="text-sm font-bold text-red-700">
                {error}
              </p>
            </div>
          )}

          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
            <div>
              <label
                htmlFor="catalogo-nombre"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Nombre
              </label>

              <div className="relative">
                <Type
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="catalogo-nombre"
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  disabled={saving}
                  autoFocus
                  maxLength={100}
                  placeholder="Ejemplo: En mantenimiento"
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="catalogo-codigo"
                  className="block text-sm font-bold text-slate-700"
                >
                  Código
                </label>

                <button
                  type="button"
                  onClick={generarCodigo}
                  disabled={saving || !form.nombre.trim()}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-yellow-700 transition hover:text-yellow-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Sparkles size={14} />
                  Generar
                </button>
              </div>

              <div className="relative">
                <Code2
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="catalogo-codigo"
                  type="text"
                  name="codigo"
                  value={form.codigo}
                  onChange={handleChange}
                  onBlur={handleCodigoBlur}
                  disabled={saving}
                  maxLength={100}
                  placeholder="en_mantenimiento"
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 font-mono text-sm font-bold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <p className="mt-2 text-xs font-medium text-slate-500">
                Se permiten letras, números y guion bajo.
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Vista previa
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-sm font-black text-slate-800 shadow-sm">
                  {form.nombre.trim() || "Nombre"}
                </span>

                <span className="rounded-full bg-slate-200 px-3 py-1.5 font-mono text-xs font-black text-slate-700">
                  {normalizarCodigo(form.codigo) || "codigo"}
                </span>
              </div>
            </div>
          </section>
        </main>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-5 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={cerrarModal}
            disabled={saving}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 shadow-md shadow-yellow-100 transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {saving
              ? "Guardando..."
              : esEdicion
                ? "Actualizar"
                : "Crear registro"}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default CatalogoModal;