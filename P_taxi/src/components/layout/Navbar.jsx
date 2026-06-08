import { Menu, Bell, Search } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Navbar = ({ onOpenMobileMenu }) => {
  const { user, rol, sucursalNombre } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-base font-black text-slate-900 md:text-lg">
            Panel administrativo
          </h2>
          <p className="hidden text-xs font-semibold text-slate-400 sm:block">
            {sucursalNombre || rol || "Sistema de taxis"}
          </p>
        </div>
      </div>

      <div className="hidden max-w-md flex-1 px-8 md:block">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Buscar..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <Bell size={20} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="max-w-32">
            <p className="truncate text-sm font-black text-slate-900">
              {user?.username || "Usuario"}
            </p>
            <p className="truncate text-xs font-semibold text-slate-400">
              {rol || "Rol"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;