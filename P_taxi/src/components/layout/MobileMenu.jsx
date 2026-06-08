import { NavLink } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  Building2,
  Users,
  UserRound,
  CarTaxiFront,
  Route,
  CalendarDays,
  Wallet,
  HandCoins,
  Wrench,
  FileBarChart,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["superadmin", "admin_sucursal", "taxista"],
  },
  {
    label: "Sucursales",
    path: "/sucursales",
    icon: Building2,
    roles: ["superadmin"],
  },
  {
    label: "Usuarios",
    path: "/usuarios",
    icon: Users,
    roles: ["superadmin", "admin_sucursal"],
  },
  {
    label: "Conductores",
    path: "/conductores",
    icon: UserRound,
    roles: ["superadmin", "admin_sucursal"],
  },
  {
    label: "Vehículos",
    path: "/vehiculos",
    icon: CarTaxiFront,
    roles: ["superadmin", "admin_sucursal", "taxista"],
  },
  {
    label: "Asignaciones",
    path: "/asignaciones",
    icon: Route,
    roles: ["superadmin", "admin_sucursal"],
  },
  {
    label: "Jornadas",
    path: "/jornadas",
    icon: CalendarDays,
    roles: ["superadmin", "admin_sucursal", "taxista"],
  },
  {
    label: "Gastos",
    path: "/gastos",
    icon: Wallet,
    roles: ["superadmin", "admin_sucursal", "taxista"],
  },
  {
    label: "Adelantos",
    path: "/adelantos",
    icon: HandCoins,
    roles: ["superadmin", "admin_sucursal", "taxista"],
  },
  {
    label: "Mantenimiento",
    path: "/mantenimiento",
    icon: Wrench,
    roles: ["superadmin", "admin_sucursal", "taxista"],
  },
  {
    label: "Reportes",
    path: "/reportes",
    icon: FileBarChart,
    roles: ["superadmin", "admin_sucursal"],
  },
  {
    label: "Configuración",
    path: "/configuracion",
    icon: Settings,
    roles: ["superadmin", "admin_sucursal"],
  },
];

const MobileMenu = ({ open, onClose }) => {
  const { rol, user, sucursalNombre, logout } = useAuth();

  const visibleItems = menuItems.filter((item) => item.roles.includes(rol));

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40"
        aria-label="Cerrar menú"
      />

      <aside className="relative flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl">
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950 shadow-md shadow-yellow-100">
              <CarTaxiFront size={27} strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="text-lg font-black leading-tight text-slate-950">
                TaxiAdmin
              </h1>
              <p className="text-xs font-semibold text-slate-400">
                Panel operativo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <X size={22} />
          </button>
        </div>

        <div className="border-b border-slate-100 p-4">
          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <p className="mt-3 truncate text-sm font-black text-slate-900">
              {user?.username || "Usuario"}
            </p>

            <p className="truncate text-xs font-semibold text-slate-400">
              {sucursalNombre || rol || "Sistema"}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {visibleItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-yellow-400 text-slate-950 shadow-md shadow-yellow-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={21} strokeWidth={2.2} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default MobileMenu;