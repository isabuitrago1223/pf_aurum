"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  EyeOff,
  Home,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  X,
} from "lucide-react";

type RegisterResponse = {
  token: string;
  user: {
    id: string;
    nombre: string;
    email: string;
    role: string;
  };
};

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.88-1.73 2.99-4.29 2.99-7.37Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.89 6.61-2.4l-3.22-2.51c-.89.6-2.03.96-3.39.96-2.6 0-4.8-1.75-5.59-4.11H3.08v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.94A6.02 6.02 0 0 1 6.1 12c0-.67.11-1.32.31-1.94V7.47H3.08A10 10 0 0 0 2 12c0 1.61.39 3.13 1.08 4.53l3.33-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.95c1.47 0 2.78.5 3.82 1.49l2.86-2.86C16.95 2.97 14.69 2 12 2a10 10 0 0 0-8.92 5.47l3.33 2.59C7.2 7.7 9.4 5.95 12 5.95Z"
      />
    </svg>
  );
}

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
  const [acceptedDataPolicy, setAcceptedDataPolicy] =
    useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

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
        `${apiUrl}/api/auth/register`,
        {
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
        },
      );

      if (!response.ok) {
        if (response.status === 409) {
          setError(
            "El correo o la cédula ya están registrados.",
          );
          return;
        }

        setError(
          "No fue posible completar el registro.",
        );
        return;
      }

      const data: RegisterResponse =
        await response.json();

      localStorage.setItem(
        "aurum_token",
        data.token,
      );

      localStorage.setItem(
        "aurum_user",
        JSON.stringify(data.user),
      );

      window.location.href = "/";
    } catch {
      setError(
        "No fue posible conectar con el servidor.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleRegister() {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:4000";

    window.location.href =
      `${apiUrl}/api/auth/google`;
  }

  const inputClass =
    "w-full rounded-xl border border-purple-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-slate-950 px-4 py-4">
      {/* Fondo */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-black/15 backdrop-blur-sm" />

      {/* Ventana flotante */}
      <section className="relative z-10 flex max-h-[94vh] w-full max-w-[760px] flex-col overflow-hidden rounded-[1.75rem] border border-white/60 bg-white shadow-2xl shadow-black/30">
        {/* Encabezado */}
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-r from-purple-950 via-purple-800 to-indigo-950 px-6 py-5 text-white sm:px-7">
          <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-purple-500/30 blur-3xl" />

          <Link
            href="/"
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
              Crear Cuenta
            </h1>

            <p className="mt-1.5 text-xs leading-5 text-purple-100 sm:text-sm">
              Regístrate para realizar compras y gestionar tus
              entregas.
            </p>
          </div>
        </header>

        {/* Área con scroll interno */}
        <div className="overflow-y-auto px-6 py-5 sm:px-7">
          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-purple-200 hover:bg-purple-50"
          >
            <GoogleIcon />
            Registrarse con Google
          </button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              O completa tus datos
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            {/* Nombre y apellido */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="nombre"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Nombre *
                </label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={(event) =>
                      setNombre(event.target.value)
                    }
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="apellido"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Apellido *
                </label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="apellido"
                    type="text"
                    placeholder="Tu apellido"
                    value={apellido}
                    onChange={(event) =>
                      setApellido(event.target.value)
                    }
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Cédula y teléfono */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="cedula"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Cédula *
                </label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="cedula"
                    type="text"
                    placeholder="Número de cédula"
                    value={cedula}
                    onChange={(event) =>
                      setCedula(event.target.value)
                    }
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="telefono"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Teléfono *
                </label>

                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="telefono"
                    type="tel"
                    placeholder="3001234567"
                    value={telefono}
                    onChange={(event) =>
                      setTelefono(event.target.value)
                    }
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label
                htmlFor="direccion"
                className="mb-1.5 block text-sm font-bold text-slate-700"
              >
                Dirección de entrega *
              </label>

              <div className="relative">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-500" />

                <input
                  id="direccion"
                  type="text"
                  placeholder="Ej: Carrera 15 #85-30"
                  value={direccion}
                  onChange={(event) =>
                    setDireccion(event.target.value)
                  }
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Barrio, ciudad, departamento */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label
                  htmlFor="barrio"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Barrio *
                </label>

                <div className="relative">
                  <Home className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="barrio"
                    type="text"
                    placeholder="Barrio"
                    value={barrio}
                    onChange={(event) =>
                      setBarrio(event.target.value)
                    }
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="ciudad"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Ciudad *
                </label>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="ciudad"
                    type="text"
                    placeholder="Ciudad"
                    value={ciudad}
                    onChange={(event) =>
                      setCiudad(event.target.value)
                    }
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="departamento"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Departamento *
                </label>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="departamento"
                    type="text"
                    placeholder="Departamento"
                    value={departamento}
                    onChange={(event) =>
                      setDepartamento(
                        event.target.value,
                      )
                    }
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Fecha y correo */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="fechaNacimiento"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Fecha de nacimiento *
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="fechaNacimiento"
                    type="date"
                    value={fechaNacimiento}
                    onChange={(event) =>
                      setFechaNacimiento(
                        event.target.value,
                      )
                    }
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Correo electrónico *
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Contraseñas */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Contraseña *
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                    disabled={loading}
                    className={`${inputClass} pr-11`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-purple-700"
                    aria-label={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Confirmar contraseña *
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    required
                    disabled={loading}
                    className={`${inputClass} pr-11`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-purple-700"
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              La contraseña debe tener mínimo 8 caracteres e
              incluir mayúscula, minúscula, número y un
              carácter especial.
            </p>

            {/* Políticas */}
            <div className="space-y-2 rounded-xl border border-purple-100 bg-purple-50/60 p-4">
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) =>
                    setAcceptedTerms(
                      event.target.checked,
                    )
                  }
                  required
                  className="mt-1 h-4 w-4 accent-purple-700"
                />

                <span>
                  Acepto los términos y condiciones.
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(event) =>
                    setAcceptedPrivacy(
                      event.target.checked,
                    )
                  }
                  required
                  className="mt-1 h-4 w-4 accent-purple-700"
                />

                <span>
                  Acepto la política de privacidad.
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={acceptedDataPolicy}
                  onChange={(event) =>
                    setAcceptedDataPolicy(
                      event.target.checked,
                    )
                  }
                  required
                  className="mt-1 h-4 w-4 accent-purple-700"
                />

                <span>
                  Acepto la política de tratamiento de datos.
                </span>
              </label>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* Crear cuenta */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-800 via-purple-700 to-purple-800 px-6 py-3 text-sm font-black text-amber-300 shadow-lg shadow-purple-200 transition duration-300 hover:-translate-y-0.5 hover:from-purple-900 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creando cuenta..."
                : "Crear cuenta"}
            </button>
          </form>

          {/* Login */}
          <div className="mt-4 rounded-xl bg-purple-50 px-5 py-2.5 text-center">
            <p className="text-xs text-slate-600">
              ¿Ya tienes una cuenta?
            </p>

            <Link
              href="/login"
              className="inline-block text-sm font-black text-purple-700 transition hover:text-purple-900"
            >
              Iniciar sesión
            </Link>
          </div>

          {/* Volver */}
          <Link
            href="/"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-5 py-2.5 text-sm font-bold text-purple-800 transition hover:bg-purple-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
