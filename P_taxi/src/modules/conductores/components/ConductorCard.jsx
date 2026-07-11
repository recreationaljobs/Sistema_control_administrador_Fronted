// src/modules/conductores/components/ConductorCard.jsx

const ESTILOS = {
  yellow: {
    icono: "bg-yellow-100 text-yellow-700",
    valor: "text-slate-950",
    borde: "hover:border-yellow-300",
  },
  green: {
    icono: "bg-emerald-100 text-emerald-700",
    valor: "text-emerald-600",
    borde: "hover:border-emerald-300",
  },
  red: {
    icono: "bg-red-100 text-red-600",
    valor: "text-red-600",
    borde: "hover:border-red-300",
  },
  blue: {
    icono: "bg-blue-100 text-blue-600",
    valor: "text-blue-600",
    borde: "hover:border-blue-300",
  },
};

const ConductorCard = ({
  title,
  value,
  icon: Icon,
  tone = "yellow",
  description = "",
}) => {
  const estilo =
    ESTILOS[tone] || ESTILOS.yellow;

  return (
    <article
      className={`rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${estilo.borde}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${estilo.icono}`}
        >
          <Icon size={27} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500">
            {title}
          </p>

          <h3
            className={`mt-1 text-3xl font-black tabular-nums ${estilo.valor}`}
          >
            {value}
          </h3>

          {description && (
            <p className="mt-1 truncate text-xs font-medium text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default ConductorCard;