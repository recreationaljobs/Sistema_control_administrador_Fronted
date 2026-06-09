import { NavLink } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  CalendarDays,
  // Wallet,
  BriefcaseBusiness,
  HandCoins,
  UserRound,
  CarTaxiFront,
  Wrench,
  FileBarChart,
  Users,
  Settings,
  Building2,
  Route,
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
    label: "Jornadas",
    path: "/jornadas",
    icon: CalendarDays,
    roles: ["superadmin", "admin_sucursal", "taxista"],
  },
  // {
  //   label: "Ingresos",
  //   path: "/reportes",
  //   icon: Wallet,
  //   roles: ["superadmin", "admin_sucursal"],
  // },
  {
    label: "Gastos",
    path: "/gastos",
    icon: BriefcaseBusiness,
    roles: ["superadmin", "admin_sucursal", "taxista"],
  },
  {
    label: "Adelantos",
    path: "/adelantos",
    icon: HandCoins,
    roles: ["superadmin", "admin_sucursal", "taxista"],
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
    label: "Usuarios",
    path: "/usuarios",
    icon: Users,
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

  let rolNormalizado =
  rol ||
  user?.rol_codigo ||
  user?.rol?.codigo ||
  user?.rol ||
  "";

if (rolNormalizado === "admin") {
  rolNormalizado = "admin_sucursal";
}

if (rolNormalizado === "Administrador") {
  rolNormalizado = "admin_sucursal";
}

if (rolNormalizado === "Administrador de Sucursal") {
  rolNormalizado = "admin_sucursal";
}

const visibleItems = menuItems.filter((item) =>
  item.roles.includes(rolNormalizado)
);

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

      <aside className="relative flex h-full w-[310px] max-w-[85vw] flex-col bg-white shadow-2xl">
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5B800] text-white">
              <CarTaxiFront size={29} strokeWidth={2.6} />
            </div>

            <div>
              <h1 className="text-xl font-black text-slate-950">
                TaxiAdmin
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Sistema de Administración
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {visibleItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] font-semibold transition ${
                    isActive
                      ? "bg-[#FFF4CF] text-[#E7A900]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`
                }
              >
                <Icon size={22} strokeWidth={2.1} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <p className="truncate text-sm font-black text-slate-900">
              {user?.username || "Administrador"}
            </p>
            <p className="truncate text-xs font-medium text-slate-500">
              {sucursalNombre || rol || "Sistema"}
            </p>

            <button
              type="button"
              onClick={logout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
            >
              <LogOut size={15} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default MobileMenu;