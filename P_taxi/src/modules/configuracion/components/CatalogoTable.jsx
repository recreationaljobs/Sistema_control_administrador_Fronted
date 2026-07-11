// src/modules/configuracion/components/CatalogoTable.jsx

import {
  Edit3,
  FolderOpen,
  Plus,
  Tag,
  Tags,
  Trash2,
} from "lucide-react";

const TONOS = {
  roles: {
    icono: "bg-violet-100 text-violet-700",
    barra: "bg-violet-500",
    contador: "bg-violet-50 text-violet-700",
  },
  estados: {
    icono: "bg-emerald-100 text-emerald-700",
    barra: "bg-emerald-500",
    contador: "bg-emerald-50 text-emerald-700",
  },
  tipos: {
    icono: "bg-blue-100 text-blue-700",
    barra: "bg-blue-500",
    contador: "bg-blue-50 text-blue-700",
  },
  default: {
    icono: "bg-yellow-100 text-yellow-700",
    barra: "bg-yellow-400",
    contador: "bg-yellow-50 text-yellow-700",
  },
};

const CatalogoTable = ({
  meta,
  registros = [],
  puedeAdministrar = false,
  onCreate,
  onEdit,
  onDelete,
}) => {
  const tono =
    TONOS[meta?.key] ||
    TONOS[
      String(meta?.key || "")
        .split("_")[0]
        .toLowerCase()
    ] ||
    TONOS.default;

  const Icono = meta?.icono || Tags;

  return (
    <article className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className={`h-1.5 w-full ${tono.barra}`} />

      <header className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tono.icono}`}
          >
            <Icono size={21} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-black text-slate-950">
                {meta?.titulo || "Catálogo"}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-black ${tono.contador}`}
              >
                {registros.length}
              </span>
            </div>

            {meta?.descripcion && (
              <p className="mt-1 truncate text-xs font-medium text-slate-500">
                {meta.descripcion}
              </p>
            )}
          </div>
        </div>

        {puedeAdministrar && (
          <button
            type="button"
            onClick={() => onCreate?.(meta)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
          >
            <Plus size={17} />
            Agregar
          </button>
        )}
      </header>

      {!registros.length ? (
        <div className="p-5">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
            <FolderOpen
              size={30}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-bold text-slate-500">
              Sin registros
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Vista móvil */}
          <div className="grid gap-3 p-4 md:hidden">
            {registros.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                      <Tag size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">
                        {item.nombre}
                      </p>

                      <span className="mt-1.5 inline-flex max-w-full truncate rounded-full bg-white px-2.5 py-1 font-mono text-xs font-bold text-slate-600 shadow-sm">
                        {item.codigo}
                      </span>
                    </div>
                  </div>

                  {puedeAdministrar && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit?.(meta, item)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        title="Editar"
                        aria-label="Editar registro"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete?.(meta, item)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                        title="Eliminar"
                        aria-label="Eliminar registro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Vista escritorio */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    Nombre
                  </th>

                  <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    Código
                  </th>

                  {puedeAdministrar && (
                    <th className="px-5 py-3.5 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {registros.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tono.icono}`}
                        >
                          <Tag size={16} />
                        </div>

                        <p className="text-sm font-black text-slate-900">
                          {item.nombre}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 font-mono text-xs font-black text-slate-700">
                        {item.codigo}
                      </span>
                    </td>

                    {puedeAdministrar && (
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit?.(meta, item)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                            title="Editar"
                            aria-label="Editar registro"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete?.(meta, item)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                            title="Eliminar"
                            aria-label="Eliminar registro"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </article>
  );
};

export default CatalogoTable;