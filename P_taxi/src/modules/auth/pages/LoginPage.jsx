// src/modules/auth/pages/LoginPage.jsx

import { Eye, EyeOff, Lock, User, CarTaxiFront, ShieldCheck } from "lucide-react";
import { useLogin } from "../hooks/useLogin";

const LoginPage = () => {
  const {
    form,
    loading,
    error,
    showPassword,
    handleChange,
    handleSubmit,
    togglePassword,
  } = useLogin();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-yellow-100 blur-3xl opacity-80" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-slate-200 blur-3xl opacity-70" />
        <div className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-yellow-50 blur-2xl opacity-90" />
      </div>

      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700 shadow-sm">
              <CarTaxiFront size={18} />
              Sistema de administración de taxis
            </div>

            <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 leading-tight">
              Controla ingresos, gastos, taxistas y mantenimiento desde un solo lugar.
            </h1>

            <p className="mt-5 text-lg text-slate-600 leading-8">
              Administra sucursales, conductores, vehículos, jornadas diarias,
              adelantos, kilometraje y alertas de mantenimiento con una plataforma
              clara, rápida y ordenada.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="h-11 w-11 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="mt-4 font-bold text-slate-900">
                  Acceso seguro
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-6">
                  Cada usuario accede según su rol y sucursal asignada.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="h-11 w-11 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                  <CarTaxiFront size={22} />
                </div>
                <h3 className="mt-4 font-bold text-slate-900">
                  Gestión completa
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-6">
                  Control financiero, operativo y preventivo para vehículos taxi.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 md:p-8 shadow-xl shadow-slate-200/70">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-3xl bg-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-yellow-200">
                <CarTaxiFront size={34} strokeWidth={2.4} />
              </div>

              <h2 className="mt-5 text-3xl font-black text-slate-950">
                TaxiAdmin
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Ingresa tus credenciales para acceder al sistema.
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Usuario
                </label>

                <div className="relative">
                  <User
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Ejemplo: admin"
                    autoComplete="username"
                    className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Contraseña
                </label>

                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-12 text-sm font-medium text-slate-800 outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
                  />

                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-yellow-400 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-yellow-100 transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs leading-6 text-slate-500">
                El acceso está protegido por roles. El superadministrador puede
                gestionar sucursales, el administrador gestiona su sucursal y el
                taxista solo accede a su información.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;