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

  if (
    valor === "admin" ||
    valor === "administrador" ||
    valor === "administrador de sucursal"
  ) {
    return "admin_sucursal";
  }

  if (valor === "super_admin") {
    return "superadmin";
  }

  return valor;
};

const RedireccionInicial = () => {
  const { rol, user } = useAuth();

  const rolNormalizado = obtenerRolNormalizado(
    rol,
    user
  );

  if (rolNormalizado === "taxista") {
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

const RutaDashboard = () => {
  const { rol, user } = useAuth();

  const rolNormalizado = obtenerRolNormalizado(
    rol,
    user
  );

  if (rolNormalizado === "taxista") {
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
          <Route
            index
            element={<RedireccionInicial />}
          />

          <Route
            path="dashboard"
            element={<RutaDashboard />}
          />

          <Route
            path="sucursales"
            element={
              <RoleRoute
                allowedRoles={["superadmin"]}
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
                  "admin_sucursal",
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
                  "admin_sucursal",
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
                  "admin_sucursal",
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
                  "admin_sucursal",
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
                  "admin_sucursal",
                ]}
              >
                <ConfiguracionPage />
              </RoleRoute>
            }
          />
        </Route>

        <Route
          path="*"
          element={
            <PrivateRoute>
              <RedireccionInicial />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
