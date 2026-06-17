import { useEffect, useMemo, useState } from "react";
import {
  getDashboardResumen,
  getDashboardFinanciero,
  getJornadas,
  getVehiculos,
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
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const obtenerFechaLocal = () => {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const obtenerMensajeError = (err, mensajeDefault) => {
  const data = err?.response?.data;

  if (data?.detail) return data.detail;
  if (typeof data === "string") return data;

  return mensajeDefault;
};

export const useDashboard = () => {
  const anioActual = new Date().getFullYear();

  const [resumen, setResumen] = useState({});
  const [jornadasHoy, setJornadasHoy] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [financieroMensual, setFinancieroMensual] = useState([]);

  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual);
  const [periodo, setPeriodo] = useState("dia");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hoy = obtenerFechaLocal();

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [resumenData, financieroData, jornadasData, vehiculosData] =
        await Promise.all([
          getDashboardResumen(),
          getDashboardFinanciero({ anio: anioSeleccionado }),
          getJornadas({ fecha: hoy }),
          getVehiculos(),
        ]);

      setResumen(resumenData || {});
      setFinancieroMensual(normalizarLista(financieroData));
      setJornadasHoy(normalizarLista(jornadasData));
      setVehiculos(normalizarLista(vehiculosData));
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudo cargar la información del dashboard."
        )
      );

      setResumen({});
      setFinancieroMensual([]);
      setJornadasHoy([]);
      setVehiculos([]);
    } finally {
      setLoading(false);
    }
  };

  const metricasPeriodo = useMemo(() => {
    const data = resumen || {};

    if (periodo === "semana") {
      return {
        ingreso: data.ingreso_semana || 0,
        pagoTaxistas: data.pago_taxistas_semana || 0,
        gananciaBase: data.ganancia_dueno_semana || 0,
        gastosVehiculos: data.gastos_vehiculos_semana || 0,
        mantenimiento: data.mantenimiento_semana || 0,
        gastosOperativos: data.gastos_semana || 0,
        gananciaReal: data.ganancia_real_dueno_semana || 0,
        kilometros: data.km_semana || 0,
      };
    }

    if (periodo === "mes") {
      return {
        ingreso: data.ingreso_mes || 0,
        pagoTaxistas: data.pago_taxistas_mes || 0,
        gananciaBase: data.ganancia_dueno_mes || 0,
        gastosVehiculos: data.gastos_vehiculos_mes || 0,
        mantenimiento: data.mantenimiento_mes || 0,
        gastosOperativos: data.gastos_mes || 0,
        gananciaReal: data.ganancia_real_dueno_mes || 0,
        kilometros: data.km_mes || 0,
      };
    }

    return {
      ingreso: data.ingreso_dia || 0,
      pagoTaxistas: data.pago_taxistas_dia || 0,
      gananciaBase: data.ganancia_dueno_dia || 0,
      gastosVehiculos: data.gastos_vehiculos_dia || 0,
      mantenimiento: data.mantenimiento_dia || 0,
      gastosOperativos: data.gastos_dia || 0,
      gananciaReal: data.ganancia_real_dueno_dia || 0,
      kilometros: data.km_dia || 0,
    };
  }, [resumen, periodo]);

  const alertas = useMemo(() => {
    if (Array.isArray(resumen?.alertas)) return resumen.alertas;
    return [];
  }, [resumen]);

  const vehiculosEstado = useMemo(() => {
    const total = vehiculos.length;

    const vencidos = vehiculos.filter((vehiculo) => {
      return vehiculo.necesita_cambio_aceite || vehiculo.necesita_mantenimiento;
    }).length;

    const proximos = vehiculos.filter((vehiculo) => {
      const alerta =
        vehiculo.alerta_cambio_aceite || vehiculo.alerta_mantenimiento;

      const vencido =
        vehiculo.necesita_cambio_aceite || vehiculo.necesita_mantenimiento;

      return alerta && !vencido;
    }).length;

    const buenEstado = Math.max(total - vencidos - proximos, 0);

    return {
      total,
      buenEstado,
      proximos,
      vencidos,
    };
  }, [vehiculos]);

  const datosGrafica = useMemo(() => {
    return financieroMensual.map((item) => {
      const partes = String(item.mes || "").split("-");
      const numeroMes = partes[1];

      return {
        label: MESES[numeroMes] || item.mes || "",
        ingreso: Number(item.ingresos || 0),
        ganancia: Number(item.ganancia_real || 0),
        gastos: Number(item.gastos_operativos || 0),
      };
    });
  }, [financieroMensual]);

  useEffect(() => {
    cargarDashboard();
  }, [anioSeleccionado]);

  return {
    resumen,
    jornadasHoy,
    vehiculos,
    vehiculosEstado,
    alertas,
    datosGrafica,
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