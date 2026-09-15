"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Sparkles,
  X,
} from "lucide-react";

type ForgotPasswordResponse = {
  message?: string;
};

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

      const response = await fetch(
        `${apiUrl}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        },
      );

      const data: ForgotPasswordResponse =
        await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          data.message ??
            "No fue posible procesar la solicitud en este momento.",
        );
        return;
      }

      setSuccess(
        data.message ??
          "Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.",
      );
    } catch {
      setError(
        "No fue posible conectar con el servidor. Inténtalo nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }

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
              Recuperar contraseña
            </h1>

            <p className="mt-1.5 max-w-md text-xs leading-5 text-purple-100 sm:text-sm">
              Ingresa el correo asociado a tu cuenta y te
              enviaremos las instrucciones para crear una
              nueva contraseña.
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
                      Revisa tu correo
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
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={handleSubmit}
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Correo electrónico
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-purple-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
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
                  ? "Enviando..."
                  : "Enviar instrucciones"}
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