import { NavLink, useNavigate } from "react-router-dom";
import {
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
  ChevronLeft,
  ChevronRight,
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

const Sidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const { rol, user, sucursalNombre, logout } = useAuth();

  const visibleItems = menuItems.filter((item) => item.roles.includes(rol));

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={`hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col border-r border-slate-200 bg-white shadow-sm transition-all duration-300 ${
        collapsed ? "w-24" : "w-72"
      }`}
    >
      <div className="flex h-20 items-center justify-between border-b border-slate-100 px-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className={`flex items-center gap-3 min-w-0 ${
            collapsed ? "justify-center w-full" : ""
          }`}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950 shadow-md shadow-yellow-100">
            <CarTaxiFront size={27} strokeWidth={2.5} />
          </div>

          {!collapsed && (
            <div className="text-left">
              <h1 className="text-lg font-black leading-tight text-slate-950">
                TaxiAdmin
              </h1>
              <p className="text-xs font-semibold text-slate-400">
                Panel operativo
              </p>
            </div>
          )}
        </button>
      </div>

      <div className="px-4 py-4">
        <div
          className={`flex items-center rounded-2xl bg-slate-50 p-3 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Sidebar
              </p>
              <p className="text-sm font-bold text-slate-700">
                Expandido
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onToggle}
            className={`relative flex h-8 w-14 items-center rounded-full transition ${
              collapsed ? "bg-slate-300" : "bg-yellow-400"
            }`}
            title={collapsed ? "Expandir menú" : "Contraer menú"}
          >
            <span
              className={`absolute flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transition-all ${
                collapsed ? "left-1" : "left-7"
              }`}
            >
              {collapsed ? (
                <ChevronRight size={15} className="text-slate-600" />
              ) : (
                <ChevronLeft size={15} className="text-slate-800" />
              )}
            </span>
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-yellow-400 text-slate-950 shadow-md shadow-yellow-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                } ${collapsed ? "justify-center px-0" : ""}`
              }
            >
              <Icon size={21} strokeWidth={2.2} />

              {!collapsed && (
                <span className="truncate">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div
          className={`mb-4 rounded-2xl bg-slate-50 p-3 ${
            collapsed ? "text-center" : ""
          }`}
        >
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>

          {!collapsed && (
            <div className="mt-3 text-center">
              <p className="truncate text-sm font-black text-slate-900">
                {user?.username || "Usuario"}
              </p>
              <p className="truncate text-xs font-semibold text-slate-400">
                {sucursalNombre || rol || "Sistema"}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Cerrar sesión" : undefined}
          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <LogOut size={20} />

          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;