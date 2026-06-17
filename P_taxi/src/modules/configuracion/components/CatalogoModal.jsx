import { useEffect, useState } from "react";
import { Settings2, X } from "lucide-react";

const initialForm = {
  nombre: "",
  codigo: "",
};

const CatalogoModal = ({
  open,
  onClose,
  onSave,
  catalogoActivo,
  registroEditando,
  saving,
}) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (registroEditando) {
      setForm({
        nombre: registroEditando.nombre || "",
        codigo: registroEditando.codigo || "",
      });
    } else {
      setForm(initialForm);
    }

    setError("");
  }, [registroEditando, open]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const normalizarCodigo = (valor) => {
    return valor
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const handleCodigoBlur = () => {
    setForm((prev) => ({
      ...prev,
      codigo: normalizarCodigo(prev.codigo),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

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

    onSave({
      nombre,
      codigo,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40"
        aria-label="Cerrar modal"
      />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4CF] text-[#E7A900]">
              <Settings2 size={25} />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-950">
                {registroEditando ? "Editar registro" : "Nuevo registro"}
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {catalogoActivo?.titulo || "Catálogo del sistema"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Nombre
            </label>

            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
              placeholder="Ejemplo: Activo"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Código
            </label>

            <input
              type="text"
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              onBlur={handleCodigoBlur}
              disabled={saving}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#F5B800] focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100 disabled:text-slate-500"
              placeholder="Ejemplo: activo"
            />

            <p className="mt-2 text-xs font-semibold text-slate-500">
              Usa códigos sin espacios. Ejemplo: activo, pendiente,
              mantenimiento, cambio_aceite.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-[#F5B800] px-5 py-3 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600] disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CatalogoModal;