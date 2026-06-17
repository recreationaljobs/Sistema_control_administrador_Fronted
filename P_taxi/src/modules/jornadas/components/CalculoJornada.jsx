const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const CalculoJornada = ({
  tipoCobro = "porcentaje",
  kilometrajeInicial,
  kilometrajeFinal,
  ingresoBruto,
  porcentajePago = 30,
  montoAlquiler = 0,
  totalGastos = 0,
}) => {
  const kmInicial = Number(kilometrajeInicial || 0);
  const kmFinal = Number(kilometrajeFinal || 0);
  const ingreso = Number(ingresoBruto || 0);
  const porcentaje = Number(porcentajePago || 0);
  const alquiler = Number(montoAlquiler || 0);
  const gastos = Number(totalGastos || 0);

  const kilometrosRecorridos =
    kmFinal >= kmInicial ? kmFinal - kmInicial : 0;

  let ingresoSistema = ingreso;
  let pagoConductor = 0;
  let gananciaDueno = 0;

  if (tipoCobro === "alquiler") {
    ingresoSistema = alquiler;
    pagoConductor = 0;
    gananciaDueno = alquiler - gastos;
  } else {
    ingresoSistema = ingreso;
    pagoConductor = ingreso * (porcentaje / 100);
    gananciaDueno = ingreso - pagoConductor - gastos;
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-wide text-[#DFA600]">
          Vista previa del cálculo
        </p>

        <h4 className="mt-1 text-lg font-black text-slate-950">
          Resultado estimado de la jornada
        </h4>

        <p className="mt-1 text-sm font-medium text-slate-500">
          {tipoCobro === "alquiler"
            ? "En alquiler no se registra cuánto hizo el conductor. Solo se toma el monto del alquiler como ingreso del dueño."
            : "En porcentaje se calcula el pago del conductor según el ingreso del día."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Kilómetros
          </p>

          <p className="mt-2 text-xl font-black text-slate-950">
            {kilometrosRecorridos.toLocaleString()} km
          </p>
        </div>

        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Ingreso sistema
          </p>

          <p className="mt-2 text-xl font-black text-green-600">
            {formatoDinero(ingresoSistema)}
          </p>
        </div>

        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Pago conductor
          </p>

          <p className="mt-2 text-xl font-black text-blue-600">
            {tipoCobro === "alquiler"
              ? "No aplica"
              : formatoDinero(pagoConductor)}
          </p>
        </div>

        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Ganancia dueño
          </p>

          <p className="mt-2 text-xl font-black text-[#B98200]">
            {formatoDinero(gananciaDueno)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CalculoJornada;