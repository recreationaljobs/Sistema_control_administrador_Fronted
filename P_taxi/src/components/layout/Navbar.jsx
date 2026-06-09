import { Bell, CalendarDays, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Navbar = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-[92px] items-center justify-between bg-[#F8FAFC] px-4 md:px-6 lg:px-7">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
        >
          <Menu size={23} />
        </button>

        <div>
          <h2 className="text-xl font-black text-slate-950 md:text-[28px]">
            ¡Bienvenido, {user?.first_name || user?.username || "Administrador"}!
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
            Resumen general del sistema
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="hidden h-12 items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm md:flex"
        >
          <span>23 de mayo, 2024</span>
          <CalendarDays size={18} className="text-slate-600" />
        </button>

        <button
          type="button"
          className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Bell size={21} />

          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white">
            3
          </span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;