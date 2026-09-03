"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log({
      nombre,
      email,
      password,
      confirmPassword,
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-6 py-12 text-[#2f2a27]">
      <div className="w-full max-w-md rounded-3xl border border-[#eadfd8] bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a2725e]">
            Aurum Decoraciones
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Crear cuenta
          </h1>

          <p className="mt-3 text-sm text-[#7a6f69]">
            Regístrate para realizar pedidos y consultar tus compras.
          </p>
        </div>

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              htmlFor="nombre"
              className="mb-2 block text-sm font-semibold"
            >
              Nombre
            </label>

            <input
              id="nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              required
              className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none transition focus:border-[#a2725e]"
            />
          </div>

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
              autoComplete="new-password"
              placeholder="Crea una contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none transition focus:border-[#a2725e]"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold"
            >
              Confirmar contraseña
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none transition focus:border-[#a2725e]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[#2f2a27] px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Crear cuenta
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[#7a6f69]">
            ¿Ya tienes una cuenta?{" "}
          </span>

          <Link
            href="/login"
            className="font-semibold text-[#a2725e] transition hover:opacity-70"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}