// src/modules/auth/pages/LoginPage.jsx

import {
  ArrowRight,
  CarTaxiFront,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  ShieldCheck,
  User,
} from "lucide-react";

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
    <main className="relative min-h-[100dvh] overflow-hidden bg-slate-100">
      {/* Fondo decorativo ligero.
          Evita varios blur-3xl porque pueden producir lentitud visual. */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 lg:w-[58%]" />

        <div className="absolute left-[42%] top-[-180px] hidden h-[420px] w-[420px] rounded-full bg-yellow-400/10 lg:block" />

        <div className="absolute bottom-[-220px] left-[-180px] hidden h-[520px] w-[520px] rounded-full border border-white/5 lg:block" />
      </div>

      <div className="relative mx-auto grid min-h-[100dvh] w-full max-w-[1600px] grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Panel informativo */}
        <section className="relative hidden min-h-screen items-center px-10 py-14 lg:flex xl:px-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-300">
              <CarTaxiFront size={19} />
              Sistema de administración de taxis
            </div>

            <h1 className="mt-8 max-w-xl text-5xl font-black leading-[1.08] tracking-tight text-white xl:text-6xl">
              Control operativo y financiero en un solo lugar.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Gestiona conductores, vehículos, jornadas, ingresos, gastos,
              adelantos, liquidaciones y mantenimientos desde una plataforma
              centralizada.
            </p>

            <div className="mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-400/10 text-green-300">
                  <ShieldCheck size={23} />
                </div>

                <h2 className="mt-4 text-base font-bold text-white">
                  Acceso protegido
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Cada usuario visualiza únicamente las funciones habilitadas
                  para su rol y sucursal.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-300">
                  <CarTaxiFront size={23} />
                </div>

                <h2 className="mt-4 text-base font-bold text-white">
                  Gestión centralizada
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Información financiera, operativa y preventiva disponible
                  desde una misma plataforma.
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 size={18} className="text-yellow-400" />
                Seguimiento de jornadas e ingresos diarios.
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 size={18} className="text-yellow-400" />
                Control de conductores y vehículos asignados.
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 size={18} className="text-yellow-400" />
                Alertas de mantenimiento y vencimientos.
              </div>
            </div>
          </div>
        </section>

        {/* Panel del formulario */}
        <section className="flex min-h-[100dvh] items-center justify-center bg-slate-100 px-4 py-8 sm:px-6 lg:bg-transparent lg:px-10">
          <div className="w-full max-w-[460px]">
            {/* Logo visible en móvil */}
            <div className="mb-6 flex justify-center lg:hidden">
              <div className="inline-flex items-center gap-3 rounded-full bg-slate-950 px-5 py-3 text-white shadow-lg">
                <CarTaxiFront size={22} className="text-yellow-400" />
                <span className="font-black">TaxiAdmin</span>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-300/50 sm:p-9">
              <div className="text-center">
                <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-200/70">
                  <CarTaxiFront size={38} strokeWidth={2.3} />
                </div>

                <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-950">
                  Bienvenido
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Ingresa tus credenciales para acceder a TaxiAdmin.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5"
                >
                  <p className="text-sm font-semibold text-red-700">
                    No se pudo iniciar sesión
                  </p>

                  <p className="mt-1 text-sm leading-5 text-red-600">
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Usuario
                  </label>

                  <div className="relative">
                    <User
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="username"
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Ingresa tu usuario"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      disabled={loading}
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition duration-200 placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Contraseña
                  </label>

                  <div className="relative">
                    <Lock
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                      disabled={loading}
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-12 text-sm font-semibold text-slate-800 outline-none transition duration-200 placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:opacity-70"
                    />

                    <button
                      type="button"
                      onClick={togglePassword}
                      disabled={loading}
                      className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-yellow-200/70 transition duration-200 hover:-translate-y-0.5 hover:bg-yellow-500 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-yellow-200 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <LoaderCircle
                        size={20}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                      <span>Verificando credenciales...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar sesión</span>
                      <ArrowRight
                        size={19}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 border-t border-slate-200 pt-5">
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />

                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              Sistema privado de administración de taxis
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;