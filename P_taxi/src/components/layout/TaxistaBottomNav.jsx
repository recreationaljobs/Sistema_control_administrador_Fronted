import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  CalendarDays,
  CarTaxiFront,
  LogOut,
  Wallet,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

const TaxistaBottomNav = () => {
  const { logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const jornadasActivo =
    location.pathname ===
    "/jornadas";

  const gananciasActivo =
    location.pathname ===
    "/ganancias";

  const miVehiculoActivo =
    location.pathname ===
    "/mi-vehiculo";

  const abrirJornadas = () => {
    navigate("/jornadas");
  };

  const abrirGanancias = () => {
    navigate("/ganancias");
  };

  const abrirMiVehiculo = () => {
    navigate("/mi-vehiculo");
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white px-2 pb-[calc(0.65rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.10)]">
      <div className="mx-auto grid max-w-md grid-cols-4">
        <button
          type="button"
          onClick={abrirJornadas}
          className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold transition sm:text-[11px] ${
            jornadasActivo
              ? "text-[#E7A900]"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
              jornadasActivo
                ? "bg-[#FFF4CF]"
                : "bg-transparent"
            }`}
          >
            <CalendarDays
              size={22}
              strokeWidth={2.2}
            />
          </div>

          <span>Jornadas</span>
        </button>

        <button
          type="button"
          onClick={abrirGanancias}
          className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold transition sm:text-[11px] ${
            gananciasActivo
              ? "text-[#E7A900]"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
              gananciasActivo
                ? "bg-[#FFF4CF]"
                : "bg-transparent"
            }`}
          >
            <Wallet
              size={22}
              strokeWidth={2.2}
            />
          </div>

          <span>Ganancias</span>
        </button>

        <button
          type="button"
          onClick={abrirMiVehiculo}
          className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold transition sm:text-[11px] ${
            miVehiculoActivo
              ? "text-[#E7A900]"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
              miVehiculoActivo
                ? "bg-[#FFF4CF]"
                : "bg-transparent"
            }`}
          >
            <CarTaxiFront
              size={22}
              strokeWidth={2.2}
            />
          </div>

          <span>Mi vehículo</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold text-red-500 transition hover:bg-red-50 sm:text-[11px]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full">
            <LogOut
              size={22}
              strokeWidth={2.2}
            />
          </div>

          <span>Salir</span>
        </button>
      </div>
    </nav>
  );
};

export default TaxistaBottomNav;