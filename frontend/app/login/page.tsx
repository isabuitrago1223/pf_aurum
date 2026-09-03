import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-6 py-12 text-[#2f2a27]">
      <div className="w-full max-w-md rounded-3xl border border-[#eadfd8] bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a2725e]">
            Aurum Decoraciones
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Iniciar sesión
          </h1>

          <p className="mt-3 text-sm text-[#7a6f69]">
            Ingresa con tu correo y contraseña para continuar.
          </p>
        </div>

        <form className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none transition focus:border-[#a2725e]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold"
            >
              Contraseña
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña"
              className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none transition focus:border-[#a2725e]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[#2f2a27] px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Iniciar sesión
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-[#a2725e] transition hover:opacity-70"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}