import {
  MessageCircle,
  RotateCcw,
  Save,
  Send,
  Smartphone,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  registrarMovimientoAuditoria,
} from "../../auditoria/services/auditoriaService";

const STORAGE_KEY =
  "taxicontrol_plantilla_liquidacion_whatsapp";

const plantillaInicial = `Hola {conductor_nombre} 👋

Te informamos que se registró tu liquidación.

📅 Período: {fecha_inicio} al {fecha_fin}
🚕 Jornadas pagadas: {jornadas}
💰 Total pagado: {total_pago}
💳 Adelantos pendientes: {adelantos}

Gracias por tu trabajo y compromiso.
TaxiControl`;

const formatoMoneda = (valor) => {
  const numero = Number(valor || 0);

  return `C$ ${numero.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatoFecha = (fecha) => {
  if (!fecha) {
    return "-";
  }

  return new Date(
    `${fecha}T00:00:00`
  ).toLocaleDateString("es-NI");
};

const obtenerCantidadJornadas = (liquidacion) => {
  if (
    Array.isArray(liquidacion?.jornadas)
  ) {
    return liquidacion.jornadas.length;
  }

  if (
    Array.isArray(
      liquidacion?.jornadas_pagadas
    )
  ) {
    return liquidacion.jornadas_pagadas.length;
  }

  return Number(
    liquidacion?.cantidad_jornadas ||
      liquidacion?.total_jornadas_cantidad ||
      0
  );
};

const reemplazarVariables = (
  texto,
  liquidacion
) => {
  const variables = {
    "{conductor_nombre}":
      liquidacion?.conductor_nombre ||
      "Conductor",

    "{fecha_inicio}": formatoFecha(
      liquidacion?.fecha_inicio
    ),

    "{fecha_fin}": formatoFecha(
      liquidacion?.fecha_fin
    ),

    "{jornadas}": obtenerCantidadJornadas(
      liquidacion
    ),

    "{total_pago}": formatoMoneda(
      liquidacion?.total_pago
    ),

    "{adelantos}": formatoMoneda(
      liquidacion?.total_adelantos_pendientes
    ),
  };

  return Object.entries(variables).reduce(
    (mensaje, [variable, valor]) =>
      mensaje.replaceAll(variable, valor),
    texto
  );
};

const normalizarTelefono = (telefono) => {
  const numero = String(
    telefono || ""
  ).replace(/\D/g, "");

  if (!numero) {
    return "";
  }

  if (numero.length === 8) {
    return `505${numero}`;
  }

  return numero;
};

const WhatsAppLiquidacionModal = ({
  liquidacion,
  onClose,
}) => {
  const [
    plantilla,
    setPlantilla,
  ] = useState(plantillaInicial);

  const [
    mensajeLiquidacion,
    setMensajeLiquidacion,
  ] = useState("");

  const telefono = normalizarTelefono(
    liquidacion?.conductor_telefono ||
      liquidacion?.conductor?.telefono
  );
  const referenciaAuditoria =
  `Liquidación #${
    liquidacion?.id ||
    liquidacion?.liquidacion_id ||
    "-"
  } · Conductor: ${
    liquidacion?.conductor_nombre ||
    "Sin nombre"
  }`;

  useEffect(() => {
    const plantillaGuardada =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    const plantillaCargada =
      plantillaGuardada ||
      plantillaInicial;

    setPlantilla(plantillaCargada);

    setMensajeLiquidacion(
      reemplazarVariables(
        plantillaCargada,
        liquidacion
      )
    );
  }, [liquidacion]);

  const vistaPrevia = useMemo(() => {
    return (
      mensajeLiquidacion ||
      reemplazarVariables(
        plantilla,
        liquidacion
      )
    );
  }, [
    liquidacion,
    mensajeLiquidacion,
    plantilla,
  ]);

  const guardarPlantilla = () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      plantilla
    );
    void registrarMovimientoAuditoria({
      evento: "plantilla_whatsapp_guardada",
      referencia: referenciaAuditoria,
    });

    setMensajeLiquidacion(
      reemplazarVariables(
        plantilla,
        liquidacion
      )
    );
  };

  const restaurarPlantilla = () => {
    window.localStorage.removeItem(
      STORAGE_KEY
    );
   void registrarMovimientoAuditoria({
    evento: "plantilla_whatsapp_restaurada",
    referencia: referenciaAuditoria,
  });
    setPlantilla(plantillaInicial);

    setMensajeLiquidacion(
      reemplazarVariables(
        plantillaInicial,
        liquidacion
      )
    );
  };

  const insertarVariable = (variable) => {
    setPlantilla((valorActual) => {
      const salto = valorActual.endsWith("\n")
        ? ""
        : "\n";

      return `${valorActual}${salto}${variable}`;
    });
  };

  const abrirWhatsApp = () => {
    if (!telefono) {
      window.alert(
        "Este conductor no tiene un teléfono registrado."
      );
      return;
    }

    const mensaje = mensajeLiquidacion.trim();

    if (!mensaje) {
      window.alert(
        "Escribe un mensaje antes de abrir WhatsApp."
      );
      return;
    }

    const url =
      `https://wa.me/${telefono}?text=` +
      encodeURIComponent(mensaje);

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const variables = [
    "{conductor_nombre}",
    "{fecha_inicio}",
    "{fecha_fin}",
    "{jornadas}",
    "{total_pago}",
    "{adelantos}",
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-3 py-4 backdrop-blur-sm">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar modal"
      />

      <section className="relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <MessageCircle size={23} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
              Mensaje de liquidación
            </p>

            <h2 className="text-lg font-black text-slate-950">
              Personalizar WhatsApp
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid min-h-full grid-cols-1 lg:grid-cols-[1fr_380px]">
            <div className="space-y-5 p-5 sm:p-6">
              <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <h3 className="text-sm font-black text-slate-900">
                  Plantilla general
                </h3>

                <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                  Guárdala y será la base de tus próximos mensajes. Puedes modificar el mensaje de esta liquidación sin cambiar la plantilla.
                </p>
              </section>

              <div>
                <label
                  htmlFor="plantilla-whatsapp"
                  className="mb-2 block text-sm font-black text-slate-800"
                >
                  Texto de la plantilla
                </label>

                <textarea
                  id="plantilla-whatsapp"
                  value={plantilla}
                  onChange={(event) =>
                    setPlantilla(
                      event.target.value
                    )
                  }
                  rows={10}
                  className="w-full resize-y rounded-2xl border border-emerald-400 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={guardarPlantilla}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-700"
                >
                  <Save size={15} />
                  Guardar plantilla
                </button>

                <button
                  type="button"
                  onClick={restaurarPlantilla}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                >
                  <RotateCcw size={15} />
                  Restaurar
                </button>
              </div>

              <div>
                <p className="mb-2 text-sm font-black text-slate-800">
                  Variables disponibles
                </p>

                <div className="flex flex-wrap gap-2">
                  {variables.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() =>
                        insertarVariable(variable)
                      }
                      className="cursor-pointer rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-black text-slate-600 transition hover:bg-emerald-100 hover:text-emerald-700"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="mensaje-liquidacion"
                  className="mb-2 block text-sm font-black text-slate-800"
                >
                  Mensaje para esta liquidación
                </label>

                <textarea
                  id="mensaje-liquidacion"
                  value={mensajeLiquidacion}
                  onChange={(event) =>
                    setMensajeLiquidacion(
                      event.target.value
                    )
                  }
                  rows={9}
                  className="w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />

                <p className="mt-2 text-xs font-medium text-slate-500">
                  Este cambio solo se aplicará a esta liquidación.
                </p>
              </div>
            </div>

            <aside className="flex items-center justify-center border-t border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-6 lg:border-l lg:border-t-0">
              <div className="w-full max-w-[310px]">
                <div className="relative mx-auto h-[630px] w-[306px] rounded-[48px] bg-[#07101f] p-[10px] shadow-[0_25px_60px_rgba(15,23,42,0.35)]">
                  <div className="absolute left-1/2 top-[16px] z-20 flex h-[30px] w-[116px] -translate-x-1/2 items-center justify-end gap-2 rounded-full bg-black px-3">
                    <span className="h-2 w-2 rounded-full bg-slate-800" />

                    <span className="h-2.5 w-2.5 rounded-full bg-[#172554] ring-2 ring-slate-800" />
                  </div>

                  <div className="relative h-full overflow-hidden rounded-[39px] bg-[#efeae2]">
                    <div className="flex h-16 items-end gap-2 bg-[#087b6d] px-4 pb-3 pt-7 text-white">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Smartphone size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-black">
                          {liquidacion?.conductor_nombre ||
                            "Conductor"}
                        </p>

                        <p className="text-[9px] font-semibold text-emerald-100">
                          WhatsApp
                        </p>
                      </div>
                    </div>

                    <div className="h-[calc(100%-4rem)] overflow-y-auto bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45)_1px,transparent_1px)] bg-[length:15px_15px] px-3 py-4">
                      <div className="rounded-2xl rounded-tl-sm bg-white px-3 py-3 shadow-sm">
                        <p className="whitespace-pre-wrap text-[11px] font-medium leading-5 text-slate-700">
                          {vistaPrevia}
                        </p>

                        <div className="mt-2 flex justify-end">
                          <span className="text-[9px] font-medium text-slate-400">
                            Ahora ✓✓
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-[#f0f2f5] px-3 py-2">
                      <div className="h-8 flex-1 rounded-full bg-white px-3 py-2 text-[9px] font-medium text-slate-400">
                        Mensaje
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#087b6d] text-white">
                        <Send size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-center text-xs font-medium leading-5 text-slate-500">
                  Después de abrir WhatsApp puedes adjuntar manualmente el PDF del recibo.
                </p>
              </div>
            </aside>
          </div>
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={abrirWhatsApp}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-600"
          >
            <Send size={17} />
            Abrir WhatsApp
          </button>
        </footer>
      </section>
    </div>
  );
};

export default WhatsAppLiquidacionModal;