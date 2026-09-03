"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type RegisterResponse = {
  token: string;
  user: {
    id: string;
    nombre: string;
    email: string;
    role: string;
  };
};

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [barrio, setBarrio] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedDataPolicy, setAcceptedDataPolicy] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          apellido,
          cedula,
          telefono,
          direccion,
          barrio,
          ciudad,
          departamento,
          fechaNacimiento,
          email,
          password,
          acceptedTerms,
          acceptedPrivacy,
          acceptedDataPolicy,
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          setError("El correo o la cédula ya están registrados.");
          return;
        }

        setError("No fue posible completar el registro.");
        return;
      }

      const data: RegisterResponse = await response.json();

      localStorage.setItem("aurum_token", data.token);
      localStorage.setItem("aurum_user", JSON.stringify(data.user));

      window.location.href = "/";
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] px-6 py-12 text-[#2f2a27]">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-[#eadfd8] bg-white p-8 shadow-sm">
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

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="nombre"
                className="mb-2 block text-sm font-semibold"
              >
                Nombre
              </label>

              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none focus:border-[#a2725e]"
              />
            </div>

            <div>
              <label
                htmlFor="apellido"
                className="mb-2 block text-sm font-semibold"
              >
                Apellido
              </label>

              <input
                id="apellido"
                type="text"
                value={apellido}
                onChange={(event) => setApellido(event.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none focus:border-[#a2725e]"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="cedula"
                className="mb-2 block text-sm font-semibold"
              >
                Cédula
              </label>

              <input
                id="cedula"
                type="text"
                value={cedula}
                onChange={(event) => setCedula(event.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none focus:border-[#a2725e]"
              />
            </div>

            <div>
              <label
                htmlFor="telefono"
                className="mb-2 block text-sm font-semibold"
              >
                Teléfono
              </label>

              <input
                id="telefono"
                type="tel"
                value={telefono}
                onChange={(event) => setTelefono(event.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none focus:border-[#a2725e]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="direccion"
              className="mb-2 block text-sm font-semibold"
            >
              Dirección
            </label>

            <input
              id="direccion"
              type="text"
              value={direccion}
              onChange={(event) => setDireccion(event.target.value)}
              required
              disabled={loading}
              className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none focus:border-[#a2725e]"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="barrio"
                className="mb-2 block text-sm font-semibold"
              >
                Barrio
              </label>

              <input
                id="barrio"
                type="text"
                value={barrio}
                onChange={(event) => setBarrio(event.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none focus:border-[#a2725e]"
              />
            </div>

            <div>
              <label
                htmlFor="ciudad"
                className="mb-2 block text-sm font-semibold"
              >
                Ciudad
              </label>

              <input
                id="ciudad"
                type="text"
                value={ciudad}
                onChange={(event) => setCiudad(event.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none focus:border-[#a2725e]"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="departamento"
                className="mb-2 block text-sm font-semibold"
              >
                Departamento
              </label>

              <input
                id="departamento"
                type="text"
                value={departamento}
                onChange={(event) => setDepartamento(event.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none focus:border-[#a2725e]"
              />
            </div>

            <div>
              <label
                htmlFor="fechaNacimiento"
                className="mb-2 block text-sm font-semibold"
              >
                Fecha de nacimiento
              </label>

              <input
                id="fechaNacimiento"
                type="date"
                value={fechaNacimiento}
                onChange={(event) =>
                  setFechaNacimiento(event.target.value)
                }
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none focus:border-[#a2725e]"
              />
            </div>
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
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={loading}
              className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none focus:border-[#a2725e]"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold"
              >
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none focus:border-[#a2725e]"
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
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#d9cec7] px-4 py-3 outline-none focus:border-[#a2725e]"
              />
            </div>
          </div>

          <p className="text-xs leading-5 text-[#7a6f69]">
            La contraseña debe tener mínimo 8 caracteres e incluir mayúscula,
            minúscula, número y un carácter especial.
          </p>

          <div className="space-y-3 rounded-xl border border-[#eadfd8] p-4">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) =>
                  setAcceptedTerms(event.target.checked)
                }
                required
              />
              <span>Acepto los términos y condiciones.</span>
            </label>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(event) =>
                  setAcceptedPrivacy(event.target.checked)
                }
                required
              />
              <span>Acepto la política de privacidad.</span>
            </label>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={acceptedDataPolicy}
                onChange={(event) =>
                  setAcceptedDataPolicy(event.target.checked)
                }
                required
              />
              <span>Acepto la política de tratamiento de datos.</span>
            </label>
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
            {loading ? "Creando cuenta..." : "Crear cuenta"}
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