"use client";

import Link from "next/link";
import {
  FormEvent,
  Suspense,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Sparkles,
  X,
} from "lucide-react";

type ResetPasswordResponse = {
  message?: string;
};

function RestablecerContrasenaContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "El enlace de recuperación no es válido. Solicita uno nuevo.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "La contraseña debe tener al menos 8 caracteres.",
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError(
        "La contraseña debe incluir al menos una letra mayúscula.",
      );
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError(
        "La contraseña debe incluir al menos una letra minúscula.",
      );
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError(
        "La contraseña debe incluir al menos un número.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

      const response = await fetch(
        `${apiUrl}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        },
      );

      const data: ResetPasswordResponse =
        await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          data.message ??
            "El enlace es inválido o ha expirado. Solicita uno nuevo.",
        );
        return;
      }

      setPassword("");
      setConfirmPassword("");

      setSuccess(
        data.message ??
          "Tu contraseña fue actualizada correctamente.",
      );
    } catch {
      setError(
        "No fue posible conectar con el servidor. Inténtalo nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  const invalidToken = !token;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-slate-950 px-4 py-4">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-black/15 backdrop-blur-sm" />

      <section className="relative z-10 w-full max-w-[500px] overflow-hidden rounded-[1.75rem] border border-white/60 bg-white shadow-2xl shadow-black/30">
        <header className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-purple-800 to-indigo-950 px-6 py-5 text-white sm:px-7">
          <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-purple-500/30 blur-3xl" />

          <Link
            href="/login"
            aria-label="Cerrar"
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-purple-100 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Link>

          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-purple-950 shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>

              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-300">
                Aurum Decoraciones
              </span>
            </div>

            <h1 className="mt-2 font-serif text-3xl font-black tracking-tight sm:text-[2.25rem]">
              Nueva contraseña
            </h1>

            <p className="mt-1.5 max-w-md text-xs leading-5 text-purple-100 sm:text-sm">
              Crea una nueva contraseña segura para volver
              a ingresar a tu cuenta.
            </p>
          </div>
        </header>

        <div className="px-6 py-5 sm:px-7">
          {success ? (
            <div>
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="font-black">
                      Contraseña actualizada
                    </p>

                    <p className="mt-1 leading-5">
                      {success}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/login"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-800 via-purple-700 to-purple-800 px-6 py-3 text-sm font-black text-amber-300 shadow-lg shadow-purple-200 transition duration-300 hover:-translate-y-0.5 hover:from-purple-900 hover:to-purple-700"
              >
                Iniciar sesión
              </Link>
            </div>
          ) : invalidToken ? (
            <div>
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                El enlace de recuperación no es válido o no
                contiene un token.
              </div>

              <Link
                href="/recuperar-contrasena"
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-800 via-purple-700 to-purple-800 px-6 py-3 text-sm font-black text-amber-300 shadow-lg shadow-purple-200 transition"
              >
                Solicitar un nuevo enlace
              </Link>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={handleSubmit}
            >
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Nueva contraseña
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-purple-200 bg-white py-2.5 pl-11 pr-11 text-sm text-slate-800 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value,
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-purple-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  Mínimo 8 caracteres, con mayúscula,
                  minúscula y número.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Confirmar nueva contraseña
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-purple-200 bg-white py-2.5 pl-11 pr-11 text-sm text-slate-800 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value,
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-purple-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-purple-800 via-purple-700 to-purple-800 px-6 py-3 text-sm font-black text-amber-300 shadow-lg shadow-purple-200 transition duration-300 hover:-translate-y-0.5 hover:from-purple-900 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Actualizando..."
                  : "Guardar nueva contraseña"}
              </button>
            </form>
          )}

          {!success && (
            <Link
              href="/login"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-5 py-2.5 text-sm font-bold text-purple-800 transition hover:bg-purple-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a iniciar sesión
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

function LoadingResetPassword() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-950 via-purple-900 to-slate-950 px-4">
      <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-2xl">
        <p className="text-sm font-bold text-purple-800">
          Cargando recuperación de contraseña...
        </p>
      </div>
    </main>
  );
}

export default function RestablecerContrasenaPage() {
  return (
    <Suspense fallback={<LoadingResetPassword />}>
      <RestablecerContrasenaContent />
    </Suspense>
  );
}