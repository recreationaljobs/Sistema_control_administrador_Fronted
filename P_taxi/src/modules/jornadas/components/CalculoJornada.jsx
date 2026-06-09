// src/modules/jornadas/components/CalculoJornada.jsx

const formatoDinero = (valor) => {
  return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const CalculoJornada = ({
  kilometrajeInicial,
  kilometrajeFinal,
  ingresoBruto,
  porcentajePago = 30,
}) => {
  const kmInicial = Number(kilometrajeInicial || 0);
  const kmFinal = Number(kilometrajeFinal || 0);
  const ingreso = Number(ingresoBruto || 0);
  const porcentaje = Number(porcentajePago || 0);

  const kilometrosRecorridos =
    kmFinal >= kmInicial ? kmFinal - kmInicial : 0;

  const pagoConductor = ingreso * (porcentaje / 100);
  const gananciaEstimada = ingreso - pagoConductor;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900">
          Cálculo previo de la jornada
        </h3>

        <p className="mt-1 text-xs font-medium text-slate-500">
          Estos valores son una vista previa. El cálculo definitivo lo realiza el backend según la configuración del sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Kilómetros
          </p>

          <p className="mt-2 text-2xl font-black text-slate-950">
            {kilometrosRecorridos.toLocaleString()} km
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Pago conductor
          </p>

          <p className="mt-2 text-2xl font-black text-blue-600">
            {formatoDinero(pagoConductor)}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Ganancia estimada
          </p>

          <p className="mt-2 text-2xl font-black text-green-600">
            {formatoDinero(gananciaEstimada)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CalculoJornada;