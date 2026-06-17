import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  BriefcaseBusiness,
  HandCoins,
  UserRound,
  CarTaxiFront,
  Wrench,
  FileBarChart,
  Users,
  Settings,
  ChevronDown,
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
    roles: ["superadmin", "admin_sucursal"],
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
  //   path: "/ingresos",
  //   icon: Wallet,
  //   roles: ["superadmin", "admin_sucursal"],
  // },
  {
    label: "Gastos",
    path: "/gastos",
    icon: BriefcaseBusiness,
    roles: ["superadmin", "admin_sucursal"],
  },
  {
    label: "Adelantos",
    path: "/adelantos",
    icon: HandCoins,
    roles: ["superadmin", "admin_sucursal", "taxista"],
  },
  {
    label: "Liquidaciones",
    path: "/liquidaciones",
    icon: Wallet,
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
    label: "Mantenimiento",
    path: "/mantenimiento",
    icon: Wrench,
    roles: ["superadmin", "admin_sucursal"],
  },
  // {
  //   label: "Reportes",
  //   path: "/reportes",
  //   icon: FileBarChart,
  //   roles: ["superadmin", "admin_sucursal"],
  // },
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

const Sidebar = () => {
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

 return (
  <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[310px] flex-col border-r border-slate-200 bg-white lg:flex">
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-slate-100 px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5B800] text-white shadow-md shadow-yellow-100">
            <CarTaxiFront size={34} strokeWidth={2.8} />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              TaxiAdmin
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Sistema de Administración
            </p>
          </div>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-5 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
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

      <div className="shrink-0 border-t border-slate-100 bg-white p-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFE7A3] text-sm font-black text-slate-900">
              {user?.username?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-slate-900">
                {user?.username || "Administrador"}
              </p>
              <p className="truncate text-xs font-medium text-slate-500">
                {sucursalNombre || rolNormalizado || "Sistema"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  </aside>
);
};

export default Sidebar;