
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "../modules/auth/pages/LoginPage";
import DashboardPage from "../modules/dashboard/pages/DashboardPage";
import SucursalesPage from "../modules/sucursales/pages/SucursalesPage";
import UsuariosPage from "../modules/usuarios/pages/UsuariosPage";
import ConductoresPage from "../modules/conductores/pages/ConductoresPage";
import VehiculosPage from "../modules/vehiculos/pages/VehiculosPage";
import AsignacionesPage from "../modules/asignaciones/pages/AsignacionesPage";
import JornadasPage from "../modules/jornadas/pages/JornadasPage";
import GastosPage from "../modules/gastos/pages/GastosPage";
import AdelantosPage from "../modules/adelantos/pages/AdelantosPage";
import LiquidacionesPage from "../modules/liquidaciones/pages/LiquidacionesPage";
import MantenimientoPage from "../modules/mantenimiento/pages/MantenimientoPage";
import ReportesPage from "../modules/reportes/pages/ReportesPage";
import ConfiguracionPage from "../modules/configuracion/pages/ConfiguracionPage";

import Layout from "../components/layout/Layout";
import PrivateRoute from "../routes/PrivateRoute";
import PublicRoute from "../routes/PublicRoute";
import RoleRoute from "../routes/RoleRoute";

import { useAuth } from "../hooks/useAuth";

const obtenerCodigoRol = (auth) => {
  const rolDirecto = auth?.rol;

  if (typeof rolDirecto === "string") {
    return rolDirecto.toLowerCase();
  }

  const rolUsuario = auth?.user?.rol;

  if (typeof rolUsuario === "string") {
    return rolUsuario.toLowerCase();
  }

  if (
    typeof auth?.user?.rol_codigo ===
    "string"
  ) {
    return auth.user.rol_codigo.toLowerCase();
  }

  if (
    typeof rolUsuario?.codigo ===
    "string"
  ) {
    return rolUsuario.codigo.toLowerCase();
  }

  return "";
};

const InicioPorRol = () => {
  const auth = useAuth();
  const rol = obtenerCodigoRol(auth);

  if (rol === "taxista") {
    return (
      <Navigate
        to="/jornadas"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/dashboard"
      replace
    />
  );
};

const DashboardPorRol = () => {
  const auth = useAuth();
  const rol = obtenerCodigoRol(auth);

  /*
   * El taxista nunca renderiza DashboardPage.
   * Si intenta entrar manualmente a /dashboard,
   * se envía directamente a sus jornadas.
   */
  if (rol === "taxista") {
    return (
      <Navigate
        to="/jornadas"
        replace
      />
    );
  }

  return (
    <RoleRoute
      allowedRoles={[
        "superadmin",
        "super_admin",
        "admin_sucursal",
      ]}
    >
      <DashboardPage />
    </RoleRoute>
  );
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* Entrada principal según el rol */}
          <Route
            index
            element={<InicioPorRol />}
          />

          {/* Dashboard exclusivo de administradores */}
          <Route
            path="dashboard"
            element={<DashboardPorRol />}
          />

          <Route
            path="sucursales"
            element={
              <RoleRoute
                allowedRoles={[
                  "superadmin",
                  "super_admin",
                ]}
              >
                <SucursalesPage />
              </RoleRoute>
            }
          />

          <Route
            path="usuarios"
            element={
              <RoleRoute
                allowedRoles={[
                  "superadmin",
                  "super_admin",
                  "admin_sucursal",
                ]}
              >
                <UsuariosPage />
              </RoleRoute>
            }
          />

          <Route
            path="conductores"
            element={
              <RoleRoute
                allowedRoles={[
                  "superadmin",
                  "super_admin",
                  "admin_sucursal",
                ]}
              >
                <ConductoresPage />
              </RoleRoute>
            }
          />

          <Route
            path="vehiculos"
            element={
              <RoleRoute
                allowedRoles={[
                  "superadmin",
                  "super_admin",
                  "admin_sucursal",
                  "taxista",
                ]}
              >
                <VehiculosPage />
              </RoleRoute>
            }
          />

          <Route
            path="asignaciones"
            element={
              <RoleRoute
                allowedRoles={[
                  "superadmin",
                  "super_admin",
                  "admin_sucursal",
                ]}
              >
                <AsignacionesPage />
              </RoleRoute>
            }
          />

          <Route
            path="jornadas"
            element={
              <RoleRoute
                allowedRoles={[
                  "superadmin",
                  "super_admin",
                  "admin_sucursal",
                  "taxista",
                ]}
              >
                <JornadasPage />
              </RoleRoute>
            }
          />

          <Route
            path="gastos"
            element={
              <RoleRoute
                allowedRoles={[
                  "superadmin",
                  "super_admin",
                  "admin_sucursal",
                  "taxista",
                ]}
              >
                <GastosPage />
              </RoleRoute>
            }
          />

          <Route
            path="adelantos"
            element={
              <RoleRoute
                allowedRoles={[
                  "superadmin",
                  "super_admin",
                  "admin_sucursal",
                  "taxista",
                ]}
              >
                <AdelantosPage />
              </RoleRoute>
            }
          />

          <Route
            path="liquidaciones"
            element={
              <RoleRoute
                allowedRoles={[
                  "superadmin",
                  "super_admin",
                  "admin_sucursal",
                ]}
              >
                <LiquidacionesPage />
              </RoleRoute>
            }
          />

          <Route
            path="mantenimiento"
            element={
              <RoleRoute
                allowedRoles={[
                  "superadmin",
                  "super_admin",
                  "admin_sucursal",
                  "taxista",
                ]}
              >
                <MantenimientoPage />
              </RoleRoute>
            }
          />

          <Route
            path="reportes"
            element={
              <RoleRoute
                allowedRoles={[
                  "superadmin",
                  "super_admin",
                  "admin_sucursal",
                ]}
              >
                <ReportesPage />
              </RoleRoute>
            }
          />

          <Route
            path="configuracion"
            element={
              <RoleRoute
                allowedRoles={[
                  "superadmin",
                  "super_admin",
                  "admin_sucursal",
                ]}
              >
                <ConfiguracionPage />
              </RoleRoute>
            }
          />
        </Route>

        {/* Rutas inexistentes regresan al inicio por rol */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

