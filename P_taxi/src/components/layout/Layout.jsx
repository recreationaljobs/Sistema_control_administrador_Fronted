import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileMenu from "./MobileMenu";
import TaxistaBottomNav from "./TaxistaBottomNav";
import { useAuth } from "../../hooks/useAuth";

const obtenerRolNormalizado = (rol, user) => {
  const valor = String(
    rol ||
      user?.rol_codigo ||
      user?.rol?.codigo ||
      user?.rol ||
      ""
  )
    .trim()
    .toLowerCase();

  if (valor === "super_admin") {
    return "superadmin";
  }

  if (
    valor === "admin" ||
    valor === "administrador" ||
    valor === "administrador de sucursal"
  ) {
    return "admin_sucursal";
  }

  return valor;
};

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const { rol, user } = useAuth();

  const rolNormalizado = obtenerRolNormalizado(
    rol,
    user
  );

  const esTaxista =
    rolNormalizado === "taxista";

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
          onOpenMobileMenu={abrirMenuMovil}
        />

        <main
          className={
            esTaxista
              ? "px-4 py-4 md:px-6"
              : "px-4 py-5 md:px-6 lg:px-7"
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