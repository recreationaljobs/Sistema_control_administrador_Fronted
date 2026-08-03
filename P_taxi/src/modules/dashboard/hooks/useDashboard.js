import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getDashboardFinanciero,
  getDashboardResumen,
  getJornadas,
} from "../services/dashboardService";

const MESES = {
  "01": "Ene",
  "02": "Feb",
  "03": "Mar",
  "04": "Abr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dic",
};

const normalizarLista = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const numeroSeguro = (valor) => {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : 0;
};

const formatearFechaLocal = (fecha) => {
  const year = fecha.getFullYear();

  const month = String(
    fecha.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    fecha.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const obtenerParametrosPeriodo = (
  periodoSeleccionado
) => {
  const fechaActual = new Date();

  const fechaFin =
    formatearFechaLocal(fechaActual);

  if (periodoSeleccionado === "dia") {
    return {
      fecha: fechaFin,
    };
  }

  if (periodoSeleccionado === "semana") {
    const inicioSemana = new Date(
      fechaActual
    );

    const numeroDia =
      fechaActual.getDay();

    const diasDesdeLunes =
      numeroDia === 0
        ? 6
        : numeroDia - 1;

    inicioSemana.setDate(
      fechaActual.getDate() -
        diasDesdeLunes
    );

    return {
      fecha_inicio:
        formatearFechaLocal(
          inicioSemana
        ),
      fecha_fin: fechaFin,
    };
  }

  const inicioMes = new Date(
    fechaActual.getFullYear(),
    fechaActual.getMonth(),
    1
  );

  return {
    fecha_inicio:
      formatearFechaLocal(
        inicioMes
      ),
    fecha_fin: fechaFin,
  };
};

const obtenerMensajeError = (
  err,
  mensajeDefault
) => {
  const data =
    err?.response?.data;

  if (data?.detail) {
    return data.detail;
  }

  if (typeof data === "string") {
    return data;
  }

  return mensajeDefault;
};

export const useDashboard = ({
  enabled = true,
} = {}) => {
  const anioActual =
    new Date().getFullYear();

  const [resumen, setResumen] =
    useState({});

  const [
    jornadasHoy,
    setJornadasHoy,
  ] = useState([]);

  const [
    financieroMensual,
    setFinancieroMensual,
  ] = useState([]);

  const [
    anioSeleccionado,
    setAnioSeleccionado,
  ] = useState(anioActual);

  const [periodo, setPeriodo] =
    useState("dia");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const limpiarDashboard =
    useCallback(() => {
      setResumen({});
      setFinancieroMensual([]);
      setJornadasHoy([]);
      setError("");
      setLoading(false);
    }, []);

  const cargarDashboard =
    useCallback(async () => {
      if (!enabled) {
        limpiarDashboard();
        return;
      }

      try {
        setLoading(true);
        setError("");

        const parametrosJornadas =
          obtenerParametrosPeriodo(
            periodo
          );

        const [
          resumenData,
          financieroData,
          jornadasData,
        ] = await Promise.all([
          getDashboardResumen(),

          getDashboardFinanciero({
            anio: anioSeleccionado,
          }),

          getJornadas(
            parametrosJornadas
          ),
        ]);

        setResumen(
          resumenData || {}
        );

        setFinancieroMensual(
          normalizarLista(
            financieroData
          )
        );

        setJornadasHoy(
          normalizarLista(
            jornadasData
          )
        );
      } catch (err) {
        console.error(
          "Error al cargar dashboard:",
          err?.response?.data || err
        );

        setError(
          obtenerMensajeError(
            err,
            "No se pudo cargar la información del dashboard."
          )
        );

        setResumen({});
        setFinancieroMensual([]);
        setJornadasHoy([]);
      } finally {
        setLoading(false);
      }
    }, [
      anioSeleccionado,
      enabled,
      limpiarDashboard,
      periodo,
    ]);

  const moneda = useMemo(() => {
    const valor = String(
      resumen?.moneda || "C$"
    ).trim();

    return valor || "C$";
  }, [resumen]);

  const metricasPeriodo =
    useMemo(() => {
      const data = resumen || {};

      if (periodo === "semana") {
        return {
          ingreso: numeroSeguro(
            data.ingreso_semana
          ),
          pagoTaxistas: numeroSeguro(
            data.pago_taxistas_semana
          ),
          gananciaBase: numeroSeguro(
            data.ganancia_dueno_semana
          ),
          gastosVehiculos: numeroSeguro(
            data.gastos_vehiculos_semana
          ),
          mantenimiento: numeroSeguro(
            data.mantenimiento_semana
          ),
          gastosOperativos: numeroSeguro(
            data.gastos_semana
          ),
          gananciaReal: numeroSeguro(
            data.ganancia_real_dueno_semana
          ),
          kilometros: numeroSeguro(
            data.km_semana
          ),
        };
      }

      if (periodo === "mes") {
        return {
          ingreso: numeroSeguro(
            data.ingreso_mes
          ),
          pagoTaxistas: numeroSeguro(
            data.pago_taxistas_mes
          ),
          gananciaBase: numeroSeguro(
            data.ganancia_dueno_mes
          ),
          gastosVehiculos: numeroSeguro(
            data.gastos_vehiculos_mes
          ),
          mantenimiento: numeroSeguro(
            data.mantenimiento_mes
          ),
          gastosOperativos: numeroSeguro(
            data.gastos_mes
          ),
          gananciaReal: numeroSeguro(
            data.ganancia_real_dueno_mes
          ),
          kilometros: numeroSeguro(
            data.km_mes
          ),
        };
      }

      return {
        ingreso: numeroSeguro(
          data.ingreso_dia
        ),
        pagoTaxistas: numeroSeguro(
          data.pago_taxistas_dia
        ),
        gananciaBase: numeroSeguro(
          data.ganancia_dueno_dia
        ),
        gastosVehiculos: numeroSeguro(
          data.gastos_vehiculos_dia
        ),
        mantenimiento: numeroSeguro(
          data.mantenimiento_dia
        ),
        gastosOperativos: numeroSeguro(
          data.gastos_dia
        ),
        gananciaReal: numeroSeguro(
          data.ganancia_real_dueno_dia
        ),
        kilometros: numeroSeguro(
          data.km_dia
        ),
      };
    }, [
      periodo,
      resumen,
    ]);

  const alertas = useMemo(() => {
    return Array.isArray(
      resumen?.alertas
    )
      ? resumen.alertas
      : [];
  }, [resumen]);

  const vehiculosEstado =
    useMemo(() => {
      const estado =
        resumen?.estado_vehiculos ||
        {};

      return {
        total: numeroSeguro(
          estado.total ??
            resumen?.vehiculos
        ),
        buenEstado: numeroSeguro(
          estado.buen_estado
        ),
        proximos: numeroSeguro(
          estado.proximos
        ),
        vencidos: numeroSeguro(
          estado.vencidos
        ),
        sinHistorial: numeroSeguro(
          estado.sin_historial
        ),
      };
    }, [resumen]);

  const datosGrafica =
    useMemo(() => {
      return financieroMensual.map(
        (item) => {
          const partes = String(
            item.mes || ""
          ).split("-");

          const numeroMes =
            partes[1];

          return {
            label:
              MESES[numeroMes] ||
              item.mes ||
              "",
            ingreso: numeroSeguro(
              item.ingresos
            ),
            ganancia: numeroSeguro(
              item.ganancia_real
            ),
            gastos: numeroSeguro(
              item.gastos_operativos
            ),
          };
        }
      );
    }, [financieroMensual]);

  useEffect(() => {
    if (!enabled) {
      limpiarDashboard();
      return;
    }

    cargarDashboard();
  }, [
    cargarDashboard,
    enabled,
    limpiarDashboard,
  ]);

  return {
    resumen,
    jornadasHoy,
    vehiculosEstado,
    alertas,
    datosGrafica,
    moneda,

    periodo,
    setPeriodo,

    metricasPeriodo,

    loading,
    error,
    cargarDashboard,
    anioSeleccionado,
    setAnioSeleccionado,

    financieroMensual,
  };
};
