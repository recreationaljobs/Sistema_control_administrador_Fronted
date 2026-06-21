
import { NavLink } from "react-router-dom";
import {
  X,
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
    roles: [
      "superadmin",
      "super_admin",
      "admin_sucursal",
    ],
  },
  {
    label: "Sucursales",
    path: "/sucursales",
    icon: Building2,
    roles: [
      "superadmin",
      "super_admin",
    ],
  },
  {
    label: "Jornadas",
    path: "/jornadas",
    icon: CalendarDays,
    roles: [
      "superadmin",
      "super_admin",
      "admin_sucursal",
      "taxista",
    ],
  },
  {
    label: "Gastos",
    path: "/gastos",
    icon: BriefcaseBusiness,
    roles: [
      "superadmin",
      "super_admin",
      "admin_sucursal",
      
    ],
  },
  {
    label: "Adelantos",
    path: "/adelantos",
    icon: HandCoins,
    roles: [
      "superadmin",
      "super_admin",
      "admin_sucursal",
      "taxista",
    ],
  },
  {
    label: "Liquidaciones",
    path: "/liquidaciones",
    icon: Wallet,
    roles: [
      "superadmin",
      "super_admin",
      "admin_sucursal",
    ],
  },
  {
    label: "Conductores",
    path: "/conductores",
    icon: UserRound,
    roles: [
      "superadmin",
      "super_admin",
      "admin_sucursal",
    ],
  },
  {
    label: "Vehículos",
    path: "/vehiculos",
    icon: CarTaxiFront,
    roles: [
      "superadmin",
      "super_admin",
      "admin_sucursal",
      "taxista",
    ],
  },
  {
    label: "Asignaciones",
    path: "/asignaciones",
    icon: Route,
    roles: [
      "superadmin",
      "super_admin",
      "admin_sucursal",
    ],
  },
  {
    label: "Mantenimiento",
    path: "/mantenimiento",
    icon: Wrench,
    roles: [
      "superadmin",
      "super_admin",
      "admin_sucursal",
      "taxista",
    ],
  },
  {
    label: "Reportes",
    path: "/reportes",
    icon: FileBarChart,
    roles: [
      "superadmin",
      "super_admin",
      "admin_sucursal",
    ],
  },
  {
    label: "Usuarios",
    path: "/usuarios",
    icon: Users,
    roles: [
      "superadmin",
      "super_admin",
      "admin_sucursal",
    ],
  },
  {
    label: "Configuración",
    path: "/configuracion",
    icon: Settings,
    roles: [
      "superadmin",
      "super_admin",
      "admin_sucursal",
    ],
  },
];

const obtenerRolNormalizado = (rol, user) => {
  let valorRol =
    rol ||
    user?.rol_codigo ||
    user?.rol?.codigo ||
    user?.rol ||
    "";

  if (typeof valorRol !== "string") {
    return "";
  }

  valorRol = valorRol
    .trim()
    .toLowerCase();

  const equivalencias = {
    admin: "admin_sucursal",
    administrador: "admin_sucursal",
    "administrador de sucursal": "admin_sucursal",
  };

  return equivalencias[valorRol] || valorRol;
};

const MobileMenu = ({
  open,
  onClose,
}) => {
  const {
    rol,
    user,
    sucursalNombre,
    logout,
  } = useAuth();

  const rolNormalizado =
    obtenerRolNormalizado(
      rol,
      user
    );

  const visibleItems =
    menuItems.filter((item) =>
      item.roles.includes(
        rolNormalizado
      )
    );

  const handleLogout = () => {
    onClose();
    logout();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        aria-label="Cerrar menú"
      />

      <aside className="relative flex h-full w-[310px] max-w-[86vw] flex-col bg-white shadow-2xl">
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F5B800] text-white shadow-md shadow-yellow-100">
              <CarTaxiFront
                size={29}
                strokeWidth={2.6}
              />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-black text-slate-950">
                TaxiAdmin
              </h1>

              <p className="truncate text-xs font-medium text-slate-500">
                Sistema de Administración
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-4 [scrollbar-color:#CBD5E1_transparent] [scrollbar-width:thin]">
          {visibleItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({
                    isActive,
                  }) =>
                    `flex items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] font-semibold transition ${
                      isActive
                        ? "bg-[#FFF4CF] text-[#E7A900]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`
                  }
                >
                  <Icon
                    size={22}
                    strokeWidth={2.1}
                  />

                  <span>
                    {item.label}
                  </span>
                </NavLink>
              );
            }
          )}
        </nav>

        <div className="shrink-0 border-t border-slate-100 bg-white p-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFE7A3] text-sm font-black text-slate-900">
                {user?.username
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-900">
                  {user?.username ||
                    "Usuario"}
                </p>

                <p className="truncate text-xs font-medium text-slate-500">
                  {sucursalNombre ||
                    rolNormalizado ||
                    "Sistema"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
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

