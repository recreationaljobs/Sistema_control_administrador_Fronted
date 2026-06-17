import { Edit3, Plus, Trash2 } from "lucide-react";

const CatalogoTable = ({
  meta,
  registros = [],
  puedeAdministrar,
  onCreate,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-black text-slate-950">
            {meta.titulo}
          </h3>

          <p className="mt-1 text-sm font-medium text-slate-500">
            {meta.descripcion}
          </p>
        </div>

        {puedeAdministrar && (
          <button
            type="button"
            onClick={() => onCreate(meta)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5B800] px-4 py-2.5 text-sm font-black text-white shadow-md shadow-yellow-100 transition hover:bg-[#DFA600]"
          >
            <Plus size={18} />
            Nuevo
          </button>
        )}
      </div>

      {!registros.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
          <p className="text-sm font-bold text-slate-500">
            No hay registros disponibles.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    Nombre
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    Código
                  </th>

                  {puedeAdministrar && (
                    <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {registros.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-black text-slate-900">
                        {item.nombre}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                        {item.codigo}
                      </span>
                    </td>

                    {puedeAdministrar && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(meta, item)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                            title="Editar"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(meta, item)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                            title="Eliminar"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogoTable;