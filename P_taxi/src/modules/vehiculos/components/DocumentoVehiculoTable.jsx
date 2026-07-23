import {
  CalendarDays,
  Edit3,
  FileClock,
  Trash2,
} from "lucide-react";

const ESTILOS_ESTADO = {
  vigente:
    "border-green-200 bg-green-50 text-green-700",

  por_vencer:
    "border-yellow-200 bg-yellow-50 text-yellow-700",

  vencido:
    "border-red-200 bg-red-50 text-red-700",

  sin_registrar:
    "border-slate-200 bg-slate-100 text-slate-600",
};

const formatearFecha = (
  fecha
) => {
  if (!fecha) {
    return "No registrada";
  }

  const partes = String(
    fecha
  ).split("-");

  if (partes.length !== 3) {
    return fecha;
  }

  const [
    year,
    month,
    day,
  ] = partes;

  return `${day}/${month}/${year}`;
};

const obtenerTextoDias = (
  documento
) => {
  const dias = Number(
    documento?.dias_para_vencer
  );

  if (
    !Number.isFinite(dias)
  ) {
    return "Sin información";
  }

  if (dias < 0) {
    const cantidad =
      Math.abs(dias);

    return cantidad === 1
      ? "Venció hace 1 día"
      : `Venció hace ${cantidad} días`;
  }

  if (dias === 0) {
    return "Vence hoy";
  }

  if (dias === 1) {
    return "Vence en 1 día";
  }

  return `Vence en ${dias} días`;
};

const DocumentoVehiculoTable = ({
  documentos = [],
  loading = false,
  onEdit,
  onDelete,
  saving = false,
  soloLectura = false,
}) => {
  if (loading) {
    return (
      <div className="flex min-h-44 items-center justify-center rounded-[24px] border border-slate-200 bg-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#F5B800]" />

          <p className="mt-3 text-sm font-bold text-slate-500">
            Cargando documentos...
          </p>
        </div>
      </div>
    );
  }

  if (!documentos.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <FileClock size={28} />
        </div>

        <h4 className="mt-4 text-base font-black text-slate-900">
          No hay documentos registrados
        </h4>

        <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">
          Todavía no se han registrado fechas para este tipo de documento.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Fecha de inicio
              </th>

              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Vencimiento
              </th>

              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Estado
              </th>

              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                Observaciones
              </th>

              {!soloLectura && (
                <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {documentos.map(
              (documento) => {
                const estilo =
                  ESTILOS_ESTADO[
                    documento.estado
                  ] ||
                  ESTILOS_ESTADO
                    .sin_registrar;

                return (
                  <tr
                    key={
                      documento.id
                    }
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <CalendarDays
                          size={16}
                          className="shrink-0 text-slate-400"
                        />

                        {formatearFecha(
                          documento.fecha_inicio
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm font-black text-slate-800">
                        {formatearFecha(
                          documento.fecha_vencimiento
                        )}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {obtenerTextoDias(
                          documento
                        )}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${estilo}`}
                      >
                        {documento.estado_nombre ||
                          "Sin registrar"}
                      </span>
                    </td>

                    <td className="max-w-xs px-4 py-4">
                      <p className="line-clamp-3 text-sm font-medium text-slate-600">
                        {documento.observaciones ||
                          "Sin observaciones"}
                      </p>
                    </td>

                    {!soloLectura && (
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onEdit(
                                documento
                              )
                            }
                            disabled={
                              saving
                            }
                            className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Editar documento"
                          >
                            <Edit3
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onDelete(
                                documento
                              )
                            }
                            disabled={
                              saving
                            }
                            className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Eliminar documento"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentoVehiculoTable;