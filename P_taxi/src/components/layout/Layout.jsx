// src/components/layout/Layout.jsx

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Outlet,
  useLocation,
} from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileMenu from "./MobileMenu";
import TaxistaBottomNav from "./TaxistaBottomNav";

import { useAuth } from "../../hooks/useAuth";

const obtenerRolNormalizado = (
  rol,
  user
) => {
  let valorRol = rol;

  if (
    valorRol &&
    typeof valorRol === "object"
  ) {
    valorRol =
      valorRol.codigo ||
      valorRol.nombre ||
      "";
  }

  const valor = String(
    valorRol ||
      user?.rol_codigo ||
      user?.rol?.codigo ||
      user?.rol_nombre ||
      ""
  )
    .trim()
    .toLowerCase();

  if (valor === "super_admin") {
    return "superadmin";
  }

  if (
    [
      "admin",
      "administrador",
      "administrador de sucursal",
    ].includes(valor)
  ) {
    return "admin_sucursal";
  }

  return valor;
};

const Layout = () => {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const { rol, user } = useAuth();
  const location = useLocation();

  const rolNormalizado = useMemo(
    () =>
      obtenerRolNormalizado(
        rol,
        user
      ),
    [rol, user]
  );

  const esTaxista =
    rolNormalizado === "taxista";

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const abrirMenuMovil = () => {
    if (!esTaxista) {
      setMobileMenuOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {!esTaxista && <Sidebar />}

      {!esTaxista && (
        <MobileMenu
          open={mobileMenuOpen}
          onClose={() =>
            setMobileMenuOpen(false)
          }
        />
      )}

      <div
        className={
          esTaxista
            ? "min-h-screen pb-28"
            : "min-h-screen lg:pl-[310px]"
        }
      >
        <Navbar
          onOpenMobileMenu={
            abrirMenuMovil
          }
        />

        <main
          className={
            esTaxista
              ? "min-w-0 overflow-x-hidden px-4 py-4 md:px-6"
              : "min-w-0 overflow-x-hidden px-4 py-5 md:px-6 lg:px-7"
          }
        >
          <Outlet />
        </main>
      </div>

      {esTaxista && (
        <TaxistaBottomNav />
      )}
    </div>
  );
};

export default Layout;