"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    nombre: string;
    email: string;
    role: string;
  };
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        setError("Correo o contraseña incorrectos.");
        return;
      }

      const data: LoginResponse = await response.json();

      localStorage.setItem("aurum_token", data.token);
      localStorage.setItem("aurum_user", JSON.stringify(data.user));

      window.location.href = "/";
    } catch {
      setError("No fue posible iniciar sesión en este momento.");
    } finally {
      setLoading(false);
    }
  }

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

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit}
        >
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={loading}
              className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none transition focus:border-[#a2725e] disabled:cursor-not-allowed disabled:opacity-60"
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={loading}
              className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none transition focus:border-[#a2725e] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#2f2a27] px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm">
  <div>
    <span className="text-[#7a6f69]">
      ¿No tienes una cuenta?{" "}
    </span>

    <Link
      href="/registro"
      className="font-semibold text-[#a2725e] transition hover:opacity-70"
    >
      Crear cuenta
    </Link>
  </div>

  <div>
    <Link
      href="/"
      className="font-semibold text-[#a2725e] transition hover:opacity-70"
    >
      Volver al inicio
    </Link>
  </div>
</div>

      </div>
    </main>
  );
}

