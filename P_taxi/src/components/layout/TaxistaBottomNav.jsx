import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  LogOut,
  Search,
  Wallet,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const TaxistaBottomNav = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const parametros = new URLSearchParams(location.search);

  const calendarioActivo =
    location.pathname === "/jornadas" &&
    parametros.get("calendario") === "1";

  const jornadasActivo =
    location.pathname === "/jornadas" &&
    !calendarioActivo;

  const gananciasActivo =
    location.pathname === "/ganancias";

  const abrirJornadas = () => {
    navigate("/jornadas");
  };

  const abrirCalendario = () => {
    navigate("/jornadas?calendario=1");
  };

  const abrirGanancias = () => {
    navigate("/ganancias");
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white px-3 pb-[calc(0.65rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.10)] ">
      <div className="mx-auto grid max-w-md grid-cols-3 justify-between">
        <button
          type="button"
          onClick={abrirJornadas}
          className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold transition ${
            jornadasActivo
              ? "text-[#E7A900]"
              : "text-slate-500"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              jornadasActivo
                ? "bg-[#FFF4CF]"
                : "bg-transparent"
            }`}
          >
            <CalendarDays size={23} strokeWidth={2.2} />
          </div>

          <span>Jornadas</span>
        </button>

        {/* <button
          type="button"
          onClick={abrirCalendario}
          className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold transition ${
            calendarioActivo
              ? "text-[#E7A900]"
              : "text-slate-500"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              calendarioActivo
                ? "bg-[#FFF4CF]"
                : "bg-transparent"
            }`}
          >
            <Search size={23} strokeWidth={2.2} />
          </div>

          <span>Fecha</span>
        </button> */}

        <button
          type="button"
          onClick={abrirGanancias}
          className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold transition ${
            gananciasActivo
              ? "text-[#E7A900]"
              : "text-slate-500"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              gananciasActivo
                ? "bg-[#FFF4CF]"
                : "bg-transparent"
            }`}
          >
            <Wallet size={23} strokeWidth={2.2} />
          </div>

          <span>Ganancias</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold text-red-500 transition hover:bg-red-50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full">
            <LogOut size={23} strokeWidth={2.2} />
          </div>

          <span>Salir</span>
        </button>
      </div>
    </nav>
  );
};

export default TaxistaBottomNav;