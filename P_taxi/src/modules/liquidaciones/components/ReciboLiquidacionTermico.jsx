import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Swal from "sweetalert2";

import {
  Download,
  Printer,
  Share2,
  X,
} from "lucide-react";

import {
  registrarMovimientoAuditoria,
} from "../../auditoria/services/auditoriaService";

const formatoMoneda = (valor) => {
  const numero = Number(valor || 0);

  return `C$ ${numero.toLocaleString(
    "es-NI",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};

const formatoFecha = (fecha) => {
  if (!fecha) {
    return "-";
  }

  const valor = String(fecha).slice(
    0,
    10
  );

  const partes = valor.split("-");

  if (partes.length !== 3) {
    return valor;
  }

  const [anio, mes, dia] = partes;

  return `${dia}/${mes}/${anio}`;
};

const formatoKilometros = (valor) => {
  const numero = Number(valor || 0);

  if (!Number.isFinite(numero)) {
    return "0";
  }

  return numero.toLocaleString("es-NI");
};

const obtenerNombreConductor = (
  recibo
) => {
  const conductor = recibo?.conductor;

  if (
    conductor &&
    typeof conductor === "object"
  ) {
    const nombreCompleto = [
      conductor.nombre,
      conductor.apellido,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (nombreCompleto) {
      return nombreCompleto;
    }
  }

  return (
    recibo?.conductor_nombre ||
    "Sin conductor"
  );
};

const obtenerCedulaConductor = (
  recibo
) => {
  return (
    recibo?.conductor?.cedula ||
    recibo?.conductor_cedula ||
    "Sin cédula"
  );
};

const obtenerNombreSucursal = (
  recibo
) => {
  return (
    recibo?.sucursal?.nombre ||
    recibo?.sucursal_nombre ||
    "Administración General"
  );
};

const obtenerNombreVehiculo = (
  jornada
) => {
  const vehiculo = jornada?.vehiculo;

  if (typeof vehiculo === "string") {
    return vehiculo || "-";
  }

  if (
    vehiculo &&
    typeof vehiculo === "object"
  ) {
    const datos = [
      vehiculo.numero,
      vehiculo.placa,
      vehiculo.marca,
      vehiculo.modelo,
    ]
      .filter(Boolean)
      .join(" - ");

    return datos || "-";
  }

  return (
    jornada?.vehiculo_descripcion ||
    jornada?.vehiculo_placa ||
    jornada?.vehiculo_numero ||
    "-"
  );
};

const ESTILOS_RECIBO_TERMICO = `
  * {
    box-sizing: border-box;
  }

  .recibo-termico {
    width: 340px;
    margin: 0 auto;
    padding: 18px 15px 24px;
    background: #ffffff;
    color: #000000;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
    line-height: 1.35;
  }

  .recibo-vista-previa {
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.20);
  }

  .recibo-encabezado {
    padding-bottom: 9px;
    border-bottom: 2px solid #000000;
  }

  .recibo-encabezado-superior {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .recibo-palabra {
    margin: 0;
    font-size: 30px;
    font-weight: 900;
    line-height: 0.9;
    letter-spacing: -1px;
  }

  .recibo-marca {
    margin-top: 5px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.5px;
  }

  .recibo-numero {
    min-width: 94px;
    padding: 6px;
    border: 1.5px solid #000000;
    text-align: center;
  }

  .recibo-numero-label,
  .recibo-etiqueta {
    display: block;
    font-size: 7px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .recibo-numero-valor {
    display: block;
    margin-top: 2px;
    font-size: 11px;
    font-weight: 900;
  }

  .recibo-empresa {
    margin-top: 8px;
    font-size: 8px;
    font-weight: 600;
    line-height: 1.45;
  }

  .recibo-titulo-documento {
    margin: 10px 0 0;
    text-align: center;
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .recibo-separador {
    margin: 8px 0;
    border-top: 1px dashed #000000;
  }

  .recibo-separador-solido {
    margin: 9px 0;
    border-top: 1.5px solid #000000;
  }

  .recibo-datos {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px 9px;
  }

  .recibo-dato {
    min-width: 0;
  }

  .recibo-etiqueta {
    margin-bottom: 2px;
  }

  .recibo-valor {
    display: block;
    overflow-wrap: anywhere;
    font-size: 8.5px;
    font-weight: 700;
  }

  .recibo-seccion-titulo {
    margin: 0 0 6px;
    font-size: 8px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .recibo-tabla {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .recibo-tabla th {
    padding: 4px 2px;
    border-top: 1.5px solid #000000;
    border-bottom: 1.5px solid #000000;
    font-size: 6.5px;
    font-weight: 900;
    text-align: left;
    text-transform: uppercase;
  }

  .recibo-tabla td {
    padding: 5px 2px;
    border-bottom: 1px dotted #777777;
    vertical-align: top;
    overflow-wrap: anywhere;
    font-size: 7.5px;
    font-weight: 600;
  }

  .recibo-tabla th:nth-child(1),
  .recibo-tabla td:nth-child(1) {
    width: 20%;
  }

  .recibo-tabla th:nth-child(2),
  .recibo-tabla td:nth-child(2) {
    width: 37%;
  }

  .recibo-tabla th:nth-child(3),
  .recibo-tabla td:nth-child(3) {
    width: 14%;
    text-align: center;
  }

  .recibo-tabla th:nth-child(4),
  .recibo-tabla td:nth-child(4) {
    width: 29%;
    text-align: right;
  }

  .recibo-sin-registros {
    padding: 10px 2px !important;
    text-align: center !important;
    font-style: italic;
  }

  .recibo-resumen {
    margin-top: 9px;
  }

  .recibo-resumen-fila {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding: 2px 0;
    font-size: 8.5px;
  }

  .recibo-resumen-fila strong {
    flex-shrink: 0;
  }

  .recibo-total {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 8px;
    padding: 8px 2px;
    border-top: 1.5px solid #000000;
    border-bottom: 1.5px solid #000000;
    font-size: 13px;
    font-weight: 900;
  }

  .recibo-observacion {
    margin-top: 10px;
    padding: 7px;
    border: 1px dashed #000000;
    font-size: 8px;
    line-height: 1.4;
  }

  .recibo-gracias {
    margin: 14px 0 0;
    text-align: center;
    font-size: 16px;
    font-weight: 900;
    font-style: italic;
  }

  .recibo-pie {
    margin: 4px 0 0;
    text-align: center;
    font-size: 6.8px;
    line-height: 1.35;
  }

  .recibo-codigo {
    margin-top: 7px;
    text-align: center;
    font-family: "Courier New", monospace;
    font-size: 7px;
    font-weight: 900;
    letter-spacing: 1px;
  }

  @media print {
    @page {
      size: 80mm auto;
      margin: 0;
    }

    html,
    body {
      width: 80mm !important;
      min-width: 80mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
    }

    .recibo-termico {
      width: 80mm !important;
      margin: 0 !important;
      padding: 7mm 5mm 10mm !important;
      box-shadow: none !important;
    }

    .recibo-vista-previa {
      box-shadow: none !important;
    }
  }
`;

const ReciboLiquidacionTermico = ({
  recibo,
  onClose,
}) => {
  const reciboRef = useRef(null);

  const [
    generandoPdf,
    setGenerandoPdf,
  ] = useState(false);

  useEffect(() => {
    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const manejarTecla = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      manejarTecla
    );

    return () => {
      document.removeEventListener(
        "keydown",
        manejarTecla
      );

      document.body.style.overflow =
        overflowAnterior;
    };
  }, [onClose]);

  const jornadas = useMemo(() => {
    return Array.isArray(recibo?.jornadas)
      ? recibo.jornadas
      : [];
  }, [recibo]);

  const totalIngresoBruto = useMemo(() => {
    const totalBackend = Number(
      recibo?.total_ingreso_bruto
    );

    if (
      Number.isFinite(totalBackend) &&
      totalBackend > 0
    ) {
      return totalBackend;
    }

    return jornadas.reduce(
      (total, jornada) =>
        total +
        Number(
          jornada?.ingreso_bruto || 0
        ),
      0
    );
  }, [recibo, jornadas]);

  const totalPagoJornadas = useMemo(() => {
    const totalBackend = Number(
      recibo?.total_jornadas
    );

    if (Number.isFinite(totalBackend)) {
      return totalBackend;
    }

    return jornadas.reduce(
      (total, jornada) =>
        total +
        Number(
          jornada?.pago_conductor || 0
        ),
      0
    );
  }, [recibo, jornadas]);

  const saldoPendienteAdelantos = useMemo(() => {
    const saldoInicial = Number(
      recibo?.total_adelantos_pendientes || 0
    );

    const abonoAplicado = Number(
      recibo?.abono_aplicado || 0
    );

    return Math.max(
      saldoInicial - abonoAplicado,
      0
    );
  }, [recibo]);

  const numeroRecibo = String(
    recibo?.id || 0
  ).padStart(5, "0");

  const codigoRecibo =
    `LIQ-${numeroRecibo}`;

  const fechaEmision =
    recibo?.fecha_registro ||
    recibo?.fecha ||
    recibo?.created_at ||
    recibo?.fecha_fin;

  const nombreConductor =
    obtenerNombreConductor(recibo);

  const cedulaConductor =
    obtenerCedulaConductor(recibo);

  const nombreSucursal =
    obtenerNombreSucursal(recibo);
  
  const referenciaAuditoria =
  `Recibo ${codigoRecibo} · Conductor: ${nombreConductor}`;

const registrarEventoRecibo = (evento) => {
  void registrarMovimientoAuditoria({
    evento,
    referencia: referenciaAuditoria,
  });
};

useEffect(() => {
  if (!recibo?.id) {
    return;
  }

  registrarEventoRecibo("recibo_abierto");

  // Solo se registra al abrir un recibo distinto.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [recibo?.id]);

  const abrirDialogoImpresion = () => {
    const contenido =
      reciboRef.current?.outerHTML;

    if (!contenido) {
      return;
    }

    const ventanaImpresion = window.open(
      "",
      "_blank",
      "width=430,height=820,resizable=yes,scrollbars=yes"
    );

    if (!ventanaImpresion) {
      return;
    }

    ventanaImpresion.document.open();

    ventanaImpresion.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Recibo ${codigoRecibo}</title>
          <style>${ESTILOS_RECIBO_TERMICO}</style>
        </head>
        <body>
          ${contenido}
        </body>
      </html>
    `);

    ventanaImpresion.document.close();
    ventanaImpresion.focus();

    window.setTimeout(() => {
      ventanaImpresion.print();
      registrarEventoRecibo("recibo_impreso");
    }, 350);

    ventanaImpresion.onafterprint = () => {
      ventanaImpresion.close();
    };
  };

  const generarArchivoPdf = async () => {
    const elementoRecibo =
      reciboRef.current;

    if (!elementoRecibo) {
      throw new Error(
        "No se pudo preparar el recibo."
      );
    }

    const canvas = await html2canvas(
      elementoRecibo,
      {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      }
    );

    const anchoUtilMm = 76;

    const altoImagenMm =
      (canvas.height * anchoUtilMm) /
      canvas.width;

    const altoPaginaMm = Math.max(
      120,
      altoImagenMm + 4
    );

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, altoPaginaMm],
      compress: true,
    });

    const imagenPdf = canvas.toDataURL(
      "image/jpeg",
      0.96
    );

    pdf.addImage(
      imagenPdf,
      "JPEG",
      2,
      2,
      anchoUtilMm,
      altoImagenMm,
      undefined,
      "FAST"
    );

    const blob = pdf.output("blob");

    return new File(
      [blob],
      `Liquidacion-${codigoRecibo}.pdf`,
      {
        type: "application/pdf",
      }
    );
  };

  const descargarArchivoPdf = (archivo) => {
    const urlArchivo =
      URL.createObjectURL(archivo);

    const enlace =
      document.createElement("a");

    enlace.href = urlArchivo;
    enlace.download = archivo.name;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(urlArchivo);
    }, 1000);
  };

  const guardarComoPdf = async () => {
    try {
      setGenerandoPdf(true);

      const archivoPdf =
        await generarArchivoPdf();

      descargarArchivoPdf(archivoPdf);
      registrarEventoRecibo("recibo_pdf_descargado");

      await Swal.fire({
        title: "PDF descargado",
        text: "El recibo fue guardado correctamente en tu dispositivo.",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#2563eb",
        timer: 1800,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error(
        "Error al descargar PDF:",
        error
      );

      await Swal.fire({
        title: "No se pudo generar el PDF",
        text: "Inténtalo nuevamente.",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setGenerandoPdf(false);
    }
  };

  const compartirPdf = async () => {
    try {
      setGenerandoPdf(true);

      const archivoPdf =
        await generarArchivoPdf();

      const datosCompartir = {
        title: `Liquidación ${codigoRecibo}`,
        text: `Recibo de liquidación para ${nombreConductor}.`,
        files: [archivoPdf],
      };

      const puedeCompartir =
        typeof navigator.share ===
          "function" &&
        (
          typeof navigator.canShare !==
            "function" ||
          navigator.canShare(datosCompartir)
        );

      if (!puedeCompartir) {
        descargarArchivoPdf(archivoPdf);
        registrarEventoRecibo("recibo_pdf_descargado");

        await Swal.fire({
          title: "PDF descargado",
          text: "Este navegador no permite compartir archivos directamente. Puedes adjuntar el PDF descargado por WhatsApp.",
          icon: "info",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#2563eb",
        });

        return;
      }

      await navigator.share(datosCompartir);
      registrarEventoRecibo("recibo_compartido");
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error(
        "Error al compartir PDF:",
        error
      );

      await Swal.fire({
        title: "No se pudo compartir",
        text: "Inténtalo nuevamente o descarga el PDF para adjuntarlo manualmente.",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setGenerandoPdf(false);
    }
  };

  return (
    <>
      <style>
        {ESTILOS_RECIBO_TERMICO}
      </style>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-recibo-termico"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-3 py-4 backdrop-blur-sm"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute inset-0 cursor-default"
          aria-label="Cerrar recibo"
        />

        <section className="relative flex max-h-[96vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white shadow-2xl">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
            <div>
              <h2
                id="titulo-recibo-termico"
                className="text-base font-black text-slate-950"
              >
                Recibo térmico
              </h2>

              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                Formato para papel de 80 mm
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={generandoPdf}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Cerrar"
            >
              <X size={19} />
            </button>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto bg-slate-200 px-4 py-6">
            <div
              ref={reciboRef}
              className="recibo-termico recibo-vista-previa"
            >
              <header className="recibo-encabezado">
                <div className="recibo-encabezado-superior">
                  <div>
                    <h1 className="recibo-palabra">
                      RECIBO
                    </h1>

                    <div className="recibo-marca">
                      TAXIADMIN
                    </div>
                  </div>

                  <div className="recibo-numero">
                    <span className="recibo-numero-label">
                      Número
                    </span>

                    <strong className="recibo-numero-valor">
                      {codigoRecibo}
                    </strong>
                  </div>
                </div>

                <div className="recibo-empresa">
                  <strong>
                    Sistema de Administración de Taxis
                  </strong>
                  <br />
                  {nombreSucursal}
                  <br />
                  Comprobante de pago al conductor
                </div>

                <h2 className="recibo-titulo-documento">
                  Liquidación de jornadas
                </h2>
              </header>

              <div className="recibo-separador" />

              <section className="recibo-datos">
                <div className="recibo-dato">
                  <span className="recibo-etiqueta">
                    Fecha de emisión
                  </span>

                  <span className="recibo-valor">
                    {formatoFecha(fechaEmision)}
                  </span>
                </div>

                <div className="recibo-dato">
                  <span className="recibo-etiqueta">
                    Jornadas pagadas
                  </span>

                  <span className="recibo-valor">
                    {jornadas.length}
                  </span>
                </div>

                <div className="recibo-dato">
                  <span className="recibo-etiqueta">
                    Conductor
                  </span>

                  <span className="recibo-valor">
                    {nombreConductor}
                  </span>
                </div>

                <div className="recibo-dato">
                  <span className="recibo-etiqueta">
                    Cédula
                  </span>

                  <span className="recibo-valor">
                    {cedulaConductor}
                  </span>
                </div>

                <div className="recibo-dato">
                  <span className="recibo-etiqueta">
                    Período desde
                  </span>

                  <span className="recibo-valor">
                    {formatoFecha(
                      recibo?.fecha_inicio
                    )}
                  </span>
                </div>

                <div className="recibo-dato">
                  <span className="recibo-etiqueta">
                    Período hasta
                  </span>

                  <span className="recibo-valor">
                    {formatoFecha(
                      recibo?.fecha_fin
                    )}
                  </span>
                </div>
              </section>

              <div className="recibo-separador-solido" />

              <section>
                <h3 className="recibo-seccion-titulo">
                  Detalle de jornadas pagadas
                </h3>

                <table className="recibo-tabla">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Vehículo</th>
                      <th>KM</th>
                      <th>Pago</th>
                    </tr>
                  </thead>

                  <tbody>
                    {jornadas.length > 0 ? (
                      jornadas.map(
                        (
                          jornada,
                          index
                        ) => (
                          <tr
                            key={
                              jornada?.id ||
                              `${jornada?.fecha}-${index}`
                            }
                          >
                            <td>
                              {formatoFecha(
                                jornada?.fecha
                              )}
                            </td>

                            <td>
                              {obtenerNombreVehiculo(
                                jornada
                              )}
                            </td>

                            <td>
                              {formatoKilometros(
                                jornada?.kilometros_recorridos
                              )}
                            </td>

                            <td>
                              {formatoMoneda(
                                jornada?.pago_conductor
                              )}
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="recibo-sin-registros"
                        >
                          No hay jornadas asociadas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>

              <section className="recibo-resumen">
                <div className="recibo-resumen-fila">
                  <span>
                    Ingreso bruto generado
                  </span>

                  <strong>
                    {formatoMoneda(
                      totalIngresoBruto
                    )}
                  </strong>
                </div>

                <div className="recibo-resumen-fila">
                  <span>
                    Pago por jornadas
                  </span>

                  <strong>
                    {formatoMoneda(
                      totalPagoJornadas
                    )}
                  </strong>
                </div>

                <div className="recibo-resumen-fila">
                  <span>
                    Saldo de adelantos
                  </span>

                  <strong>
                    {formatoMoneda(
                      recibo?.total_adelantos_pendientes
                    )}
                  </strong>
                </div>

                <div className="recibo-resumen-fila">
                  <span>
                    Abono aplicado
                  </span>

                  <strong>
                    {formatoMoneda(
                      recibo?.abono_aplicado
                    )}
                  </strong>
                </div>

                <div className="recibo-resumen-fila">
                  <span>
                    Saldo pendiente
                  </span>

                  <strong>
                    {formatoMoneda(
                      saldoPendienteAdelantos
                    )}
                  </strong>
                </div>

                <div className="recibo-total">
                  <span>
                    TOTAL A PAGAR
                  </span>

                  <strong>
                    {formatoMoneda(
                      recibo?.total_pago
                    )}
                  </strong>
                </div>
              </section>

              {recibo?.notas && (
                <section className="recibo-observacion">
                  <strong>
                    OBSERVACIÓN:
                  </strong>{" "}
                  {recibo.notas}
                </section>
              )}

              <div className="recibo-separador" />

              <p className="recibo-gracias">
                ¡Gracias!
              </p>

              <p className="recibo-pie">
                Este documento confirma la liquidación registrada en el sistema.
              </p>

              <p className="recibo-pie">
                Generado por TaxiAdmin
              </p>

              <div className="recibo-codigo">
                * {codigoRecibo} *
              </div>

              <div className="recibo-separador" />
            </div>
          </main>

          <footer className="grid shrink-0 grid-cols-1 gap-3 border-t border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={onClose}
              disabled={generandoPdf}
              className="h-11 cursor-pointer rounded-xl border border-slate-300 bg-white text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={guardarComoPdf}
              disabled={generandoPdf}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-sm font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={17} />

              {generandoPdf
                ? "Generando..."
                : "Descargar PDF"}
            </button>

            <button
              type="button"
              onClick={compartirPdf}
              disabled={generandoPdf}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Share2 size={17} />

              {generandoPdf
                ? "Generando..."
                : "Compartir PDF"}
            </button>

            <button
              type="button"
              onClick={abrirDialogoImpresion}
              disabled={generandoPdf}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#F5B800] text-sm font-black text-slate-950 transition hover:bg-[#DFA600] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Printer size={17} />
              Imprimir
            </button>
          </footer>
        </section>
      </div>
    </>
  );
};

export default ReciboLiquidacionTermico;
