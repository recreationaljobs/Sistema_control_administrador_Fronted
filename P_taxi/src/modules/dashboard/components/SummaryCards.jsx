import {
  CircleDollarSign,
  Gauge,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const SummaryCards = ({ metricas }) => {
  const cards = [
    {
      title: "Ingreso",
      value: formatoDinero(metricas.ingreso),
      icon: CircleDollarSign,
      iconBox: "bg-green-100 text-green-600",
      valueColor: "text-green-600",
    },
    {
      title: "Ganancia real dueño",
      value: formatoDinero(metricas.gananciaReal),
      icon: Wallet,
      iconBox: "bg-blue-100 text-blue-600",
      valueColor: "text-blue-600",
    },
    {
      title: "Pago a taxistas",
      value: formatoDinero(metricas.pagoTaxistas),
      icon: Users,
      iconBox: "bg-yellow-100 text-yellow-600",
      valueColor: "text-orange-500",
    },
    {
      title: "Gastos + mantenimiento",
      value: formatoDinero(metricas.gastosOperativos),
      icon: Wrench,
      iconBox: "bg-red-100 text-red-600",
      valueColor: "text-red-600",
    },
    {
      title: "Km recorridos",
      value: `${Number(metricas.kilometros || 0).toLocaleString("es-NI")} km`,
      icon: Gauge,
      iconBox: "bg-purple-100 text-purple-600",
      valueColor: "text-purple-600",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${card.iconBox}`}
              >
                <Icon size={27} strokeWidth={2.4} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700">
                  {card.title}
                </p>

                <h3 className={`mt-2 text-xl font-black ${card.valueColor}`}>
                  {card.value}
                </h3>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default SummaryCards;